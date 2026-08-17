import type { Metadata } from "next";
import Link from "next/link";
import AiAnalysisPanel from "@/components/ai-analysis-panel";
import SupplierSearch from "@/components/supplier-search";
import WatchButton from "@/components/watch-button";
import { Shell, PageHead, Stat } from "@/components/page-shell";
import { getSignal } from "@/lib/signals";
import { getWatchedIds } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth";
import { platformStyle } from "@/lib/platform-style";
import type { ProductContext } from "@/lib/analysis-types";

export const metadata: Metadata = { title: "Analysis" };
export const dynamic = "force-dynamic";

/*
 * This page now loads the signal from the database by id.
 *
 * It previously built its context by spreading query-string values over a hardcoded
 * sample product, which meant a REAL product was analysed with the SAMPLE product's
 * market figures — the model duly reported an Amazon rank movement for a product we
 * hold no Amazon data on. The interface showed dashes while the analysis showed
 * invented evidence, which is the exact failure this product sells against.
 */

/** The worked example, shown only when no signal is selected, and flagged as sample
 *  everywhere it travels — including into the model's fact sheet. */
const SAMPLE: ProductContext = {
  id: "sample-001",
  name: "Steam-spray pet brush",
  chineseName: "喷雾梳",
  category: "Pet care",
  sample: true,
  sources: ["Xiaohongshu"],
  supplier: { wholesaleCny: 2.52 },
  market: { retailAud: 6.44 },
  signals: { velocityPct: 214, intentScore: 88, stage: "Rising" },
  engagement: { likes: 41200, saves: 36300, savesPerLike: 0.88 },
  daysTracked: 26,
  reviews: [],
  creators: [],
};

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const id = typeof q.id === "string" ? q.id : null;

  const { user } = await requireUser();
  const row = id ? await getSignal(id) : null;
  const watched = user ? await getWatchedIds(user.id) : [];

  // Legacy links carried the product name in the query string. Honour them so an old
  // bookmark still opens something useful, but carry only what was actually passed —
  // never sample figures dressed up as measurements.
  const legacyName = typeof q.product === "string" ? q.product : null;

  const context: ProductContext = row
    ? {
        id: row.id,
        name: row.product,
        chineseName: row.zh || undefined,
        category: row.niche,
        sources: row.sources,
        firstDetectedAt: row.firstDetectedAt,
        daysTracked: row.daysTracked,
        signals: {
          velocityPct: row.velocityPct || undefined,
          intentScore: row.intent || undefined,
          stage: row.stage,
        },
        engagement: {
          likes: (row as any).likes || undefined,
          saves: (row as any).saves || undefined,
          comments: (row as any).comments || undefined,
          savesPerLike: row.savesRatio,
        },
        supplier: { wholesaleCny: row.wholesaleCny || undefined },
        market: { retailAud: row.retailAud || undefined },
      }
    : legacyName
      ? {
          name: legacyName,
          chineseName: typeof q.zh === "string" ? q.zh : undefined,
          category: typeof q.niche === "string" ? q.niche : "Unclassified",
        }
      : SAMPLE;

  const wholesale = context.supplier?.wholesaleCny ?? 0;
  const retail = context.market?.retailAud ?? 0;
  const spread = wholesale > 0 && retail > 0 ? retail / (wholesale * 0.213) : null;
  const platform = platformStyle(context.sources?.[0] ?? "");

  const sub = row
    ? "Loaded from your index. Every figure below is one we recorded against this signal."
    : legacyName
      ? "Opened from an older link, so only the product name came through. Open it from the radar to load the recorded figures."
      : "No signal selected, so this is a worked example. Open a row from the radar to analyse a real signal.";

  return (
    <Shell active="Analysis">
      <PageHead
        title={context.name}
        sub={sub}
        aside={
          <div className="flex items-center gap-2">
            {context.chineseName && (
              <span className="rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[12px] text-body">
                {context.chineseName}
              </span>
            )}
            {row && <WatchButton signalId={row.id} initial={watched.includes(row.id)} />}
          </div>
        }
      />

      {!row && (
        <div className="mt-6 max-w-[64rem] rounded-card border border-line bg-warnweak px-4 py-3 text-[13px] leading-relaxed text-warn">
          {legacyName ? (
            <>
              <b className="font-medium">No recorded figures for this view.</b> The analysis will say
              so rather than filling the gaps.{" "}
              <Link href="/radar" className="underline">
                Open it from the radar
              </Link>{" "}
              to load the real numbers.
            </>
          ) : (
            <>
              <b className="font-medium">This is the worked example, not a real signal.</b> Anything
              the analyst writes here is labelled as sample data.
            </>
          )}
        </div>
      )}

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat
          label="Velocity"
          value={context.signals?.velocityPct ? `+${context.signals.velocityPct}%` : "-"}
          note="week on week"
          hue={platform.fg}
        />
        <Stat
          label="Intent"
          value={context.signals?.intentScore ? String(context.signals.intentScore) : "-"}
          note={context.engagement?.savesPerLike ? `${context.engagement.savesPerLike.toFixed(2)} saves per like` : "saves to likes"}
          hue="var(--c-douyin)"
        />
        <Stat
          label="Wholesale"
          value={wholesale ? `¥${wholesale}` : "-"}
          note={wholesale ? "median 1688 offer" : "no supplier price yet"}
          hue="var(--c-1688)"
        />
        <Stat
          label="Spread"
          value={spread ? `${spread.toFixed(1)}×` : "-"}
          note={spread ? "inferred, not measured" : "needs a wholesale price"}
          hue="var(--c-taobao)"
        />
      </div>

      {row?.firstDetectedAt && (
        <p className="mt-4 font-mono text-[11.5px] text-mut">
          First recorded {new Date(row.firstDetectedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
          {row.daysTracked != null && ` · tracked ${row.daysTracked}d`}
          {row.sourceUrl && (
            <>
              {" · "}
              <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                view the original post
              </a>
            </>
          )}
        </p>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <AiAnalysisPanel context={context} />
        <SupplierSearch initialKeyword={context.chineseName || context.name} />
      </div>
    </Shell>
  );
}
