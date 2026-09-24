"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { RadarRow } from "@/lib/signals";
import type { Saturation } from "@/lib/saturation";
import { platformStyle } from "@/lib/platform-style";

/**
 * Radar desk — the Direction A command surface.
 *
 * Denser than the marketing radar row: adds the two numbers a seller actually
 * decides on — Etsy saturation (measured, from the cache) and estimated net margin
 * after Etsy's real 15–28% take — alongside the radar's own velocity + first-seen.
 * Provenance badges, tabular figures, honesty about estimates, and the
 * hairline-not-card structure are lifted from the existing system so this reads as
 * the same product one register deeper.
 *
 * Honesty note: saturation is null until the batch scraper has measured that term
 * — rendered as a dash, never fabricated. estNetAud is derived and labelled est.
 */

export type DeskRow = RadarRow & {
  firstSeenDays: number | null;
  saturation: Saturation;
  saturationVerdict: "open" | "building" | "crowded" | null;
  /** Derived est. net per unit after landed cost + full Etsy fee drag. null unpriced. */
  estNetAud: number | null;
  /** Derived margin ratio 0–1. null unpriced. */
  marginPct: number | null;
  /** Derived suggested list price, AUD. null unpriced. */
  listAud: number | null;
};

const STAGE_DOT: Record<string, string> = {
  Rising: "var(--c-pos)",
  Peaking: "var(--c-warn)",
  Fading: "var(--c-faint)",
};

function SatPill({ r }: { r: DeskRow }) {
  if (r.saturation.count == null) {
    return (
      <span className="font-mono text-[11px] text-faint" title="Not measured yet — the batch scraper hasn't covered this term">
        —
      </span>
    );
  }
  const v = r.saturationVerdict;
  const tone =
    v === "open" ? { fg: "var(--c-pos)", bg: "var(--c-pos-weak)" }
    : v === "building" ? { fg: "var(--c-warn)", bg: "var(--c-warn-weak)" }
    : { fg: "var(--c-neg)", bg: "var(--c-neg-weak)" };
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span data-numeric className="font-mono text-[12.5px] font-medium text-ink">{r.saturation.count.toLocaleString()}</span>
      {v && (
        <span className="rounded-chip px-1.5 py-px font-mono text-[9.5px]" style={{ background: tone.bg, color: tone.fg }}>
          {v}
        </span>
      )}
    </span>
  );
}

function Row({ r }: { r: DeskRow }) {
  const dot = STAGE_DOT[r.stage] ?? STAGE_DOT.Rising;
  const viable = r.marginPct != null && r.marginPct >= 0.3;
  return (
    <li className="border-b border-line last:border-b-0">
      <div className="grid grid-cols-[minmax(0,2.2fr)_.9fr_.7fr_.95fr_.95fr_.7fr] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface2 max-lg:grid-cols-[minmax(0,2fr)_.9fr_.8fr] sm:px-5">
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

        <div className="text-right max-lg:hidden"><SatPill r={r} /></div>

        <div className="text-right max-lg:hidden">
          {r.estNetAud != null ? (
            <>
              <span data-numeric className="font-mono text-[12.5px] font-medium" style={{ color: viable ? "var(--c-pos)" : "var(--c-warn)" }}>
                A${r.estNetAud.toFixed(2)}
              </span>
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
          <Link
            href={`/studio?id=${encodeURIComponent(r.id)}`}
            title={r.estNetAud ? "Open in the listing studio" : "No factory price yet, so there is nothing to list honestly"}
            className={`rounded-ctl px-2.5 py-1.5 font-mono text-[10.5px] font-medium transition-all ${
              r.estNetAud ? "bg-accentweak text-accentstrong hover:bg-accentstrong hover:text-onaccent" : "cursor-not-allowed bg-surface2 text-faint"
            }`}
          >
            List
          </Link>
        </div>
      </div>
    </li>
  );
}

export default function RadarDesk({ rows }: { rows: DeskRow[] }) {
  const [stage, setStage] = useState<"All" | "Rising" | "Peaking" | "Fading">("All");
  const visible = useMemo(() => (stage === "All" ? rows : rows.filter((r) => r.stage === stage)), [rows, stage]);
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

      <div className="grid grid-cols-[minmax(0,2.2fr)_.9fr_.7fr_.95fr_.95fr_.7fr] items-center gap-3 border-b border-line px-4 py-2.5 max-lg:hidden sm:px-5">
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
            <Row key={r.id} r={r} />
          ))}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center font-mono text-[12px] text-faint">No {stage.toLowerCase()} signals in view.</p>
      )}

      <p className="border-t border-line bg-surface2 px-5 py-3 text-[11px] leading-relaxed text-mut">
        <span className="font-mono">Est. net</span> is derived from the measured 1688 price after Etsy's full fee
        stack (listing + transaction + processing + Offsite Ads contingency), marked <span className="font-mono">est.</span>{" "}
        <span className="font-mono">Etsy sat.</span> is a measured count from the cache, or a dash where the scraper
        hasn't covered the term — we don't invent it.
      </p>
    </div>
  );
}
