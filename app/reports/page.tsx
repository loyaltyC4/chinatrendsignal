import type { Metadata } from "next";
import ReportForm from "./report-form";
import { Shell, PageHead, SourceBadge } from "@/components/page-shell";
import { getRadar } from "@/lib/signals";

/** Relative age of the last completed pull. Shared shape with the radar so the two
 *  pages never describe the same freshness differently. */
function ago(iso: string | null) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const metadata: Metadata = { title: "Weekly report" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  // Niches come from what is actually in the cache, so a button can never offer a
  // niche the report route would 404 on.
  const { rows, source, lastIngestAt } = await getRadar(200);
  const niches = Array.from(new Set(rows.map((r) => r.niche).filter(Boolean))).sort();

  return (
    <Shell active="Reports">
      <PageHead
        title="Weekly report"
        sub="What moved in a niche, why, and what to validate next. Written from the signals we recorded, with their first-seen dates."
        aside={<SourceBadge live={source === "live"} when={ago(lastIngestAt)} />}
      />
      <div className="mt-7 max-w-[46rem]">
        <ReportForm niches={niches} source={source} />
        <p className="mt-3 font-mono text-[11px] text-mut">10 credits per report</p>
      </div>
    </Shell>
  );
}
