import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell, Stat } from "@/components/page-shell";
import { platformStyle } from "@/lib/platform-style";
import WatchButton from "@/components/watch-button";
import { requireUser } from "@/lib/auth";
import { getDashboard, planAllowance } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Today" };
export const dynamic = "force-dynamic";

/*
 * DESIGN READ: dense product dashboard for an operationally-minded seller, with an
 * action-first language. Dials: VARIANCE 5, MOTION 4, DENSITY 7. Low variance
 * because order is what makes a dashboard usable; high density because the data IS
 * the product.
 *
 * The organising idea is a single question: "what changed, and what do I do now?"
 * So the page opens with a diff since the last visit and at most three derived
 * actions, and only then shows the numbers. Metric-first dashboards look busy and
 * tell you nothing to do.
 */

function ago(iso: string | null) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TONE: Record<string, { fg: string; bg: string; label: string }> = {
  urgent: { fg: "var(--c-neg)", bg: "var(--c-neg-weak)", label: "Needs attention" },
  opportunity: { fg: "var(--c-douyin)", bg: "var(--c-douyin-weak)", label: "Opportunity" },
  routine: { fg: "var(--c-accent)", bg: "var(--c-accent-weak)", label: "Set up" },
};

export default async function DashboardPage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fdashboard");

  const d = await getDashboard(user.id);
  const first = (d.profile?.displayName || d.profile?.email || "there").split("@")[0];
  const allowance = planAllowance(d.profile?.plan ?? "scout");
  const usedPct = Math.min(100, Math.round(((allowance - Math.min(d.profile?.credits ?? 0, allowance)) / allowance) * 100));

  const watched = new Set(d.watchlist.map((w) => w.signalId));

  const movers = [...d.rows]
    .filter((r) => r.isProduct !== false)
    .sort((a, b) => (b.savesRatio ?? 0) - (a.savesRatio ?? 0))
    .slice(0, 6);

  return (
    <Shell active="Today">
      {/* WHILE YOU WERE AWAY: the retention surface, first thing on the page */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display-md text-ink">Morning, {first}.</h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-body">
            {d.since.since ? (
              <>
                Since you last looked{" "}
                <span data-numeric className="font-mono font-medium text-ink">{d.since.newSignals}</span> new
                {d.since.newSignals === 1 ? " signal" : " signals"} landed and{" "}
                <span data-numeric className="font-mono font-medium text-ink">{d.since.newlyPriced}</span> got a factory price.
              </>
            ) : (
              "Here is the state of your index."
            )}
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-body">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: d.source === "live" ? "var(--c-pos)" : "var(--c-warn)" }}
          />
          {d.source === "live" ? `pulled ${ago(d.lastRuns[0]?.finishedAt ?? null)}` : "sample data"}
        </span>
      </div>

      {/* NEXT ACTIONS: derived from state, capped at three */}
      {d.actions.length > 0 && (
        <section className="mt-7">
          <h2 className="label text-mut">Do this next</h2>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {d.actions.map((a) => {
              const t = TONE[a.tone]!;
              return (
                <Link
                  key={a.id}
                  href={a.href}
                  className="group relative overflow-hidden rounded-card border border-line bg-surface p-5 transition-colors hover:border-linestrong"
                >
                  <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: t.fg }} />
                  <span
                    className="inline-block rounded-chip px-1.5 py-0.5 font-mono text-[9.5px]"
                    style={{ background: t.bg, color: t.fg }}
                  >
                    {t.label}
                  </span>
                  <p className="mt-3 text-[14.5px] font-medium leading-snug text-ink">{a.title}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-mut">{a.detail}</p>
                  <p className="mt-3 text-[12.5px] font-medium" style={{ color: t.fg }}>
                    {a.cta} &rarr;
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* NUMBERS */}
      <section className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat label="Indexed" value={String(d.counts.indexed)} note={`${d.counts.niches} niches`} hue="var(--c-accent)" />
        <Stat label="Confirmed products" value={String(d.counts.products)} note="passed extraction" hue="var(--c-xhs)" />
        <Stat label="Priced" value={`${d.counts.priced}/${d.counts.products || 0}`} note="have a wholesale offer" hue="var(--c-1688)" />
        <Stat label="Watching" value={String(d.watchlist.length)} note="saved products" hue="var(--c-douyin)" />
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* HIGHEST INTENT */}
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="display-sm text-ink">Highest intent right now</h2>
            <Link href="/radar" className="text-[13px] text-accent transition-opacity hover:opacity-70">
              Full radar
            </Link>
          </div>
          <ul className="mt-3 overflow-hidden rounded-card border border-line bg-surface">
            {movers.length === 0 && (
              <li className="px-5 py-12 text-center text-[13px] text-mut">
                Nothing indexed yet. Rows appear after the first nightly pull.
              </li>
            )}
            {movers.map((r) => {
              const p = platformStyle(r.sources[0] ?? "");
              const ratio = r.savesRatio ?? 0;
              return (
                <li key={r.id} className="border-b border-line last:border-b-0">
                  <Link
                    href={`/analysis?id=${r.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface2 sm:px-5"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-semibold"
                      style={{ background: p.bg, color: p.fg }}
                      aria-hidden
                    >
                      {p.label.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">{r.product}</span>
                      <span className="block truncate font-mono text-[11px] text-faint">
                        {r.zh ? `${r.zh} · ` : ""}{r.niche}
                      </span>
                    </span>
                    {/* intent bar: no background track, per the anti-dashboard-clutter rule */}
                    <span className="hidden w-[70px] shrink-0 sm:block" aria-hidden>
                      <span className="block h-[3px] rounded-full" style={{ width: `${Math.min(100, ratio * 100)}%`, background: p.fg }} />
                    </span>
                    <span
                      data-numeric
                      className="w-[42px] shrink-0 text-right font-mono text-[13px] font-semibold"
                      style={{ color: ratio >= 0.7 ? "var(--c-douyin)" : ratio >= 0.4 ? "var(--c-1688)" : "var(--c-muted)" }}
                    >
                      {ratio ? ratio.toFixed(2) : "-"}
                    </span>
                    <WatchButton signalId={r.id} initial={watched.has(r.id)} label={false} />
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-2.5 font-mono text-[11px] text-mut">
            Saves per like. Above 0.70 is unusual.
          </p>
        </section>

        <div className="space-y-6">
          {/* CREDITS: billing entry point, with a real usage meter */}
          <section className="rounded-card border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="display-sm text-ink">Credits</h2>
              <span className="font-mono text-[11px] capitalize text-mut">{d.profile?.plan ?? "scout"}</span>
            </div>
            <p data-numeric className="mt-3 font-mono text-[30px] font-medium leading-none tracking-[-.02em] text-ink">
              {d.profile?.credits ?? 0}
            </p>
            <div className="mt-4">
              <div className="flex items-baseline justify-between font-mono text-[10.5px] text-mut">
                <span>this cycle</span>
                <span data-numeric>{usedPct}% used</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface3">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${usedPct}%`, background: usedPct > 85 ? "var(--c-neg)" : "var(--c-accent)" }}
                />
              </div>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-mut">
              Reading the radar is free. Only analysis, supplier matches and reports are metered, and
              credits never expire.
            </p>
            <Link
              href="/settings/billing"
              className="mt-4 block rounded-ctl border border-linestrong py-2 text-center text-[13px] font-medium text-ink transition-colors hover:bg-surface2"
            >
              Billing and plan
            </Link>
          </section>

          {/* WATCHLIST with a real, teaching empty state */}
          <section className="rounded-card border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="display-sm text-ink">Your watchlist</h2>
              {d.watchlist.length > 0 && (
                <Link href="/watchlist" className="text-[12.5px] text-accent transition-opacity hover:opacity-70">
                  See movement
                </Link>
              )}
            </div>
            {d.watchlist.length === 0 ? (
              <>
                <p className="mt-2 text-[12.5px] leading-relaxed text-mut">
                  Nothing saved yet. Open a product from the radar and save it, and this becomes the
                  short list you actually work from.
                </p>
                <Link
                  href="/radar"
                  className="mt-4 block rounded-ctl bg-accentstrong py-2 text-center text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90"
                >
                  Pick a product
                </Link>
              </>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--c-line)]">
                {d.watchlist.slice(0, 6).map((w) => {
                  const p = platformStyle(w.source);
                  return (
                    <li key={w.id} className="flex items-center gap-2.5 py-2.5">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: p.fg }} />
                      <Link
                        href={`/analysis?id=${w.signalId}`}
                        className="min-w-0 flex-1 truncate text-[13px] text-ink transition-opacity hover:opacity-70"
                      >
                        {w.product}
                      </Link>
                      <span className="shrink-0 font-mono text-[10.5px] text-faint">{w.niche}</span>
                      <WatchButton signalId={w.signalId} initial label={false} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* THE MACHINE WORKED: proves value accrued while they were away */}
          <section className="rounded-card border border-line bg-surface p-5">
            <h2 className="display-sm text-ink">Recent pulls</h2>
            {d.lastRuns.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-mut">No runs recorded yet.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {d.lastRuns.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: r.error ? "var(--c-warn)" : "var(--c-pos)" }}
                      />
                      <span className="truncate font-mono text-[11.5px] text-body">{ago(r.startedAt)}</span>
                    </span>
                    <span data-numeric className="shrink-0 font-mono text-[11.5px] text-mut">
                      +{r.inserted}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {d.profile?.role === "admin" && d.lastRuns[0]?.error && (
              <p className="mt-3 rounded-ctl border border-line bg-warnweak px-2.5 py-2 font-mono text-[10.5px] leading-relaxed text-warn">
                {d.lastRuns[0].error.slice(0, 140)}
              </p>
            )}
          </section>
        </div>
      </div>
    </Shell>
  );
}
