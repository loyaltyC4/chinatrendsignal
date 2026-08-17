"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

/**
 * The outcome log.
 *
 * This is the honesty loop made into a table: it records what a call actually earned,
 * including when it lost money. So the interface has to make entering the real number
 * frictionless — every cell edits in place and saves on blur, no modal, no save button
 * to forget.
 */

export type TestRow = {
  id: string;
  product: string;
  niche: string;
  spendAud: number;
  revenueAud: number;
  result: "pending" | "testing" | "winner" | "killed";
  note: string | null;
  createdAt: string;
};

const RESULT_STYLE: Record<TestRow["result"], { bg: string; fg: string }> = {
  winner: { bg: "var(--c-pos-weak)", fg: "var(--c-pos)" },
  killed: { bg: "var(--c-neg-weak)", fg: "var(--c-neg)" },
  testing: { bg: "var(--c-warn-weak)", fg: "var(--c-warn)" },
  pending: { bg: "var(--c-surface-2)", fg: "var(--c-muted)" },
};

const GRID = "grid grid-cols-[minmax(0,1.7fr)_.75fr_.6fr_.6fr_.5fr_auto] items-center gap-3";

export default function TestLog({ rows, niches }: { rows: TestRow[]; niches: string[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [product, setProduct] = useState("");
  const [niche, setNiche] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function add() {
    if (!product.trim() || busy) return;
    setBusy(true);
    setProblem(null);
    const res = await fetch("/api/tests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ product, niche }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setProblem(data?.error ?? "Could not log that");
      return;
    }
    setProduct("");
    setNiche("");
    refresh();
  }

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch("/api/tests", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) setProblem("That change did not save");
    else refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/tests?id=${id}`, { method: "DELETE" });
    if (!res.ok) setProblem("Could not delete that row");
    else refresh();
  }

  return (
    <>
      <div className="mt-8 max-w-[54rem] rounded-card border border-line bg-surface p-5">
        <span className="label text-mut">Log a test</span>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Product you tested"
            aria-label="Product name"
            className="min-w-0 flex-1 rounded-ctl border border-line bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Niche"
            aria-label="Niche"
            list="tracker-niches"
            className="w-40 rounded-ctl border border-line bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
          <datalist id="tracker-niches">
            {niches.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <button
            onClick={add}
            disabled={busy}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-ctl bg-accentstrong px-3.5 py-2 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-60"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
            Add
          </button>
        </div>
        {problem && <p className="mt-2.5 text-[12px] text-neg">{problem}</p>}
      </div>

      <div className="mt-6 max-w-[54rem] overflow-hidden rounded-card border border-line bg-surface">
        <div className={`${GRID} border-b border-line bg-surface2 px-4 py-2.5 sm:px-5`}>
          <span className="label text-mut">Product</span>
          <span className="label text-mut">Result</span>
          <span className="label text-right text-mut">Spend</span>
          <span className="label text-right text-mut">Return</span>
          <span className="label text-right text-mut">ROI</span>
          <span className="sr-only">Remove</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[14px] font-medium text-ink">Nothing logged yet</p>
            <p className="mx-auto mt-1.5 max-w-[46ch] text-[13px] leading-relaxed text-mut">
              Add the first product you tested. Entries are saved to your account, so the
              record survives and the win rate at the top becomes real.
            </p>
          </div>
        ) : (
          rows.map((t) => {
            const style = RESULT_STYLE[t.result];
            const roi = t.spendAud > 0 ? t.revenueAud / t.spendAud : null;
            return (
              <div key={t.id} className={`${GRID} border-b border-line px-4 py-3 last:border-b-0 sm:px-5`}>
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-ink">{t.product}</p>
                  <p className="truncate text-[11.5px] text-mut">{t.niche}</p>
                </div>

                <select
                  value={t.result}
                  onChange={(e) => patch(t.id, { result: e.target.value })}
                  aria-label={`Result for ${t.product}`}
                  className="w-fit rounded-chip border-0 px-1.5 py-0.5 font-mono text-[10.5px] outline-none"
                  style={{ background: style.bg, color: style.fg }}
                >
                  <option value="pending">pending</option>
                  <option value="testing">testing</option>
                  <option value="winner">winner</option>
                  <option value="killed">killed</option>
                </select>

                <Money value={t.spendAud} onSave={(v) => patch(t.id, { spendAud: v })} label={`Spend on ${t.product}`} />
                <Money value={t.revenueAud} onSave={(v) => patch(t.id, { revenueAud: v })} label={`Return on ${t.product}`} />

                <span
                  data-numeric
                  className="text-right font-mono text-[12.5px] font-medium"
                  style={{ color: roi == null ? "var(--c-faint)" : roi >= 1 ? "var(--c-pos)" : "var(--c-neg)" }}
                >
                  {roi == null ? "-" : `${roi.toFixed(2)}×`}
                </span>

                <button
                  onClick={() => remove(t.id)}
                  aria-label={`Delete ${t.product}`}
                  title="Delete this row"
                  className="text-faint transition-colors hover:text-neg"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

/**
 * Editable currency cell.
 *
 * Debounced rather than blur-only. The first version committed on blur, and a row
 * where you typed a return figure and then changed the result dropdown lost the
 * figure: the dropdown's save refreshed the server component before the blur
 * committed. Saving shortly after typing stops, and re-syncing when the server value
 * changes, means the cell can never disagree with the database.
 */
function Money({ value, onSave, label }: { value: number; onSave: (v: number) => void; label: string }) {
  const [draft, setDraft] = useState(String(value));
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!dirty.current) setDraft(String(value));
  }, [value]);

  function commit(next: string) {
    const n = Number(next);
    if (!Number.isFinite(n) || n === value) return;
    dirty.current = false;
    onSave(n);
  }

  return (
    <span className="flex items-center justify-end gap-0.5 font-mono text-[12.5px] text-body">
      <span className="text-faint">A$</span>
      <input
        value={draft}
        aria-label={label}
        inputMode="decimal"
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d.]/g, "");
          dirty.current = true;
          setDraft(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => commit(next), 600);
        }}
        onBlur={() => {
          if (timer.current) clearTimeout(timer.current);
          commit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            dirty.current = false;
            setDraft(String(value));
          }
        }}
        className="w-[3.6rem] rounded-sm border border-transparent bg-transparent px-1 py-0.5 text-right tabular-nums text-body outline-none transition-colors hover:border-line focus:border-accent focus:bg-canvas"
      />
    </span>
  );
}
