"use client";
import { useState } from "react";
import AppNav from "@/components/app-nav";

type Test = { id: number; product: string; niche: string; spentAud: number; result: "Testing" | "Winner" | "Killed" | "Pending"; roi?: number; note?: string };

const SEED: Test[] = [
  { id: 1, product: "Steam-spray pet brush", niche: "Pet care", spentAud: 120, result: "Winner", roi: 3.4, note: "Grip variant converted; scaled" },
  { id: 2, product: "Neck fan (USB-C)", niche: "Cooling", spentAud: 95, result: "Testing", note: "CPA high, iterating creative" },
  { id: 3, product: "Glass skin mist", niche: "K-Beauty", spentAud: 60, result: "Pending", note: "Awaiting first data" },
];

export default function TrackerPage() {
  const [tests, setTests] = useState<Test[]>(SEED);
  const [product, setProduct] = useState("");
  const [niche, setNiche] = useState("");

  function add() {
    if (!product.trim()) return;
    setTests([{ id: Date.now(), product, niche: niche || "General", spentAud: 0, result: "Pending" }, ...tests]);
    setProduct(""); setNiche("");
  }

  const winners = tests.filter((t) => t.result === "Winner").length;
  const spent = tests.reduce((s, t) => s + t.spentAud, 0);

  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Outcome Tracker" />
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Outcome Tracker</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Did it actually work?</h1>
        <p className="mt-2 max-w-[60ch] text-[15px] text-mut">Log what you tested, what you spent, and what came back. Over time this learns which signals convert for <b>you</b> — so the radar gets sharper the more you use it.</p>

        <div className="mt-7 grid grid-cols-3 gap-3">
          {[["Tests logged", tests.length],["Winners", winners],["Ad spend tracked", `A$${spent}`]].map(([l, v]) => <div key={l} className="rounded-xl border border-black/8 bg-ivory px-4 py-4"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">{l}</p><p className="mt-1 font-mono text-2xl font-bold text-ink">{v}</p></div>)}
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 bg-ivory p-5">
          <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">Log a test</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product name" aria-label="Product name" className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-[#9ca3af]" />
            <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Niche" aria-label="Niche" className="w-40 rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-[#9ca3af]" />
            <button onClick={add} className="rounded-xl bg-grn px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]">Add test</button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-ivory">
          <div className="grid grid-cols-[1.6fr_.8fr_.8fr_.8fr] max-md:grid-cols-[1.4fr_1fr_.8fr] items-center gap-2 border-b border-black/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[.1em] text-mut"><span>Product</span><span>Result</span><span className="max-md:hidden">Spend</span><span>ROI</span></div>
          {tests.map((t) => (
            <div key={t.id} className="grid grid-cols-[1.6fr_.8fr_.8fr_.8fr] max-md:grid-cols-[1.4fr_1fr_.8fr] items-center gap-2 border-b border-black/5 px-5 py-4 last:border-b-0">
              <div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{t.product}</p><p className="truncate text-xs text-mut">{t.niche}{t.note ? ` · ${t.note}` : ""}</p></div>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${t.result === "Winner" ? "bg-grn/10 text-grn" : t.result === "Killed" ? "bg-red-100 text-red-700" : t.result === "Testing" ? "bg-amber-100 text-amber-800" : "bg-black/5 text-mut"}`}>{t.result}</span>
              <span className="font-mono text-sm text-ink max-md:hidden">A${t.spentAud}</span>
              <span className="font-mono text-sm font-semibold text-ink">{t.roi ? `${t.roi}×` : "—"}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10px] text-mut">Your outcomes train the radar's scoring for your account — the more you log, the sharper it gets.</p>
      </main>
    </div>
  );
}
