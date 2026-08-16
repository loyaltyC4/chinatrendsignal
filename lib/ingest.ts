import { supabaseAdmin } from "@/lib/supabase/server";
import { extractProducts, isExtractionConfigured } from "@/lib/extract";
import {
  callJustOne,
  douyinHotSearch,
  xhsHotList,
  xhsNoteSearch,
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
 * FIELD MAPPING: parsers below are written against response shapes read off live
 * JustOne calls on 16 Aug 2026, not guessed. Each row's untouched payload is still
 * stored in signals.raw so a shape change can be diagnosed without re-fetching.
 */

/**
 * Discovery sources, product-first.
 *
 * The first live run used the Douyin/XHS generic hot lists and returned viral
 * entertainment — a walrus, a cat, travel photography — because those endpoints rank
 * *content*, not merchandise. Both sources below are constrained to commerce:
 * Douyin to sponsored (XINGTU) video, XHS to save-ranked "good buy" keyword searches.
 */
const DOUYIN_CATEGORIES: Array<{ contentType: string; niche: string }> = [
  { contentType: "HOME_LIVING", niche: "Home & living" },
  { contentType: "ANIMAL", niche: "Pet care" },
  { contentType: "MOTHER_BABY", niche: "Mother & baby" },
  { contentType: "FASHION", niche: "Fashion" },
  { contentType: "SPORTS", niche: "Sports & outdoors" },
  { contentType: "FOOD", niche: "Food & snacks" },
];

/** Chinese shopping-intent phrases. "好物"/"神器" are the standard product-rec markers. */
const XHS_KEYWORDS: Array<{ keyword: string; niche: string }> = [
  { keyword: "居家好物推荐", niche: "Home & living" },
  { keyword: "宠物用品好物", niche: "Pet care" },
  { keyword: "厨房神器", niche: "Kitchen" },
  { keyword: "美妆好物推荐", niche: "Beauty" },
  { keyword: "母婴好物", niche: "Mother & baby" },
  { keyword: "健身装备推荐", niche: "Sports & outdoors" },
];

/**
 * Rotate which slice of sources each nightly run covers. A full sweep does not fit
 * in one 60s function, so we take a different window each day and let coverage build
 * across the week rather than truncating the same prefix every night.
 */
// Measured latency, 16 Aug 2026: XHS note search 10-12s per call, Douyin 1-2s.
// The window sizes below are set from those numbers, not guessed.
function rotate<T>(arr: T[], take: number): T[] {
  const day = Math.floor(Date.now() / 86_400_000);
  const start = (day * take) % arr.length;
  return Array.from({ length: Math.min(take, arr.length) }, (_, i) => arr[(start + i) % arr.length]);
}

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
  extracted: number;
  productsFound: number;
  enriched: number;
  elapsedMs: number;
  stoppedEarly: string | null;
  endpoints: EndpointResult[];
};

/* --------------------------- extraction --------------------------- */

/**
 * Per-endpoint parsers. An earlier generic "find the first array" heuristic failed
 * in production against real payloads: the 1688 response carries an EMPTY top-level
 * `result: []` alongside the real rows at `data.OFFER.items`, so the guesser
 * confidently returned zero. Shapes below were read off live responses on 16 Aug 2026.
 */

type Extracted = {
  title: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  likes: number | null;
  saves: number | null;
  comments: number | null;
  shares: number | null;
  engagement: number | null; // used when a platform gives a composite score, not components
  trend: string | null;
  raw: any;
};

const num = (v: any): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
    // Chinese compact counts: 918.6w = 9,186,000; 12.3k
    const m = t.match(/^(\d+(?:\.\d+)?)\s*([wk万千])$/i);
    if (m) {
      const mult = /[w万]/i.test(m[2]) ? 10_000 : 1_000;
      return Math.round(Number(m[1]) * mult);
    }
  }
  return null;
};

/** XHS hot list: data.items[] of { rank, title, url, item_id, hot, hot_value, trend } */
export function parseXhsHotList(data: any): Extracted[] {
  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .map((it: any): Extracted | null => {
      const title = typeof it?.title === "string" ? it.title.trim() : "";
      if (!title) return null;
      return {
        title,
        sourceUrl: it.url ?? null,
        imageUrl: null,
        // The hot list exposes a composite heat score, not like/save components.
        // Recording it as engagement is honest; inventing components would not be.
        likes: null, saves: null, comments: null, shares: null,
        engagement: num(it.hot_value) ?? num(it.hot),
        trend: typeof it.trend === "string" ? it.trend : null,
        raw: it,
      };
    })
    .filter(Boolean) as Extracted[];
}

