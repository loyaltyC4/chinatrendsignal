import type { Metadata } from "next";
import Link from "next/link";
import { Shell, PageHead, SourceBadge, Stat } from "@/components/page-shell";
import { getRadar } from "@/lib/signals";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

function ago(iso: string | null) {
  if (!iso) return "never";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "under an hour ago";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function DashboardPage() {
  const { source, rows, lastIngestAt } = await getRadar(200);
  const rising = rows.filter((r) => r.stage === "Rising").length;
  const priced = rows.filter((r) => r.wholesaleCny > 0).length;
  const niches = new Set(rows.map((r) => r.niche)).size;

  const top = [...rows].sort((a, b) => b.velocityPct - a.velocityPct).slice(0, 5);

  return (
    <Shell active="Overview">
      <PageHead
        title="Overview"
        sub="Where the pipeline stands right now, and the fastest-moving signals in your index."
        aside={<SourceBadge live={source === "live"} when={ago(lastIngestAt)} />}
      />

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat label="Signals indexed" value={String(rows.length)} note={`across ${niches} niches`} />
        <Stat label="Rising" value={String(rising)} note="accelerating week on week" />
        <Stat label="Priced" value={`${priced}/${rows.length}`} note="have a wholesale offer" />
        <Stat label="Last pull" value={source === "live" ? ago(lastIngestAt) : "-"} note={source === "live" ? "nightly at 05:00 AEST" : "no live pull yet"} />
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="display-sm text-ink">Moving fastest</h2>
          <Link href="/radar" className="text-[13px] text-accent transition-opacity hover:opacity-70">
            Open the radar
          </Link>
        </div>
        <ul className="mt-3 overflow-hidden rounded-card border border-line bg-surface">
          {top.length === 0 && (
            <li className="px-4 py-10 text-center text-[13px] text-mut">Nothing indexed yet.</li>
          )}
          {top.map((r) => (
            <li key={r.id} className="border-b border-line last:border-b-0">
              <Link
                href={`/analysis?product=${encodeURIComponent(r.product)}&zh=${encodeURIComponent(r.zh)}&niche=${encodeURIComponent(r.niche)}&stage=${r.stage}&velocity=${r.velocityPct}&intent=${r.intent}&wholesale=${r.wholesaleCny}&retail=${r.retailAud}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface2 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-ink">{r.product}</p>
                  <p className="truncate text-[11.5px] text-mut">{r.niche}</p>
                </div>
                <span data-numeric className="shrink-0 font-mono text-[13px] font-medium text-pos">
                  +{r.velocityPct}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="display-sm text-ink">Where to go next</h2>
        <div className="mt-3 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
          {[
            { href: "/radar", name: "Radar", note: "Every signal, ranked by momentum against margin." },
            { href: "/reports", name: "Weekly report", note: "A written brief on what moved in one niche." },
            { href: "/tracker", name: "Tracker", note: "Log what you tested and what came back." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="group bg-surface p-5 transition-colors hover:bg-surface2">
              <p className="text-[14px] font-medium text-ink group-hover:text-accent">{c.name}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-mut">{c.note}</p>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}
