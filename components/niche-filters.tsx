"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

/*
 * Niche filter pills for /radar.
 *
 * Replaces the flat mono-font chips with per-niche icon tiles + counts.
 * Each niche gets a Phosphor icon that matches CTS's landing-page bento
 * (paw for pets, cooking-pot for kitchen, etc.), so the visual vocabulary
 * stays consistent across marketing and product. Selected pill fills with
 * the accent color and gently lifts; unselected pills lift on hover.
 *
 * Uses <Link> so the URL still drives the filter state (server component
 * on /radar reads searchParams.niche) — no client-side routing hacks.
 */

const NICHE_ICONS: Record<string, string> = {
  "pet supplies": "ph-paw-print",
  "pet": "ph-paw-print",
  "pets": "ph-paw-print",
  "baby and kids": "ph-baby",
  "baby": "ph-baby",
  "kids": "ph-baby",
  "kitchen": "ph-cooking-pot",
  "cookware": "ph-cooking-pot",
  "beauty": "ph-sparkle",
  "skincare": "ph-sparkle",
  "makeup": "ph-sparkle",
  "fitness": "ph-barbell",
  "sports": "ph-barbell",
  "home": "ph-house-line",
  "home goods": "ph-house-line",
  "furniture": "ph-armchair",
  "phone accessories": "ph-device-mobile",
  "phone": "ph-device-mobile",
  "electronics": "ph-device-mobile",
  "outdoor": "ph-mountains",
  "camping": "ph-mountains",
  "fashion": "ph-t-shirt",
  "apparel": "ph-t-shirt",
  "jewelry": "ph-diamond",
  "food": "ph-fork-knife",
  "toys": "ph-game-controller",
};

function iconFor(niche: string): string {
  const key = niche.trim().toLowerCase();
  return NICHE_ICONS[key] ?? "ph-package";
}

export default function NicheFilters({
  niches,
  active,
  counts,
  total,
}: {
  niches: string[];
  active?: string;
  counts: Record<string, number>;
  total: number;
}) {
  const reduce = useReducedMotion();

  const Pill = ({
    href,
    on,
    label,
    icon,
    count,
  }: {
    href: string;
    on: boolean;
    label: string;
    icon: string;
    count: number;
  }) => (
    <motion.div
      whileHover={reduce ? undefined : { y: -2 }}
      whileTap={reduce ? undefined : { y: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
    >
      <Link
        href={href}
        prefetch={false}
        aria-current={on ? "page" : undefined}
        className={`nf-pill ${on ? "on" : ""}`}
      >
        <span className={`nf-ic ${on ? "on" : ""}`}>
          <i className={`ph-fill ${icon}`} />
        </span>
        <span className="nf-lbl">{label}</span>
        <span className={`nf-count ${on ? "on" : ""}`} data-numeric>
          {count}
        </span>
      </Link>
    </motion.div>
  );

  return (
    <div className="nf-wrap" role="group" aria-label="Filter by niche">
      <Pill href="/radar" on={!active} label="All" icon="ph-globe" count={total} />
      {niches.map((n) => (
        <Pill
          key={n}
          href={`/radar?niche=${encodeURIComponent(n)}`}
          on={active === n}
          label={n}
          icon={iconFor(n)}
          count={counts[n] ?? 0}
        />
      ))}
      <style>{`
        .nf-wrap{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
        .nf-pill{display:inline-flex;align-items:center;gap:8px;padding:7px 12px 7px 6px;background:var(--c-surface);border:1.5px solid var(--c-line);border-radius:999px;color:var(--c-body);font-family:var(--font-geist-sans);font-weight:500;font-size:.85rem;text-decoration:none;transition:border-color .22s,background .22s,color .22s,box-shadow .22s;cursor:pointer;user-select:none}
        .nf-pill:hover{border-color:var(--c-line-strong);color:var(--c-ink);box-shadow:0 4px 14px -8px rgba(14,21,36,.14)}
        .nf-pill.on{background:var(--c-accent);border-color:var(--c-accent);color:#fff;box-shadow:0 8px 22px -10px color-mix(in oklab,var(--c-accent) 55%,transparent)}
        .nf-ic{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:var(--c-surface-2);color:var(--c-muted);font-size:.75rem;flex-shrink:0;transition:background .22s,color .22s}
        .nf-pill:hover .nf-ic{background:color-mix(in oklab,var(--c-accent) 12%,var(--c-surface-2));color:var(--c-accent)}
        .nf-ic.on{background:rgba(255,255,255,.2);color:#fff}
        .nf-pill:hover .nf-ic.on{background:rgba(255,255,255,.28);color:#fff}
        .nf-lbl{white-space:nowrap;text-transform:capitalize;font-size:.83rem}
        .nf-count{font-family:var(--font-geist-mono);font-size:.65rem;color:var(--c-muted);background:var(--c-surface-2);padding:1px 6px;border-radius:6px;flex-shrink:0}
        .nf-pill:hover .nf-count{color:var(--c-accent)}
        .nf-count.on{background:rgba(255,255,255,.2);color:#fff}
        .nf-pill:hover .nf-count.on{background:rgba(255,255,255,.28);color:#fff}
      `}</style>
    </div>
  );
}
