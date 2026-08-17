import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell, PageHead, Stat } from "@/components/page-shell";
import WatchButton from "@/components/watch-button";
import { requireUser } from "@/lib/auth";
import { getWatchlistDetail } from "@/lib/signals";
import { watchlistCap, type Profile } from "@/lib/dashboard";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { platformStyle } from "@/lib/platform-style";

export const metadata: Metadata = { title: "Watchlist" };
export const dynamic = "force-dynamic";

/*
 * DESIGN READ: the short list you work from, so it is ordered by MOVEMENT rather than
 * by when you saved things. Dials: VARIANCE 4, MOTION 3, DENSITY 6.
 *
 * The column that earns the page is "since you saved" — a measured delta against the
 * observation recorded on the day you saved the row. Everything else here you could
 * get from the radar; that column you can only get by having saved it, which is the
 * reason to come back.
 */
export default async function WatchlistPage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fwatchlist");

  const rows = await getWatchlistDetail(user.id);

  let plan: Profile["plan"] = "scout";
  if (isServiceRoleConfigured()) {
    const { data } = await supabaseAdmin().from("profiles").select("plan").eq("id", user.id).maybeSingle();
    plan = (data?.plan as Profile["plan"]) ?? "scout";
  }
  const cap = watchlistCap(plan);

  // Movement first, unknown movement last: a row we cannot yet compare is not news.
  const ordered = [...rows].sort((a, b) => {
    if (a.movementPct == null && b.movementPct == null) return 0;
    if (a.movementPct == null) return 1;
    if (b.movementPct == null) return -1;
    return b.movementPct - a.movementPct;
  });

  const climbing = rows.filter((r) => (r.movementPct ?? 0) > 0).length;
  const priced = rows.filter((r) => r.wholesaleCny > 0).length;

  return (
    <Shell active="Watchlist">
      <PageHead
        title="Watchlist"
        sub="The products you asked us to keep an eye on. Re-checked on every nightly pull, ordered by how much they have moved since you saved them."
        aside={
          <span className="rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-body">
            <span data-numeric>{rows.length}</span> of {cap} on {plan}
          </span>
        }
      />

      {rows.length === 0 ? (
        <div className="mt-8 max-w-[46rem] rounded-card border border-line bg-surface px-6 py-14 text-center">
          <p className="text-[15px] font-medium text-ink">Nothing saved yet</p>
          <p className="mx-auto mt-2 max-w-[48ch] text-[13.5px] leading-relaxed text-mut">
            Save a product from the radar and we will re-check it every night. From then on this
            page can tell you something the radar cannot: how far it has moved since the day you
            decided it was interesting.
          </p>
          <Link
            href="/radar"
            className="mt-5 inline-block rounded-ctl bg-accentstrong px-4 py-2 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90"
          >
            Open the radar
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-7 grid max-w-[54rem] grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            <Stat label="Tracked" value={String(rows.length)} note={`ceiling ${cap}`} hue="var(--c-accent)" />
            <Stat label="Climbing" value={String(climbing)} note="up since you saved" hue="var(--c-douyin)" />
            <Stat label="Priced" value={`${priced}/${rows.length}`} note="have a factory price" hue="var(--c-1688)" />
            <Stat
              label="Oldest"
              value={ordered.some((r) => r.daysTracked != null) ? `${Math.max(...ordered.map((r) => r.daysTracked ?? 0))}d` : "-"}
              note="since first detection"
              hue="var(--c-xhs)"
            />
          </div>

          <ul className="mt-8 overflow-hidden rounded-card border border-line bg-surface">
            <li className="grid grid-cols-[minmax(0,2fr)_.8fr_.7fr_.7fr_auto] items-center gap-3 border-b border-line bg-surface2 px-4 py-2.5 sm:px-5">
              <span className="label text-mut">Product</span>
              <span className="label text-right text-mut">Since you saved</span>
              <span className="label text-right text-mut">Intent</span>
              <span className="label text-right text-mut">Saved</span>
              <span className="sr-only">Remove</span>
            </li>

            {ordered.map((r) => {
              const p = platformStyle(r.sources[0] ?? "");
              const move = r.movementPct;
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-[minmax(0,2fr)_.8fr_.7fr_.7fr_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="shrink-0 rounded-chip px-1.5 py-px font-mono text-[9.5px]"
                      style={{ background: p.bg, color: p.fg }}
                    >
                      {p.label}
                    </span>
                    <Link
                      href={`/analysis?id=${r.id}`}
                      className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink transition-opacity hover:opacity-70"
                    >
                      {r.product}
                    </Link>
                  </div>

                  <span
                    data-numeric
                    className="text-right font-mono text-[13px] font-medium"
                    style={{
                      color: move == null ? "var(--c-faint)" : move > 0 ? "var(--c-pos)" : move < 0 ? "var(--c-neg)" : "var(--c-muted)",
                    }}
                    title={move == null ? "No observation from before you saved it yet" : "Engagement change since the day you saved it"}
                  >
                    {move == null ? "-" : `${move > 0 ? "+" : ""}${move}%`}
                  </span>

                  <span data-numeric className="text-right font-mono text-[12.5px] text-body">
                    {r.savesRatio != null ? `${r.savesRatio.toFixed(2)}×` : "-"}
                  </span>

                  <span data-numeric className="text-right font-mono text-[11.5px] text-faint">
                    {new Date(r.savedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </span>

                  <WatchButton signalId={r.id} initial label={false} />
                </li>
              );
            })}
          </ul>

          <p className="mt-4 max-w-[80ch] text-[11.5px] leading-relaxed text-mut">
            <span className="font-mono">Since you saved</span> compares tonight&apos;s engagement
            against the reading we had on the day you saved the row. It shows a dash until we have a
            reading from before that date, because a percentage against an unknown baseline
            would be a made-up number.
          </p>
        </>
      )}
    </Shell>
  );
}
