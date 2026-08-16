import type { Metadata } from "next";
import AiAnalysisPanel from "@/components/ai-analysis-panel";
import SupplierSearch from "@/components/supplier-search";
import { Shell, PageHead, Stat } from "@/components/page-shell";

export const metadata: Metadata = { title: "Analysis" };

const FALLBACK = {
  id: "sample-001",
  name: "Steam-spray pet brush",
  chineseName: "喷雾梳",
  category: "Pet care",
  supplier: { wholesaleCny: 2.52, seller: "1688 supplier match", shippingDays: 9 },
  market: { retailAud: 39.95, tiktokShopListings: 12, amazonListings: 18, amazonRankGain: 176 },
  signals: { velocityPct: 214, intentScore: 88, stage: "Rising" as const },
  reviews: [],
  creators: [],
};

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const fromRow = Boolean(q.product);

  const product = fromRow
    ? {
        ...FALLBACK,
        name: String(q.product),
        chineseName: String(q.zh || ""),
        category: String(q.niche || FALLBACK.category),
        supplier: { ...FALLBACK.supplier, wholesaleCny: Number(q.wholesale) || 0 },
        market: { ...FALLBACK.market, retailAud: Number(q.retail) || 0 },
        signals: {
          velocityPct: Number(q.velocity) || 0,
          intentScore: Number(q.intent) || 0,
          stage: (q.stage as "Rising" | "Peaking" | "Fading") || "Rising",
        },
      }
    : FALLBACK;

  const spread =
    product.supplier.wholesaleCny > 0 && product.market.retailAud > 0
      ? product.market.retailAud / (product.supplier.wholesaleCny * 0.213)
      : null;

  return (
    <Shell active="Analysis">
      <PageHead
        title={product.name}
        sub={
          fromRow
            ? "Opened from a radar row. Figures below are the ones recorded against that signal."
            : "No signal selected, so this is a worked example. Open a row from the radar to analyse a real signal."
        }
        aside={
          product.chineseName ? (
            <span className="rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[12px] text-body">
              {product.chineseName}
            </span>
          ) : null
        }
      />

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat
          label="Velocity"
          value={product.signals.velocityPct ? `+${product.signals.velocityPct}%` : "-"}
          note="week on week"
        />
        <Stat
          label="Intent"
          value={product.signals.intentScore ? String(product.signals.intentScore) : "-"}
          note="saves to likes"
        />
        <Stat
          label="Wholesale"
          value={product.supplier.wholesaleCny ? `¥${product.supplier.wholesaleCny}` : "-"}
          note={product.supplier.wholesaleCny ? "median 1688 offer" : "no supplier price yet"}
        />
        <Stat
          label="Spread"
          value={spread ? `${spread.toFixed(1)}×` : "-"}
          note={spread ? "inferred, not measured" : "needs a wholesale price"}
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <AiAnalysisPanel context={product} />
        <SupplierSearch initialKeyword={product.chineseName || product.name} />
      </div>
    </Shell>
  );
}
