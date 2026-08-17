import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar, type RadarRow } from "@/lib/signals";

/**
 * Dashboard data, assembled server-side in one place.
 *
 * The shape here is deliberately opinionated: the dashboard's job is to answer
 * "what changed, and what should I do about it", so this returns a diff and a
 * list of concrete next actions rather than a bag of metrics. Actions are derived
 * from real state, so an empty account gets different advice from a busy one.
 */

export type NextAction = {
  id: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
  tone: "urgent" | "opportunity" | "routine";
};

export type Profile = {
  id: string;
  email: string | null;
  displayName: string | null;
  plan: "scout" | "hunter" | "operator";
  role: "member" | "admin";
  niches: string[];
  weeklyEmail: boolean;
  credits: number;
};

export type WatchRow = { id: string; signalId: string; product: string; zh: string; niche: string; source: string };

export type IngestRun = {
  status: string;
  startedAt: string;
  finishedAt: string | null;
  inserted: number;
  productsFound: number;
  error: string | null;
};

export type DashboardData = {
  profile: Profile | null;
  rows: RadarRow[];
  source: "live" | "seed";
  since: { newSignals: number; newlyPriced: number; since: string | null };
  watchlist: WatchRow[];
  actions: NextAction[];
  counts: { indexed: number; products: number; priced: number; unpriced: number; niches: number };
  lastRuns: IngestRun[];
};

const PLAN_CREDITS: Record<Profile["plan"], number> = { scout: 10, hunter: 100, operator: 300 };
export const planAllowance = (plan: Profile["plan"]) => PLAN_CREDITS[plan] ?? 10;

/** Watchlist ceilings. Scout gets a genuine taste of the habit rather than zero,
 *  because a feature nobody has felt is not a feature they will pay to unlock.
 *  Operator reads as "unlimited" in copy but is capped in code: every saved row is
 *  re-checked nightly, so an unbounded list is an unbounded bill. */
const PLAN_WATCH: Record<Profile["plan"], number> = { scout: 3, hunter: 10, operator: 250 };
export const watchlistCap = (plan: Profile["plan"]) => PLAN_WATCH[plan] ?? 3;

/** Signal ids this user already tracks, for rendering save state on the radar. */
export async function getWatchedIds(userId: string): Promise<string[]> {
  if (!isServiceRoleConfigured()) return [];
  const { data } = await supabaseAdmin().from("watchlist").select("signal_id").eq("user_id", userId);
  return (data ?? []).map((r: { signal_id: string }) => r.signal_id);
}

export async function getDashboard(userId: string): Promise<DashboardData> {
  const { rows, source } = await getRadar(200);

  const counts = {
    indexed: rows.length,
    products: rows.filter((r) => r.isProduct === true).length,
    priced: rows.filter((r) => r.wholesaleCny > 0).length,
    unpriced: rows.filter((r) => r.isProduct === true && r.wholesaleCny === 0).length,
    niches: new Set(rows.map((r) => r.niche)).size,
  };

  let profile: Profile | null = null;
  let since = { newSignals: 0, newlyPriced: 0, since: null as string | null };
  let watchlist: WatchRow[] = [];
  let lastRuns: IngestRun[] = [];

  if (isServiceRoleConfigured()) {
    const db = supabaseAdmin();

    const [{ data: p }, { data: diff }, { data: watch }, { data: runs }, { data: bal }] = await Promise.all([
      db.from("profiles").select("id, email, display_name, plan, role, niches, weekly_email").eq("id", userId).maybeSingle(),
      db.rpc("signals_since", { p_user_id: userId }),
      db.from("watchlist").select("id, signal_id, signals(title, product_en, product_term, niche, platform)").eq("user_id", userId).order("created_at", { ascending: false }).limit(12),
      db.from("ingest_runs").select("status, started_at, finished_at, signals_inserted, endpoint_results, error").order("started_at", { ascending: false }).limit(4),
      db.rpc("credit_balance", { p_user_id: userId }),
    ]);

    if (p) {
      profile = {
        id: p.id,
        email: p.email ?? null,
        displayName: p.display_name ?? null,
        plan: (p.plan as Profile["plan"]) ?? "scout",
        role: (p.role as Profile["role"]) ?? "member",
        niches: p.niches ?? [],
        weeklyEmail: p.weekly_email ?? true,
        credits: typeof bal === "number" ? bal : 0,
      };
    }

    const d = Array.isArray(diff) ? diff[0] : diff;
    if (d) {
      since = {
        newSignals: Number(d.new_signals ?? 0),
        newlyPriced: Number(d.newly_priced ?? 0),
        since: d.since ?? null,
      };
    }

    watchlist = (watch ?? []).map((w: any) => ({
      id: w.id,
      signalId: w.signal_id,
      product: w.signals?.product_en || w.signals?.title || "Untitled",
      zh: w.signals?.product_term || "",
      niche: w.signals?.niche || "Unclassified",
      source: w.signals?.platform || "",
    }));

    lastRuns = (runs ?? []).map((r: any) => ({
      status: r.status,
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      inserted: r.signals_inserted ?? 0,
      productsFound: 0,
      error: r.error ?? null,
    }));

    // Stamp the visit AFTER reading the diff, so the next visit compares against now.
    await db.rpc("touch_last_seen", { p_user_id: userId });
  }

  return {
    profile,
    rows,
    source,
    since,
    watchlist,
    actions: buildActions({ profile, counts, watchlist, rows, lastRuns, source }),
    counts,
    lastRuns,
  };
}

