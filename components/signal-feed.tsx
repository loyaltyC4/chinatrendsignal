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
 *
 * The empty state upgraded from a centered text block to a small "empty radar"
 * SVG + a real next action, so a first-time viewer with no ingest sees something
 * that reads like a state, not a rendering bug.
 */

export type Signal = {
  id: string;
  product: string;
  zh: string;
  niche: string;
  stage: "Rising" | "Peaking" | "Fading";
  velocityPct: number;
  intent: number;
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

/* ── Empty state (upgraded from centered-text-only to illustration + CTA) ── */

function EmptyRadar() {
  return (
    <div className="rf-empty">
      <div className="rf-empty-scope" aria-hidden="true">
        <svg viewBox="0 0 140 140" width="140" height="140">
          <defs>
            <radialGradient id="rf-glow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.14" />
              <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="70" cy="70" r="66" fill="url(#rf-glow)" />
          {[26, 44, 62].map((r) => (
            <circle
              key={r}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="var(--c-line)"
              strokeWidth="1"
              opacity="0.7"
            />
          ))}
          <line x1="4" y1="70" x2="136" y2="70" stroke="var(--c-line)" strokeWidth="0.5" />
          <line x1="70" y1="4" x2="70" y2="136" stroke="var(--c-line)" strokeWidth="0.5" />
          {/* Center hub — quiet, no signals */}
          <circle cx="70" cy="70" r="4" fill="var(--c-accent)" />
          <circle cx="70" cy="70" r="8" fill="none" stroke="var(--c-accent)" strokeWidth="1" opacity="0.4" />
          {/* Static sweep — no rotation for the empty state */}
          <line x1="70" y1="70" x2="70" y2="8" stroke="var(--c-line-strong)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
      <p className="rf-empty-title">Nothing on the radar yet.</p>
      <p className="rf-empty-body">
        Signals appear here after the first nightly pull completes. If a filter is
        active, try clearing it — some niches move slower than others.
      </p>
      <div className="rf-empty-ctas">
        <Link href="/radar" className="rf-empty-cta rf-empty-cta-primary">
          Clear filters <i className="ph ph-arrow-right" />
        </Link>
        <Link href="/analysis" className="rf-empty-cta rf-empty-cta-ghost">
          Try the worked example
        </Link>
      </div>
      <style>{`
        .rf-empty{display:flex;flex-direction:column;align-items:center;text-align:center;padding:36px 24px 40px;border-radius:16px;border:1px solid var(--c-line);background:var(--c-surface)}
        .rf-empty-scope{margin-bottom:14px}
        .rf-empty-title{font-family:var(--font-geist-sans);font-weight:700;font-size:1.02rem;color:var(--c-ink)}
        .rf-empty-body{margin-top:6px;font-size:.86rem;line-height:1.55;color:var(--c-muted);max-width:44ch}
        .rf-empty-ctas{margin-top:18px;display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
        .rf-empty-cta{display:inline-flex;align-items:center;gap:7px;padding:9px 16px;border-radius:999px;font-family:var(--font-geist-sans);font-weight:600;font-size:.82rem;text-decoration:none;transition:transform .22s cubic-bezier(.34,1.56,.64,1),background .22s,border-color .22s}
        .rf-empty-cta i{font-size:.85em}
        .rf-empty-cta-primary{background:var(--c-accent);color:#fff;box-shadow:0 8px 22px -10px color-mix(in oklab,var(--c-accent) 55%,transparent)}
        .rf-empty-cta-primary:hover{transform:translateY(-2px);box-shadow:0 12px 28px -10px color-mix(in oklab,var(--c-accent) 70%,transparent)}
        .rf-empty-cta-ghost{background:transparent;color:var(--c-ink);border:1.5px solid var(--c-line-strong)}
        .rf-empty-cta-ghost:hover{transform:translateY(-2px);background:var(--c-surface-2);border-color:var(--c-ink)}
      `}</style>
    </div>
  );
}

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
    return <EmptyRadar />;
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
