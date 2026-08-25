"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

/*
 * Hero band for /radar.
 *
 * Same warm-gradient + shortcut treatment as DashboardWelcome, tuned for
 * the radar page: on the right, instead of a seller character, we render
 * a stylised radar SCOPE — concentric rings, a sweeping arm, and four
 * colored blips at platform-specific angles. That says "signals coming in
 * from Douyin / XHS / 1688 / Taobao" without any text.
 *
 * The freshness pill (Live vs Sample data) lives here now, so the old
 * flat PageHead + SourceBadge duo isn't needed at the top of the page.
 */

export default function RadarHero({
  live,
  when,
}: {
  live: boolean;
  when: string; // e.g. "30m ago", "never"
}) {
  const reduce = useReducedMotion();

  return (
    <div className="rh-wrap">
      <div className="rh-copy">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rh-eyebrow"
        >
          <span
            className="rh-eyebrow-dot"
            style={{ background: live ? "var(--c-pos)" : "var(--c-warn)" }}
            aria-hidden="true"
          />
          {live ? `Live · pulled ${when}` : "Sample data"}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="rh-title"
        >
          Your <span className="rh-name">radar</span>.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rh-since"
        >
          Products moving on Chinese platforms, ranked by momentum against margin.
          Every row carries the date we first recorded it — never back-dated.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="rh-ctas"
        >
          <Link href="/watchlist" className="rh-cta rh-cta-ghost">
            <i className="ph-fill ph-bookmark-simple" /> Your watchlist
          </Link>
          <Link href="/ask" className="rh-cta rh-cta-ghost">
            <i className="ph-fill ph-chat-circle-dots" /> Ask the radar
          </Link>
        </motion.div>
      </div>

      <div className="rh-scope" aria-hidden="true">
        <RadarScope reduce={!!reduce} />
      </div>

      <style>{`
        .rh-wrap{position:relative;display:grid;grid-template-columns:1fr 220px;gap:24px;align-items:center;padding:26px 28px;border-radius:20px;overflow:hidden;background:linear-gradient(120deg,color-mix(in oklab,var(--c-accent) 4%,var(--c-surface)),color-mix(in oklab,var(--c-1688) 3%,var(--c-surface)) 55%,var(--c-surface));border:1px solid var(--c-line);box-shadow:0 1px 0 rgba(14,21,36,.02)}
        @media(max-width:760px){.rh-wrap{grid-template-columns:1fr;padding:22px 20px}.rh-scope{display:none}}
        .rh-copy{min-width:0;position:relative;z-index:2}
        .rh-eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-geist-mono);font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:var(--c-muted);background:var(--c-surface);border:1px solid var(--c-line);padding:4px 10px;border-radius:999px}
        .rh-eyebrow-dot{width:6px;height:6px;border-radius:50%;animation:rh-pulse 2s ease-in-out infinite}
        @keyframes rh-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.65;transform:scale(1.3)}}
        .rh-title{margin-top:12px;font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(1.8rem,3.4vw,2.4rem);letter-spacing:-.03em;line-height:1.02;color:var(--c-ink)}
        .rh-name{background:linear-gradient(96deg,var(--c-accent),var(--c-1688) 60%,var(--c-taobao));-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
        .rh-since{margin-top:8px;font-size:.94rem;line-height:1.55;color:var(--c-body);max-width:60ch}
        .rh-ctas{margin-top:18px;display:flex;flex-wrap:wrap;gap:10px}
        .rh-cta{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;font-weight:600;font-size:.82rem;transition:transform .22s cubic-bezier(.34,1.56,.64,1),background .22s,border-color .22s;text-decoration:none}
        .rh-cta i{font-size:.9em;color:var(--c-accent)}
        .rh-cta-ghost{background:var(--c-surface);color:var(--c-ink);border:1.5px solid var(--c-line)}
        .rh-cta-ghost:hover{transform:translateY(-2px);background:var(--c-surface-2);border-color:var(--c-ink)}
        .rh-scope{flex-shrink:0;width:200px;height:200px;position:relative;z-index:2}
      `}</style>
    </div>
  );
}

function RadarScope({ reduce }: { reduce: boolean }) {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" aria-hidden="true">
      <defs>
        <radialGradient id="rh-scope-bg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rh-sweep-grad">
          <stop offset="0%" stopColor="var(--c-accent)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--c-accent)" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {/* Backdrop halo */}
      <circle cx="100" cy="100" r="94" fill="url(#rh-scope-bg)" />

      {/* Concentric rings */}
      {[36, 60, 84].map((r) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="var(--c-line)"
          strokeWidth="1"
          opacity="0.7"
        />
      ))}

      {/* Cross hairs */}
      <line x1="6" y1="100" x2="194" y2="100" stroke="var(--c-line)" strokeWidth="0.5" />
      <line x1="100" y1="6" x2="100" y2="194" stroke="var(--c-line)" strokeWidth="0.5" />

      {/* Sweep arm */}
      <motion.g
        style={{ originX: "100px", originY: "100px" }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      >
        <path
          d="M 100 100 L 100 12 A 88 88 0 0 1 187 82 Z"
          fill="url(#rh-sweep-grad)"
        />
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="12"
          stroke="var(--c-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Center hub */}
      <circle cx="100" cy="100" r="5" fill="var(--c-accent)" />
      <circle cx="100" cy="100" r="10" fill="none" stroke="var(--c-accent)" strokeWidth="1" opacity="0.4" />

      {/* Platform blips (XHS · 1688 · Taobao · Douyin) — pulsing radii vary */}
      <PlatformBlip cx={148} cy={62} label="红" bg="var(--c-xhs)" delay={0} reduce={reduce} />
      <PlatformBlip cx={62} cy={72} label="抖" bg="var(--c-douyin)" delay={0.6} reduce={reduce} />
      <PlatformBlip cx={72} cy={148} label="淘" bg="var(--c-taobao)" delay={1.2} reduce={reduce} />
      <PlatformBlip cx={158} cy={130} label="16" bg="var(--c-1688)" delay={1.8} reduce={reduce} />
    </svg>
  );
}

function PlatformBlip({
  cx,
  cy,
  label,
  bg,
  delay,
  reduce,
}: {
  cx: number;
  cy: number;
  label: string;
  bg: string;
  delay: number;
  reduce: boolean;
}) {
  return (
    <g>
      {/* Pulsing halo */}
      {!reduce && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={8}
          fill={bg}
          opacity="0.25"
          animate={{ scale: [1, 2, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 3.2, delay, repeat: Infinity, ease: "easeOut" }}
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
        />
      )}
      <circle cx={cx} cy={cy} r="8" fill={bg} />
      <text
        x={cx}
        y={cy + 2.5}
        fontSize="8"
        textAnchor="middle"
        fill="#fff"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  );
}
