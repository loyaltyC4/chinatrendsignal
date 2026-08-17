import type { AnalysisKind, EnrichmentResult, ProductContext } from "./analysis-types";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

function systemPrompt(kind: AnalysisKind) {
  // The evidence rules are stated as prohibitions with examples because the softer
  // earlier version ("never invent sales, revenue, review counts") still produced a
  // confident "the 176-position Amazon rank gain" for a product where we hold no
  // Amazon data at all. Naming the exact failure modes is what stops them.
  const base = `You are China Trend Signal's product intelligence analyst.

EVIDENCE RULES — these override every other instruction:
1. The user message is a fact sheet. It is the ONLY evidence you have. Treat anything absent from it as unknown, not as zero and not as something you may estimate.
2. Never state a figure that is not in the fact sheet. No sales, revenue, units, rank, rank movement, review counts, ratings, listing counts, conversion rates, CAC, ad costs, follower counts or dates.
3. Only refer to the platforms named in the fact sheet. We read Douyin, Xiaohongshu, 1688 and Taobao. We hold NO Amazon, eBay, Etsy, Shopify or TikTok Shop data, so never characterise activity on them; you may suggest the reader go and check them.
4. When something important is unknown, say it is not measured. "Wholesale price is not measured yet" is a good sentence. Inventing one is a product failure.
5. Label inference as inference. Recommendations may be reasoned; facts may not be invented.
6. If the fact sheet says it is sample data, open by saying the analysis is based on a worked example, not a real signal.

Be commercially rigorous and specific about what to DO, which needs no invented numbers. Do not give legal, medical or financial advice. Use concise Australian English. Return valid JSON only.`;
  const task: Record<AnalysisKind, string> = {
    signal_explanation: "Explain why a product is moving in exactly three useful parts: hook, buyer, and risk. Give a Test/Watch/Pass verdict and practical next actions.",
    niche_scorecard: "Score the product 0-100 based on demand momentum, intent, saturation, margin headroom, shipping practicality, and differentiation. Explain the score and give a Test/Watch/Pass verdict.",
    complaint_miner: "Extract recurring complaint themes from review/comment text. Each complaint needs a severity and a concrete product or listing differentiation opportunity.",
    listing_copy: "Write a high-converting but factual product listing. Do not make unsupported performance, health, safety, or certification claims. Include title, 4 benefit bullets, a concise description, and search tags.",
    creator_match: "Rank available creators for this exact product based on audience fit, engagement, and rate-card efficiency. Recommend up to three and draft one respectful outreach message that does not invent a relationship.",
    weekly_report: "Write a concise niche intelligence report: what moved, why, what to validate next, and what to avoid. Never claim a product is guaranteed to win.",
  };
  return `${base}\n\nTask: ${task[kind]}\n\nReturn JSON matching: {title, executiveSummary, verdict, score, hook, buyer, risk, actions, evidence, complaints, listing, creatorBrief}. Omit fields that do not apply.`;
}

/**
 * Renders the context as a labelled fact sheet, with unknowns stated as unknown.
 *
 * Sending the raw context object was part of the same bug: a JSON object whose
 * wholesaleCny was 0 reads to a model as "the wholesale price is zero", and any key we
 * happened to leave on the object read as a measurement. Text with explicit
 * "not measured" lines removes both.
 */
export function factSheet(context: ProductContext & { sample?: boolean }): string {
  const lines: string[] = [];
  const known = (label: string, value: unknown, suffix = "") =>
    lines.push(`${label}: ${value === undefined || value === null || value === "" ? "not measured" : `${value}${suffix}`}`);

  if (context.sample) {
    lines.push("DATA STATUS: sample data. This is a worked example, not a signal we recorded.");
  } else {
    lines.push("DATA STATUS: recorded signal. Every figure below came from our own index.");
  }

  known("Product (English)", context.name);
  known("Product (Chinese)", context.chineseName);
  known("Category", context.category);
  known("Platform we saw it on", context.sources?.join(", "));
  known("First recorded in our index", context.firstDetectedAt);
  known("Days we have tracked it", context.daysTracked);
  known("Stage we classified it as", context.signals?.stage);
  known("Week-on-week engagement velocity", context.signals?.velocityPct, "%");
  known("Intent score (saves-to-likes, 0-100)", context.signals?.intentScore);
  known("Saves per like", context.engagement?.savesPerLike);
  known("Likes recorded", context.engagement?.likes);
  known("Saves recorded", context.engagement?.saves);
  known("Comments recorded", context.engagement?.comments);
  known("Median 1688 wholesale price (CNY)", context.supplier?.wholesaleCny);
  known("Implied AUD retail (inferred, not measured)", context.market?.retailAud);

  // Row-level records, used by the weekly report where the "product" is a whole niche.
  // These arrive pre-formatted with unknowns already omitted by the caller.
  if (context.reviews?.length) {
    lines.push("", `SIGNALS IN THIS VIEW (${context.reviews.length}):`);
    context.reviews.forEach((r) => lines.push(`- ${r.text ?? r.title ?? ""}`.trimEnd()));
  }

  lines.push(
    "",
    "Figures we deliberately do NOT hold: store revenue, units sold, marketplace rank, review counts, ratings, ad costs, competitor listing counts. If a line above does not mention a figure, we have not measured it.",
  );
  return lines.join("\n");
}

export function isClaudeConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function enrichWithClaude(kind: AnalysisKind, context: ProductContext): Promise<EnrichmentResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0.25,
      system: systemPrompt(kind),
      messages: [{ role: "user", content: factSheet(context) }],
    }),
  });
  if (!response.ok) throw new Error(`Claude request failed: ${response.status}`);
  const payload = await response.json();
  const text = payload?.content?.find((item: { type: string }) => item.type === "text")?.text;
  if (!text) throw new Error("Claude returned no text");
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  let parsed: Partial<EnrichmentResult>;
  try {
    parsed = JSON.parse(cleaned) as Partial<EnrichmentResult>;
  } catch {
    const start = cleaned.indexOf("{");
    let end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Claude returned invalid JSON");
    let candidate = cleaned.slice(start, end + 1);
    try {
      parsed = JSON.parse(candidate) as Partial<EnrichmentResult>;
    } catch {
      // If Claude hit a token cap mid-string, close the structure safely enough for analysis fields.
      candidate = candidate.replace(/,\s*$/, "");
      const openBraces = (candidate.match(/\{/g) || []).length;
      const closeBraces = (candidate.match(/\}/g) || []).length;
      candidate += "}".repeat(Math.max(0, openBraces - closeBraces));
      parsed = JSON.parse(candidate) as Partial<EnrichmentResult>;
    }
  }
  return {
    kind,
    title: parsed.title || "AI analysis",
    executiveSummary: parsed.executiveSummary || "",
    verdict: parsed.verdict,
    score: parsed.score,
    hook: parsed.hook,
    buyer: parsed.buyer,
    risk: parsed.risk,
    actions: parsed.actions || [],
    evidence: parsed.evidence || [],
    complaints: parsed.complaints,
    listing: parsed.listing,
    creatorBrief: parsed.creatorBrief,
    model: MODEL,
    generatedAt: new Date().toISOString(),
  };
}
