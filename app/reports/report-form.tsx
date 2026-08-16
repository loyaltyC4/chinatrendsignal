"use client";

import { useState } from "react";

export default function ReportForm({ niches, source }: { niches: string[]; source: "live" | "seed" }) {
  const [niche, setNiche] = useState(niches[0] ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
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
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ niche }),
      });
      const d = await r.json();
      if (r.status === 401) { setStatus("error"); setNote("Your session expired. Sign in again to generate a report."); return; }
      if (r.status === 402) { setStatus("error"); setNote(`Not enough credits. This costs ${d.required} and you have ${d.balance}.`); return; }
      if (r.status === 429) { setStatus("error"); setNote("You've hit the report limit. It resets shortly."); return; }
      if (d.setupRequired) { setStatus("error"); setNote(d.instructions || "Reports are not connected yet."); return; }
      if (!r.ok) { setStatus("error"); setNote(d.error || "Report failed."); return; }
      setReport(d.report);
      setStatus("done");
    } catch {
      setStatus("error");
      setNote("Could not reach the server. Try again.");
    }
  }

  if (!niches.length) {
    return (
      <div className="rounded-card border border-line bg-surface px-6 py-12 text-center">
        <p className="text-[14px] font-medium text-ink">Nothing to report on yet</p>
        <p className="mx-auto mt-1.5 max-w-[44ch] text-[13px] leading-relaxed text-mut">
          The radar needs at least one completed pull before a brief can be written.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="label text-mut">Pick a niche</span>
        {source === "seed" && (
          <span className="rounded-chip border border-line bg-warnweak px-1.5 py-px font-mono text-[10px] text-warn">
            sample data
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {niches.map((n) => (
          <button
            key={n}
            onClick={() => setNiche(n)}
            className={`rounded-ctl border px-2.5 py-1.5 font-mono text-[11.5px] transition-colors ${
              niche === n ? "border-accent bg-accentweak text-accent" : "border-line text-mut hover:border-linestrong hover:text-ink"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={status === "loading"}
        className="mt-5 w-full rounded-ctl bg-accentstrong py-2.5 text-[13.5px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-50"
      >
        {status === "loading" ? "Writing the brief…" : `Generate the ${niche} report`}
      </button>

      {status === "loading" && (
        <div className="mt-5 space-y-2" aria-live="polite">
          {[..."12345"].map((k, i) => (
            <div key={k} className="h-3 animate-pulse rounded bg-surface2" style={{ width: `${95 - i * 9}%` }} />
          ))}
        </div>
      )}

      {status === "error" && (
        <p className="mt-4 rounded-ctl border border-line bg-negweak px-3 py-2.5 text-[13px] text-neg">{note}</p>
      )}

      {report && (
        <div className="mt-5 whitespace-pre-wrap rounded-ctl border border-line bg-canvas p-4 text-[13.5px] leading-relaxed text-body">
          {report}
        </div>
      )}
    </div>
  );
}
