import { NextRequest, NextResponse } from "next/server";
import { enrichWithClaude, isClaudeConfigured } from "@/lib/claude";
import { debitCredits } from "@/lib/credits";
import { SIGNALS } from "@/lib/radar-data";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { question?: string; history?: Array<{ role: string; content: string }>; userId?: string } | null;
  if (!body?.question?.trim()) return NextResponse.json({ error: "Ask a question" }, { status: 400 });
  if (!isClaudeConfigured()) {
    return NextResponse.json({ setupRequired: true, error: "The analyst is not connected yet", instructions: "Add ANTHROPIC_API_KEY in Vercel environment variables for Production and Preview.", creditCost: 2 }, { status: 503 });
  }
  try {
    const debit = await debitCredits({ userId: body.userId, action: "signal_explanation", reference: crypto.randomUUID() });
    // Ground the analyst in the live signal table instead of inventing products.
    const result = await enrichWithClaude("signal_explanation", {
      name: body.question,
      category: "Analyst question",
      signals: { stage: "Rising" },
      market: {},
      reviews: SIGNALS.slice(0, 12).map((s) => ({ platform: s.sources[0] || "Radar", text: `${s.product} — ${s.zh}; velocity +${s.velocityPct}%; intent ${s.intent}; spread ${s.retailAud}s vs ¥${s.wholesaleCny}` })),
    });
    const answer = [result.executiveSummary, result.actions.length ? `\n\nNext moves:\n${result.actions.map((a) => `• ${a}`).join("\n")}` : ""].filter(Boolean).join("");
    return NextResponse.json({ ok: true, answer, credit: debit });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analyst failed" }, { status: 500 });
  }
}
