import type { Metadata } from "next";
import SignalFeed from "@/components/signal-feed";
import { Shell, PageHead, SourceBadge, Stat } from "@/components/page-shell";
import { getRadar } from "@/lib/signals";

export const metadata: Metadata = { title: "Radar" };
export const dynamic = "force-dynamic";

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

  const niches = Array.from(new Set(rows.map((r) => r.niche).filter(Boolean))).sort();
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
      <PageHead
        title="Radar"
        sub="Products moving on Chinese platforms, ranked by momentum against margin. Every row carries the date we first recorded it."
        aside={<SourceBadge live={source === "live"} when={ago(lastIngestAt)} />}
      />

      {source === "seed" && (
        <div className="mt-6 rounded-card border border-line bg-warnweak px-4 py-3 text-[13px] leading-relaxed text-warn">
          <b className="font-medium">These are example rows, not live signals.</b> The nightly
          pull has not produced data for this view yet. First-seen dates read as a dash because
          we genuinely do not know them.
        </div>
      )}

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat label="Signals" value={String(visible.length)} note={source === "live" ? "from the nightly pull" : "sample dataset"} />
        <Stat label="Rising" value={String(rising)} note="accelerating week on week" />
        <Stat
          label="Median spread"
          value={medianSpread ? `${medianSpread.toFixed(1)}×` : "-"}
          note={medianSpread ? "wholesale to implied retail" : "awaiting supplier prices"}
        />
        <Stat
          label="Longest tracked"
          value={oldest != null ? `${oldest}d` : "-"}
          note={oldest != null ? "since first detection" : "no history yet"}
        />
      </div>

      {niches.length > 1 && (
        <div className="mt-8 flex flex-wrap items-center gap-1.5">
          <a
            href="/radar"
            className={`rounded-ctl border px-2.5 py-1 font-mono text-[11px] transition-colors ${
              !niche ? "border-accent bg-accentweak text-accent" : "border-line text-mut hover:border-linestrong hover:text-ink"
            }`}
          >
            All
          </a>
          {niches.map((n) => (
            <a
              key={n}
              href={`/radar?niche=${encodeURIComponent(n)}`}
              className={`rounded-ctl border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                niche === n ? "border-accent bg-accentweak text-accent" : "border-line text-mut hover:border-linestrong hover:text-ink"
              }`}
            >
              {n}
            </a>
          ))}
          <span data-numeric className="ml-auto hidden font-mono text-[11px] text-faint sm:block">
            {visible.length} of {rows.length}
          </span>
        </div>
      )}

      <div className="mt-4">
        <SignalFeed signals={visible} />
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
