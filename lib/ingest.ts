import { supabaseAdmin } from "@/lib/supabase/server";
import {
  callJustOne,
  douyinHotSearch,
  xhsHotList,
  wholesaleSearch,
  type JustOneResult,
} from "@/lib/justone";

/**
 * Nightly ingest.
 *
 * SHAPE OF THE PROBLEM: Vercel caps a Hobby function at 60s, while JustOne suggests
 * 120s timeouts and each call costs real money. So this does NOT try to build the
 * whole radar in one pass. It runs a cheap discovery stage every night, then spends
 * whatever time is left enriching the least-recently-enriched signals. The cache
 * converges over several nights instead of blowing the time and cost budget in one.
 *
 * FIELD MAPPING CAVEAT: the exact JSON shape of each JustOne endpoint is not
 * documented field-by-field, so the extractors below try the common key spellings
 * and fall back gracefully. Every item's untouched payload is stored in signals.raw,
 * so once we've seen real responses we can tighten the mapping without re-fetching.
 */

const DISCOVERY_CATEGORIES: Array<{ contentType: string; niche: string }> = [
  { contentType: "HOME_LIVING", niche: "Home & living" },
  { contentType: "ANIMAL", niche: "Pet care" },
  { contentType: "FOOD", niche: "Food & snacks" },
  { contentType: "MOTHER_BABY", niche: "Mother & baby" },
  { contentType: "FASHION", niche: "Fashion" },
  { contentType: "SPORTS", niche: "Sports & outdoors" },
];

export type EndpointResult = {
  endpoint: string;
  label: string;
  ok: boolean;
  code: number;
  message?: string;
  ms: number;
  items?: number;
};

export type IngestReport = {
  runId: string | null;
  status: "complete" | "partial" | "failed";
  callsMade: number;
  inserted: number;
  updated: number;
  enriched: number;
  elapsedMs: number;
  stoppedEarly: string | null;
  endpoints: EndpointResult[];
};

/* --------------------------- extraction helpers --------------------------- */

function pickArray(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  for (const key of ["list", "items", "data", "records", "notes", "videos", "result", "aweme_list", "cards"]) {
    const v = data[key];
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      for (const inner of ["list", "items", "data", "records"]) {
        if (Array.isArray(v[inner])) return v[inner];
      }
    }
  }
  return [];
}

