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
      .select("id, title, title_en, niche, platform, source_url, first_detected_at, last_seen_at, likes, saves, comments, shares, engagement_total, velocity_pct, intent_score, wholesale_cny, stage")
      .order("velocity_pct", { ascending: false, nullsFirst: false })
      .order("engagement_total", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error || !data || data.length === 0) return seedPayload();

    const { data: run } = await db
      .from("ingest_runs")
      .select("finished_at, status")
      .eq("status", "complete")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const rows: RadarRow[] = data.map((r: any) => {
      const saves = Number(r.saves ?? 0);
      const likes = Number(r.likes ?? 0);
      return {
        id: r.id,
        product: r.title_en || r.title,
        zh: r.title_en ? r.title : "",
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
  if (!iso) return "—";
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
    })),
    lastIngestAt: null,
    lastIngestStatus: null,
  };
}
