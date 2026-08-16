import { NextRequest, NextResponse } from "next/server";
import { enrichWithClaude, isClaudeConfigured } from "@/lib/claude";
import { debitCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";

export async function POST(req: NextRequest) {
  // Reports are the most expensive Claude call we make, so the window is tighter.
  const blocked = guardPaidRoute(req, "reports", { limit: 5 });
  if (blocked) return blocked;

  const body = await req.json().catch(() => null) as { niche?: string; signals?: Array<{ product: string; velocityPct: number; intent: number; wholesaleCny: number; retailAud: number }>; userId?: string } | null;
  if (!body?.niche || !Array.isArray(body.signals)) return NextResponse.json({ error: "Expected niche and signals" }, { status: 400 });
  if (!isClaudeConfigured()) return NextResponse.json({ setupRequired: true, error: "Reports are not connected yet", instructions: "Add ANTHROPIC_API_KEY in Vercel environment variables for Production and Preview.", creditCost: 10 }, { status: 503 });
  try {
    const debit = await debitCredits({ userId: body.userId, action: "weekly_report", reference: crypto.randomUUID() });
    const result = await enrichWithClaude("weekly_report", {
      name: `${body.niche} weekly intelligence`,
      category: body.niche,
      signals: { stage: "Rising" },
      market: {},
      reviews: body.signals.map((s) => ({ platform: "Radar", text: `${s.product}: velocity +${s.velocityPct}%, intent ${s.intent}/100, wholesale ¥${s.wholesaleCny}, retail A$${s.retailAud}` })),
    });
    const report = [result.title, "", result.executiveSummary, result.actions.length ? `\nWhat to do next:\n${result.actions.map((a) => `• ${a}`).join("\n")}` : ""].filter(Boolean).join("\n");
    return NextResponse.json({ ok: true, report, credit: debit });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Report failed" }, { status: 500 });
  }
}
