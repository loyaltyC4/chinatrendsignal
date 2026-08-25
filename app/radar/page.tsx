import type { Metadata } from "next";
import SignalFeed from "@/components/signal-feed";
import { Shell, Stat } from "@/components/page-shell";
import RadarHero from "@/components/radar-hero";
import NicheFilters from "@/components/niche-filters";
import { getRadar } from "@/lib/signals";
import { requireUser } from "@/lib/auth";
import { getWatchedIds, watchlistCap, type Profile } from "@/lib/dashboard";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Radar" };
export const dynamic = "force-dynamic";

/*
 * Radar page — warm hero + polished filters + skeleton loading + upgraded empty.
 *
 * Structural changes from the previous version:
 *  1. Flat `PageHead` + `SourceBadge` replaced with `RadarHero` — a gradient
 *     band carrying the freshness pill, gradient headline, sub, two shortcut
 *     CTAs, and an animated radar-scope SVG on the right.
 *  2. Mono-font niche chips replaced with `NicheFilters` — per-niche icon
 *     tiles + counts, hover lift, active fill.
 *  3. Sample-data warning demoted from a full-width red card to a subtle
 *     one-line note; the hero already flags "Sample data" up top so it
 *     doesn't need to shout twice.
 *  4. Empty state lives inside `SignalFeed` and now renders an actual
 *     empty-radar illustration with a Clear filters / Worked example
 *     next action. Skeleton rows during the initial server render live in
 *     the sibling `loading.tsx`.
 */

function ago(iso: string | null) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function RadarPage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string }>;
}) {
  const { niche } = await searchParams;
  const { source, rows, lastIngestAt } = await getRadar(60);

  const { user } = await requireUser();
  let watched: string[] = [];
  let plan: Profile["plan"] = "scout";
  let role = "member";
  if (user) {
    watched = await getWatchedIds(user.id);
    if (isServiceRoleConfigured()) {
      const { data } = await supabaseAdmin().from("profiles").select("plan, role").eq("id", user.id).maybeSingle();
      plan = (data?.plan as Profile["plan"]) ?? "scout";
      role = data?.role ?? "member";
    }
  }
  const canExport = plan === "operator" || role === "admin";

  const niches = Array.from(new Set(rows.map((r) => r.niche).filter(Boolean))).sort();
  const counts: Record<string, number> = {};
  for (const r of rows) {
    if (r.niche) counts[r.niche] = (counts[r.niche] ?? 0) + 1;
  }
  const visible = niche ? rows.filter((r) => r.niche === niche) : rows;

  const rising = visible.filter((r) => r.stage === "Rising").length;
  const spreads = visible
    .filter((r) => r.wholesaleCny > 0 && r.retailAud > 0)
    .map((r) => r.retailAud / (r.wholesaleCny * 0.213))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  const medianSpread = spreads.length ? spreads[Math.floor(spreads.length / 2)] : null;
  const tracked = visible.filter((r) => r.daysTracked != null).map((r) => r.daysTracked!);
  const oldest = tracked.length ? Math.max(...tracked) : null;

  return (
    <Shell active="Radar">
      <RadarHero live={source === "live"} when={ago(lastIngestAt)} />

      {source === "seed" && (
        <p className="mt-4 flex items-start gap-2 rounded-ctl border border-line bg-warnweak px-3 py-2 text-[12.5px] leading-relaxed text-warn">
          <i className="ph-fill ph-info shrink-0 text-[14px] leading-[1.4]" />
          These are example rows so you can see the shape. The nightly pull has not
          produced data for this view yet, so first-seen dates read as a dash.
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat
          label="Signals"
          value={String(visible.length)}
          note={source === "live" ? "from the nightly pull" : "sample dataset"}
          hue="var(--c-accent)"
        />
        <Stat label="Rising" value={String(rising)} note="accelerating week on week" hue="var(--c-pos)" />
        <Stat
          label="Median spread"
          value={medianSpread ? `${medianSpread.toFixed(1)}×` : "-"}
          note={medianSpread ? "wholesale to implied retail" : "awaiting supplier prices"}
          hue="var(--c-1688)"
        />
        <Stat
          label="Longest tracked"
          value={oldest != null ? `${oldest}d` : "-"}
          note={oldest != null ? "since first detection" : "no history yet"}
          hue="var(--c-taobao)"
        />
      </div>

      {niches.length > 1 && (
        <div className="mt-8">
          <NicheFilters niches={niches} active={niche} counts={counts} total={rows.length} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] text-mut">
          Tracking{" "}
          <span data-numeric className="text-ink">
            {watched.length}
          </span>{" "}
          of {watchlistCap(plan)} on your {plan} plan
        </p>
        {canExport ? (
          <a
            href={`/api/export${niche ? `?niche=${encodeURIComponent(niche)}` : ""}`}
            className="rounded-ctl border border-line px-2.5 py-1 font-mono text-[11px] text-body transition-colors hover:border-linestrong hover:text-ink"
          >
            Export CSV
          </a>
        ) : (
          <a
            href="/settings/billing"
            title="CSV export is an Operator feature"
            className="rounded-ctl border border-line px-2.5 py-1 font-mono text-[11px] text-faint transition-colors hover:text-mut"
          >
            Export CSV · Operator
          </a>
        )}
      </div>

      <div className="mt-3">
        <SignalFeed signals={visible} watched={watched} />
      </div>

      <p className="mt-5 max-w-[86ch] text-[11.5px] leading-relaxed text-mut">
        <span className="font-mono">Intent</span> is the saves-to-likes ratio on Xiaohongshu, our
        bookmark-to-buy proxy. <span className="font-mono">Spread</span> compares implied AUD retail
        against the median 1688 wholesale offer and is marked <span className="font-mono">est.</span>{" "}
        because it is inferred, not measured. <span className="font-mono">First seen</span> is when a
        signal entered our index and is never back-dated. We do not estimate store revenue.
      </p>
    </Shell>
  );
}
