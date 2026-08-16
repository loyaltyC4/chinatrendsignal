"use client";
import { useState } from "react";

export default function ReportForm({ niches, source }: { niches: string[]; source: "live" | "seed" }) {
  const [niche, setNiche] = useState(niches[0] ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "setup" | "error">("idle");
  const [report, setReport] = useState("");
  const [note, setNote] = useState("");

  async function generate() {
    if (!niche) return;
    setStatus("loading");
    setReport("");
    setNote("");
    try {
      // Only the niche is sent. Signal rows are read server-side so a caller cannot
      // supply their own data and have it presented as ours.
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const data = await response.json();
      if (data.setupRequired) { setStatus("setup"); setNote(data.instructions); return; }
      if (response.status === 401) { setStatus("error"); setNote("Your session expired. Sign in again to generate a report."); return; }
      if (response.status === 402) { setStatus("error"); setNote(`Not enough credits — this report costs ${data.required}, you have ${data.balance}.`); return; }
      if (!response.ok) { setStatus("error"); setNote(data.error || "Report failed"); return; }
      setReport(data.report);
      setStatus("done");
    } catch {
      setStatus("error");
      setNote("Could not reach the server. Try again.");
    }
  }

  if (!niches.length) {
    return (
      <div className="mt-7 rounded-2xl border border-black/10 bg-ivory p-6 text-sm text-mut">
        No niches to report on yet. The radar needs at least one pull before a brief can be written.
      </div>
    );
  }

  return (
    <div className="mt-7 rounded-2xl border border-black/10 bg-ivory p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">Choose a niche</p>
        {source === "seed" && (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-[10px] text-amber-800">
            sample data
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {niches.map((n) => (
          <button
            key={n}
            onClick={() => setNiche(n)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors ${niche === n ? "border-grn/40 bg-grn/10 text-grn" : "border-black/10 text-mut hover:border-black/25 hover:text-ink"}`}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={generate}
        disabled={status === "loading"}
        className="mt-5 w-full rounded-xl bg-grn py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50"
      >
        {status === "loading" ? "Writing your brief…" : `Generate ${niche} report · 10 cr`}
      </button>
      {status === "setup" && (
        <div className="mt-4 rounded-xl border border-[#1d4ed8]/20 bg-[#1d4ed8]/5 p-4 text-sm text-[#334155]">
          <b>Engine ready, provider not connected.</b><br />{note}
        </div>
      )}
      {status === "error" && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{note}</div>
      )}
      {report && (
        <div className="mt-5 whitespace-pre-wrap rounded-xl bg-[#f4f1ea] p-5 text-sm leading-relaxed text-[#374151]">{report}</div>
      )}
    </div>
  );
}
