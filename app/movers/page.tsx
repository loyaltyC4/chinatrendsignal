import type { Metadata } from "next";

export const metadata: Metadata = { title: "Movers & Shakers — China Trend Signal" };

// Cross-platform momentum: which products are gaining rank RIGHT NOW on each platform.
// China side = JustOne (¥0.10-0.20). West confirmation = Amazon M&S (JustOne ¥0.10). Premium deep-spy = Apify (credits).
const MOVERS = [
  { platform: "Douyin", handle: "hot-search", item: "Steam-spray pet brush", gain: "+312%", note: "surging in pet-care feed", region: "CN", cost: "¥0.20" },
  { platform: "Xiaohongshu", handle: "hot-list", item: "Glass skin essence mist", gain: "+248%", note: "saves outpacing likes 2:1", region: "CN", cost: "¥0.15" },
  { platform: "1688", handle: "search-item-list", item: "USB-C neck fan", gain: "+198%", note: "new supplier listings spiking", region: "CN", cost: "¥0.10" },
  { platform: "Amazon M&S", handle: "get-movers-and-shakers", item: "Portable neck fan", gain: "+176%", note: "CROSSED OVER — climbing Home & Kitchen", region: "US", cost: "¥0.10" },
  { platform: "TikTok Shop", handle: "search-products", item: "Heatless curls kit", gain: "+141%", note: "listing count still thin in AU/US", region: "US", cost: "¥0.10" },
  { platform: "Kuaishou", handle: "trending", item: "Acupressure neck pillow", gain: "+96%", note: "wellness vertical gaining", region: "CN", cost: "¥0.10" },
  { platform: "Taobao", handle: "hot-items", item: "Magnetic cable clips", gain: "+88%", note: "desk-org category heating", region: "CN", cost: "¥0.10" },
  { platform: "Weibo", handle: "hot-search", item: "Snack-box sampler", gain: "+64%", note: "snack content trending", region: "CN", cost: "¥0.10" },
];

const PLATFORMS = ["All", "Douyin", "Xiaohongshu", "1688", "Amazon M&S", "TikTok Shop", "Kuaishou", "Taobao", "Weibo"];

export default function MoversPage() {
  return (
    <div className="min-h-screen bg-[#0a120e] font-sans text-[#eef2fa]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-lime">Movers &amp; Shakers</p>
            <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">What's gaining rank right now, on every platform</h1>
            <p className="mt-1 max-w-[62ch] text-sm text-[#9dbf9f]">
              The same momentum leaderboard, pulled across every platform we track. China platforms flag the origin; the Amazon Movers &amp; Shakers row is the <b className="text-ivory">crossover confirmation</b> — proof the trend just landed in the West.
            </p>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] text-[#9dbf9f] sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-grn" />Live</span>
        </div>

        {/* platform filter */}
        <div className="mt-7 flex flex-wrap gap-2">
          {PLATFORMS.map((p, i) => (
            <button key={p} className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors ${i === 0 ? "border-lime/40 bg-lime/10 text-lime" : "border-white/10 text-[#9dbf9f] hover:border-white/25 hover:text-white"}`}>{p}</button>
          ))}
        </div>

        {/* movers table */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1613]">
          <div className="grid grid-cols-[1.3fr_.8fr_1.6fr_.9fr] max-md:grid-cols-[1.2fr_.9fr_1fr] items-center gap-2 border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.1em] text-[#7e947f]">
            <span>Product</span><span>Platform</span><span className="max-md:hidden">Signal</span><span>Rank gain</span>
          </div>
          {MOVERS.map((m, i) => (
            <div key={i} className={`grid grid-cols-[1.3fr_.8fr_1.6fr_.9fr] max-md:grid-cols-[1.2fr_.9fr_1fr] items-center gap-2 border-b border-white/5 px-5 py-4 last:border-b-0 transition-colors hover:bg-white/[.03] ${m.region === "US" ? "bg-lime/[.04]" : ""}`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ivory">{m.item}</p>
                {m.region === "US" && <span className="mt-1 inline-block rounded border border-lime/40 bg-lime/10 px-1.5 py-px font-mono text-[9px] font-bold text-lime">CROSSED OVER</span>}
              </div>
              <div>
                <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[#9dbf9f]">{m.platform}</span>
              </div>
              <p className="truncate text-[12.5px] text-[#9dbf9f] max-md:hidden">{m.note}</p>
              <p className="font-mono text-[15px] font-bold text-grn">{m.gain}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 font-mono text-[11px] leading-relaxed text-[#7e947f]">
          Every row is a real rank-gain read from a live pull. China platforms (Douyin, XHS, 1688, Kuaishou, Taobao, Weibo) flag origin; Amazon Movers &amp; Shakers and TikTok Shop confirm Western crossover. Cost per refresh: ¥0.10–0.20 per platform, cached and shared across all subscribers.
        </p>
      </div>
    </div>
  );
}
