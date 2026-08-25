"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/*
 * Animated hero. Chrome adapted from 21st.dev's hero-1 (beratberkayg):
 * a masked grid background + a radial "sunrise" glow at the bottom + a
 * gradient-clipped headline. The interactive element is a rotating
 * emphasis word inside the headline — "See it in China {before/faster/
 * cheaper/smarter} the window shuts." — which cycles every 2.4s and
 * cross-fades the word.
 *
 * All CTS design tokens: --c-accent for the accent, --c-ink for text.
 * Reduced-motion collapses to the static word "before".
 */

const WORDS = ["before", "faster than", "cheaper than", "smarter than"] as const;
const CYCLE_MS = 2400;

export default function HeroAnim() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), CYCLE_MS);
    return () => clearInterval(t);
  }, [reduce]);

  const word = reduce ? WORDS[0] : WORDS[i];

  return (
    <section className="ha-hero">
      {/* masked grid */}
      <div className="ha-grid" aria-hidden="true" />
      {/* radial sunrise */}
      <div className="ha-glow" aria-hidden="true" />

      <div className="ha-inner">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="ha-eyebrow"
        >
          <span className="ha-eyebrow-dot" />
          Trend radar for cross-border sellers
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="ha-title"
        >
          See it in China{" "}
          <span className="ha-emphasis">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={word}
                initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -16, filter: "blur(6px)" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="ha-word"
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </span>
          {"\n"}the window shuts.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="ha-sub"
        >
          We match what&apos;s trending on Douyin and Xiaohongshu to a factory
          price on 1688, dated the day we saw it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="ha-ctas"
        >
          <Link href="/login" className="ha-cta ha-cta-primary">
            Get started
            <i className="ph ph-arrow-right" />
          </Link>
          <Link href="/pricing" className="ha-cta ha-cta-ghost">
            See pricing
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="ha-badges"
          aria-label="What every alert carries"
        >
          <span className="ha-badge">
            <i className="ph-fill ph-heart" /> Demand proof
          </span>
          <span className="ha-badge ha-badge-dot">·</span>
          <span className="ha-badge">
            <i className="ph-fill ph-factory" /> Factory match
          </span>
          <span className="ha-badge ha-badge-dot">·</span>
          <span className="ha-badge">
            <i className="ph-fill ph-chart-line-up" /> Live margin
          </span>
        </motion.div>
      </div>

      <style>{`
        .ha-hero{position:relative;overflow:hidden;padding:100px 20px 84px;isolation:isolate}
        @media(min-width:768px){.ha-hero{padding:130px 24px 100px}}
        .ha-inner{position:relative;z-index:2;max-width:900px;margin:0 auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px}
        .ha-grid{position:absolute;inset:0;z-index:0;opacity:.55;background-image:linear-gradient(to right,var(--c-line) 1px,transparent 1px),linear-gradient(to bottom,var(--c-line) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse 78% 55% at 50% 20%,#000 55%,transparent 100%);mask-image:radial-gradient(ellipse 78% 55% at 50% 20%,#000 55%,transparent 100%)}
        .ha-glow{position:absolute;left:50%;top:78%;z-index:0;width:min(140%,1400px);height:640px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(closest-side,color-mix(in oklab,var(--c-accent) 22%,transparent) 0%,color-mix(in oklab,var(--c-accent) 8%,transparent) 42%,transparent 76%);pointer-events:none;filter:blur(4px)}
        .ha-eyebrow{display:inline-flex;align-items:center;gap:9px;font-family:var(--font-mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-muted);background:color-mix(in oklab,var(--c-surface-2) 60%,transparent);border:1px solid var(--c-line);padding:7px 15px;border-radius:999px;backdrop-filter:blur(6px)}
        .ha-eyebrow-dot{width:7px;height:7px;border-radius:50%;background:var(--c-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--c-accent) 20%,transparent);animation:ha-pulse 2.2s ease-in-out infinite}
        @keyframes ha-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}
        .ha-title{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(2.6rem,7vw,5.4rem);line-height:.98;letter-spacing:-.03em;color:var(--c-ink);max-width:18ch;white-space:pre-line;background:linear-gradient(180deg,var(--c-ink) 55%,color-mix(in oklab,var(--c-ink) 55%,transparent));-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
        .ha-emphasis{position:relative;display:inline-block;vertical-align:baseline;padding:0 .05em;min-width:5.5ch;text-align:left}
        @media(min-width:768px){.ha-emphasis{min-width:7ch}}
        .ha-word{display:inline-block;background:linear-gradient(96deg,var(--c-accent),var(--c-xhs) 55%,var(--c-1688));-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent}
        .ha-sub{max-width:52ch;font-size:clamp(1rem,1.4vw,1.15rem);line-height:1.55;color:var(--c-muted)}
        .ha-ctas{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:8px}
        .ha-cta{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;font-family:var(--font-geist-sans);font-weight:600;font-size:.95rem;transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,background .2s,color .2s}
        .ha-cta i{font-size:.95em;transition:transform .22s cubic-bezier(.34,1.56,.64,1)}
        .ha-cta-primary{background:var(--c-accent);color:var(--c-onaccent,#fff);box-shadow:0 10px 26px -8px color-mix(in oklab,var(--c-accent) 55%,transparent)}
        .ha-cta-primary:hover{transform:translateY(-2px) scale(1.02);box-shadow:0 16px 34px -8px color-mix(in oklab,var(--c-accent) 70%,transparent)}
        .ha-cta-primary:hover i{transform:translateX(3px)}
        .ha-cta-ghost{background:transparent;color:var(--c-ink);border:1.5px solid var(--c-line-strong)}
        .ha-cta-ghost:hover{transform:translateY(-2px);border-color:var(--c-ink);background:var(--c-surface-2)}
        .ha-badges{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center;margin-top:14px;font-family:var(--font-mono);font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted)}
        .ha-badge{display:inline-flex;align-items:center;gap:6px;padding:2px 4px}
        .ha-badge i{color:var(--c-accent);font-size:.85rem}
        .ha-badge-dot{color:var(--c-line-strong);padding:0 4px}
        @media (prefers-reduced-motion:reduce){
          .ha-eyebrow-dot{animation:none}
        }
      `}</style>
    </section>
  );
}
