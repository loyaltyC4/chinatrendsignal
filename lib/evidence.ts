import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";

/**
 * Amazon US catalog evidence — the read layer over evidence_cache.
 *
 * Mirrors lib/saturation.ts: the desk reads the cache; it never calls SP-API
 * inline. A signal without a cached row renders a dash — "not measured" — never
 * a carried-forward or interpolated number. Every cached row was written by the
 * nightly evidence cron with its own search_term and retrieved_at.
 */

export type AmazonEvidence = {
  /** Catalog items returned for the search term. null = not measured. */
  resultCount: number | null;
  /** Median of the top-5 listed prices (USD). null when none carried a price. */
  medianTopPriceUsd: number | null;
  topAsins: string[];
  retrievedAt: string | null;
};

const EMPTY: AmazonEvidence = { resultCount: null, medianTopPriceUsd: null, topAsins: [], retrievedAt: null };

export function emptyAmazonEvidence(): AmazonEvidence {
  return { ...EMPTY, topAsins: [] };
}

export async function getAmazonEvidence(signalIds: string[]): Promise<Map<string, AmazonEvidence>> {
  const map = new Map<string, AmazonEvidence>();
  if (!signalIds.length || !isServiceRoleConfigured()) return map;
  try {
    const db = supabaseAdmin();
    const { data } = await db
      .from("evidence_cache")
      .select("signal_id, result_count, top_prices_usd, top_asins, retrieved_at")
      .eq("source", "amazon_sp_api_us")
      .in("signal_id", signalIds);
    for (const r of data ?? []) {
      const prices = Array.isArray(r.top_prices_usd) ? r.top_prices_usd.map(Number).filter((n: number) => Number.isFinite(n) && n > 0).sort((a: number, b: number) => a - b) : [];
      map.set(r.signal_id, {
        resultCount: r.result_count != null ? Number(r.result_count) : null,
        medianTopPriceUsd: prices.length ? prices[Math.floor(prices.length / 2)] : null,
        topAsins: Array.isArray(r.top_asins) ? r.top_asins : [],
        retrievedAt: r.retrieved_at ?? null,
      });
    }
  } catch {
    // degrade to unmeasured — dashes, not errors
  }
  return map;
}
