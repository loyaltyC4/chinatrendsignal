"use client";
import { useState } from "react";
import AppNav from "@/components/app-nav";
import { SIGNALS } from "@/lib/radar-data";

const NICHES = ["Pet care", "K-Beauty", "Summer/Cooling", "Desk/Home org", "Wellness", "Food/Snacks"];

export default function ReportsPage() {
  const [niche, setNiche] = useState(NICHES[0]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "setup" | "error">("idle");
  const [report, setReport] = useState("");
  const [note, setNote] = useState("");

  async function generate() {
    setStatus("loading"); setReport(""); setNote("");
    const rows = SIGNALS.filter((s) => niche === "All" || s.niche === niche);
    const response = await fetch("/api/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ niche, signals: rows }) });
    const data = await response.json();
    if (data.setupRequired) { setStatus("setup"); setNote(data.instructions); return; }
    if (!response.ok) { setStatus("error"); setNote(data.error || "Report failed"); return; }
    setReport(data.report); setStatus("done");
  }

  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Reports" />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Weekly Report</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Your niche, briefed weekly</h1>
        <p className="mt-2 text-[15px] text-mut">Auto-generated intelligence on what moved in your niche, why, and what to validate next. Grounded in your tracked signals — never hype.</p>

        <div className="mt-7 rounded-2xl border border-black/10 bg-ivory p-5">
          <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">Choose a niche</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NICHES.map((n) => <button key={n} onClick={() => setNiche(n)} className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors ${niche === n ? "border-grn/40 bg-grn/10 text-grn" : "border-black/10 text-mut hover:border-black/25 hover:text-ink"}`}>{n}</button>)}
          </div>
          <button onClick={generate} disabled={status === "loading"} className="mt-5 w-full rounded-xl bg-grn py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50">{status === "loading" ? "Writing your brief…" : `Generate ${niche} report · 10 cr`}</button>
          {status === "setup" && <div className="mt-4 rounded-xl border border-[#1d4ed8]/20 bg-[#1d4ed8]/5 p-4 text-sm text-[#334155]"><b>Engine ready, provider not connected.</b><br />{note}</div>}
          {status === "error" && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{note}</div>}
          {report && <div className="mt-5 rounded-xl bg-[#f4f1ea] p-5 text-sm leading-relaxed text-[#374151] whitespace-pre-wrap">{report}</div>}
        </div>
        <p className="mt-3 font-mono text-[10px] text-mut">10 credits per generated report · emailed weekly on Hunter and above</p>
      </main>
    </div>
  );
}
