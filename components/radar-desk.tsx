"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RadarRow } from "@/lib/signals";
import { platformStyle } from "@/lib/platform-style";

/**
 * Radar desk — the Direction A command surface.
 *
 * Denser than the marketing radar row: adds the two numbers a seller actually
 * decides on, Etsy saturation and estimated net margin, alongside the radar's own
 * velocity + first-seen. Everything else (provenance badges, tabular figures,
 * honesty about estimates, hairline-not-card structure) is lifted from the
 * existing system so this reads as the same product, one register deeper.
 *
 * Honesty note: `estNetAud` is derived from the measured wholesale price and is
 * labelled est. `saturation` is null until a real marketplace-competition feed
 * exists — we render a dash, not an invented count.
 */

export type DeskRow = RadarRow & {
  /** Derived suggested list price, AUD. null when no wholesale price. */
  listAud: number | null;
  /** Derived est. net per unit after landed cost + fee drag. null unpriced. */
  estNetAud: number | null;
  /** Etsy competition count. null = not measured; never fabricated. */
  saturation: number | null;
};

const STAGE_DOT: Record<string, string> = {
  Rising: "var(--c-pos)",
  Peaking: "var(--c-warn)",
  Fading: "var(--c-faint)",
};

function SatPill({ n }: { n: number | null }) {
  if (n == null) {
    return (
      <span className="font-mono text-[11px] text-faint" title="No marketplace-competition feed yet">
        —
      </span>
    );
  }
  const tone =
    n < 40 ? { fg: "var(--c-pos)", bg: "var(--c-pos-weak)", label: "open" }
    : n < 200 ? { fg: "var(--c-warn)", bg: "var(--c-warn-weak)", label: "building" }
    : { fg: "var(--c-neg)", bg: "var(--c-neg-weak)", label: "crowded" };
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span data-numeric className="font-mono text-[12.5px] font-medium text-ink">{n}</span>
      <span className="rounded-chip px-1.5 py-px font-mono text-[9.5px]" style={{ background: tone.bg, color: tone.fg }}>
        {tone.label}
      </span>
    </span>
  );
}

function Row({ r, queued, onQueue }: { r: DeskRow; queued: boolean; onQueue: (r: DeskRow) => void }) {
  const dot = STAGE_DOT[r.stage] ?? STAGE_DOT.Rising;
  return (
    <li className="border-b border-line last:border-b-0">
      <div className="grid grid-cols-[minmax(0,2.2fr)_.9fr_.7fr_.8fr_.95fr_.8fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface2 max-lg:grid-cols-[minmax(0,2fr)_.9fr_.8fr] sm:px-5">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <Link href={`/studio?id=${encodeURIComponent(r.id)}`} className="truncate text-[13.5px] font-medium tracking-[-.01em] text-ink hover:underline">
              {r.product}
            </Link>
            {r.zh && <span className="shrink-0 font-mono text-[10.5px] text-faint">{r.zh}</span>}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {r.sources.slice(0, 2).map((src) => {
              const p = platformStyle(src);
              return (
                <span key={src} className="rounded-chip px-1.5 py-px font-mono text-[9.5px]" style={{ background: p.bg, color: p.fg }}>
                  {p.label}
                </span>
              );
            })}
            <span className="truncate text-[11px] text-mut">{r.niche}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
          <span className="text-[12px]" style={{ color: dot }}>{r.stage}</span>
        </div>

        <div className="text-right">
          <span data-numeric className="font-mono text-[12.5px] font-medium text-ink">
            {r.velocityPct > 0 ? "+" : ""}{r.velocityPct}%
          </span>
        </div>

        <div className="text-right max-lg:hidden"><SatPill n={r.saturation} /></div>

        <div className="text-right max-lg:hidden">
          {r.estNetAud != null ? (
            <>
              <span data-numeric className="font-mono text-[12.5px] font-medium text-ink">A${r.estNetAud.toFixed(2)}</span>
              <span className="ml-1 font-mono text-[9.5px] text-faint">est.</span>
            </>
          ) : (
            <span className="font-mono text-[11px] text-faint">—</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <span data-numeric className="font-mono text-[11px] text-faint max-sm:hidden">
            {r.firstSeenDays == null ? "—" : r.firstSeenDays === 0 ? "today" : `${r.firstSeenDays}d`}
          </span>
          <button
            onClick={() => onQueue(r)}
            disabled={!r.estNetAud}
            title={r.estNetAud ? "Open in the listing studio" : "No factory price yet, so there is nothing to list honestly"}
            className={`rounded-ctl px-2.5 py-1.5 font-mono text-[10.5px] font-medium transition-all ${
              queued
                ? "bg-posweak text-pos"
                : r.estNetAud
                  ? "bg-accentweak text-accentstrong hover:bg-accentstrong hover:text-onaccent"
                  : "cursor-not-allowed bg-surface2 text-faint"
            }`}
          >
            {queued ? "Queued" : "List"}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function RadarDesk({
  rows,
  initialQueued = [],
}: {
  rows: DeskRow[];
  initialQueued?: string[];
}) {
  const [stage, setStage] = useState<"All" | "Rising" | "Peaking" | "Fading">("All");
  const [queued, setQueued] = useState<Set<string>>(new Set(initialQueued));

  const visible = useMemo(() => (stage === "All" ? rows : rows.filter((r) => r.stage === stage)), [rows, stage]);

  function queue(r: DeskRow) {
    setQueued((s) => new Set(s).add(r.id));
    if (typeof window !== "undefined") window.location.href = `/studio?id=${encodeURIComponent(r.id)}`;
  }

  const stages: Array<typeof stage> = ["All", "Rising", "Peaking", "Fading"];

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface2 px-4 py-2.5 sm:px-5">
        <span className="label text-mut">Trend feed</span>
        <span className="font-mono text-[10.5px] text-faint">ranked by velocity · first-seen dated</span>
        <div className="ml-auto flex gap-1">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-ctl px-2.5 py-1 font-mono text-[10.5px] transition-colors ${
                stage === s ? "bg-ink text-onaccent" : "text-mut hover:bg-surface hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,2.2fr)_.9fr_.7fr_.8fr_.95fr_.8fr] items-center gap-3 border-b border-line px-4 py-2.5 max-lg:hidden sm:px-5">
        <span className="label text-mut">Signal</span>
        <span className="label text-mut">Stage</span>
        <span className="label text-right text-mut">Velocity</span>
        <span className="label text-right text-mut">Etsy sat.</span>
        <span className="label text-right text-mut">Est. net</span>
        <span className="label text-right text-mut">First seen</span>
      </div>

      {visible.length ? (
        <ul>
          {visible.map((r) => (
            <Row key={r.id} r={r} queued={queued.has(r.id)} onQueue={queue} />
          ))}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center font-mono text-[12px] text-faint">No {stage.toLowerCase()} signals in view.</p>
      )}

      <p className="border-t border-line bg-surface2 px-5 py-3 text-[11px] leading-relaxed text-mut">
        <span className="font-mono">Est. net</span> is derived from the measured 1688 price and a stated fee
        drag, marked <span className="font-mono">est.</span> <span className="font-mono">Etsy sat.</span> is a
        dash until a real marketplace-competition feed exists — we do not invent that count.
      </p>
    </div>
  );
}
