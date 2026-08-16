"use client";
// Dashboard — signal feed. Data-product register: dense, terminal-clean, single accent.
import React from "react";
import Link from "next/link";
import SupplierMatchButton from "@/components/supplier-match-button";

export type Signal = {
  id: string;
  product: string;
  zh: string;
  niche: string;
  stage: "Rising" | "Peaking" | "Fading";
  velocityPct: number; // week-over-week growth %
  intent: number;      // 0-100 saves-to-likes intent score
  wholesaleCny: number;
  retailAud: number;
  sources: string[];   // e.g. ["Douyin","XHS","1688"]
  refreshed: string;
  /** Set only on live rows: days since we first recorded this signal. This is the
   *  earlier-signal claim made checkable, so it must never be faked for seed rows. */
  daysTracked?: number | null;
};

export default function SignalFeed({ signals }: { signals: Signal[] }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-[#fbf9f4] overflow-hidden">
      {/* header row */}
      <div className="grid grid-cols-[1.6fr_.7fr_.85fr_.65fr_.8fr_.7fr_.7fr] max-md:grid-cols-[1.4fr_.8fr_.9fr] items-center gap-2 border-b border-black/10 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#8a8f96]">
        <span>Signal</span><span>Stage</span><span>Velocity</span><span>Intent</span><span>Margin</span><span className="max-md:hidden">First seen</span><span className="max-md:hidden">Sources</span>
      </div>
      {signals.map((s) => <SignalRow key={s.id} s={s} />)}
    </div>
  );
}

function Bar({ v, color }: { v: number; color: string }) {
  return (
    <span className="relative block h-1.5 w-full max-w-[90px] overflow-hidden rounded-full bg-white/10">
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, v)}%`, background: color }} />
    </span>
  );
}

function SignalRow({ s }: { s: Signal }) {
  const spread = (s.retailAud / (s.wholesaleCny * 0.213)) || 0; // ~CNY->AUD
  const stageColor = s.stage === "Rising" ? "#22c55e" : s.stage === "Peaking" ? "#f59e0b" : "#8a8f96";
  const href = `/analysis?product=${encodeURIComponent(s.product)}&zh=${encodeURIComponent(s.zh)}&niche=${encodeURIComponent(s.niche)}&stage=${s.stage}&velocity=${s.velocityPct}&intent=${s.intent}&wholesale=${s.wholesaleCny}&retail=${s.retailAud}`;
  return (
    <Link href={href} className="grid w-full grid-cols-[1.6fr_.7fr_.85fr_.65fr_.8fr_.7fr_.7fr] max-md:grid-cols-[1.4fr_.8fr_.9fr] items-center gap-2 border-b border-black/5 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-black/[.03]">
      {/* product */}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[#1a1b20]">{s.product}</span>
        <span className="mt-0.5 flex items-center gap-2 truncate font-mono text-[11px] text-[#8a8f96]"><span className="truncate">{s.zh} · {s.niche}</span><SupplierMatchButton keyword={s.zh || s.product} /></span>
      </span>
      {/* stage */}
      <span className="flex items-center gap-1.5 font-mono text-[11px]" style={{ color: stageColor }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: stageColor }} />{s.stage}
      </span>
      {/* velocity */}
      <span className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-semibold text-[#1a1b20]">+{s.velocityPct}%</span>
        <Bar v={s.velocityPct} color="#22c55e" />
      </span>
      {/* intent */}
      <span className="max-md:hidden flex items-center gap-2">
        <span className="font-mono text-[13px] font-semibold text-[#1a1b20]">{s.intent}</span>
        <Bar v={s.intent} color="#1d4ed8" />
      </span>
      {/* margin */}
      <span className="font-mono text-[13px] font-semibold text-[#1a1b20]">{spread.toFixed(1)}×</span>
      {/* first seen — the provenance column. Em dash when we genuinely don't know. */}
      <span className="max-md:hidden font-mono text-[11.5px] text-[#6b6f78]">
        {s.daysTracked == null ? "—" : s.daysTracked === 0 ? "today" : `${s.daysTracked}d ago`}
      </span>
      {/* sources */}
      <span className="max-md:hidden flex gap-1">
        {s.sources.map((src) => (
          <span key={src} className="rounded border border-black/10 bg-black/5 px-1.5 py-0.5 font-mono text-[9.5px] text-[#6b6f78]">{src}</span>
        ))}
      </span>
    </Link>
  );
}
