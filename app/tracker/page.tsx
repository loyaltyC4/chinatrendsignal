"use client";

import { useState } from "react";
import { Shell, PageHead, Stat } from "@/components/page-shell";

type Test = {
  id: number;
  product: string;
  niche: string;
  spentAud: number;
  result: "Pending" | "Testing" | "Winner" | "Killed";
  roi?: number;
  note?: string;
};

const RESULT_STYLE: Record<Test["result"], { bg: string; fg: string }> = {
  Winner: { bg: "var(--c-pos-weak)", fg: "var(--c-pos)" },
  Killed: { bg: "var(--c-neg-weak)", fg: "var(--c-neg)" },
  Testing: { bg: "var(--c-warn-weak)", fg: "var(--c-warn)" },
  Pending: { bg: "var(--c-surface-2)", fg: "var(--c-muted)" },
};

export default function TrackerPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [product, setProduct] = useState("");
  const [niche, setNiche] = useState("");

  function add() {
    if (!product.trim()) return;
    setTests([
      { id: Date.now(), product: product.trim(), niche: niche.trim() || "Unclassified", spentAud: 0, result: "Pending" },
      ...tests,
    ]);
    setProduct("");
    setNiche("");
  }

  const winners = tests.filter((t) => t.result === "Winner").length;
  const spent = tests.reduce((s, t) => s + t.spentAud, 0);

  return (
    <Shell active="Tracker">
      <PageHead
        title="Outcome tracker"
        sub="Log what you tested and what came back. This is the record that shows whether our calls were right, including when they were not."
      />

      <div className="mt-7 grid max-w-[46rem] grid-cols-3 gap-x-4">
        <Stat label="Tests logged" value={String(tests.length)} />
        <Stat label="Winners" value={String(winners)} />
        <Stat label="Spend tracked" value={`A$${spent}`} />
      </div>

      <div className="mt-8 max-w-[46rem] rounded-card border border-line bg-surface p-5">
        <span className="label text-mut">Log a test</span>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Product name"
            aria-label="Product name"
            className="min-w-0 flex-1 rounded-ctl border border-line bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Niche"
            aria-label="Niche"
            className="w-36 rounded-ctl border border-line bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
          <button
            onClick={add}
            className="shrink-0 rounded-ctl bg-accentstrong px-3.5 py-2 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mt-6 max-w-[46rem] overflow-hidden rounded-card border border-line bg-surface">
        <div className="grid grid-cols-[1.8fr_.8fr_.6fr_.5fr] items-center gap-3 border-b border-line bg-surface2 px-4 py-2.5 sm:px-5">
          <span className="label text-mut">Product</span>
          <span className="label text-mut">Result</span>
          <span className="label text-right text-mut">Spend</span>
          <span className="label text-right text-mut">ROI</span>
        </div>

        {tests.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[14px] font-medium text-ink">Nothing logged yet</p>
            <p className="mx-auto mt-1.5 max-w-[42ch] text-[13px] leading-relaxed text-mut">
              Add the first product you tested above. Entries live in this browser only for
              now. They are not saved to your account yet.
            </p>
          </div>
        ) : (
          tests.map((t) => {
            const style = RESULT_STYLE[t.result];
            return (
              <div
                key={t.id}
                className="grid grid-cols-[1.8fr_.8fr_.6fr_.5fr] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-ink">{t.product}</p>
                  <p className="truncate text-[11.5px] text-mut">{t.niche}</p>
                </div>
                <span
                  className="inline-flex w-fit items-center rounded-chip px-1.5 py-0.5 font-mono text-[10px]"
                  style={{ background: style.bg, color: style.fg }}
                >
                  {t.result}
                </span>
                <span data-numeric className="text-right font-mono text-[12.5px] text-body">A${t.spentAud}</span>
                <span data-numeric className="text-right font-mono text-[12.5px] font-medium text-ink">
                  {t.roi ? `${t.roi}×` : "-"}
                </span>
              </div>
            );
          })
        )}
      </div>

      <p className="mt-3 max-w-[46rem] font-mono text-[11px] text-mut">
        Entries are held in this browser only. Saving them to your account is not built yet.
      </p>
    </Shell>
  );
}
