"use client";

import { useEffect, useRef, useState } from "react";

/*
 * "Your radar, live." — an animated feed of real-shaped signal rows.
 *
 * Replaces the broken "Signal scan / Your listing, read in seconds" section
 * (right column was empty because the scroll-reveal race left the .cts-bdna-row
 * elements at opacity:0). This shows the actual product surface the user
 * gets, not a stock illustration of what the product does.
 *
 * Header stats mirror the real /radar page: Signals · Rising · Median spread
 * · Longest tracked. Rows tick in one at a time (newest at top), and the
 * intent bar animates to its final width so the section is *always* moving
 * even when static, without being noisy.
 */

type Sig = {
  platform: "XHS" | "Douyin" | "1688" | "Taobao";
  glyph: string;
  hue: string;
  name: string;
  niche: string;
  intent: number; // 0-1
  spread: string; // "27×"
  stage: "Rising" | "Warm" | "Watch";
  first: string; // "6d"
};

const POOL: Sig[] = [
  { platform: "XHS", glyph: "红", hue: "var(--c-xhs)", name: "Steam-spray pet brush", niche: "Pet supplies", intent: 0.96, spread: "27×", stage: "Rising", first: "6d" },
  { platform: "Douyin", glyph: "抖", hue: "var(--c-douyin)", name: "Silicone night-light lamp", niche: "Home", intent: 0.71, spread: "18×", stage: "Rising", first: "9d" },
  { platform: "1688", glyph: "16", hue: "var(--c-1688)", name: "Portable espresso press", niche: "Kitchen", intent: 0.58, spread: "22×", stage: "Warm", first: "12d" },
  { platform: "Taobao", glyph: "淘", hue: "var(--c-taobao)", name: "Baby silicone bib set", niche: "Baby and kids", intent: 0.83, spread: "31×", stage: "Rising", first: "4d" },
  { platform: "XHS", glyph: "红", hue: "var(--c-xhs)", name: "Ceramic slow-feeder bowl", niche: "Pet supplies", intent: 0.44, spread: "16×", stage: "Watch", first: "3d" },
  { platform: "Douyin", glyph: "抖", hue: "var(--c-douyin)", name: "Magnetic phone tripod", niche: "Phone accessories", intent: 0.67, spread: "24×", stage: "Rising", first: "8d" },
  { platform: "XHS", glyph: "红", hue: "var(--c-xhs)", name: "Refillable capsule blush", niche: "Beauty", intent: 0.79, spread: "34×", stage: "Rising", first: "5d" },
  { platform: "Taobao", glyph: "淘", hue: "var(--c-taobao)", name: "Foldable resistance band kit", niche: "Fitness", intent: 0.52, spread: "20×", stage: "Warm", first: "11d" },
];

const TICK_MS = 3200;
const ROW_COUNT = 5;

export default function RadarLive() {
  const [rows, setRows] = useState<Sig[]>(() => POOL.slice(0, ROW_COUNT));
  const [pulse, setPulse] = useState(0);
  const cursorRef = useRef<number>(ROW_COUNT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotionRef.current) return;
    timerRef.current = setInterval(() => {
      cursorRef.current = (cursorRef.current + 1) % POOL.length;
      const next = POOL[cursorRef.current];
      setRows((prev) => [next, ...prev.slice(0, ROW_COUNT - 1)]);
      setPulse((p) => p + 1);
    }, TICK_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="rlv-wrap">
      <div className="rlv-stats">
        <Stat label="Signals" value="847" hue="var(--c-accent)" />
        <Stat label="Rising" value="34" hue="var(--c-xhs)" pulse />
        <Stat label="Median spread" value="27×" hue="var(--c-1688)" />
        <Stat label="Longest tracked" value="118d" hue="var(--c-taobao)" />
      </div>

      <div className="rlv-panel">
        <div className="rlv-bar">
          <span className="rlv-bar-title">
            <i className="ph-fill ph-radar" /> Radar · Live feed
          </span>
          <span className="rlv-bar-right">
            <span className="rlv-live">
              <span className="rlv-live-dot" /> Live
            </span>
            <span className="rlv-tick" key={pulse} aria-hidden="true">
              signal in
            </span>
          </span>
        </div>

        <div className="rlv-thead">
          <span className="rlv-col rlv-col-plat">Source</span>
          <span className="rlv-col rlv-col-name">Product</span>
          <span className="rlv-col rlv-col-intent">Intent</span>
          <span className="rlv-col rlv-col-spread">Spread</span>
          <span className="rlv-col rlv-col-stage">Stage</span>
          <span className="rlv-col rlv-col-first">First seen</span>
        </div>

        <div className="rlv-rows">
          {rows.map((r, i) => (
            <div
              key={`${r.platform}-${r.name}`}
              className={`rlv-row ${i === 0 ? "rlv-row-new" : ""} rlv-stage-${r.stage.toLowerCase()}`}
            >
              <span className="rlv-col rlv-col-plat">
                <span className="rlv-plat" style={{ background: r.hue }}>{r.glyph}</span>
                <span className="rlv-plat-name">{r.platform}</span>
              </span>
              <span className="rlv-col rlv-col-name">
                <span className="rlv-name">{r.name}</span>
                <span className="rlv-niche">{r.niche}</span>
              </span>
              <span className="rlv-col rlv-col-intent">
                <span className="rlv-bar-track">
                  <span
                    className="rlv-bar-fill"
                    style={{
                      width: `${Math.round(r.intent * 100)}%`,
                      background: r.hue,
                    }}
                  />
                </span>
                <span className="rlv-intent-v">{r.intent.toFixed(2)}</span>
              </span>
              <span className="rlv-col rlv-col-spread rlv-mono">{r.spread}</span>
              <span className="rlv-col rlv-col-stage">
                <span className={`rlv-pill rlv-pill-${r.stage.toLowerCase()}`}>{r.stage}</span>
              </span>
              <span className="rlv-col rlv-col-first rlv-mono">{r.first}</span>
            </div>
          ))}
        </div>

        <div className="rlv-foot">
          <span className="rlv-foot-lbl">
            <i className="ph-fill ph-clock" /> First-seen dated, so you know how much window is left.
          </span>
          <span className="rlv-foot-cta">
            <i className="ph-fill ph-arrow-right" /> Open the radar
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hue,
  pulse,
}: {
  label: string;
  value: string;
  hue: string;
  pulse?: boolean;
}) {
  return (
    <div className="rlv-stat">
      <span className="rlv-stat-lbl">
        {pulse && <span className="rlv-stat-pulse" style={{ background: hue }} aria-hidden="true" />}
        {label}
      </span>
      <span className="rlv-stat-val" style={{ color: hue }}>{value}</span>
    </div>
  );
}
