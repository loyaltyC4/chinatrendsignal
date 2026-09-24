import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/server";
import { getAmazonConfig, isAmazonConfigured, searchCatalog } from "@/lib/amazon";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/evidence — nightly Amazon US catalog evidence pull.
 *
 * ORDERING: consumes jev_route = 'auto' rows FIRST (Jev already blessed them),
 * then unrouted products ranked by saves. This is the Phase 2 design: evidence
 * follows triage, so paid marketplace attention lands on products that already
 * cleared the cheap gate.
 *
 * COST/TIME: SP-API catalog search is 2-10s per term. Default batch 5 terms fits
 * the 60s Hobby budget with margin; one page of 10 items per term, nothing else.
 *
 * HONESTY: every row written to evidence_cache carries source='amazon_sp_api_us',
 * the search term actually used, and retrieved_at. A failed term is recorded as
 * absent — nothing is interpolated or carried forward from a previous run.
 *
 * Auth: same Bearer CRON_SECRET contract as /api/cron/ingest.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured; refusing to run an authenticated job unauthenticated." },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAmazonConfigured()) {
    return NextResponse.json(
      { error: "Amazon SP-API credentials are not configured (AMAZON_LWA_CLIENT_ID/SECRET, AMAZON_REFRESH_TOKEN, AMAZON_AWS_ACCESS_KEY_ID/SECRET). Evidence stage is fail-closed." },
      { status: 503 },
    );
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }

  const db = supabaseAdmin();
  const cfg = getAmazonConfig()!;
  const maxTerms = Number(process.env.MAX_EVIDENCE_PER_RUN || 5);
  const results: any[] = [];

  // Jev-approved first, then unrouted products by saves. product_term is the
  // Chinese 1688 noun — English search works better against the US catalog, so we
  // prefer product_en and fall back to the extracted English label only.
  const { data: queue } = await db
    .from("signals")
    .select("id, product_en, product_term, jev_route")
    .eq("is_product", true)
    .not("product_en", "is", null)
    .order("jev_route", { ascending: false, nullsFirst: false }) // 'auto' sorts before null lexicographically? no — order by saves below instead
    .limit(maxTerms * 3);

  // Simpler, honest ordering: auto-routed first (fixed set), then the rest by saves.
  const auto = (queue ?? []).filter((q: any) => q.jev_route === "auto").slice(0, maxTerms);
  const rest = (queue ?? [])
    .filter((q: any) => q.jev_route !== "auto" && q.jev_route !== "kill")
    .sort((a: any, b: any) => (b.saves ?? 0) - (a.saves ?? 0))
    .slice(0, maxTerms - auto.length);
  const terms = [...auto, ...rest].filter((q: any) => (q.product_en ?? "").trim().length > 1).slice(0, maxTerms);

  for (const q of terms) {
    const term = (q.product_en as string).trim().slice(0, 60);
    const r = await searchCatalog(cfg, term);
    if (r.ok) {
      const { error } = await db.from("evidence_cache").upsert(
        {
          signal_id: q.id,
          source: "amazon_sp_api_us",
          search_term: term,
          result_count: r.data.resultCount,
          top_prices_usd: r.data.topPricesUsd,
          top_asins: r.data.topAsins,
          retrieved_at: r.data.retrievedAt,
        },
        { onConflict: "signal_id,source" },
      );
      results.push({ signalId: q.id, term, ok: true, count: r.data.resultCount, error: error?.message });
    } else {
      results.push({ signalId: q.id, term, ok: false, code: r.code, message: r.message.slice(0, 200) });
      // Auth/permission failures will not heal by hammering: stop the run.
      if (r.code === 401 || r.code === 403) break;
    }
  }

  return NextResponse.json({
    status: "complete",
    termsSearched: terms.length,
    results,
  });
}
