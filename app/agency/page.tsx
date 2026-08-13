"use client";
import { useState } from "react";
import AppNav from "@/components/app-nav";

const CLIENTS = ["Acme Pets", "Glow Beauty Co", "CoolWave Gadgets"];

export default function AgencyPage() {
  const [client, setClient] = useState(CLIENTS[0]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "setup" | "error">("idle");
  const [report, setReport] = useState("");
  const [note, setNote] = useState("");

  async function generate() {
    setStatus("loading"); setReport(""); setNote("");
    const response = await fetch("/api/reports", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ niche: client, signals: [] }) });
    const data = await response.json();
    if (data.setupRequired) { setStatus("setup"); setNote(data.instructions); return; }
    if (!response.ok) { setStatus("error"); setNote(data.error || "Report failed"); return; }
    setReport(data.report); setStatus("done");
  }

  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Agency" />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Agency Reports</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Client-ready China-entry briefs</h1>
        <p className="mt-2 max-w-[60ch] text-[15px] text-mut">Generate white-label market briefs for clients entering China or sourcing from it. Your branding, your voice, our data.</p>

        <div className="mt-7 rounded-2xl border border-black/10 bg-ivory p-5">
          <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">Client</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CLIENTS.map((c) => <button key={c} onClick={() => setClient(c)} className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-colors ${client === c ? "border-grn/40 bg-grn/10 text-grn" : "border-black/10 text-mut hover:border-black/25 hover:text-ink"}`}>{c}</button>)}
          </div>
          <button onClick={generate} disabled={status === "loading"} className="mt-5 w-full rounded-xl bg-grn py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50">{status === "loading" ? "Writing the brief…" : `Generate ${client} brief · 15 cr`}</button>
          {status === "setup" && <div className="mt-4 rounded-xl border border-[#1d4ed8]/20 bg-[#1d4ed8]/5 p-4 text-sm text-[#334155]"><b>Engine ready, provider not connected.</b><br />{note}</div>}
          {status === "error" && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{note}</div>}
          {report && <div className="mt-5 rounded-xl bg-[#f4f1ea] p-5 text-sm leading-relaxed text-[#374151] whitespace-pre-wrap">{report}</div>}
        </div>
        <p className="mt-3 font-mono text-[10px] text-mut">15 credits per client brief · Agency tier · export as branded PDF</p>
      </main>
    </div>
  );
}
