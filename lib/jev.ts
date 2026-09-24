/**
 * Jev signal triage via Vercel AI Gateway (typesafe-ai/jev).
 *
 * WHY JEV EXISTS HERE: the pipeline's cost ordering is Haiku extraction
 * (~$0.0002/row) → JustOne supplier match (~A$0.02–0.04/call) → future marketplace
 * evidence pulls. The middle step is the first *expensive* one, and today every
 * extracted product reaches it unvetted. Jev is a cheap evaluation model that
 * scores a signal against typed questions BEFORE the paid call — killing obvious
 * noise, flagging borderline rows for human review, and issuing a "best first
 * market" opinion we store alongside the signal.
 *
 * HONESTY RULES (same as the rest of the pipeline):
 * - A Jev verdict is an OPINION with a stated confidence, never a fact. It is
 *   stored as `jev_*` fields, never merged into measured fields like velocity or
 *   wholesale_cny.
 * - Fail-closed on configuration: when the gateway key is absent, triage reports
 *   `configured: false` and the pipeline skips the stage — it does not invent a
 *   verdict or block the run.
 * - No blind retries. A timeout or 5xx may already have been charged; we record
 *   the failure and move on. One bounded 429 backoff is the only exception.
 *
 * REQUEST SHAPE (verified against the gateway 2026-09-19): POST /v1/evaluate with
 * `{ model, state, questions }`. Question discriminators are boolean | choice |
 * score. State holds the FACTS; questions hold only the JUDGMENT. Batch limit:
 * questions in one call evaluate independently but a large choice set can push a
 * single call past 60s, so callers keep each call to ~4 questions.
 */

const GATEWAY_URL = process.env.VERCEL_AI_GATEWAY_URL || "https://ai-gateway.vercel.sh";
const MODEL = process.env.JEV_MODEL || "typesafe-ai/jev";
// The gateway can take 60s+ on a large choice question. 120s with NO retry loop:
// an unknown outcome may already be charged.
const TIMEOUT_MS = 120_000;

export function isJevConfigured(): boolean {
  return Boolean(process.env.VERCEL_AI_GATEWAY_API_KEY);
}

/* ------------------------------ types ------------------------------ */

export type JevBoolean = { type: "boolean"; probability: number };
export type JevChoice = { type: "choice"; choice: string; probabilities: Record<string, number>; confidence: number };
export type JevScore = { type: "score"; score: number; probabilities: Record<string, number>; confidence: number };
export type JevAnswer = JevBoolean | JevChoice | JevScore;

export type JevResult =
  | { ok: true; answers: Record<string, JevAnswer>; usage: { inputTokens: number; outputTokens: number }; ms: number }
  | { ok: false; code: number; message: string; ms: number; fatal: boolean };

/* --------------------------- the client --------------------------- */

/**
 * One evaluate call. `questions` is the typed question object straight from the
 * verified gateway shape. Callers batch (~4 questions per call); this function
 * does one HTTP round trip and stops on error — it never retries silently.
 */
