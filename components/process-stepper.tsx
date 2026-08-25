"use client";

import { useEffect, useRef, useState } from "react";

/*
 * "From signal to listing" — interactive stepper.
 *
 * Replaces the old process section that stacked three tiny illustrations
 * of a person with a magnifying glass on the left, then repeated the SAME
 * illustration in a big panel on the right. This shows the three steps as
 * pills across the top, then swaps the right-hand panel between three
 * real product-UI mockups (radar row → 1688 supplier match → watchlist
 * delta) so the visual actually tells the story.
 *
 * Auto-advances every 5s. Pauses on any interaction.
 */

const STEP_CYCLE_MS = 5000;

type Step = {
  id: "spot" | "match" | "list";
  n: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    id: "spot",
    n: "01",
    title: "We spot the demand.",
    body: "Saves beating likes on Xiaohongshu means bookmark-to-buy intent, not vanity views. Every candidate is scored before we look further.",
  },
  {
    id: "match",
    n: "02",
    title: "We match the factory.",
    body: "1688 and Taobao are checked for every candidate, including a reverse image search from the viral photo, so the unit cost is real, not a guess.",
  },
  {
    id: "list",
    n: "03",
    title: "You list it first.",
    body: "The alert carries the unit cost and the live TikTok Shop spread, so you can price and list the same day. Watchlist tracks it from there.",
  },
];

