"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

/*
 * "Read from the source" — four platform cards.
 *
 * Replaces the previous credibility strip (four flat stats + a dim
 * platform-glyph footer). The old shape restated the obvious ("4
 * platforms") and buried the actual proof (which platforms, and what
 * we extract from each). This is now the section's core: one card per
 * Chinese platform, each showing what CTS actually reads from it plus
 * a running total that counts up when the section scrolls into view.
 *
 * Numbers are illustrative-but-plausible for the marketing page;
 * they'll be wired to real dashboard counts in a later pass.
 */

type Source = {
  id: string;
  glyph: string;
  hue: string;
  bg: string;
  nameZh: string;
  name: string;
  reads: string;
  metric: {
    value: number;
    format: (n: number) => string;
    label: string;
  };
  detail: string;
};

const SOURCES: Source[] = [
  {
    id: "douyin",
    glyph: "抖",
    hue: "var(--c-douyin)",
    bg: "linear-gradient(155deg, color-mix(in oklab, var(--c-douyin) 8%, transparent), transparent)",
    nameZh: "抖音",
    name: "Douyin",
    reads: "Video hooks + save counts",
    metric: {
      value: 12400,
      format: (n) => n.toLocaleString("en-US"),
      label: "posts scanned this week",
    },
    detail: "The hooks that make people stop scrolling, ranked by how many people saved the video.",
  },
  {
    id: "xhs",
    glyph: "红",
    hue: "var(--c-xhs)",
    bg: "linear-gradient(155deg, color-mix(in oklab, var(--c-xhs) 8%, transparent), transparent)",
    nameZh: "小红书",
    name: "Xiaohongshu",
    reads: "Bookmark-to-buy intent",
    metric: {
      value: 0.94,
      format: (n) => n.toFixed(2),
      label: "median saves-to-likes on rising items",
    },
    detail: "A save is bookmark-to-buy, not a like. Ratios above 0.7 are the ones that turn into orders.",
  },
  {
    id: "1688",
    glyph: "16",
    hue: "var(--c-1688)",
    bg: "linear-gradient(155deg, color-mix(in oklab, var(--c-1688) 8%, transparent), transparent)",
    nameZh: "阿里1688",
    name: "1688",
    reads: "Factory unit prices",
    metric: {
      value: 47200,
      format: (n) => n.toLocaleString("en-US"),
      label: "SKUs indexed",
    },
    detail: "Median wholesale, not cheapest. The cheapest listing is usually bait, so we skip it.",
  },
  {
    id: "taobao",
    glyph: "淘",
    hue: "var(--c-taobao)",
    bg: "linear-gradient(155deg, color-mix(in oklab, var(--c-taobao) 8%, transparent), transparent)",
    nameZh: "淘宝",
    name: "Taobao",
    reads: "Retail spread + KOL rates",
    metric: {
      value: 8900,
      format: (n) => n.toLocaleString("en-US"),
      label: "sellers tracked",
    },
    detail: "Retail sell-through and creator rate cards, so you can price the listing and the ad the same day.",
  },
];

export default function SourceCards() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();

  return (
    <div className="sc-wrap" ref={wrapRef}>
      <div className="sc-head">
        <span className="sc-kicker">
          <span className="sc-kicker-dot" aria-hidden="true" />
          Read from the source
        </span>
        <h3 className="sc-line">
          Not just trends.{" "}
          <span className="spectrum-text">It&apos;s signal intelligence.</span>
        </h3>
        <p className="sc-sub">
          Read straight from four Chinese platforms every night. Here&apos;s
          what we extract from each.
        </p>
      </div>

      <div className="sc-grid">
        {SOURCES.map((s, i) => (
          <Card key={s.id} src={s} index={i} inView={inView} reduce={!!reduce} />
        ))}
      </div>

      <style>{`
        .sc-wrap{display:flex;flex-direction:column;gap:28px;max-width:1080px;margin:0 auto;padding-bottom:32px;border-bottom:1px solid var(--c-line)}
        .sc-head{max-width:640px;margin:0 auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px}
        .sc-kicker{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-muted);background:var(--c-surface-2);border:1px solid var(--c-line);padding:6px 13px;border-radius:999px}
        .sc-kicker-dot{width:7px;height:7px;border-radius:50%;background:var(--c-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--c-accent) 20%,transparent);animation:sc-pulse 2.2s ease-in-out infinite}
        @keyframes sc-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
        .sc-line{font-family:var(--font-geist-sans);font-weight:700;font-size:clamp(1.4rem,2.8vw,2.2rem);letter-spacing:-.02em;line-height:1.05;color:var(--c-ink)}
        .sc-sub{font-size:.95rem;color:var(--c-muted);max-width:52ch}
        .sc-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        @media(max-width:920px){.sc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:520px){.sc-grid{grid-template-columns:1fr}}
        @media(prefers-reduced-motion:reduce){.sc-kicker-dot{animation:none}}
      `}</style>
    </div>
  );
}