/**
 * XHS note search: data.items[].note
 * This is the better product source. `collected_count` is the save count — the
 * bookmark-to-buy signal — which the generic hot list does not expose at all.
 */
export function parseXhsNotes(data: any): Extracted[] {
  const items = Array.isArray(data?.items) ? data.items : [];
  return items
    .map((wrap: any): Extracted | null => {
      const n = wrap?.note ?? wrap;
      const title = (typeof n?.desc === "string" && n.desc.trim())
        || (typeof n?.abstract_show === "string" && n.abstract_show.trim())
        || (typeof n?.title === "string" && n.title.trim()) || "";
      if (!title) return null;
      return {
        title,
        sourceUrl: n.id ? `https://www.xiaohongshu.com/explore/${n.id}` : null,
        imageUrl: n?.images_list?.[0]?.url ?? null,
        likes: num(n.liked_count) ?? num(n.likes) ?? num(n?.interact_info?.liked_count),
        saves: num(n.collected_count) ?? num(n?.interact_info?.collected_count),
        comments: num(n.comments_count) ?? num(n?.interact_info?.comment_count),
        shares: num(n.shared_count) ?? num(n?.interact_info?.shared_count),
        engagement: null,
        trend: null,
        raw: n,
      };
    })
    .filter(Boolean) as Extracted[];
}

/** Douyin hot search: data.content_list[] with counts as strings under attribute_datas */
export function parseDouyinHotSearch(data: any): Extracted[] {
  const list = Array.isArray(data?.content_list) ? data.content_list : [];
  return list
    .map((it: any): Extracted | null => {
      const a = it?.attribute_datas ?? {};
      const title = typeof a.item_title === "string" ? a.item_title.trim() : "";
      if (!title) return null;
      return {
        title,
        sourceUrl: it.id ? `https://www.douyin.com/video/${it.id}` : null,
        imageUrl: a.cover_image_uri ? `https://p3-sign.douyinpic.com/${a.cover_image_uri}` : null,
        likes: num(a.like_cnt_all),
        saves: null, // Douyin does not expose a save/collect count here.
        comments: num(a.comment_cnt_all),
        shares: num(a.share_cnt_all),
        engagement: num(a.interact_cnt),
        trend: null,
        raw: it,
      };
    })
    .filter(Boolean) as Extracted[];
}

/** 1688 search: data.data.OFFER.items[] where each row's payload sits under .data */
export function parse1688Items(data: any): any[] {
  const items = data?.data?.OFFER?.items;
  if (!Array.isArray(items)) return [];
  return items.map((i: any) => i?.data ?? i).filter(Boolean);
}

/**
 * Recursively find the most plausible unit price in a 1688 offer. The offer payload
 * nests price under several different keys depending on listing type, so rather than
 * hardcode one path we collect every price-ish numeric and take the median.
 */
export function findPrices(node: any, depth = 0, out: number[] = []): number[] {
  if (!node || depth > 5) return out;
  if (Array.isArray(node)) {
    for (const v of node.slice(0, 20)) findPrices(v, depth + 1, out);
    return out;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (/price/i.test(k) && !/origin|market|list|max|strike/i.test(k)) {
        const n = num(v);
        if (n != null && n > 0.05 && n < 100_000) out.push(n);
      }
      if (v && typeof v === "object") findPrices(v, depth + 1, out);
    }
  }
  return out;
}

