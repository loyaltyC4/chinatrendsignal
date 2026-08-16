import { NextRequest, NextResponse } from "next/server";
import { enrichWithClaude, isClaudeConfigured } from "@/lib/claude";
import { creditCost, debitCredits, refundCredits, InsufficientCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";
import { requireUser } from "@/lib/auth";
import type { AnalysisKind, ProductContext } from "@/lib/analysis-types";

const VALID = new Set<AnalysisKind>([
  "signal_explanation", "niche_scorecard", "complaint_miner", "listing_copy", "creator_match", "weekly_report",
]);

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const blocked = await guardPaidRoute(req, "enrich", { identity: user.id, limit: 30 });
  if (blocked) return blocked;

  const body = await req.json().catch(() => null) as { kind?: AnalysisKind; context?: ProductContext } | null;
  if (!body?.kind || !VALID.has(body.kind) || !body.context?.name) {
    return NextResponse.json({ error: "Expected kind and product context" }, { status: 400 });
  }
  if (!isClaudeConfigured()) {
    return NextResponse.json({
      setupRequired: true,
      error: "AI analysis is not activated yet",
      instructions: "Add ANTHROPIC_API_KEY in Vercel environment variables for Production and Preview.",
      creditCost: creditCost(body.kind),
    }, { status: 503 });
  }

  const reference = crypto.randomUUID();
  let debit;
  try {
    // Charge first: a failed debit must never yield a free upstream call.
    debit = await debitCredits({ userId: user.id, action: body.kind, reference });
  } catch (error) {
    if (error instanceof InsufficientCredits) {
      return NextResponse.json({
        error: "Not enough credits for this analysis.",
        required: error.required,
        balance: error.balance,
      }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not charge credits" }, { status: 500 });
  }

  try {
    let result;
    try {
      result = await enrichWithClaude(body.kind, body.context);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not valid JSON")) {
        result = await enrichWithClaude(body.kind, { ...body.context, name: `${body.context.name} — return minified JSON only, no markdown fences` });
      } else throw error;
    }
    return NextResponse.json({ ok: true, result, credit: debit });
  } catch (error) {
    // Upstream failed after we charged — give the credits back.
    await refundCredits({ userId: user.id, action: body.kind, reference });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
