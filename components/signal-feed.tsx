"use client";

import Link from "next/link";
import SupplierMatchButton from "@/components/supplier-match-button";
import WatchButton from "@/components/watch-button";
import { platformStyle } from "@/lib/platform-style";

/**
 * The radar row — the product's core surface.
 *
 * Patterns borrowed deliberately:
 *  - Sentry: relative "first seen" as a first-class column plus an inline sparkline.
 *    Together they answer the only two questions someone scanning a feed has —
 *    is this new, and is it accelerating — with zero interaction required.
 *  - Clay: a per-value provenance badge, including an explicit marker for values we
 *    inferred rather than measured. This is what "we never invent a number" looks
 *    like as an interface rather than as a claim in marketing copy.
 *  - Stripe/Attio: hairline separators, no card chrome, tabular figures, numbers
 *    right-aligned so columns actually compare vertically.
 */

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
  sources: string[];
  refreshed: string;
  /** Set only on live rows: days since we first recorded this signal. This is the
   *  earlier-signal claim made checkable, so it must never be faked for seed rows. */
  daysTracked?: number | null;
  savesRatio?: number | null;
  /** Engagement over time, oldest first. Empty when we lack real history. */
  spark?: number[];
};

const STAGE: Record<Signal["stage"], string> = {
  Rising: "var(--c-pos)",
  Peaking: "var(--c-warn)",
  Fading: "var(--c-faint)",
};

/** Compact SVG trend line. Renders nothing below two points rather than drawing a
 *  flat line that would imply a trend we have not actually observed. */
function Spark({ points }: { points: number[] }) {
  if (!points || points.length < 2) {
    return <span className="font-mono text-[10px] text-faint">no history</span>;
  }
  const w = 54;
  const h = 16;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);
  const y = (p: number) => h - ((p - min) / span) * h;
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  const climbing = points[points.length - 1]! >= points[0]!;
  const stroke = climbing ? "var(--c-pos)" : "var(--c-faint)";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true" className="overflow-visible">
      <path d={d} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={y(points[points.length - 1]!)} r="1.75" fill={stroke} />
    </svg>
  );
}

function Provenance({ source, estimated }: { source: string; estimated?: boolean }) {
  // Platform badges carry the coded hue; the "est." marker stays neutral so it
  // reads as a caveat rather than a source.
  const p = platformStyle(source);
  const style = estimated
    ? undefined
    : { background: p.bg, color: p.fg };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-chip px-1.5 py-px font-mono text-[9.5px] tracking-wide ${
        estimated ? "border border-line text-mut" : ""
      }`}
      style={style}
      title={estimated ? "Inferred from the wholesale price, not measured" : `Measured on ${p.label}`}
    >
      {estimated ? "est." : p.label}
    </span>
  );
}

const GRID =
  "grid grid-cols-[minmax(0,2.1fr)_.7fr_.9fr_.65fr_.75fr_.6fr] items-center gap-3 max-lg:grid-cols-[minmax(0,2fr)_.7fr_.9fr]";

export default function SignalFeed({
  signals,
  watched = [],
}: {
  signals: Signal[];
  /** Signal ids the viewer already tracks, so save state is correct on first paint. */
  watched?: string[];
}) {
  const saved = new Set(watched);
  if (!signals.length) {
    return (
      <div className="rounded-card border border-line bg-surface px-6 py-14 text-center">
        <p className="text-sm font-medium text-ink">No signals in this view</p>
        <p className="mx-auto mt-1.5 max-w-[44ch] text-[13px] leading-relaxed text-mut">
          Signals appear here once a nightly pull completes. Nothing is shown until there
          is something real to show.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className={`${GRID} border-b border-line bg-surface2 px-4 py-2.5 sm:px-5`}>
        <span className="label text-mut">Signal</span>
        <span className="label text-mut">Stage</span>
        <span className="label text-right text-mut">Velocity</span>
        <span className="label text-right text-mut max-lg:hidden">Intent</span>
        <span className="label text-right text-mut max-lg:hidden">Spread</span>
        <span className="label text-right text-mut">First seen</span>
      </div>
      <ul>
        {signals.map((s) => (
          <SignalRow key={s.id} s={s} watching={saved.has(s.id)} />
        ))}
      </ul>
    </div>
  );
}

function SignalRow({ s, watching }: { s: Signal; watching: boolean }) {
  const hasPrice = s.wholesaleCny > 0 && s.retailAud > 0;
  const spread = hasPrice ? s.retailAud / (s.wholesaleCny * 0.213) : null;
  const stageColor = STAGE[s.stage] ?? STAGE.Rising;
  // Linked by id so the analysis page reads the row from the database rather than
  // trusting (or padding out) numbers passed through the query string.
  const href = `/analysis?id=${encodeURIComponent(s.id)}`;

  return (
    <li className="border-b border-line last:border-b-0">
      <Link href={href} className={`${GRID} px-4 py-3 transition-colors hover:bg-surface2 sm:px-5`}>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[14px] font-medium tracking-[-.01em] text-ink">{s.product}</span>
            {s.zh && <span className="shrink-0 font-mono text-[11px] text-faint">{s.zh}</span>}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            {s.sources.slice(0, 2).map((src) => (
              <Provenance key={src} source={src} />
            ))}
            <span className="truncate text-[11.5px] text-mut">{s.niche}</span>
            <WatchButton signalId={s.id} initial={watching} label={false} />
            <SupplierMatchButton keyword={s.zh || s.product} />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: stageColor }} />
          <span className="text-[12.5px]" style={{ color: stageColor }}>{s.stage}</span>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Spark points={s.spark ?? []} />
          <span data-numeric className="w-[50px] text-right font-mono text-[12.5px] font-medium text-ink">
            {s.velocityPct > 0 ? "+" : ""}{s.velocityPct}%
          </span>
        </div>

        <div className="text-right max-lg:hidden">
          {s.intent > 0 ? (
            <>
              <span data-numeric className="font-mono text-[12.5px] font-medium text-ink">{s.intent}</span>
              {s.savesRatio != null && (
                <span data-numeric className="ml-1 font-mono text-[10.5px] text-faint">{s.savesRatio.toFixed(2)}×</span>
              )}
            </>
          ) : (
            <span className="font-mono text-[12px] text-faint">-</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-1.5 max-lg:hidden">
          {spread ? (
            <>
              <span data-numeric className="font-mono text-[12.5px] font-medium text-ink">{spread.toFixed(1)}×</span>
              <Provenance source="1688" estimated />
            </>
          ) : (
            <span className="font-mono text-[12px] text-faint" title="No supplier price recorded yet">-</span>
          )}
        </div>

        {/* The column the entire positioning rests on. Never back-dated. */}
        <div className="text-right">
          <span data-numeric className="font-mono text-[12.5px] text-body">
            {s.daysTracked == null ? "-" : s.daysTracked === 0 ? "today" : `${s.daysTracked}d`}
          </span>
        </div>
      </Link>
    </li>
  );
}