export function findFirstString(node: any, pattern: RegExp, depth = 0): string | null {
  if (!node || depth > 4) return null;
  if (Array.isArray(node)) {
    for (const v of node.slice(0, 20)) {
      const r = findFirstString(v, pattern, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (pattern.test(k) && typeof v === "string" && v.trim()) return v.trim();
    }
    for (const v of Object.values(node)) {
      if (v && typeof v === "object") {
        const r = findFirstString(v, pattern, depth + 1);
        if (r) return r;
      }
    }
  }
  return null;
}

/** Stable identity so the same item on the same platform dedupes across runs. */
function fingerprint(platform: string, title: string) {
  const norm = title
    .toLowerCase()
    .replace(/[\s　]+/g, " ")
    .replace(/[!-\/:-@\[-`{-~，。！？、；：""''（）【】#]/g, "")
    .trim()
    .slice(0, 120);
  return `${platform}:${norm}`;
}

/**
 * Douyin titles are full video captions with hashtags, which make terrible 1688
 * queries. Strip hashtags and punctuation and keep a short head phrase.
 */
function searchTermFor(title: string) {
  return title
    .replace(/#[^\s#]+/g, " ")
    .replace(/[!-\/:-@\[-`{-~，。！？、；：""''（）【】]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
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
  let extracted = 0;
  let productsFound = 0;
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
    /* ---- Stage A: discovery (product-constrained sources) ---- */

    for (const kw of rotate(XHS_KEYWORDS, 2)) {
      // Reserve headroom so a slow XHS stage cannot starve Douyin completely.
      if (callsMade >= maxCalls || timeLeft() < 20_000) { stoppedEarly = stoppedEarly || "Budget exhausted during XHS discovery"; break; }
      callsMade++;
      const r = await xhsNoteSearch(kw.keyword);
      const items = r.ok ? parseXhsNotes(r.data) : [];
      note(`XHS notes · ${kw.keyword}`, r, items.length);
      if (r.ok) {
        const res = await persist(items, "xiaohongshu", kw.niche);
        inserted += res.inserted;
        updated += res.updated;
      } else if (r.fatal) {
        stoppedEarly = `XHS note search returned ${r.code}: ${r.message}`;
        break;
      }
    }

    for (const cat of rotate(DOUYIN_CATEGORIES, 3)) {
      if (stoppedEarly) break;
      if (!canCall()) { stoppedEarly = stoppedEarly || "Budget exhausted during Douyin discovery"; break; }
      callsMade++;
      const r = await douyinHotSearch({ contentType: cat.contentType, videoType: "XINGTU_VIDEO" });
      const items = r.ok ? parseDouyinHotSearch(r.data) : [];
      note(`Douyin xingtu · ${cat.contentType}`, r, items.length);
      if (r.ok) {
        const res = await persist(items, "douyin", cat.niche);
        inserted += res.inserted;
        updated += res.updated;
      } else if (r.fatal) {
        stoppedEarly = `Douyin hot search returned ${r.code}: ${r.message}`;
        break;
      }
    }

    /* ---- Stage A2: product extraction ----
     * Turns caption soup into a searchable product noun. Runs before enrichment so
     * no paid 1688 lookup is ever spent on a row that is not a product. */

    if (isExtractionConfigured() && timeLeft() > 15_000) {
      const { data: pending } = await db
        .from("signals")
        .select("id, title")
        .is("extracted_at", null)
        .order("saves", { ascending: false, nullsFirst: false })
        .limit(Number(process.env.EXTRACT_BATCH_SIZE || 25));

      if (pending?.length) {
        const ex = await extractProducts(pending.map((p: any) => ({ id: p.id, title: p.title })));
        endpoints.push({
          endpoint: "claude:extract",
          label: `Product extraction · ${pending.length} titles`,
          ok: ex.ok,
          code: ex.ok ? 0 : -1,
          message: ex.error,
          ms: 0,
          items: ex.results.length,
        });

        if (ex.ok) {
          const stamp = new Date().toISOString();
          for (const r of ex.results) {
            await db
              .from("signals")
              .update({
                is_product: r.isProduct,
                product_term: r.productTerm,
                product_en: r.productEn,
                extracted_at: stamp,
                extraction_model: ex.model,
              })
              .eq("id", r.id);
            extracted++;
            if (r.isProduct) productsFound++;
          }
        }
        // On failure extracted_at stays null, so the batch is retried next run
        // rather than being written off as "not a product".
      }
    }

    /* ---- Stage B: enrichment, with whatever budget remains ---- */

    if (!stoppedEarly) {
      // Only rows confirmed to be products, ranked by saves. Capped by env so the
      // JustOne spend (~A$0.02-0.04 per call) stays predictable — this, not the
      // extraction, is the expensive part of the pipeline.
      const { data: queue } = await db
        .from("signals")
        .select("id, title, product_term, platform")
        .eq("is_product", true)
        .is("supplier_checked_at", null)
        .order("saves", { ascending: false, nullsFirst: false })
        .limit(Number(process.env.MAX_ENRICH_PER_RUN || 8));

      for (const sig of queue ?? []) {
        if (!canCall()) break;
        callsMade++;
        // Use the extracted noun. Falls back to the stripped caption only if
        // extraction somehow left the term empty.
        const term = (sig.product_term as string | null)?.trim() || searchTermFor(sig.title);
        const r = await wholesaleSearch(term);
        const offers = r.ok ? parse1688Items(r.data) : [];
        note(`1688 supplier · ${term}`, r, offers.length);

        if (r.ok) {
          const prices = offers.flatMap((o) => findPrices(o)).sort((a, b) => a - b);
          // Median resists the ¥0.01 bait listings that skew a straight minimum.
          const median = prices.length ? prices[Math.floor(prices.length / 2)] : null;
          await db
            .from("signals")
            .update({
              wholesale_cny: median,
              supplier_url: offers.length ? findFirstString(offers[0], /url|link|detail/i) : null,
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

    return { runId, status, callsMade, inserted, updated, extracted, productsFound, enriched, elapsedMs: Date.now() - started, stoppedEarly, endpoints };
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
    return { runId, status: "failed", callsMade, inserted, updated, extracted, productsFound, enriched, elapsedMs: Date.now() - started, stoppedEarly: message, endpoints };
  }
}

async function persist(items: Extracted[], platform: string, niche: string | null) {
  const db = supabaseAdmin();
  let inserted = 0;
  let updated = 0;

  for (const item of items.slice(0, 30)) {
    const { data, error } = await db.rpc("record_signal", {
      p_fingerprint: fingerprint(platform, item.title),
      p_platform: platform,
      p_title: item.title.slice(0, 300),
      p_niche: niche,
      p_source_url: item.sourceUrl,
      p_image_url: item.imageUrl,
      // When a platform gives only a composite heat score (XHS hot list), record it
      // in `likes` so engagement_total is non-zero and velocity can be computed.
      // Fabricating a like/save split we were never given would be worse.
      p_likes: item.likes ?? item.engagement,
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
 * Describe the shape of a payload without dumping it. JustOne does not document
 * response fields, and the token is a sensitive env var we cannot use from outside
 * the deployment, so this is how we learn the real structure safely.
 */
export function describeShape(data: any, depth = 0): any {
  if (data === null || data === undefined) return typeof data;
  if (Array.isArray(data)) {
    return {
      __array: data.length,
      first: data.length && depth < 3 ? describeShape(data[0], depth + 1) : undefined,
    };
  }
  if (typeof data === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(data).slice(0, 40)) {
      if (Array.isArray(v)) out[k] = { __array: v.length, first: depth < 3 && v.length ? describeShape(v[0], depth + 1) : undefined };
      else if (v && typeof v === "object") out[k] = depth < 3 ? describeShape(v, depth + 1) : "object";
      else if (typeof v === "string") out[k] = `string(${v.slice(0, 40)})`;
      else out[k] = typeof v;
    }
    return out;
  }
  if (typeof data === "string") return `string(${data.slice(0, 40)})`;
  return typeof data;
}

function countFor(label: string, data: any): number {
  if (label.includes("XHS hot list")) return parseXhsHotList(data).length;
  if (label.includes("Douyin")) return parseDouyinHotSearch(data).length;
  if (label.includes("1688")) return parse1688Items(data).length;
  if (label.includes("XHS note")) return parseXhsNotes(data).length;
  if (label.includes("Taobao")) return parse1688Items(data).length;
  return 0;
}

export async function probeShapes(): Promise<any[]> {
  const probes: Array<[string, () => Promise<JustOneResult<any>>]> = [
    ["XHS hot list", () => xhsHotList()],
    ["Douyin hot search", () => douyinHotSearch({ contentType: "HOME_LIVING" })],
    ["1688 product search", () => wholesaleSearch("宠物梳")],
    ["XHS note search", () => callJustOne("/api/xiaohongshu/search-note/v2", { keyword: "居家好物推荐", page: 1, sort: "collect_descending" })],
    ["Douyin xingtu", () => douyinHotSearch({ contentType: "HOME_LIVING", videoType: "XINGTU_VIDEO" })],
  ];
  const out: any[] = [];
  for (const [label, fn] of probes) {
    const r = await fn();
    out.push({
      label,
      endpoint: r.endpoint,
      ok: r.ok,
      code: r.code,
      message: r.ok ? undefined : (r as any).message,
      extractedByCurrentParser: r.ok ? countFor(label, r.data) : 0,
      shape: r.ok ? describeShape(r.data) : null,
    });
  }
  return out;
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
      items: r.ok ? countFor(label, r.data) : undefined,
    });
    if (!r.ok && (r.code === 601 || r.code === 100)) break; // no point continuing
  }
  return results;
}
