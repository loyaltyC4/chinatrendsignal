"use client";
import { useState } from "react";

// One-click "find the factory" on a radar row. Uses the enabled Taobao + 1688 keyword
// search endpoints; image reverse-search can be layered on when JustOne enables it.
export default function SupplierMatchButton({ keyword }: { keyword: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error" | "setup">("idle");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<{ bestPrice?: string; supplierCount?: number } | null>(null);

  async function run() {
    setState("loading"); setNote(""); setResult(null);
    const r = await fetch("/api/supplier-match", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ keyword }) });
    const d = await r.json();
    if (d.setupRequired) { setState("setup"); setNote(d.instructions); return; }
    if (!r.ok) { setState("error"); setNote(d.error || "Match failed"); return; }
    // Normalize a quick preview from whichever source returned
    const items = d.data?.wholesale1688?.OFFER?.result || d.data?.taobao?.items || [];
    setResult({ supplierCount: Array.isArray(items) ? items.length : undefined, bestPrice: d.data?.wholesale1688?.bestPrice });
    setState("done");
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button onClick={(e) => { e.preventDefault(); run(); }} disabled={state === "loading"}
        className="rounded-md border border-grn/30 bg-grn/10 px-2 py-0.5 font-mono text-[9.5px] font-bold text-grn transition-colors hover:bg-grn/20 disabled:opacity-50">
        {state === "loading" ? "…" : "Find factory"}
      </button>
      {state === "done" && result?.supplierCount !== undefined && <span className="font-mono text-[9.5px] text-grn">{result.supplierCount} suppliers</span>}
      {state === "error" && <span className="font-mono text-[9.5px] text-red-600">{note}</span>}
    </span>
  );
}
