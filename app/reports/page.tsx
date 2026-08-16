import type { Metadata } from "next";
import AppNav from "@/components/app-nav";
import ReportForm from "./report-form";
import { getRadar } from "@/lib/signals";

export const metadata: Metadata = { title: "Weekly report — China Trend Signal" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  // Niches come from whatever is actually in the cache, so the buttons can never
  // offer a niche the report route would 404 on.
  const { rows, source } = await getRadar(200);
  const niches = Array.from(new Set(rows.map((r) => r.niche).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Reports" />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Weekly report</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Your niche, briefed weekly</h1>
        <p className="mt-2 text-[15px] text-mut">
          What moved in your niche, why, and what to validate next — written from the signals
          we actually recorded, with their first-seen dates.
        </p>

        <ReportForm niches={niches} source={source} />

        <p className="mt-3 font-mono text-[10px] text-mut">
          10 credits per generated report · emailed weekly on Hunter and above
        </p>
      </main>
    </div>
  );
}
