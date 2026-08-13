"use client";
import { useState } from "react";
import type { AnalysisKind, EnrichmentResult, ProductContext } from "@/lib/analysis-types";

const actions: Array<{ kind: AnalysisKind; label: string; description: string; credits: number }> = [
  { kind: "signal_explanation", label: "Explain signal", description: "Hook, buyer, risk", credits: 2 },
  { kind: "niche_scorecard", label: "Score opportunity", description: "Demand, margin, saturation", credits: 3 },
  { kind: "complaint_miner", label: "Mine complaints", description: "Turn reviews into an angle", credits: 5 },
  { kind: "listing_copy", label: "Write listing", description: "Benefits, tags, copy", credits: 5 },
  { kind: "creator_match", label: "Match creators", description: "Rate-card fit + outreach", credits: 4 },
];

export default function AiAnalysisPanel({ context }: { context: ProductContext }) {
  const [kind, setKind] = useState<AnalysisKind>("signal_explanation");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "setup" | "done">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<EnrichmentResult | null>(null);

  async function run(next: AnalysisKind) {
    setKind(next); setStatus("loading"); setMessage(""); setResult(null);
    const response = await fetch("/api/enrich", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: next, context }) });
    const data = await response.json();
    if (data.setupRequired) { setStatus("setup"); setMessage(data.instructions); return; }
    if (!response.ok) { setStatus("error"); setMessage(data.error || "Analysis failed"); return; }
    setResult(data.result); setStatus("done");
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-ivory p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">AI Decision Engine</p><h2 className="mt-1 text-lg font-semibold text-ink">Turn this signal into a decision</h2></div>
        <span className="rounded-full border border-grn/20 bg-grn/10 px-2.5 py-1 font-mono text-[10px] text-grn">Credit-metered</span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {actions.map((a) => <button key={a.kind} onClick={() => run(a.kind)} disabled={status === "loading"} className={`rounded-xl border p-3 text-left transition-colors ${kind === a.kind ? "border-grn/40 bg-grn/5" : "border-black/10 hover:border-black/25"}`}>
          <span className="block text-sm font-medium text-ink">{a.label}</span><span className="mt-0.5 block text-xs text-mut">{a.description}</span><span className="mt-2 block font-mono text-[10px] text-grn">{a.credits} credits</span>
        </button>)}
      </div>
      {status === "loading" && <p className="mt-5 text-sm text-mut">Reading the signal, supplier data and review context…</p>}
      {status === "setup" && <div className="mt-5 rounded-xl border border-[#1d4ed8]/20 bg-[#1d4ed8]/5 p-4 text-sm text-[#334155]"><b>Engine ready, provider not connected.</b><br />{message}</div>}
      {status === "error" && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}</div>}
      {result && <div className="mt-5 rounded-xl border border-black/10 bg-[#f4f1ea] p-4"><div className="flex justify-between gap-3"><h3 className="font-semibold text-ink">{result.title}</h3>{result.verdict && <span className="font-mono text-xs text-grn">{result.verdict}</span>}</div><p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{result.executiveSummary}</p>{result.actions.length > 0 && <ul className="mt-3 space-y-1 text-sm text-[#374151]">{result.actions.map((a) => <li key={a}>• {a}</li>)}</ul>}</div>}
    </section>
  );
}
