import { NextRequest, NextResponse } from "next/server";
import { enrichWithClaude, isClaudeConfigured } from "@/lib/claude";
import { debitCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";
import type { AnalysisKind, ProductContext } from "@/lib/analysis-types";

const VALID = new Set<AnalysisKind>([
  "signal_explanation", "niche_scorecard", "complaint_miner", "listing_copy", "creator_match", "weekly_report",
]);

export async function POST(req: NextRequest) {
  // Stopgap until auth + ledger enforcement land. See lib/guard.ts.
  const blocked = guardPaidRoute(req, "enrich", { limit: 10 });
  if (blocked) return blocked;

  const body = await req.json().catch(() => null) as { kind?: AnalysisKind; context?: ProductContext; userId?: string } | null;
  if (!body?.kind || !VALID.has(body.kind) || !body.context?.name) {
    return NextResponse.json({ error: "Expected kind and product context" }, { status: 400 });
  }
  if (!isClaudeConfigured()) {
    return NextResponse.json({
      setupRequired: true,
      error: "AI analysis is not activated yet",
      instructions: "Add ANTHROPIC_API_KEY in Vercel environment variables for Production and Preview.",
      creditCost: (await import("@/lib/credits")).creditCost(body.kind),
    }, { status: 503 });
  }
  try {
    // Debit only after provider is confirmed configured. In setup mode this is never faked.
    const debit = await debitCredits({ userId: body.userId, action: body.kind, reference: crypto.randomUUID() });
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Analysis failed" }, { status: 500 });
  }
}