export default function ProcessStepper() {
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<Record<number, boolean>>({ 0: true });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotionRef.current) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSeen((prev) => (prev[active] ? prev : { ...prev, [active]: true }));
  }, [active]);

  function start() {
    stop();
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, STEP_CYCLE_MS);
  }

  function stop() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function pick(i: number) {
    if (i === active) return;
    setActive(i);
    if (!reduceMotionRef.current) start();
  }

  const s = STEPS[active];

  return (
    <div className="ps-wrap">
      <div className="ps-rail" role="tablist" aria-label="How China Trend Signal works">
        {STEPS.map((st, i) => (
          <button
            key={st.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`ps-tab ${i === active ? "on" : ""}`}
            onClick={() => pick(i)}
          >
            <span className="ps-num">{st.n}</span>
            <span className="ps-lbl">{st.title.replace(/\.$/, "")}</span>
            {i === active && !reduceMotionRef.current && (
              <span key={`bar-${active}`} className="ps-bar run" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      <div className="ps-panel">
        <div className="ps-copy">
          <span className="ps-eyebrow">Step {s.n}</span>
          <h3 className="ps-title">{s.title}</h3>
          <p className="ps-body">{s.body}</p>
        </div>
        <div className="ps-stage">
          {STEPS.map((st, i) =>
            seen[i] ? (
              <div key={st.id} className={`ps-view ${i === active ? "on" : ""}`}>
                {st.id === "spot" && <SpotMock live={i === active} />}
                {st.id === "match" && <MatchMock live={i === active} />}
                {st.id === "list" && <ListMock live={i === active} />}
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

/* ── mockup 1: Radar row picking up demand on XHS ── */
function SpotMock({ live }: { live: boolean }) {
  return (
    <div className="mock mock-radar" aria-label="Radar detecting bookmark-to-buy intent">
      <div className="mock-head">
        <span className="mock-title">
          <i className="ph-fill ph-radar" /> Radar · Pet supplies
        </span>
        <span className="mock-pill mock-pill-live">
          <span className="mock-dot" /> Live
        </span>
      </div>
      <div className="mock-rows">
        <div className="mr">
          <span className="mr-plat" style={{ background: "var(--c-xhs)" }}>红</span>
          <span className="mr-name">Steam-spray pet brush</span>
          <span className="mr-intent">
            <span className="mr-bar-track">
              <span className="mr-bar" style={{ width: live ? "96%" : "0%" }} />
            </span>
            <span className="mr-intent-v">0.96</span>
          </span>
          <span className="mr-stage mr-rising">Rising</span>
          <span className="mr-first">6d</span>
        </div>
        <div className="mr mr-dim">
          <span className="mr-plat" style={{ background: "var(--c-douyin)" }}>抖</span>
          <span className="mr-name">Silicone grooming glove</span>
          <span className="mr-intent">
            <span className="mr-bar-track">
              <span className="mr-bar" style={{ width: live ? "62%" : "0%", transitionDelay: "0.12s" }} />
            </span>
            <span className="mr-intent-v">0.62</span>
          </span>
          <span className="mr-stage">Warm</span>
          <span className="mr-first">14d</span>
        </div>
        <div className="mr mr-dim">
          <span className="mr-plat" style={{ background: "var(--c-taobao)" }}>淘</span>
          <span className="mr-name">Slow-feeder bowl, ceramic</span>
          <span className="mr-intent">
            <span className="mr-bar-track">
              <span className="mr-bar" style={{ width: live ? "38%" : "0%", transitionDelay: "0.24s" }} />
            </span>
            <span className="mr-intent-v">0.38</span>
          </span>
          <span className="mr-stage">Watch</span>
          <span className="mr-first">3d</span>
        </div>
      </div>
      <div className="mock-caption">
        <i className="ph-fill ph-cursor-click" /> The row you'd click first, ranked by saves-to-likes.
      </div>
    </div>
  );
}

/* ── mockup 2: 1688 supplier match panel ── */
function MatchMock({ live }: { live: boolean }) {
  const rows = [
    { name: "Guangzhou Yuanbo Pet Co.", price: "¥14.00", moq: "MOQ 100", rating: "4.8", top: true },
    { name: "Ningbo Cixi Handi Trading", price: "¥15.20", moq: "MOQ 200", rating: "4.6", top: false },
    { name: "Yiwu Chengfeng Import Ltd.", price: "¥16.80", moq: "MOQ 50", rating: "4.4", top: false },
  ];
  return (
    <div className="mock mock-match" aria-label="1688 supplier match">
      <div className="mock-head">
        <span className="mock-title">
          <i className="ph-fill ph-factory" /> Supplier match · 1688
        </span>
        <span className="mock-pill">
          <i className="ph-fill ph-image" /> Reverse image
        </span>
      </div>
      <div className="mm-search">
        <i className="ph ph-magnifying-glass" />
        <span>steam-spray pet brush</span>
        <span className="mm-search-ct">3 matches</span>
      </div>
      <div className="mm-rows">
        {rows.map((r, i) => (
          <div key={r.name} className={`mm-row ${r.top ? "mm-top" : ""}`} style={{ transitionDelay: live ? `${i * 0.1}s` : "0s" }}>
            <div className="mm-thumb" style={{ background: r.top ? "var(--c-1688)" : "var(--c-line-strong)" }}>
              <i className="ph-fill ph-cube" />
            </div>
            <div className="mm-body">
              <span className="mm-name">{r.name}</span>
              <span className="mm-meta">
                <span>{r.moq}</span>
                <span className="mm-dot">·</span>
                <span>
                  <i className="ph-fill ph-star" /> {r.rating}
                </span>
              </span>
            </div>
            <span className="mm-price">{r.price}</span>
          </div>
        ))}
      </div>
      <div className="mock-caption">
        <i className="ph-fill ph-check-circle" /> Verified unit cost, not a guess.
      </div>
    </div>
  );
}

/* ── mockup 3: Watchlist "since you saved" delta ── */
function ListMock({ live }: { live: boolean }) {
  return (
    <div className="mock mock-list" aria-label="Watchlist tracking climbing intent">
      <div className="mock-head">
        <span className="mock-title">
          <i className="ph-fill ph-bookmarks" /> Watchlist · Since you saved
        </span>
        <span className="mock-pill mock-pill-win">
          <i className="ph-fill ph-trend-up" /> Climbing
        </span>
      </div>
      <div className="wl-hero">
        <div className="wl-thumb" style={{ background: "var(--c-xhs)" }}>
          <i className="ph-fill ph-paw-print" />
        </div>
        <div className="wl-body">
          <span className="wl-name">Steam-spray pet brush</span>
          <span className="wl-sub">XHS · saved 4 days ago</span>
        </div>
        <span className="wl-delta">
          <span className="wl-delta-num" style={{ opacity: live ? 1 : 0 }}>+42%</span>
          <span className="wl-delta-lbl">engagement</span>
        </span>
      </div>
      <div className="wl-facts">
        <div className="wl-fact">
          <span className="wl-fact-lbl">Factory unit</span>
          <span className="wl-fact-val">¥14.00</span>
        </div>
        <div className="wl-fact">
          <span className="wl-fact-lbl">Sell spread</span>
          <span className="wl-fact-val wl-fact-hi">A$18-28</span>
        </div>
        <div className="wl-fact">
          <span className="wl-fact-lbl">Margin</span>
          <span className="wl-fact-val wl-fact-hi">25-40×</span>
        </div>
      </div>
      <div className="wl-cta">
        <span className="wl-cta-lbl">Price and list the same day.</span>
        <button className="wl-cta-btn" type="button" tabIndex={-1}>
          Open listing draft <i className="ph-fill ph-arrow-right" />
        </button>
      </div>
    </div>
  );
}
