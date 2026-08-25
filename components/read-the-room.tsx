"use client";

import { useEffect, useRef, useState } from "react";

/*
 * "Stop guessing. Read the room." — interactive console.
 * Adapted from Mint Studio's `.room` pattern (activity-mint.vercel.app):
 * left rail of clickable signal tabs, auto-cycling with a progress bar,
 * right panel swaps between live-swapping visualizations.
 *
 * All five signals stay anchored to ONE concrete example already used
 * elsewhere on this page (the Xiaohongshu steam pet brush from the
 * "Listing created in seconds" section), so the numbers read as one
 * coherent product read rather than a grab-bag of invented stats.
 */

type SignalId = "demand" | "sentiment" | "ads" | "terms" | "competitors";

type Signal = {
  id: SignalId;
  icon: string;
  label: string;
  sub: string;
  tag: string;
  title: string;
  caption: string;
};

const SIGNALS: Signal[] = [
  {
    id: "demand",
    icon: "ph-heart",
    label: "Demand",
    sub: "Saves vs. likes, by platform",
    tag: "Demand",
    title: "Xiaohongshu is where this is actually moving.",
    caption: "0.96 saves-to-likes on Xiaohongshu, people are bookmarking to buy, not just scrolling past.",
  },
  {
    id: "sentiment",
    icon: "ph-chat-circle-text",
    label: "Sentiment",
    sub: "Comment tone on the viral post",
    tag: "Sentiment",
    title: "Comments read overwhelmingly positive.",
    caption: "82 of the last 100 comments on the source post are positive or asking where to buy it.",
  },
  {
    id: "ads",
    icon: "ph-play-circle",
    label: "Ad performance",
    sub: "TikTok Shop ads on this product",
    tag: "Ad performance",
    title: "One ad is carrying the whole campaign.",
    caption: "A 9-day-old demo ad is outperforming the other two combined, that's the angle worth copying.",
  },
  {
    id: "terms",
    icon: "ph-hash",
    label: "Trending terms",
    sub: "Words pulled from captions and comments",
    tag: "Trending terms",
    title: "The words buyers are actually using.",
    caption: "\"Steam clean\" and \"5-min groom\" outrank the generic \"pet brush\" by a wide margin.",
  },
  {
    id: "competitors",
    icon: "ph-storefront",
    label: "Competitors",
    sub: "Who else is already listing it",
    tag: "Competitors",
    title: "Three sellers are in. The window is narrowing.",
    caption: "First competing listing went up 4 days after our alert. Price is still holding above factory cost.",
  },
];

const CYCLE_MS = 4200;

