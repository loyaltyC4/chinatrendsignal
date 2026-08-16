import { NextRequest, NextResponse } from "next/server";

/**
 * Stopgap abuse guard for the paid-upstream routes (Claude + JustOne).
 *
 * WHY THIS EXISTS: /api/enrich and /api/supplier-match call metered third-party APIs
 * on our account. Until Supabase auth + the credit ledger are enforcing real per-user
 * quotas, these routes are open to anyone who finds the URL. This module is the
 * temporary floor, not the final answer.
 *
 * LIMITATIONS — be honest about these:
 *  - Counters live in module memory, so they are per-serverless-instance and reset on
 *    cold start. A distributed attacker hitting many instances gets more than `limit`.
 *  - Origin checks are trivially forged by a determined caller. They stop casual
 *    curl/script abuse and hotlinking, nothing more.
 * Both go away once `requireUser()` + ledger debits land in Phase 2.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const day = { stamp: today(), count: 0 };

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Best-effort client IP from the proxy chain Vercel sets. */
function clientIp(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Hosts allowed to call our own API routes from the browser. */
function allowedHosts() {
  const hosts = new Set<string>([
    "localhost:3000",
    "127.0.0.1:3000",
    "chinatrendsignal.vercel.app",
  ]);
  // The deployment's own hostname, plus an explicit override for the custom domain.
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

/**
 * Reject requests that did not originate from our own pages.
 * Returns null when the request is acceptable.
 */
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
  const allowed = allowedHosts();
  // Allow any preview deployment on the project's own Vercel namespace.
  const isProjectPreview = /^chinatrendsignal-[a-z0-9-]+\.vercel\.app$/.test(host);
  if (!allowed.has(host) && !isProjectPreview) {
    return NextResponse.json(
      { error: "This endpoint is only callable from the app." },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Sliding-window per-IP limiter. `route` namespaces the bucket so a user burning
 * their supplier-match allowance does not also lock them out of the analyst.
 */
export function rateLimit(
  req: NextRequest,
  route: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const now = Date.now();
  const key = `${route}:${clientIp(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else if (bucket.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again shortly.", retryAfter },
      { status: 429, headers: { "retry-after": String(retryAfter) } },
    );
  } else {
    bucket.count += 1;
  }

  // Opportunistic sweep so the map cannot grow without bound on a warm instance.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }
  return null;
}

/**
 * Hard ceiling on total paid-upstream calls per day per instance. This is the
 * backstop that caps the worst case if the per-IP limiter is evaded by rotation.
 */
export function dailyBudget(): NextResponse | null {
  const max = Number(process.env.MAX_DAILY_AI_CALLS || 300);
  const stamp = today();
  if (day.stamp !== stamp) {
    day.stamp = stamp;
    day.count = 0;
  }
  if (day.count >= max) {
    return NextResponse.json(
      {
        error: "Daily capacity reached.",
        detail: "The radar has hit its usage ceiling for today. It resets at midnight UTC.",
      },
      { status: 429 },
    );
  }
  day.count += 1;
  return null;
}

/**
 * One call to apply the whole stopgap policy to a paid route.
 * Returns a response to short-circuit with, or null to proceed.
 */
export function guardPaidRoute(
  req: NextRequest,
  route: string,
  opts: { limit: number; windowMs?: number; countsAgainstBudget?: boolean } ,
): NextResponse | null {
  return (
    checkOrigin(req) ||
    rateLimit(req, route, opts.limit, opts.windowMs ?? 60 * 60 * 1000) ||
    (opts.countsAgainstBudget === false ? null : dailyBudget())
  );
}
