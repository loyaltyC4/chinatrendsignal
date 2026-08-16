/**
 * JustOne API client.
 *
 * JustOne returns HTTP 200 with a business `code` in the body, so a failed call
 * looks like a success to anything that only checks response.ok. Every call goes
 * through here so that never happens silently, and so each run can report exactly
 * which endpoints are enabled on this account.
 */

const BASE = process.env.JUSTONE_API_BASE || "https://api.justoneapi.com";

/** Documented business codes. 601/602/303 are the ones that cost us money or stop a run. */
export const JUSTONE_CODES: Record<number, string> = {
  0: "Success",
  100: "Invalid or inactive token",
  301: "Collection failed, retryable",
  302: "Rate limit exceeded",
  303: "Daily quota exceeded",
  400: "Invalid parameters",
  500: "Upstream internal error",
  600: "Permission denied — endpoint not enabled on this token",
  601: "Insufficient balance on the shared account",
  602: "Token budget exceeded",
};

/** Codes where continuing to hammer the API is pointless or expensive. */
export const FATAL_CODES = new Set([100, 303, 600, 601, 602]);

export type JustOneResult<T = unknown> =
  | { ok: true; code: 0; data: T; endpoint: string; ms: number }
  | { ok: false; code: number; message: string; endpoint: string; ms: number; fatal: boolean };

export function isJustOneConfigured() {
  return Boolean(process.env.JUSTONEAPI_TOKEN);
}

export async function callJustOne<T = unknown>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  timeoutMs = 45_000,
): Promise<JustOneResult<T>> {
  const token = process.env.JUSTONEAPI_TOKEN;
  const started = Date.now();
  if (!token) {
    return { ok: false, code: -1, message: "JUSTONEAPI_TOKEN is not set", endpoint: path, ms: 0, fatal: true };
  }

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("token", token);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }

  try {
    // JustOne suggests 120s; we cannot afford that inside a 60s function, so we
    // cap lower and treat a timeout as a retryable miss rather than a hard failure.
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    const ms = Date.now() - started;
    const text = await res.text();

    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      return { ok: false, code: -2, message: `Non-JSON response (HTTP ${res.status})`, endpoint: path, ms, fatal: false };
    }

    const code = Number(body?.code ?? -3);
    if (code === 0) return { ok: true, code: 0, data: body.data as T, endpoint: path, ms };

    return {
      ok: false,
      code,
      message: body?.message || JUSTONE_CODES[code] || `Unknown code ${code}`,
      endpoint: path,
      ms,
      fatal: FATAL_CODES.has(code),
    };
  } catch (err) {
    const ms = Date.now() - started;
    const aborted = err instanceof Error && err.name === "TimeoutError";
    return {
      ok: false,
      code: aborted ? -4 : -5,
      message: aborted ? `Timed out after ${timeoutMs}ms` : err instanceof Error ? err.message : "Network error",
      endpoint: path,
      ms,
      fatal: false,
    };
  }
}

/* ------------------------------------------------------------------ *
 * Endpoints. Paths verified against docs.justoneapi.com, Aug 2026.
 * ------------------------------------------------------------------ */

/** Douyin hot content. The upstream discovery call — no keyword needed. */
export const douyinHotSearch = (opts: { contentType?: string; sortType?: string; page?: number; videoType?: string } = {}) =>
  callJustOne<any>("/api/douyin/hot-search/v1", {
    contentType: opts.contentType ?? "ALL",
    sortType: opts.sortType ?? "HIGH_INTERACTION",
    // XINGTU_VIDEO restricts results to commercial/sponsored content. The default
    // (ALL) returns viral entertainment — cats, skits, scenery — which is trending
    // content but not trending *product*, and is useless for sourcing.
    videoType: opts.videoType ?? "XINGTU_VIDEO",
    page: opts.page ?? 1,
  });

/** Xiaohongshu hot list. Cheapest possible trend read: one call, no parameters. */
export const xhsHotList = () => callJustOne<any>("/api/xiaohongshu/hot-list/v1");

/**
 * XHS note search sorted by saves. This is the demand check that matters:
 * `collect_descending` ranks by bookmark count, and saves-over-likes is the
 * bookmark-to-buy signal the whole product is built on.
 */
export const xhsNoteSearch = (keyword: string, page = 1) =>
  callJustOne<any>("/api/xiaohongshu/search-note/v2", {
    keyword,
    page,
    sort: "collect_descending",
    noteTime: "ONE_WEEK",
  });

/** 1688 wholesale search — the supply and margin check. */
export const wholesaleSearch = (keyword: string) =>
  callJustOne<any>("/api/1688/search-item-list/v1", { keyword });

/** Taobao search — retail comparison. */
export const taobaoSearch = (keyword: string) =>
  callJustOne<any>("/api/taobao/search-item-list/v1", { keyword });
