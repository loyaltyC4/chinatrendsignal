import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import SignalFeed from "@/components/signal-feed";
import { getRadar } from "@/lib/signals";

export const metadata: Metadata = { title: "Radar — China Trend Signal" };
export const dynamic = "force-dynamic";

function fmtWhen(iso: string | null) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function RadarPage() {
  const { source, rows, lastIngestAt } = await getRadar(40);

  const rising = rows.filter((r) => r.stage === "Rising").length;
  const withPrice = rows.filter((r) => r.wholesaleCny > 0);
  const spreads = withPrice
    .map((r) => r.retailAud / (r.wholesaleCny * 0.213))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  const medianSpread = spreads.length ? spreads[Math.floor(spreads.length / 2)] : null;
  const tracked = rows.filter((r) => r.daysTracked != null);
  const oldest = tracked.length ? Math.max(...tracked.map((r) => r.daysTracked!)) : null;

  const KPIS = [
    { label: "Active signals", value: String(rows.length), delta: source === "live" ? "from the nightly pull" : "sample dataset" },
    { label: "Rising now", value: String(rising), delta: "accelerating week on week" },
    { label: "Median spread", value: medianSpread ? `${medianSpread.toFixed(1)}×` : "—", delta: medianSpread ? "wholesale → retail" : "awaiting supplier data" },
    { label: "Longest tracked", value: oldest != null ? `${oldest}d` : "—", delta: oldest != null ? "since we first saw it" : "no history yet" },
  ];

  const niches = Array.from(new Set(rows.map((r) => r.niche))).slice(0, 6);

  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Radar" />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Radar</h1>
            <p className="mt-1 text-sm text-mut">
              Trends moving on Chinese platforms, ranked by momentum and margin.
            </p>
          </div>
          {/* Provenance badge. The whole pitch is data honesty, so the UI states
              plainly whether these rows came from a real pull or the sample set. */}
          {source === "live" ? (
            <span className="flex items-center gap-2 rounded-full border border-grn/25 bg-grn/10 px-3 py-1.5 font-mono text-[11px] text-grn">
              <span className="h-1.5 w-1.5 rounded-full bg-grn" />
              Live · pulled {fmtWhen(lastIngestAt)}
            </span>
          ) : (
            <span className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 font-mono text-[11px] text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Sample data · first pull pending
            </span>
          )}
        </div>

        {source === "seed" && (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <b>These are example rows, not live signals.</b> The nightly pull hasn&apos;t
            produced data yet, so the radar is showing a fixed sample set. First-seen dates
            read &ldquo;—&rdquo; because we genuinely don&apos;t know them.
          </div>
        )}

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-xl border border-black/8 bg-black/[.03] px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">{k.label}</p>
              <p className="mt-1 font-mono text-[26px] font-bold leading-none">{k.value}</p>
              <p className="mt-1.5 text-[11.5px] text-[#8a8f96]">{k.delta}</p>
            </div>
          ))}
        </div>

        {niches.length > 0 && (
          <div className="mt-7 flex flex-wrap gap-2">
            <span className="rounded-full border border-grn/40 bg-grn/10 px-3.5 py-1.5 font-mono text-[11px] text-grn">All niches</span>
            {niches.map((f) => (
              <span key={f} className="rounded-full border border-black/10 px-3.5 py-1.5 font-mono text-[11px] text-[#6b6f78]">{f}</span>
            ))}
            <span className="ml-auto hidden font-mono text-[11px] text-[#8a8f96] sm:block">{rows.length} signals</span>
          </div>
        )}

        <div className="mt-4">
          <SignalFeed signals={rows} />
        </div>

        <p className="mt-4 max-w-[80ch] font-mono text-[11px] leading-relaxed text-[#8a8f96]">
          Intent = saves-to-likes ratio on Xiaohongshu (bookmark-to-buy). Spread = implied retail
          AUD vs 1688 wholesale (CNY→AUD). First seen = when this signal first entered our
          index, never back-dated. We do not estimate store revenue.
        </p>
      </main>
    </div>
  );
}
