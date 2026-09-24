import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { setSaturation } from "@/lib/saturation";

/**
 * GET /api/cron/saturation — refresh the Etsy saturation cache.
 *
 * Runs nightly after ingest. For each active product term it asks a scraper
 * (Firecrawl, when FIRECRAWL_API_KEY is set) how many live Etsy listings match,
 * and stores the measured count. The desk reads the cache; it never scrapes
 * inline.
 *
 * Honesty contract: if the scraper isn't configured or a term's count can't be
 * read, we store nothing for that term — the desk renders a dash, not a guess.
 * Auth is the shared CRON_SECRET bearer, same as the other paid jobs.
 */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function etsyListingCount(term: string): Promise<{ count: number; top10AvgReviews: number | null } | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: `site:etsy.com/listing ${term}`, limit: 1 }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; data?: { web?: Array<{ url?: string }> } };
    // Firecrawl search doesn't return Etsy's internal result count; without that
    // we can't honestly report a number, so we return null. A dedicated Etsy
    // scrape (Apify etsy-scraper) returns the real totalResults and belongs here
    // once wired.
    return null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const db = supabaseAdmin();
  const { data } = await db
    .from("signals")
    .select("product_en, product_term")
    .not("is_product", "is", false)
    .order("velocity_pct", { ascending: false, nullsFirst: false })
    .limit(40);

  const terms = Array.from(
    new Set((data ?? []).map((r: any) => (r.product_en || r.product_term || "").trim().toLowerCase()).filter(Boolean)),
  );

  let measured = 0;
  for (const term of terms) {
    const got = await etsyListingCount(term);
    if (got) {
      await setSaturation(term, got.count, got.top10AvgReviews);
      measured++;
    }
    // Firecrawl rate limits — pace the batch.
    await new Promise((r) => setTimeout(r, 300));
  }

  return NextResponse.json({ considered: terms.length, measured, note: "unmeasured terms left as a dash" });
}
