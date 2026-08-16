import { NextRequest, NextResponse } from "next/server";
import { isServiceRoleConfigured, supabaseAdmin } from "@/lib/supabase/server";

/**
 * Abuse guard for the paid-upstream routes (Claude + JustOne).
 *
 * Two layers:
 *  1. Same-origin enforcement — cheap, synchronous, blocks scripted callers that
 *     do not send a browser Origin. Forgeable, so it is a filter and not a control.
 *  2. Postgres-backed sliding window + a global daily ceiling.
 *
 * WHY POSTGRES: the first version of this file kept counters in module memory.
 * That does not work on Vercel. Measured on production: 8 sequential requests
 * were served by 5 distinct instances, so per-instance counters never accumulated
 * and 12 calls against a limit of 10 produced zero 429s. The counters now live in
 * one place every instance shares (see migration
 * `durable_rate_limit_and_daily_budget`).
 *
 * Identity: authenticated calls are limited per user id, which is stable. Anonymous
 * calls fall back to IP, which is weaker but only reachable on unauthenticated routes.
 */

function clientIp(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function allowedHosts() {
  const hosts = new Set<string>([
    "localhost:3000",
    "127.0.0.1:3000",
    "chinatrendsignal.vercel.app",
  ]);
  if (process.env.VERCEL_URL) hosts.add(process.env.VERCEL_URL);
  if (process.env.VERCEL_BRANCH_URL) hosts.add(process.env.VERCEL_BRANCH_URL);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      hosts.add(new URL(site).host);
    } catch {
      /* ignore a malformed env value rather than 500 every request */
    }
  }
  return hosts;
}

/** Reject requests that did not originate from our own pages. */
export function checkOrigin(req: NextRequest): NextResponse | null {
  const raw = req.headers.get("origin") || req.headers.get("referer");
  if (!raw) {
    return NextResponse.json(
      { error: "This endpoint is only callable from the app." },
      { status: 403 },
    );
  }
  let host: string;
  try {
    host = new URL(raw).host;
  } catch {
    return NextResponse.json({ error: "Malformed origin." }, { status: 403 });
  }
  const isProjectPreview = /^chinatrendsignal-[a-z0-9-]+\.vercel\.app$/.test(host);
  if (!allowedHosts().has(host) && !isProjectPreview) {
    return NextResponse.json(
      { error: "This endpoint is only callable from the app." },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Shared sliding-window limiter. Fails OPEN on a database error: a Supabase
 * outage should degrade the limiter, not take the whole product down. The origin
 * check and per-user auth still apply in that window.
 */
export async function rateLimit(
  route: string,
  identity: string,
  limit: number,
  windowSeconds: number,
): Promise<NextResponse | null> {
  if (!isServiceRoleConfigured()) return null;
  try {
    const { data, error } = await supabaseAdmin().rpc("consume_rate_limit", {
      p_key: `${route}:${identity}`,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return null;
    const row = Array.isArray(data) ? data[0] : data;
    if (row && row.allowed === false) {
      const resetAt = row.reset_at ? new Date(row.reset_at) : null;
      const retryAfter = resetAt
        ? Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000))
        : 3600;
      return NextResponse.json(
        {
          error: "You've hit the limit for this action. It resets shortly.",
          retryAfter,
          resetAt: row.reset_at ?? null,
        },
        { status: 429, headers: { "retry-after": String(retryAfter) } },
      );
    }
    return null;
  } catch {
    return null;
  }
}

/** Global ceiling across all users and instances. Also fails open. */
export async function dailyBudget(): Promise<NextResponse | null> {
  if (!isServiceRoleConfigured()) return null;
  const max = Number(process.env.MAX_DAILY_AI_CALLS || 300);
  try {
    const { data, error } = await supabaseAdmin().rpc("consume_daily_budget", { p_max: max });
    if (error) return null;
    if (data === false) {
      return NextResponse.json(
        {
          error: "Daily capacity reached.",
          detail: "The radar has hit its usage ceiling for today. It resets at midnight UTC.",
        },
        { status: 429 },
      );
    }
    return null;
  } catch {
    return null;
  }
}

/** Apply the whole policy. Returns a response to short-circuit with, or null. */
export async function guardPaidRoute(
  req: NextRequest,
  route: string,
  opts: { identity: string; limit: number; windowSeconds?: number; countsAgainstBudget?: boolean },
): Promise<NextResponse | null> {
  const origin = checkOrigin(req);
  if (origin) return origin;

  const limited = await rateLimit(
    route,
    opts.identity || clientIp(req),
    opts.limit,
    opts.windowSeconds ?? 3600,
  );
  if (limited) return limited;

  if (opts.countsAgainstBudget === false) return null;
  return dailyBudget();
}
