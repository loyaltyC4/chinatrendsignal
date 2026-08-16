"use client";

import { useState } from "react";

/**
 * One-click "find the factory" on a radar row.
 *
 * Two fixes over the previous version:
 *  - It read `data.wholesale1688.OFFER.result`, which is the EMPTY array 1688
 *    returns alongside the real rows. The verified path is `.OFFER.items`.
 *  - It had no handling for 401 (signed out) or 402 (out of credits), so both
 *    surfaced as a bare "Match failed".
 */
export default function SupplierMatchButton({ keyword }: { keyword: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [note, setNote] = useState("");
  const [count, setCount] = useState<number | null>(null);

  async function run() {
    setState("loading");
    setNote("");
    setCount(null);
    try {
      const r = await fetch("/api/supplier-match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword }),
      });
      const d = await r.json();

      if (r.status === 401) { setState("error"); setNote("sign in"); return; }
      if (r.status === 402) { setState("error"); setNote(`needs ${d.required} cr`); return; }
      if (r.status === 429) { setState("error"); setNote("rate limited"); return; }
      if (d.setupRequired) { setState("error"); setNote("not connected"); return; }
      if (!r.ok) { setState("error"); setNote(d.error?.slice(0, 28) || "failed"); return; }

      const offers = d.data?.wholesale1688?.data?.OFFER?.items ?? d.data?.taobao?.items ?? [];
      setCount(Array.isArray(offers) ? offers.length : 0);
      setState("done");
    } catch {
      setState("error");
      setNote("network error");
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          run();
        }}
        disabled={state === "loading"}
        className="rounded-chip border border-line px-1.5 py-px font-mono text-[9.5px] text-mut transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {state === "loading" ? "checking…" : "find factory"}
      </button>
      {state === "done" && count !== null && (
        <span data-numeric className="font-mono text-[9.5px] text-pos">{count} offers</span>
      )}
      {state === "error" && <span className="font-mono text-[9.5px] text-neg">{note}</span>}
    </span>
  );
}
