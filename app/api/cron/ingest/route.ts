import { NextRequest, NextResponse } from "next/server";
import { runIngest, probeEndpoints } from "@/lib/ingest";
import { isJustOneConfigured } from "@/lib/justone";
import { isServiceRoleConfigured } from "@/lib/supabase/server";

// Vercel Hobby caps this at 60s. The pipeline budgets 45s of work and reserves the
// rest for writing the run record, so a slow upstream degrades to a partial run
// rather than a hard timeout with no audit trail.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/ingest        — run the nightly ingest
 * GET /api/cron/ingest?probe=1 — probe which JustOne endpoints this token can reach
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Manual runs use the
 * same header. Without CRON_SECRET set the route refuses to run at all, rather than
 * defaulting open on a route that spends money.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured; refusing to run a paid job unauthenticated." },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isJustOneConfigured()) {
    return NextResponse.json({ error: "JUSTONEAPI_TOKEN is not set" }, { status: 503 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }

  if (req.nextUrl.searchParams.get("probe") === "1") {
    const results = await probeEndpoints();
    return NextResponse.json({
      mode: "probe",
      note: "Reports which JustOne endpoints this token can reach. Code 600 means the endpoint is not enabled; 601 means the shared balance is empty.",
      results,
    });
  }

  const report = await runIngest();
  return NextResponse.json(report, { status: report.status === "failed" ? 500 : 200 });
}
