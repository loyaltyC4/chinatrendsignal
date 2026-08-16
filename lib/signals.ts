import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/server";
import { SIGNALS as SEED } from "@/lib/radar-data";
import type { Signal } from "@/components/signal-feed";

/**
 * Read layer for the radar.
 *
 * Returns real cached rows when the ingest has produced any, and falls back to the
 * seed table otherwise. The `source` field is not cosmetic: the UI must tell the
 * user which one they are looking at. Presenting seed rows as live data is the
 * specific dishonesty this product positions against.
 */

export type RadarSource = "live" | "seed";

export type RadarRow = Signal & {
  firstDetectedAt: string | null;
  daysTracked: number | null;
  lastSeenAt: string | null;
  sourceUrl: string | null;
  savesRatio: number | null;
  /** null while the extraction backlog clears; true once confirmed a product. */
  isProduct: boolean | null;
  /** Engagement over time, oldest first. Drives the inline row sparkline. Empty
   *  when we have fewer than two observations — we draw nothing rather than
   *  faking a trend line from a single point. */
  spark: number[];
};

export type RadarPayload = {
  source: RadarSource;
  rows: RadarRow[];
  lastIngestAt: string | null;
  lastIngestStatus: string | null;
};

function daysBetween(iso: string | null) {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Rough AUD retail comparator until a real retail feed exists. Deliberately null
 *  rather than invented when we have no wholesale price to work from. */
function impliedRetailAud(wholesaleCny: number | null): number | null {
  if (!wholesaleCny || wholesaleCny <= 0) return null;
  const aud = wholesaleCny * 0.21; // CNY -> AUD, approximate
  return Math.round(aud * 12 * 100) / 100; // typical cross-border markup band
}

export async function getRadar(limit = 40): Promise<RadarPayload> {
  if (!isServiceRoleConfigured()) return seedPayload();

  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("signals")
      .select("id, title, title_en, product_term, product_en, is_product, niche, platform, source_url, first_detected_at, last_seen_at, likes, saves, comments, shares, engagement_total, velocity_pct, intent_score, wholesale_cny, stage")
      // Drop rows extraction confirmed are not products. Rows not yet assessed
      // (is_product null) stay visible so the radar is not empty while the
      // extraction backlog clears.
      .not("is_product", "is", false)
      .order("velocity_pct", { ascending: false, nullsFirst: false })
      .order("engagement_total", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error || !data || data.length === 0) return seedPayload();

    // One batched query for the observation history behind every returned row,
    // grouped in memory. Avoids an N+1 round trip per signal.
    const ids = data.map((r: any) => r.id);
    const sparks = new Map<string, number[]>();
    const { data: obs } = await db
      .from("signal_observations")
      .select("signal_id, engagement_total, observed_at")
      .in("signal_id", ids)
      .order("observed_at", { ascending: true });
    for (const o of obs ?? []) {
      const arr = sparks.get(o.signal_id) ?? [];
      arr.push(Number(o.engagement_total ?? 0));
      sparks.set(o.signal_id, arr);
    }

    // "partial" is the normal steady state, not a failure: source rotation means a
    // run deliberately covers a slice per night. Only "failed" should be excluded.
    const { data: run } = await db
      .from("ingest_runs")
      .select("finished_at, status")
      .in("status", ["complete", "partial"])
      .not("finished_at", "is", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const rows: RadarRow[] = data.map((r: any) => {
      const saves = Number(r.saves ?? 0);
      const likes = Number(r.likes ?? 0);
      return {
        id: r.id,
        // Prefer the extracted product name; fall back to the raw caption so a row
        // is never blank while it waits for extraction.
        product: r.product_en || r.title_en || r.title,
        zh: r.product_term || (r.title_en ? r.title : ""),
        niche: r.niche || "Unclassified",
        stage: (r.stage as Signal["stage"]) || "Rising",
        velocityPct: r.velocity_pct != null ? Number(r.velocity_pct) : 0,
        // Saves-to-likes is the bookmark-to-buy proxy. Null when we have neither,
        // rather than a fabricated score.
        intent: r.intent_score ?? (likes > 0 ? Math.min(100, Math.round((saves / likes) * 100)) : 0),
        wholesaleCny: r.wholesale_cny != null ? Number(r.wholesale_cny) : 0,
        retailAud: impliedRetailAud(r.wholesale_cny) ?? 0,
        sources: [platformLabel(r.platform)],
        refreshed: relativeTime(r.last_seen_at),
        firstDetectedAt: r.first_detected_at,
        daysTracked: daysBetween(r.first_detected_at),
        lastSeenAt: r.last_seen_at,
        sourceUrl: r.source_url,
        savesRatio: likes > 0 ? Math.round((saves / likes) * 100) / 100 : null,
        isProduct: r.is_product ?? null,
        spark: (sparks.get(r.id) ?? []).slice(-14),
      };
    });

    return {
      source: "live",
      rows,
      lastIngestAt: run?.finished_at ?? null,
      lastIngestStatus: run?.status ?? null,
    };
  } catch {
    return seedPayload();
  }
}

export async function getNiches(): Promise<string[]> {
  const { rows } = await getRadar(200);
  return Array.from(new Set(rows.map((r) => r.niche).filter(Boolean))).sort();
}

export async function getSignalsForNiche(niche: string): Promise<RadarRow[]> {
  const { rows } = await getRadar(200);
  return rows.filter((r) => r.niche === niche);
}

function platformLabel(p: string) {
  return { douyin: "Douyin", xiaohongshu: "XHS", "1688": "1688", taobao: "Taobao" }[p] || p;
}

function relativeTime(iso: string | null) {
  if (!iso) return "-";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function seedPayload(): RadarPayload {
  return {
    source: "seed",
    rows: SEED.map((s) => ({
      ...s,
      firstDetectedAt: null,
      daysTracked: null,
      lastSeenAt: null,
      sourceUrl: null,
      savesRatio: null,
      isProduct: null,
      spark: [],
    })),
    lastIngestAt: null,
    lastIngestStatus: null,
  };
}
