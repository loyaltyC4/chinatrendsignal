/**
 * Product extraction.
 *
 * WHY: discovery returns post captions, not product names. A real row looks like
 * "#好物分享 #爱用好物 #便宜好用 #名创优品" or "我真服了我老婆…他真是个购物奇才！
 * #母婴好物 #防止宝宝掉下床". Feeding that to 1688 search returns noise, which is how
 * the first run matched a walrus video to a supplier at ¥13.
 *
 * COST: batched deliberately. 25 titles per call on Haiku is ~$0.0002/row; one call
 * per row would repeat the system prompt every time and cost roughly 5x more for the
 * same output. Extraction is ~100x cheaper than the single JustOne call it unlocks,
 * so the batching matters less for the Claude bill than for keeping the run inside
 * its time budget — but it is free to do correctly.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
// Extraction is a narrow classification task; the frontier model is not needed and
// costs 3x more. Overridable if the cheap model proves insufficient.
const MODEL = process.env.ANTHROPIC_EXTRACT_MODEL || "claude-haiku-4-5";

export type ExtractionInput = { id: string; title: string };
export type ExtractionOutput = {
  id: string;
  isProduct: boolean;
  productTerm: string | null; // Chinese noun phrase, for 1688 search
  productEn: string | null;   // English label, for the UI
};

const SYSTEM = `You extract the physical product from Chinese social commerce posts.

For each numbered post you receive, decide whether it is promoting a SPECIFIC PHYSICAL PRODUCT that a cross-border seller could source and resell.

Return isProduct false for: entertainment, vlogs, memes, pets being cute, scenery, travel, recipes with no product focus, services, general lifestyle advice, and posts naming only a brand or shop with no identifiable item.

Return isProduct true only when a concrete physical object is identifiable.

When true:
- productTerm: the Chinese product noun phrase, 2-6 characters where possible, suitable as a 1688 wholesale SEARCH QUERY. Strip brand names, hashtags, adjectives and marketing language. Prefer the generic category term a factory would list under. Example: from "#好物分享 谷雨湿敷棉片 #湿敷棉片" return "湿敷棉片" (cotton pads), not the brand 谷雨.
- productEn: a short plain English name, 2-5 words.

When false, set productTerm and productEn to null.

Do not guess. If several products appear, pick the single most prominent. If none is identifiable, isProduct is false.

Return ONLY a JSON array, no prose and no markdown fences, in the form:
[{"i":1,"isProduct":true,"productTerm":"湿敷棉片","productEn":"facial cotton pads"}]`;

export function isExtractionConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Extract products from a batch of titles. Returns one result per input; on any
 * failure the batch is reported as unextracted rather than guessed, so a bad model
 * response can never silently mark noise as a product.
 */
export async function extractProducts(
  items: ExtractionInput[],
  timeoutMs = 25_000,
): Promise<{ ok: boolean; results: ExtractionOutput[]; model: string; error?: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, results: [], model: MODEL, error: "ANTHROPIC_API_KEY not set" };
  if (!items.length) return { ok: true, results: [], model: MODEL };

  const numbered = items
    .map((it, i) => `${i + 1}. ${it.title.replace(/\s+/g, " ").slice(0, 160)}`)
    .join("\n");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        // ~30 tokens per row plus headroom; caps a runaway response.
        max_tokens: Math.min(4000, 120 + items.length * 45),
        temperature: 0,
        system: SYSTEM,
        messages: [{ role: "user", content: numbered }],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      return { ok: false, results: [], model: MODEL, error: `Claude returned HTTP ${res.status}` };
    }

    const payload = await res.json();
    const text: string | undefined = payload?.content?.find((c: any) => c.type === "text")?.text;
    if (!text) return { ok: false, results: [], model: MODEL, error: "Empty response" };

    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start < 0 || end <= start) {
      return { ok: false, results: [], model: MODEL, error: "No JSON array in response" };
    }

    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed)) return { ok: false, results: [], model: MODEL, error: "Not an array" };

    const results: ExtractionOutput[] = [];
    for (const row of parsed) {
      const idx = Number(row?.i);
      if (!Number.isInteger(idx) || idx < 1 || idx > items.length) continue;
      const source = items[idx - 1]!;
      const isProduct = row?.isProduct === true;
      const term = typeof row?.productTerm === "string" ? row.productTerm.trim() : "";
      const en = typeof row?.productEn === "string" ? row.productEn.trim() : "";
      results.push({
        id: source.id,
        // A "product" with no usable search term is not actionable; treat it as false
        // so it neither shows on the radar nor consumes a paid 1688 lookup.
        isProduct: isProduct && term.length > 0,
        productTerm: isProduct && term ? term.slice(0, 60) : null,
        productEn: isProduct && en ? en.slice(0, 80) : null,
      });
    }

    return { ok: true, results, model: MODEL };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "TimeoutError";
    return {
      ok: false,
      results: [],
      model: MODEL,
      error: aborted ? `Timed out after ${timeoutMs}ms` : err instanceof Error ? err.message : "Extraction failed",
    };
  }
}
