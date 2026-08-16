import AppNav from "@/components/app-nav";
import AiAnalysisPanel from "@/components/ai-analysis-panel";

const DEFAULT_PRODUCT = {
  id: "pet-brush-001",
  name: "Steam-spray pet brush",
  chineseName: "跨境手柄喷雾梳猫狗电动蒸汽喷雾刷按摩梳",
  category: "Pet care",
  supplier: { wholesaleCny: 2.52, seller: "1688 supplier match", shippingDays: 9 },
  market: { retailAud: 39.95, tiktokShopListings: 12, amazonListings: 18, amazonRankGain: 176 },
  signals: { velocityPct: 214, intentScore: 88, stage: "Rising" as const },
  reviews: [
    { platform: "Xiaohongshu", text: "The brush is easy to clean but the handle feels too smooth when wet." },
    { platform: "Amazon", text: "Works well but I wish the water reservoir held more." },
    { platform: "Douyin", text: "My cat finally sits still, but the release button could be easier to press." },
  ],
  creators: [
    { name: "大圆子", followers: 520000, engagementRate: 5.02, quoteCny: 132800, niche: "Pet lifestyle" },
    { name: "PetLab 小白", followers: 82000, engagementRate: 6.8, quoteCny: 2800, niche: "Cats" },
    { name: "毛孩子日记", followers: 46000, engagementRate: 7.1, quoteCny: 1500, niche: "Dog care" },
  ],
};

export default async function AnalysisPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams;
  const product = q.product
    ? {
        ...DEFAULT_PRODUCT,
        name: String(q.product),
        chineseName: String(q.zh || DEFAULT_PRODUCT.chineseName),
        category: String(q.niche || DEFAULT_PRODUCT.category),
        supplier: { ...DEFAULT_PRODUCT.supplier, wholesaleCny: Number(q.wholesale) || DEFAULT_PRODUCT.supplier.wholesaleCny },
        market: { ...DEFAULT_PRODUCT.market, retailAud: Number(q.retail) || DEFAULT_PRODUCT.market.retailAud },
        signals: { ...DEFAULT_PRODUCT.signals, velocityPct: Number(q.velocity) || DEFAULT_PRODUCT.signals.velocityPct, intentScore: Number(q.intent) || DEFAULT_PRODUCT.signals.intentScore, stage: (q.stage as "Rising" | "Peaking" | "Fading") || DEFAULT_PRODUCT.signals.stage },
      }
    : DEFAULT_PRODUCT;
  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Analysis" />
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Product Decision Workspace</p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
            <p className="mt-1 font-mono text-xs text-mut">{product.chineseName} · {product.category}</p>
          </div>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-4">
          {[
            ["Velocity", `+${product.signals.velocityPct}%`, "week-over-week"],
            ["Intent", `${product.signals.intentScore}/100`, "saves-to-likes"],
            ["Wholesale", `¥${product.supplier.wholesaleCny}`, "1688 matched"],
            ["Saturation", `${product.market.tiktokShopListings} listings`, "TikTok Shop AU/US"],
          ].map(([l,v,d]) => <div key={l} className="rounded-2xl border border-black/10 bg-ivory p-5"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">{l}</p><p className="mt-2 text-2xl font-bold text-ink">{v}</p><p className="mt-1 text-xs text-mut">{d}</p></div>)}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <AiAnalysisPanel context={product} />
          <section className="rounded-2xl border border-black/10 bg-ivory p-5">
            <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">Supplier match</p>
            <h2 className="mt-1 text-lg font-semibold text-ink">Find the exact factory for a viral product</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">Enter the product keyword from a Douyin/XHS post. We search Taobao and 1688 supplier listings, then calculate the live margin. Image-based reverse search activates when JustOne enables an image endpoint on this account.</p>
            <form action="/api/supplier-match" method="post" className="mt-4 flex gap-2"><input name="keyword" aria-label="Product keyword" placeholder="pet brush" className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-[#9ca3af]" /><button className="rounded-xl bg-grn px-4 py-2.5 text-sm font-semibold text-white">Match · 3 cr</button></form>
            <div className="mt-5 rounded-xl bg-[#f4f1ea] p-4"><p className="font-mono text-[10px] uppercase tracking-[.1em] text-mut">Live match preview</p><p className="mt-2 text-sm font-medium text-ink">Steam-spray pet brush</p><p className="mt-1 text-sm text-mut">¥2.52 wholesale → A$39.95 suggested retail → 74.4× gross spread</p></div>
          </section>
        </div>
      </main>
    </div>
  );
}
