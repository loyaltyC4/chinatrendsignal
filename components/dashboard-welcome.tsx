"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

/*
 * Welcome hero for the signed-in dashboard.
 *
 * The old top strip on /dashboard was pure text ("Morning, Sam. Since you last
 * looked X new signals landed…"). Useful information, but visually flat — the
 * user just walks into a wall of stats. This adds warmth: a soft gradient
 * band, a friendly SVG "signal seller" scene on the right, and two quick
 * shortcuts (Open the radar, See what changed) so there's always a next move.
 *
 * The greeting copy is still generated server-side and passed in as a prop,
 * so nothing about the underlying data flow changes.
 */

export default function DashboardWelcome({
  firstName,
  sinceCopy,
  freshnessLabel,
  fresh,
}: {
  firstName: string;
  sinceCopy: React.ReactNode;
  freshnessLabel: string;
  fresh: boolean;
}) {
  const reduce = useReducedMotion();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 5 ? "Late night" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div className="dw-wrap">
      <div className="dw-copy">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="dw-eyebrow"
        >
          <span className="dw-eyebrow-dot" style={{ background: fresh ? "var(--c-pos)" : "var(--c-warn)" }} />
          {freshnessLabel}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="dw-title"
        >
          {greeting}, <span className="dw-name">{firstName}</span>.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="dw-since"
        >
          {sinceCopy}
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="dw-ctas"
        >
          <Link href="/radar" className="dw-cta dw-cta-primary">
            Open the radar <i className="ph ph-arrow-right" />
          </Link>
          <Link href="/watchlist" className="dw-cta dw-cta-ghost">
            <i className="ph-fill ph-bookmark-simple" /> Your watchlist
          </Link>
        </motion.div>
      </div>

      <div className="dw-scene" aria-hidden="true">
        <SellerScene reduce={!!reduce} />
      </div>

      <style>{`
        .dw-wrap{position:relative;display:grid;grid-template-columns:1fr auto;gap:24px;align-items:center;padding:26px 28px;border-radius:20px;overflow:hidden;background:linear-gradient(120deg,color-mix(in oklab,var(--c-accent) 4%,var(--c-surface)),color-mix(in oklab,var(--c-xhs) 3%,var(--c-surface)) 55%,var(--c-surface));border:1px solid var(--c-line);box-shadow:0 1px 0 rgba(14,21,36,.02)}
        @media(max-width:760px){.dw-wrap{grid-template-columns:1fr;padding:22px 20px}.dw-scene{display:none}}
        .dw-copy{min-width:0;position:relative;z-index:2}
        .dw-eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-geist-mono);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);background:var(--c-surface);border:1px solid var(--c-line);padding:4px 10px;border-radius:999px}
        .dw-eyebrow-dot{width:6px;height:6px;border-radius:50%;animation:dw-pulse 2s ease-in-out infinite}
        @keyframes dw-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.65;transform:scale(1.3)}}
        .dw-title{margin-top:12px;font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(1.8rem,3.4vw,2.4rem);letter-spacing:-.03em;line-height:1.02;color:var(--c-ink)}
        .dw-name{background:linear-gradient(96deg,var(--c-accent),var(--c-xhs));-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
        .dw-since{margin-top:8px;font-size:.94rem;line-height:1.55;color:var(--c-body);max-width:56ch}
        .dw-ctas{margin-top:18px;display:flex;flex-wrap:wrap;gap:10px}
        .dw-cta{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border-radius:999px;font-weight:600;font-size:.88rem;transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,background .22s;text-decoration:none}
        .dw-cta i{font-size:.9em}
        .dw-cta-primary{background:var(--c-accent);color:#fff;box-shadow:0 10px 22px -10px color-mix(in oklab,var(--c-accent) 55%,transparent)}
        .dw-cta-primary:hover{transform:translateY(-2px);box-shadow:0 14px 30px -10px color-mix(in oklab,var(--c-accent) 70%,transparent)}
        .dw-cta-ghost{background:var(--c-surface);color:var(--c-ink);border:1.5px solid var(--c-line-strong)}
        .dw-cta-ghost:hover{transform:translateY(-2px);background:var(--c-surface-2);border-color:var(--c-ink)}
        .dw-scene{flex-shrink:0;width:180px;position:relative;z-index:2}
      `}</style>
    </div>
  );
}

function SellerScene({ reduce }: { reduce: boolean }) {
  return (
    <svg viewBox="0 0 180 130" width="180" height="130" aria-hidden="true">
      <ellipse cx="90" cy="120" rx="72" ry="5" fill="var(--c-accent)" opacity="0.08" />
      {/* head */}
      <circle cx="68" cy="46" r="14" fill="#f3d4b8" stroke="var(--c-accent)" strokeWidth="1.2" />
      <path d="M55 44c0-9 7-14 13-14s13 5 13 14c0 3-1 5-2 5-3-3-8-4-11-4s-8 1-11 4c-1 0-2-2-2-5z" fill="var(--c-accent)" />
      <circle cx="64" cy="47" r="1.2" fill="#161613" />
      <circle cx="72" cy="47" r="1.2" fill="#161613" />
      <path d="M64 52c1 1.5 3 2 4 2s3-.5 4-2" stroke="#161613" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* body */}
      <path d="M52 110l4-32c1-6 5-10 12-10h0c7 0 11 4 12 10l4 32z" fill="var(--c-accent)" />
      {/* arm to tablet */}
      <path d="M82 76l14-3" stroke="#f3d4b8" strokeWidth="6" strokeLinecap="round" />
      {/* tablet */}
      <rect x="98" y="60" width="42" height="54" rx="5" fill="#fff" stroke="#161613" strokeWidth="1.2" />
      <rect x="102" y="66" width="34" height="6" rx="1.5" fill="var(--c-accent)" opacity="0.5" />
      <rect x="102" y="76" width="22" height="3.5" rx="1.5" fill="var(--c-xhs)" />
      <rect x="102" y="83" width="30" height="3.5" rx="1.5" fill="var(--c-1688)" />
      <rect x="102" y="90" width="16" height="3.5" rx="1.5" fill="var(--c-taobao)" />
      <rect x="102" y="97" width="26" height="3.5" rx="1.5" fill="var(--c-douyin)" />
      {/* floating platform dots */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="156" cy="42" r="7" fill="var(--c-xhs)" />
        <text x="156" y="45" fontSize="8" textAnchor="middle" fill="#fff" fontWeight="700">红</text>
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { y: [0, 4, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <circle cx="40" cy="30" r="6" fill="var(--c-douyin)" />
        <text x="40" y="33" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="700">抖</text>
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <circle cx="30" cy="72" r="6" fill="var(--c-taobao)" />
        <text x="30" y="75" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="700">淘</text>
      </motion.g>
      <path d="M40 34 Q54 40 60 42" stroke="var(--c-douyin)" strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M36 72 Q46 84 60 92" stroke="var(--c-taobao)" strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M148 44 Q140 55 138 62" stroke="var(--c-xhs)" strokeWidth="0.7" fill="none" opacity="0.4" />
    </svg>
  );
}
