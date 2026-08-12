import type { Metadata } from "next";
import Link from "next/link";
import SignalFeed, { type Signal } from "@/components/signal-feed";

export const metadata: Metadata = { title: "Radar — China Trend Signal" };

const NAV = [
  { label: "Radar", href: "/radar" },
  { label: "Movers & Shakers", href: "/movers" },
  { label: "Listing Studio", href: "/listing" },
  { label: "Pricing", href: "/pricing" },
  { label: "Home", href: "/" },
];

const KPIS = [
  { label: "Active signals", value: "47", delta: "+9 this week" },
  { label: "Rising now", value: "12", delta: "peak in 1-3 wks" },
  { label: "Median spread", value: "31×", delta: "wholesale→retail" },
  { label: "Tracked sources", value: "7", delta: "Douyin · XHS · 1688…" },
];

const SIGNALS: Signal[] = [
  { id: "1", product: "Steam-spray pet brush", zh: "喷雾梳", niche: "Pet care", stage: "Rising", velocityPct: 214, intent: 88, wholesaleCny: 2.52, retailAud: 39.95, sources: ["XHS", "1688", "Douyin"], refreshed: "4h" },
  { id: "2", product: "Portable neck fan (USB-C)", zh: "挂脖风扇", niche: "Summer/Cooling", stage: "Rising", velocityPct: 186, intent: 81, wholesaleCny: 8.9, retailAud: 34.95, sources: ["Douyin", "1688"], refreshed: "4h" },
  { id: "3", product: "Glass skin essence mist", zh: "精华喷雾", niche: "K-Beauty", stage: "Rising", velocityPct: 149, intent: 84, wholesaleCny: 6.4, retailAud: 29.95, sources: ["XHS", "TikTok"], refreshed: "6h" },
  { id: "4", product: "Magnetic cable clips (12pk)", zh: "磁吸理线器", niche: "Desk/Home org", stage: "Rising", velocityPct: 121, intent: 72, wholesaleCny: 1.8, retailAud: 14.95, sources: ["1688", "Douyin"], refreshed: "6h" },
  { id: "5", product: "Electric callus remover", zh: "电动磨脚器", niche: "Beauty tools", stage: "Peaking", velocityPct: 96, intent: 77, wholesaleCny: 11.2, retailAud: 44.95, sources: ["XHS", "Taobao"], refreshed: "8h" },
  { id: "6", product: "Snack-box sampler (Asian)", zh: "零食大礼包", niche: "Food/Snacks", stage: "Rising", velocityPct: 88, intent: 69, wholesaleCny: 14.5, retailAud: 49.00, sources: ["Douyin", "XHS"], refreshed: "8h" },
  { id: "7", product: "Acupressure neck pillow", zh: "颈椎按摩枕", niche: "Wellness", stage: "Peaking", velocityPct: 64, intent: 71, wholesaleCny: 9.7, retailAud: 39.95, sources: ["Taobao", "1688"], refreshed: "12h" },
  { id: "8", product: "UV phone sanitizer box", zh: "手机消毒盒", niche: "Tech/Gadgets", stage: "Fading", velocityPct: 22, intent: 41, wholesaleCny: 7.3, retailAud: 24.95, sources: ["1688"], refreshed: "12h" },
  { id: "9", product: "Heatless curls kit", zh: "无热卷发棒", niche: "Hair care", stage: "Fading", velocityPct: 12, intent: 38, wholesaleCny: 4.1, retailAud: 19.95, sources: ["XHS"], refreshed: "1d" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a120e] font-sans text-[#eef2fa]">
      <div className="flex">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r border-white/8 p-5 md:flex">
          <div className="flex items-center gap-2.5 font-semibold tracking-tight">
            <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true"><circle cx="13" cy="13" r="11" stroke="#d8f34e" strokeWidth="2.5"/><circle cx="13" cy="13" r="5.5" stroke="#d8f34e" strokeWidth="2.5"/><circle cx="13" cy="13" r="1.8" fill="#d8f34e"/></svg>
            <span>chinatrendsignal</span>
          </div>
          <nav className="mt-8 flex flex-col gap-1 text-sm">
            {NAV.map((item, i) => (
              <Link key={item.label} href={item.href} className={`rounded-lg px-3 py-2 transition-colors ${i === 0 ? "bg-lime/10 font-medium text-lime" : "text-[#9dbf9f] hover:bg-white/5 hover:text-white"}`}>{item.label}</Link>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#7e947f]">Plan</p>
            <p className="mt-1 text-sm font-semibold">Hunter · A$39/mo</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[62%] rounded-full bg-lime" /></div>
            <p className="mt-1.5 font-mono text-[10px] text-[#7e947f]">31/50 deep-dives used</p>
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Radar</h1>
              <p className="mt-1 text-sm text-[#9dbf9f]">Trends moving on Chinese platforms, ranked by momentum and margin. Refreshed daily.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] text-[#9dbf9f] sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-grn" />Live · 4h ago</span>
              <button className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-[#12220a] transition-colors hover:bg-[#e5fb70]">Export CSV</button>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {KPIS.map((k) => (
              <div key={k.label} className="rounded-xl border border-white/8 bg-white/[.03] px-4 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7e947f]">{k.label}</p>
                <p className="mt-1 font-mono text-[26px] font-bold leading-none">{k.value}</p>
                <p className="mt-1.5 text-[11.5px] text-[#7e947f]">{k.delta}</p>
              </div>
            ))}
          </div>

          {/* filters */}
          <div className="mt-7 flex flex-wrap gap-2">
            {["All niches", "Pet care", "Beauty", "Wellness", "Gadgets", "Home", "Food"].map((f, i) => (
              <button key={f} className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors ${i === 0 ? "border-lime/40 bg-lime/10 text-lime" : "border-white/10 text-[#9dbf9f] hover:border-white/25 hover:text-white"}`}>{f}</button>
            ))}
            <span className="ml-auto hidden font-mono text-[11px] text-[#7e947f] sm:block">{SIGNALS.length} signals</span>
          </div>

          {/* feed */}
          <div className="mt-4">
            <SignalFeed signals={SIGNALS} />
          </div>

          <p className="mt-4 font-mono text-[11px] text-[#7e947f]">Intent = saves-to-likes ratio on Xiaohongshu (bookmark-to-buy). Spread = retail AUD vs 1688 wholesale (CXY→AUD). Real engagement, no estimated revenue.</p>
        </main>
      </div>
    </div>
  );
}
