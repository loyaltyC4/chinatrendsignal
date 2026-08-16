import type { Metadata } from "next";
import Link from "next/link";
import SignalFeed from "@/components/signal-feed";
import { SIGNALS } from "@/lib/radar-data";

export const metadata: Metadata = { title: "Radar — China Trend Signal" };

const KPIS = [
  { label: "Active signals", value: "47", delta: "+9 this week" },
  { label: "Rising now", value: "12", delta: "peak in 1-3 wks" },
  { label: "Median spread", value: "31×", delta: "wholesale→retail" },
  { label: "Tracked sources", value: "7", delta: "Douyin · XHS · 1688…" },
];

const NAV = [
  { label: "Radar", href: "/radar" },
  { label: "Movers & Shakers", href: "/movers" },
    { label: "Pricing", href: "/pricing" },
  { label: "Home", href: "/" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f4f1ea] font-sans text-[#1a1b20]">
      <div className="flex">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-black/8 p-5 md:flex">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight hover:opacity-80 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true"><circle cx="13" cy="13" r="11" stroke="#1d4ed8" strokeWidth="2.5"/><circle cx="13" cy="13" r="5.5" stroke="#1d4ed8" strokeWidth="2.5"/><circle cx="13" cy="13" r="1.8" fill="#1d4ed8"/></svg>
            <span>chinatrendsignal</span>
          </Link>
          <nav className="mt-8 flex flex-col gap-1 text-sm">
            {NAV.map((item, i) => (
              <Link key={item.label} href={item.href} className={`rounded-lg px-3 py-2 transition-colors ${i === 0 ? "bg-grn/10 font-medium text-grn" : "text-[#6b6f78] hover:bg-black/5 hover:text-ink"}`}>{item.label}</Link>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-black/10 bg-black/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#8a8f96]">Plan</p>
            <p className="mt-1 text-sm font-semibold">Hunter · A$39/mo</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full w-[62%] rounded-full bg-grn" /></div>
            <p className="mt-1.5 font-mono text-[10px] text-[#8a8f96]">31/50 deep-dives used</p>
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Radar</h1>
              <p className="mt-1 text-sm text-[#6b6f78]">Trends moving on Chinese platforms, ranked by momentum and margin. Refreshed daily.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 font-mono text-[11px] text-[#6b6f78] sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-grn" />Live · 4h ago</span>
              <button className="rounded-xl bg-grn px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]">Export CSV</button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {KPIS.map((k) => (
              <div key={k.label} className="rounded-xl border border-black/8 bg-black/[.03] px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">{k.label}</p>
                <p className="mt-1 font-mono text-[26px] font-bold leading-none">{k.value}</p>
                <p className="mt-1.5 text-[11.5px] text-[#8a8f96]">{k.delta}</p>
              </div>
            ))}
          </div>

          {/* filters */}
          <div className="mt-7 flex flex-wrap gap-2">
            {["All niches", "Pet care", "Beauty", "Wellness", "Gadgets", "Home", "Food"].map((f, i) => (
              <button key={f} className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors ${i === 0 ? "border-grn/40 bg-grn/10 text-grn" : "border-black/10 text-[#6b6f78] hover:border-white/25 hover:text-ink"}`}>{f}</button>
            ))}
            <span className="ml-auto hidden font-mono text-[11px] text-[#8a8f96] sm:block">{SIGNALS.length} signals</span>
          </div>

          {/* feed */}
          <div className="mt-4">
            <SignalFeed signals={SIGNALS} />
          </div>

          <p className="mt-4 font-mono text-[11px] text-[#8a8f96]">Intent = saves-to-likes ratio on Xiaohongshu (bookmark-to-buy). Spread = retail AUD vs 1688 wholesale (CXY→AUD). Real engagement, no estimated revenue.</p>
        </main>
      </div>
    </div>
  );
}