function firstString(obj: any, keys: string[]): string | null {
  for (const k of keys) {
    const v = k.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function firstNumber(obj: any, keys: string[]): number | null {
  for (const k of keys) {
    const v = k.split(".").reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && /^\d+(\.\d+)?$/.test(v)) return Number(v);
  }
  return null;
}

const TITLE_KEYS = ["title", "desc", "display_title", "content", "text", "name", "note_title", "aweme_title", "word", "sentence", "subject"];
const URL_KEYS = ["url", "share_url", "note_url", "link", "detail_url", "share_info.share_url"];
const IMAGE_KEYS = ["cover", "image", "pic", "cover_url", "image_url", "video.cover.url_list.0", "images_list.0.url"];

/** Stable identity so the same product on the same platform dedupes across runs. */
function fingerprint(platform: string, title: string) {
  const norm = title
    .toLowerCase()
    .replace(/[\s　]+/g, " ")
    .replace(/[!-/:-@[-`{-~，。！？、；：""''（）【】]/g, "")
    .trim()
    .slice(0, 120);
  return `${platform}:${norm}`;
}

type Extracted = {
  title: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  likes: number | null;
  saves: number | null;
  comments: number | null;
  shares: number | null;
  raw: any;
};

function extractItem(item: any): Extracted | null {
  const title = firstString(item, TITLE_KEYS);
  if (!title || title.length < 2) return null;
  return {
    title,
    sourceUrl: firstString(item, URL_KEYS),
    imageUrl: firstString(item, IMAGE_KEYS),
    likes: firstNumber(item, ["digg_count", "like_count", "likedCount", "likes", "liked_count", "statistics.digg_count", "interact_info.liked_count"]),
    saves: firstNumber(item, ["collect_count", "collectedCount", "collects", "collected_count", "favorite_count", "interact_info.collected_count"]),
    comments: firstNumber(item, ["comment_count", "commentCount", "comments", "statistics.comment_count", "interact_info.comment_count"]),
    shares: firstNumber(item, ["share_count", "shareCount", "shares", "statistics.share_count", "interact_info.shared_count"]),
    raw: item,
  };
}

/** Pull the first plausible CNY price out of a 1688 search item. */
function extractPriceCny(item: any): number | null {
  const n = firstNumber(item, ["price", "priceInfo.price", "unitPrice", "sale_price", "wholesalePrice", "priceRange.0.price", "quantityPrices.0.price"]);
  if (n != null && n > 0 && n < 100000) return n;
  const s = firstString(item, ["price", "priceInfo.price", "showPrice"]);
  if (s) {
    const m = s.match(/(\d+(?:\.\d+)?)/);
    if (m) return Number(m[1]);
  }
  return null;
}

/* ------------------------------- the run ------------------------------- */

export async function runIngest(opts: { budgetMs?: number; maxCalls?: number } = {}): Promise<IngestReport> {
  const started = Date.now();
  const budgetMs = opts.budgetMs ?? 45_000;
  const maxCalls = opts.maxCalls ?? Number(process.env.MAX_INGEST_CALLS || 20);

  const endpoints: EndpointResult[] = [];
  let callsMade = 0;
  let inserted = 0;
  let updated = 0;
  let enriched = 0;
  let stoppedEarly: string | null = null;

  const db = supabaseAdmin();
  const { data: runRow } = await db.from("ingest_runs").insert({ status: "running" }).select("id").single();
  const runId: string | null = runRow?.id ?? null;

  const timeLeft = () => budgetMs - (Date.now() - started);
  const canCall = () => callsMade < maxCalls && timeLeft() > 8_000;

  const note = (label: string, r: JustOneResult<any>, items?: number) => {
    endpoints.push({
      endpoint: r.endpoint,
      label,
      ok: r.ok,
      code: r.code,
      message: r.ok ? undefined : r.message,
      ms: r.ms,
      items,
    });
  };

  try {
    /* ---- Stage A: discovery (cheap, no keyword required) ---- */

    if (canCall()) {
      callsMade++;
      const r = await xhsHotList();
      const items = r.ok ? pickArray(r.data) : [];
      note("XHS hot list", r, items.length);
      if (r.ok) {
        const res = await persist(items, "xiaohongshu", null);
        inserted += res.inserted;
        updated += res.updated;
      } else if (r.fatal) {
        stoppedEarly = `XHS hot list returned ${r.code}: ${r.message}`;
      }
    }

    for (const cat of DISCOVERY_CATEGORIES) {
      if (stoppedEarly) break;
      if (!canCall()) {
        stoppedEarly = stoppedEarly || "Ran out of time or call budget during discovery";
        break;
      }
      callsMade++;
      const r = await douyinHotSearch({ contentType: cat.contentType });
      const items = r.ok ? pickArray(r.data) : [];
      note(`Douyin hot search · ${cat.contentType}`, r, items.length);
      if (r.ok) {
        const res = await persist(items, "douyin", cat.niche);
        inserted += res.inserted;
        updated += res.updated;
      } else if (r.fatal) {
        stoppedEarly = `Douyin hot search returned ${r.code}: ${r.message}`;
        break;
      }
    }

    /* ---- Stage B: enrichment, with whatever budget remains ---- */

    if (!stoppedEarly) {
      const { data: queue } = await db
        .from("signals")
        .select("id, title, platform")
        .is("supplier_checked_at", null)
        .not("platform", "eq", "1688")
        .order("engagement_total", { ascending: false, nullsFirst: false })
        .limit(10);

      for (const sig of queue ?? []) {
        if (!canCall()) break;
        callsMade++;
        const r = await wholesaleSearch(sig.title.slice(0, 40));
        const items = r.ok ? pickArray(r.data) : [];
        note(`1688 supplier · ${sig.title.slice(0, 20)}`, r, items.length);

        if (r.ok) {
          const prices = items.map(extractPriceCny).filter((p): p is number => p != null).sort((a, b) => a - b);
          // Median resists the ¥0.01 bait listings that skew a straight minimum.
          const median = prices.length ? prices[Math.floor(prices.length / 2)] : null;
          await db
            .from("signals")
            .update({
              wholesale_cny: median,
              supplier_url: firstString(items[0] ?? {}, URL_KEYS),
              supplier_checked_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", sig.id);
          enriched++;
        } else {
          // Mark it checked anyway so one bad title cannot block the queue forever.
          await db.from("signals").update({ supplier_checked_at: new Date().toISOString() }).eq("id", sig.id);
          if (r.fatal) {
            stoppedEarly = `1688 search returned ${r.code}: ${r.message}`;
            break;
          }
        }
      }
    }

    const status = stoppedEarly ? "partial" : "complete";
    if (runId) {
      await db
        .from("ingest_runs")
        .update({
          finished_at: new Date().toISOString(),
          status,
          calls_made: callsMade,
          signals_inserted: inserted,
          signals_updated: updated,
          endpoint_results: endpoints,
          error: stoppedEarly,
        })
        .eq("id", runId);
    }

    return { runId, status, callsMade, inserted, updated, enriched, elapsedMs: Date.now() - started, stoppedEarly, endpoints };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingest failed";
    if (runId) {
      await db
        .from("ingest_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "failed",
          calls_made: callsMade,
          endpoint_results: endpoints,
          error: message,
        })
        .eq("id", runId);
    }
    return { runId, status: "failed", callsMade, inserted, updated, enriched, elapsedMs: Date.now() - started, stoppedEarly: message, endpoints };
  }
}

async function persist(items: any[], platform: string, niche: string | null) {
  const db = supabaseAdmin();
  let inserted = 0;
  let updated = 0;

  for (const raw of items.slice(0, 30)) {
    const item = extractItem(raw);
    if (!item) continue;
    const { data, error } = await db.rpc("record_signal", {
      p_fingerprint: fingerprint(platform, item.title),
      p_platform: platform,
      p_title: item.title.slice(0, 300),
      p_niche: niche,
      p_source_url: item.sourceUrl,
      p_image_url: item.imageUrl,
      p_likes: item.likes,
      p_saves: item.saves,
      p_comments: item.comments,
      p_shares: item.shares,
      p_raw: item.raw,
    });
    if (error) continue;
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.is_new) inserted++;
    else updated++;
  }
  return { inserted, updated };
}

/**
 * Probe every endpoint once with the cheapest possible parameters and report which
 * are actually enabled on this token. Needed because the token is a sensitive env
 * var we cannot read from outside the deployment.
 */
export async function probeEndpoints(): Promise<EndpointResult[]> {
  const results: EndpointResult[] = [];
  const probes: Array<[string, () => Promise<JustOneResult<any>>]> = [
    ["XHS hot list", () => xhsHotList()],
    ["Douyin hot search", () => douyinHotSearch({ contentType: "HOME_LIVING" })],
    ["XHS note search", () => callJustOne("/api/xiaohongshu/search-note/v2", { keyword: "宠物", page: 1, sort: "collect_descending" })],
    ["1688 product search", () => wholesaleSearch("宠物梳")],
    ["Taobao product search", () => callJustOne("/api/taobao/search-item-list/v1", { keyword: "宠物梳", page: 1 })],
  ];

  for (const [label, fn] of probes) {
    const r = await fn();
    results.push({
      endpoint: r.endpoint,
      label,
      ok: r.ok,
      code: r.code,
      message: r.ok ? undefined : r.message,
      ms: r.ms,
      items: r.ok ? pickArray(r.data).length : undefined,
    });
    if (!r.ok && (r.code === 601 || r.code === 100)) break; // no point continuing
  }
  return results;
}
