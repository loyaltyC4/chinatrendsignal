import { NextRequest, NextResponse } from "next/server";
import { enrichWithClaude, isClaudeConfigured } from "@/lib/claude";
import { debitCredits, refundCredits, InsufficientCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";
import { requireUser } from "@/lib/auth";
import { getRadar } from "@/lib/signals";

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  // Chat invites repeat calls, so the allowance is higher than the other routes.
  const blocked = await guardPaidRoute(req, "ask", { identity: user.id, limit: 60 });
  if (blocked) return blocked;

  const body = await req.json().catch(() => null) as { question?: string } | null;
  if (!body?.question?.trim()) return NextResponse.json({ error: "Ask a question" }, { status: 400 });
  if (!isClaudeConfigured()) {
    return NextResponse.json({ setupRequired: true, error: "The analyst is not connected yet", instructions: "Add ANTHROPIC_API_KEY in Vercel environment variables for Production and Preview.", creditCost: 2 }, { status: 503 });
  }

  const reference = crypto.randomUUID();
  let debit;
  try {
    debit = await debitCredits({ userId: user.id, action: "ask", reference });
  } catch (error) {
    if (error instanceof InsufficientCredits) {
      return NextResponse.json({ error: "Not enough credits to ask.", required: error.required, balance: error.balance }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not charge credits" }, { status: 500 });
  }

  try {
    // Grounded in the cache. getRadar falls back to the seed set when the nightly
    // pull has not produced rows yet, and reports which it returned.
    const { rows, source } = await getRadar(12);
    const result = await enrichWithClaude("signal_explanation", {
      name: body.question,
      category: "Analyst question",
      signals: { stage: "Rising" },
      market: {},
      reviews: rows.map((s) => ({
        platform: s.sources[0] || "Radar",
        text: `${s.product}${s.zh ? ` — ${s.zh}` : ""}; velocity +${s.velocityPct}%; intent ${s.intent}; wholesale ¥${s.wholesaleCny}${s.daysTracked != null ? `; first seen ${s.daysTracked}d ago` : ""}`,
      })),
    });
    const answer = [result.executiveSummary, result.actions.length ? `\n\nNext moves:\n${result.actions.map((a) => `• ${a}`).join("\n")}` : ""].filter(Boolean).join("");
    // Tell the caller which dataset the answer came from, so the UI can say so.
    return NextResponse.json({ ok: true, answer, dataSource: source, credit: debit });
  } catch (error) {
    await refundCredits({ userId: user.id, action: "ask", reference });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analyst failed" }, { status: 500 });
  }
}
