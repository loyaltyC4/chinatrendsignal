import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";

/**
 * Marketplace saturation — the "is this already on Etsy?" number.
 *
 * Sellers currently answer this by hand: search the term, count listings, eyeball
 * the top-10 review counts — 30–60 minutes per product, skipped by most. We cache
 * a measured count per term, refreshed by a batch scraper job (see
 * app/api/cron/saturation). The desk reads the cache; it never scrapes inline.
 *
 * Honesty contract (same as the radar): a term we have not measured returns null
 * and renders as a dash. We never interpolate a count from a neighbour or guess
 * from velocity — a fabricated saturation number is worse than none.
 */

export type Saturation = {
  /** Live listing count on the marketplace. null = not measured. */
  count: number | null;
  /** Average review count across the top-10 results. null = not measured. */
  top10AvgReviews: number | null;
  /** When the count was measured. null = never. */
  measuredAt: string | null;
};

const EMPTY: Saturation = { count: null, top10AvgReviews: null, measuredAt: null };

function norm(term: string) {
  return term.trim().toLowerCase();
}

/** Read the cached saturation for a set of product terms in one query. Returns a
 *  map keyed by normalized term; missing terms map to the empty (unmeasured) value. */
export async function getSaturation(terms: string[]): Promise<Map<string, Saturation>> {
  const map = new Map<string, Saturation>();
  const keys = Array.from(new Set(terms.map(norm).filter(Boolean)));
  for (const k of keys) map.set(k, EMPTY);
  if (!keys.length || !isServiceRoleConfigured()) return map;

  try {
    const db = supabaseAdmin();
    const { data } = await db
      .from("saturation_cache")
      .select("term, listing_count, top10_avg_reviews, measured_at")
      .eq("marketplace", "etsy")
      .in("term", keys);
    for (const r of data ?? []) {
      map.set(norm(r.term), {
        count: r.listing_count ?? null,
        top10AvgReviews: r.top10_avg_reviews != null ? Number(r.top10_avg_reviews) : null,
        measuredAt: r.measured_at ?? null,
      });
    }
  } catch {
    // fall through with the unmeasured map — the desk degrades to dashes, not errors
  }
  return map;
}

/** Upsert a measured count. Called by the saturation cron after each scrape. */
export async function setSaturation(term: string, count: number, top10AvgReviews: number | null) {
  if (!isServiceRoleConfigured()) return;
  const db = supabaseAdmin();
  await db.from("saturation_cache").upsert(
    {
      term: norm(term),
      marketplace: "etsy",
      listing_count: count,
      top10_avg_reviews: top10AvgReviews,
      measured_at: new Date().toISOString(),
    },
    { onConflict: "term,marketplace" },
  );
}

/**
 * Accessibility verdict from a measured count, using the seller heuristics:
 * <500 listings + low top-10 reviews = accessible; >2,000 + heavy reviews = avoid.
 * null when unmeasured so the UI can render a dash.
 */
export function saturationVerdict(s: Saturation): "open" | "building" | "crowded" | null {
  if (s.count == null) return null;
  if (s.count < 500 && (s.top10AvgReviews == null || s.top10AvgReviews < 50)) return "open";
  if (s.count > 2000 || (s.top10AvgReviews != null && s.top10AvgReviews > 200)) return "crowded";
  return "building";
}