/**
 * Next actions, derived from state. Ordered by urgency, capped at three, because a
 * list of ten "next" actions is a backlog and nobody acts on a backlog.
 */
function buildActions(ctx: {
  profile: Profile | null;
  counts: DashboardData["counts"];
  watchlist: WatchRow[];
  rows: RadarRow[];
  lastRuns: IngestRun[];
  source: "live" | "seed";
}): NextAction[] {
  const out: NextAction[] = [];
  const { profile, counts, watchlist, rows, lastRuns, source } = ctx;

  // Urgent: the feed is broken. Admins should see the cause.
  const lastFailed = lastRuns.find((r) => r.error);
  if (lastFailed?.error && profile?.role === "admin") {
    out.push({
      id: "ingest",
      title: "The nightly pull stopped early",
      detail: lastFailed.error.slice(0, 120),
      href: "/settings",
      cta: "See details",
      tone: "urgent",
    });
  }

  if (source === "seed") {
    out.push({
      id: "seed",
      title: "You are looking at sample data",
      detail: "No live pull has produced rows yet, so nothing here is a real signal.",
      href: "/settings",
      cta: "Check the feed",
      tone: "urgent",
    });
  }

  // Opportunity: strong intent rows the user has not saved yet.
  const saved = new Set(watchlist.map((w) => w.signalId));
  // Sorted, because the card claims "highest" — it previously showed whichever row came
  // first in velocity order, so the figure quoted was often not the highest at all.
  // The label says "unusually high" rather than "beating likes": the threshold is 0.70,
  // and a 0.85 ratio is not a ratio above 1.
  const hot = rows
    .filter((r) => (r.savesRatio ?? 0) >= 0.7 && !saved.has(r.id))
    .sort((a, b) => (b.savesRatio ?? 0) - (a.savesRatio ?? 0));
  if (hot.length > 0) {
    out.push({
      id: "hot",
      title: `${hot.length} product${hot.length === 1 ? "" : "s"} with unusually high save intent`,
      detail: `Highest is ${hot[0]!.product} at ${hot[0]!.savesRatio?.toFixed(2)} saves per like. Above 0.70 is rare.`,
      href: "/radar",
      cta: "Open the radar",
      tone: "opportunity",
    });
  }

  if (counts.unpriced > 0) {
    out.push({
      id: "price",
      title: `${counts.unpriced} products have no factory price`,
      detail: "Run a supplier match to see the wholesale figure and the spread.",
      href: "/analysis",
      cta: "Price one now",
      tone: "opportunity",
    });
  }

  if (watchlist.length === 0) {
    out.push({
      id: "watch",
      title: "Start a watchlist",
      detail: "Save a product and we will tell you when its numbers move.",
      href: "/radar",
      cta: "Pick a product",
      tone: "routine",
    });
  }

  if (!profile?.niches?.length) {
    out.push({
      id: "niches",
      title: "Choose your niches",
      detail: "We will prioritise those categories in the nightly pull and the weekly email.",
      href: "/settings",
      cta: "Set niches",
      tone: "routine",
    });
  }

  return out.slice(0, 3);
}