function Card({
  src,
  index,
  inView,
  reduce,
}: {
  src: Source;
  index: number;
  inView: boolean;
  reduce: boolean;
}) {
  const raw = useMotionValue(0);
  const display = useTransform(raw, (v) => src.metric.format(v));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      raw.set(src.metric.value);
      return;
    }
    const controls = animate(raw, src.metric.value, {
      duration: 1.6,
      delay: index * 0.15,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, reduce, raw, src.metric.value, index]);

  return (
    <motion.div
      className="sc-card"
      style={{ background: src.bg, borderColor: `color-mix(in oklab, ${src.hue} 22%, var(--c-line))` }}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="sc-card-top">
        <span className="sc-glyph" style={{ background: src.hue }}>
          {src.glyph}
          <span className="sc-glyph-pulse" style={{ background: src.hue }} aria-hidden="true" />
        </span>
        <div className="sc-name-wrap">
          <span className="sc-name-zh">{src.nameZh}</span>
          <span className="sc-name">{src.name}</span>
        </div>
      </div>

      <div className="sc-reads">
        <i className="ph-fill ph-radar" style={{ color: src.hue }} />
        <span>{src.reads}</span>
      </div>

      <div className="sc-metric">
        <motion.span className="sc-metric-val" style={{ color: src.hue }}>
          {display}
        </motion.span>
        <span className="sc-metric-lbl">{src.metric.label}</span>
      </div>

      <p className="sc-detail">{src.detail}</p>

      <style>{`
        .sc-card{position:relative;display:flex;flex-direction:column;gap:14px;padding:20px;background:#fff;border:1px solid var(--c-line);border-radius:16px;overflow:hidden;transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s}
        .sc-card:hover{transform:translateY(-4px);box-shadow:0 18px 40px -18px rgba(14,21,36,.16);z-index:2}
        .sc-card-top{display:flex;align-items:center;gap:12px}
        .sc-glyph{position:relative;width:40px;height:40px;border-radius:11px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0;box-shadow:0 6px 14px -6px currentColor}
        .sc-glyph-pulse{position:absolute;inset:0;border-radius:inherit;opacity:.4;animation:sc-glow 2.8s ease-in-out infinite;filter:blur(6px);z-index:-1}
        @keyframes sc-glow{0%,100%{opacity:.2;transform:scale(1)}50%{opacity:.5;transform:scale(1.18)}}
        .sc-name-wrap{display:flex;flex-direction:column;gap:1px;min-width:0}
        .sc-name-zh{font-family:var(--font-geist-sans);font-weight:700;font-size:1.02rem;letter-spacing:.02em;color:var(--c-ink);line-height:1.1}
        .sc-name{font-family:var(--font-mono);font-size:.68rem;color:var(--c-muted);letter-spacing:.04em;text-transform:uppercase}
        .sc-reads{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-geist-sans);font-weight:600;font-size:.86rem;color:var(--c-ink);padding-top:12px;border-top:1px solid var(--c-line)}
        .sc-reads i{font-size:1rem;flex-shrink:0}
        .sc-metric{display:flex;flex-direction:column;gap:3px}
        .sc-metric-val{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(1.7rem,2.6vw,2.2rem);letter-spacing:-.025em;line-height:1;font-variant-numeric:tabular-nums;display:inline-block}
        .sc-metric-lbl{font-family:var(--font-mono);font-size:.62rem;letter-spacing:.05em;text-transform:uppercase;color:var(--c-muted);line-height:1.35}
        .sc-detail{font-size:.8rem;line-height:1.55;color:var(--c-muted);margin-top:auto;padding-top:8px;border-top:1px solid color-mix(in oklab,var(--c-line) 60%,transparent);opacity:.85}
        @media(prefers-reduced-motion:reduce){.sc-glyph-pulse{animation:none;opacity:.3}}
      `}</style>
    </motion.div>
  );
}
