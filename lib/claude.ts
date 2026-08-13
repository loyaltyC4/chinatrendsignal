import type { AnalysisKind, EnrichmentResult, ProductContext } from "./analysis-types";

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

function systemPrompt(kind: AnalysisKind) {
  const base = `You are China Trend Signal's product intelligence analyst. You are given public product, supplier, market, engagement, review, and creator data. Be commercially rigorous. Never invent sales, revenue, review counts, citations, or source facts. Clearly distinguish evidence from inference. Do not give legal, medical, or financial advice. Use concise Australian English. Return valid JSON only.`;
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
      max_tokens: 1400,
      temperature: 0.25,
      system: systemPrompt(kind),
      messages: [{ role: "user", content: JSON.stringify(context) }],
    }),
  });
  if (!response.ok) throw new Error(`Claude request failed: ${response.status}`);
  const payload = await response.json();
  const text = payload?.content?.find((item: { type: string }) => item.type === "text")?.text;
  if (!text) throw new Error("Claude returned no text");
  const parsed = JSON.parse(text) as Partial<EnrichmentResult>;
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