export async function jevEvaluate(
  state: string | Record<string, unknown>,
  questions: Record<string, unknown>,
): Promise<JevResult> {
  const key = process.env.VERCEL_AI_GATEWAY_API_KEY;
  if (!key) {
    return { ok: false, code: -1, message: "VERCEL_AI_GATEWAY_API_KEY is not set", ms: 0, fatal: true };
  }

  const started = Date.now();
  try {
    const res = await fetch(`${GATEWAY_URL}/v1/evaluate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, state, questions }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const ms = Date.now() - started;

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      // 429: one bounded backoff, then stop — the guidance is back off once.
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get("retry-after")) || 5;
        if (retryAfter <= 30) {
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          return jevEvaluate(state, questions); // exactly one retry path, gated above
        }
      }
      return {
        ok: false,
        code: res.status,
        message: `AI Gateway ${res.status}: ${body.slice(0, 300)}`,
        ms,
        fatal: res.status === 401 || res.status === 403,
      };
    }

    const data = await res.json();
    return {
      ok: true,
      answers: data.answers ?? {},
      usage: {
        inputTokens: data.usage?.inputTokens ?? 0,
        outputTokens: data.usage?.outputTokens ?? 0,
      },
      ms,
    };
  } catch (err) {
    const ms = Date.now() - started;
    const message = err instanceof Error ? err.message : "Jev evaluate failed";
    // Timeouts are ambiguous outcomes: report, never auto-retry.
    return { ok: false, code: -2, message, ms, fatal: false };
  }
}

/* ------------------------- triage questions ------------------------- */

/**
 * The triage question set. IDs are stable storage keys (jev_* columns).
 *
 * - `is_listable_product`: boolean. A second opinion on extraction — is the noun
 *   a concrete, listable physical product a Western seller could stock?
 * - `western_demand`: score 0–2. Plausibility that this exact product has current
 *   Western consumer demand, judged from the caption's context.
 * - `novelty`: score 0–2. How unsaturated the product concept reads (0 = every
 *   marketplace is full of these, 2 = genuinely uncommon).
 * - `first_market`: choice. Where to list first, given the evidence.
 */
export const TRIAGE_QUESTIONS = {
  is_listable_product: {
    type: "boolean",
    instructions:
      "Does the state describe a concrete physical product that could be stocked and listed by a small cross-border e-commerce seller? Entertainment, content, services, and brand-only mentions are false.",
    criteria: {
      true: "A specific, manufacturable physical product is identifiable.",
      false: "No concrete stockable product, or the row is entertainment/lifestyle content.",
    },
  },
  western_demand: {
    type: "score",
    instructions:
      "How plausible is current Western consumer demand for this product, based only on the engagement signals in the state?",
    criteria: [
      "Weak: engagement is thin, generic, or cultural context suggests purely domestic-Chinese appeal.",
      "Plausible: some signals transfer — visual utility products, pets, home organization.",
      "Strong: product category with proven Western demand and strong engagement.",
    ],
  },
  novelty: {
    type: "score",
    instructions:
      "How uncommon does this product concept read for Western marketplaces (Etsy, Amazon, TikTok Shop)?",
    criteria: [
      "Saturated: commodity product available everywhere in the West.",
      "Middle: known category with room for differentiated variants.",
      "Uncommon: concept or variant combination a Western shopper would not routinely find.",
    ],
  },
  first_market: {
    type: "choice",
    instructions: "Given the state, which marketplace should this product be listed on FIRST?",
    criteria: {
      etsy: "Handmade-adjacent, personalized, craft-supply, or home/decor aesthetic products.",
      amazon: "Utilitarian, branded-boxable, high-search-volume utility products.",
      tiktok_shop: "Impulse, viral-video, demonstration-friendly products.",
      drop: "Not worth pursuing at all.",
      other: "Evidence genuinely points somewhere else or nowhere.",
    },
  },
} as const;

/** Routing bands (from the skill: high → auto, mid → review, low → kill). */
export type TriageRoute = "auto" | "review" | "kill" | "unverified";

export function routeVerdict(a: {
  listable: JevBoolean | undefined;
  demand: JevScore | undefined;
  novelty: JevScore | undefined;
}): TriageRoute {
  if (!a.listable || !a.demand || !a.novelty) return "unverified";
  // Derived, and stated as such: routing is a formula over Jev opinions, not a
  // measurement. The UI marks it like any other derived field.
  const confidence = Math.max(a.listable.probability, 1 - a.listable.probability);
  if (a.listable.probability < 0.35) return "kill";
  if (confidence >= 0.75 && a.demand.score >= 1 && a.novelty.score >= 1) return "auto";
  if (confidence < 0.5) return "kill";
  return "review";
}

/* --------------------------- batch driver --------------------------- */

export type SignalTriageInput = {
  id: string;
  title: string;
  productTerm: string | null;
  productEn: string | null;
  platform: string;
  likes: number | null;
  saves: number | null;
  comments: number | null;
  shares: number | null;
};

export type SignalTriage = {
  signalId: string;
  route: TriageRoute;
  listableProbability: number | null;
  demandScore: number | null;
  noveltyScore: number | null;
  firstMarket: string | null;
  marketConfidence: number | null;
  inputTokens: number;
  ms: number;
};

/**
 * Triage one signal. State = the facts on the row (caption, extracted noun,
 * engagement counts, platform). Questions judge; state never opines.
 */
export async function triageSignal(sig: SignalTriageInput): Promise<SignalTriage> {
  const state = {
    platform: sig.platform,
    caption: sig.title,
    extracted_product_zh: sig.productTerm,
    extracted_product_en: sig.productEn,
    engagement: {
      likes: sig.likes,
      saves: sig.saves,
      comments: sig.comments,
      shares: sig.shares,
    },
  };

  const r = await jevEvaluate(state, TRIAGE_QUESTIONS);
  if (!r.ok) {
    return {
      signalId: sig.id, route: "unverified", listableProbability: null, demandScore: null,
      noveltyScore: null, firstMarket: null, marketConfidence: null, inputTokens: 0, ms: r.ms,
    };
  }

  const listable = r.answers.is_listable_product as JevBoolean | undefined;
  const demand = r.answers.western_demand as JevScore | undefined;
  const novelty = r.answers.novelty as JevScore | undefined;
  const market = r.answers.first_market as JevChoice | undefined;

  return {
    signalId: sig.id,
    route: routeVerdict({ listable, demand, novelty }),
    listableProbability: listable?.probability ?? null,
    demandScore: demand?.score ?? null,
    noveltyScore: novelty?.score ?? null,
    firstMarket: market?.choice ?? null,
    marketConfidence: market?.confidence ?? null,
    inputTokens: r.usage.inputTokens,
    ms: r.ms,
  };
}
