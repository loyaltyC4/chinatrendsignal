import { NextRequest, NextResponse } from "next/server";
import { enrichWithClaude, isClaudeConfigured } from "@/lib/claude";
import { debitCredits, refundCredits, InsufficientCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";
import { requireUser } from "@/lib/auth";
import { getSignalsForNiche } from "@/lib/signals";

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  // The most expensive Claude call we make, so the allowance is the tightest.
  const blocked = await guardPaidRoute(req, "reports", { identity: user.id, limit: 10 });
  if (blocked) return blocked;

  const body = await req.json().catch(() => null) as { niche?: string } | null;
  if (!body?.niche) return NextResponse.json({ error: "Expected a niche" }, { status: 400 });

  // Signals are read server-side from the cache. The previous version took them
  // from the request body, which let a caller generate a report about anything and
  // present it as our data.
  const rows = await getSignalsForNiche(body.niche);
  if (!rows.length) {
    return NextResponse.json({ error: "No signals for that niche" }, { status: 404 });
  }

  if (!isClaudeConfigured()) {
    return NextResponse.json({ setupRequired: true, error: "Reports are not connected yet", instructions: "Add ANTHROPIC_API_KEY in Vercel environment variables for Production and Preview.", creditCost: 10 }, { status: 503 });
  }

  const reference = crypto.randomUUID();
  let debit;
  try {
    debit = await debitCredits({ userId: user.id, action: "weekly_report", reference });
  } catch (error) {
    if (error instanceof InsufficientCredits) {
      return NextResponse.json({ error: "Not enough credits for a report.", required: error.required, balance: error.balance }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not charge credits" }, { status: 500 });
  }

  try {
    const result = await enrichWithClaude("weekly_report", {
      name: `${body.niche} weekly intelligence`,
      category: body.niche,
      signals: { stage: "Rising" },
      market: {},
      // Each row is described with its KNOWN figures only. The previous version wrote
      // "wholesale ¥0" and "velocity +0%" for rows we had not measured, so the report
      // read those absences back as findings ("zero momentum, ¥0 pricing").
      reviews: rows.map((s) => {
        const parts = [
          s.velocityPct ? `velocity +${s.velocityPct}%` : null,
          s.intent ? `intent ${s.intent}/100` : null,
          s.savesRatio != null ? `${s.savesRatio.toFixed(2)} saves per like` : null,
          s.wholesaleCny ? `wholesale ¥${s.wholesaleCny}` : "no factory price measured",
          s.daysTracked != null ? `tracked ${s.daysTracked}d` : null,
        ].filter(Boolean);
        return { platform: s.sources[0] ?? "Radar", text: `${s.product}${s.zh ? ` (${s.zh})` : ""}: ${parts.join(", ")}` };
      }),
    });
    const report = [result.title, "", result.executiveSummary, result.actions.length ? `\nWhat to do next:\n${result.actions.map((a) => `• ${a}`).join("\n")}` : ""].filter(Boolean).join("\n");
    return NextResponse.json({ ok: true, report, credit: debit });
  } catch (error) {
    await refundCredits({ userId: user.id, action: "weekly_report", reference });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Report failed" }, { status: 500 });
  }
}