export default function ReadTheRoom() {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Record<number, boolean>>({ 0: true });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotionRef.current) startTimer();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer() {
    stopTimer();
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SIGNALS.length);
    }, CYCLE_MS);
  }

  function pick(i: number) {
    if (i === active) return;
    setActive(i);
    if (!reduceMotionRef.current) startTimer();
  }

  useEffect(() => {
    setSeen((prev) => (prev[active] ? prev : { ...prev, [active]: true }));
  }, [active]);

  const sig = SIGNALS[active];

  return (
    <div className="rtr-console">
      <div className="rtr-glow" aria-hidden="true" />
      <div className="rtr-glow g2" aria-hidden="true" />

      <div className="rtr-rail" role="tablist" aria-label="Signal types for this product">
        {SIGNALS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`rtr-signal ${i === active ? "active" : ""}`}
            onClick={() => pick(i)}
          >
            <span className="rtr-si">
              <i className={`ph-fill ${s.icon}`} />
            </span>
            <span className="rtr-sg">
              <b>{s.label}</b>
              <span>{s.sub}</span>
            </span>
            <i className="ph ph-caret-right rtr-schev" />
            {i === active && !reduceMotionRef.current && (
              <span key={`bar-${active}`} className="rtr-sbar run" />
            )}
          </button>
        ))}
      </div>

      <div className="rtr-panel">
        <div className="rtr-scanline" aria-hidden="true" />
        <div className="rtr-head">
          <span className="rtr-tag">{sig.tag}</span>
          <span className="rtr-live">
            <span className="lv" aria-hidden="true" />
            Live read
          </span>
        </div>
        <h3 className="rtr-title">{sig.title}</h3>
        <p className="rtr-cap">{sig.caption}</p>
        <div className="rtr-stage">
          {SIGNALS.map((s, i) =>
            seen[i] ? (
              <div key={s.id} className={`rtr-view ${i === active ? "on" : ""}`}>
                <Viz id={s.id} live={i === active} />
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

function Viz({ id, live }: { id: SignalId; live: boolean }) {
  if (id === "demand") return <DemandBars live={live} />;
  if (id === "sentiment") return <SentimentGauge live={live} />;
  if (id === "ads") return <AdBars live={live} />;
  if (id === "terms") return <TermCloud live={live} />;
  return <Competitors live={live} />;
}

function DemandBars({ live }: { live: boolean }) {
  const bars = [
    { label: "Douyin", value: 0.61, hue: "var(--c-douyin)" },
    { label: "Xiaohongshu", value: 0.96, hue: "var(--c-xhs)", top: true },
    { label: "TikTok Shop", value: 0.44, hue: "var(--c-taobao)" },
    { label: "Instagram", value: 0.29, hue: "var(--c-accent)" },
  ];
  return (
    <div className="rtr-bars-wrap">
      <div className="rtr-bars">
        {bars.map((b) => (
          <div key={b.label} className={`rtr-bar-col ${b.top ? "top" : ""}`}>
            <div className="rtr-bar-track">
              <div
                className="rtr-bar-fill"
                style={{ height: live ? `${b.value * 100}%` : "0%", background: b.hue }}
              >
                <span className="rtr-bar-val">{b.value.toFixed(2)}</span>
              </div>
            </div>
            <p className="rtr-bar-lbl">{b.label}</p>
          </div>
        ))}
      </div>
      <span className="rtr-flag">
        <i className="ph-fill ph-check-circle" />
        Xiaohongshu leads by a wide margin
      </span>
    </div>
  );
}

function SentimentGauge({ live }: { live: boolean }) {
  const score = 82;
  const angle = -90 + 180 * (score / 100);
  const chips: { t: string; kind: "pos" | "amb" }[] = [
    { t: "shed less", kind: "pos" },
    { t: "kids love it", kind: "pos" },
    { t: "a bit pricey", kind: "amb" },
  ];
  return (
    <div className="rtr-gauge-wrap">
      <div className="rtr-gauge">
        <svg viewBox="0 0 230 130">
          <path
            d="M15 120 A100 100 0 0 1 215 120"
            fill="none"
            stroke="var(--c-line)"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d="M15 120 A100 100 0 0 1 215 120"
            fill="none"
            stroke="var(--c-accent)"
            strokeWidth={14}
            strokeLinecap="round"
            style={{
              strokeDasharray: 314,
              strokeDashoffset: live ? 314 - 314 * (score / 100) : 314,
              transition: "stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)",
            }}
          />
        </svg>
        <div
          className="rtr-needle"
          style={{ transform: `rotate(${live ? angle : -90}deg)` }}
        />
        <div className="rtr-gauge-val">
          {score}
          <small>/100 positive</small>
        </div>
      </div>
      <div className="rtr-senti-chips">
        {chips.map((c, i) => (
          <span
            key={c.t}
            className={`rtr-chip ${c.kind} ${live ? "in" : ""}`}
            style={{ transitionDelay: `${i * 0.12}s` }}
          >
            {c.t}
          </span>
        ))}
      </div>
    </div>
  );
}

function AdBars({ live }: { live: boolean }) {
  const ads = [
    { name: "Ad A, steam demo", days: 9, share: 71, win: true },
    { name: "Ad B, unboxing", days: 22, share: 19, win: false },
    { name: "Ad C, discount", days: 5, share: 10, win: false },
  ];
  return (
    <div className="rtr-ads">
      {ads.map((a) => (
        <div key={a.name} className={`rtr-ad ${a.win ? "win" : ""}`}>
          <div className="rtr-ad-top">
            <b>{a.name}</b>
            <span className="rtr-ad-days">{a.days}d running</span>
          </div>
          <div className="rtr-ad-track">
            <div className="rtr-ad-fill" style={{ width: live ? `${a.share}%` : "0%" }} />
          </div>
          {a.win && (
            <span className={`rtr-ad-flag ${live ? "in" : ""}`}>Carrying the campaign</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TermCloud({ live }: { live: boolean }) {
  const terms: { t: string; size: "lg" | "md" | "base" }[] = [
    { t: "steam clean", size: "lg" },
    { t: "5-min groom", size: "lg" },
    { t: "shed less", size: "md" },
    { t: "pet brush", size: "base" },
    { t: "for cats", size: "base" },
    { t: "for dogs", size: "md" },
    { t: "gift idea", size: "base" },
  ];
  return (
    <div className="rtr-terms">
      {terms.map((tm, i) => (
        <span
          key={tm.t}
          className={`rtr-term ${tm.size} ${live ? "in" : ""}`}
          style={{ transitionDelay: `${i * 0.05}s` }}
        >
          {tm.t}
        </span>
      ))}
    </div>
  );
}

function Competitors({ live }: { live: boolean }) {
  const rows = [
    { name: "Seller A", hue: "var(--c-xhs)", days: "4d in", note: "matched our price" },
    { name: "Seller B", hue: "var(--c-1688)", days: "2d in", note: "10% below" },
    { name: "Seller C", hue: "var(--c-taobao)", days: "today", note: "just listed" },
  ];
  return (
    <div className="rtr-compet-wrap">
      <div className="rtr-compet">
        {rows.map((r, i) => (
          <div key={r.name} className={`rtr-ct ${live ? "in" : ""}`} style={{ transitionDelay: `${i * 0.12}s` }}>
            <span className="rtr-cdot" style={{ background: r.hue }} />
            <span className="rtr-cnm">{r.name}</span>
            <span className="rtr-cnote">{r.note}</span>
            <span className="rtr-ctrend">
              <i className="ph-fill ph-trend-up" />
              {r.days}
            </span>
          </div>
        ))}
      </div>
      <p className="rtr-window">
        First competitor listed 4 days after our alert. The window is still open, but narrowing.
      </p>
    </div>
  );
}
