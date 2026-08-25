"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

/*
 * "Built for every seller" — magnified bento.
 *
 * Replaces the static two-row pill list with an interactive 8-tile bento.
 * Pattern inspired by 21st.dev's Magnified Bento (0xUrvish, id 10470):
 * a mouse-tracked magnification effect where the tile under the cursor
 * gently scales up and adjacent tiles ease with it. Each tile carries a
 * real signature-product example for that niche (matching the POOL data
 * in RadarLive so the story stays coherent). Clicking a tile expands a
 * detail row below the grid with the full signal shape.
 *
 * All motion goes through motion values (never React state) per skill
 * guidance; reduced-motion collapses to static.
 */

type Niche = {
  id: string;
  name: string;
  icon: string;
  hue: string;
  example: {
    name: string;
    platform: "XHS" | "Douyin" | "1688" | "Taobao";
    glyph: string;
    platHue: string;
    intent: number;
    factoryPrice: string;
    sellSpread: string;
    firstSeen: string;
  };
};

const NICHES: Niche[] = [
  {
    id: "pet",
    name: "Pet supplies",
    icon: "ph-paw-print",
    hue: "var(--c-xhs)",
    example: {
      name: "Steam-spray pet brush",
      platform: "XHS",
      glyph: "红",
      platHue: "var(--c-xhs)",
      intent: 0.96,
      factoryPrice: "¥14.00",
      sellSpread: "A$18-28",
      firstSeen: "6d",
    },
  },
  {
    id: "baby",
    name: "Baby and kids",
    icon: "ph-baby",
    hue: "var(--c-taobao)",
    example: {
      name: "Baby silicone bib set",
      platform: "Taobao",
      glyph: "淘",
      platHue: "var(--c-taobao)",
      intent: 0.83,
      factoryPrice: "¥9.50",
      sellSpread: "A$16-24",
      firstSeen: "4d",
    },
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: "ph-cooking-pot",
    hue: "var(--c-1688)",
    example: {
      name: "Portable espresso press",
      platform: "1688",
      glyph: "16",
      platHue: "var(--c-1688)",
      intent: 0.58,
      factoryPrice: "¥42.00",
      sellSpread: "A$59-89",
      firstSeen: "12d",
    },
  },
  {
    id: "beauty",
    name: "Beauty",
    icon: "ph-sparkle",
    hue: "var(--c-xhs)",
    example: {
      name: "Refillable capsule blush",
      platform: "XHS",
      glyph: "红",
      platHue: "var(--c-xhs)",
      intent: 0.79,
      factoryPrice: "¥11.00",
      sellSpread: "A$22-38",
      firstSeen: "5d",
    },
  },
  {
    id: "fitness",
    name: "Fitness",
    icon: "ph-barbell",
    hue: "var(--c-taobao)",
    example: {
      name: "Foldable resistance band kit",
      platform: "Taobao",
      glyph: "淘",
      platHue: "var(--c-taobao)",
      intent: 0.52,
      factoryPrice: "¥18.00",
      sellSpread: "A$25-42",
      firstSeen: "11d",
    },
  },
  {
    id: "home",
    name: "Home",
    icon: "ph-house-line",
    hue: "var(--c-douyin)",
    example: {
      name: "Silicone night-light lamp",
      platform: "Douyin",
      glyph: "抖",
      platHue: "var(--c-douyin)",
      intent: 0.71,
      factoryPrice: "¥22.00",
      sellSpread: "A$34-52",
      firstSeen: "9d",
    },
  },
  {
    id: "phone",
    name: "Phone accessories",
    icon: "ph-device-mobile",
    hue: "var(--c-accent)",
    example: {
      name: "Magnetic phone tripod",
      platform: "Douyin",
      glyph: "抖",
      platHue: "var(--c-douyin)",
      intent: 0.67,
      factoryPrice: "¥13.00",
      sellSpread: "A$19-32",
      firstSeen: "8d",
    },
  },
  {
    id: "outdoor",
    name: "Outdoor",
    icon: "ph-mountains",
    hue: "var(--c-1688)",
    example: {
      name: "Solar collapsible lantern",
      platform: "1688",
      glyph: "16",
      platHue: "var(--c-1688)",
      intent: 0.61,
      factoryPrice: "¥28.00",
      sellSpread: "A$36-58",
      firstSeen: "14d",
    },
  },
];

const RADIUS = 260; // px — magnification falloff radius

export default function NicheBento() {
  const [selected, setSelected] = useState<string>(NICHES[0].id);
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(-999);
  const mouseY = useMotionValue(-999);
  const mouseXSpring = useSpring(mouseX, { stiffness: 300, damping: 40 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 300, damping: 40 });

  useEffect(() => {
    if (reduce) return;
    const el = gridRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };
    const onLeave = () => {
      mouseX.set(-999);
      mouseY.set(-999);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY, reduce]);

  const active = NICHES.find((n) => n.id === selected) ?? NICHES[0];

  return (
    <div className="nb-wrap">
      <div className="nb-head">
        <h3 className="nb-label">
          Built for <span className="spectrum-text">every seller.</span>
        </h3>
        <p className="nb-sub">
          Hover to browse. Click a niche to see a real signal we've indexed there.
        </p>
      </div>

      <div className="nb-grid" ref={gridRef}>
        {NICHES.map((n) => (
          <Tile
            key={n.id}
            niche={n}
            selected={n.id === selected}
            onSelect={() => setSelected(n.id)}
            mouseX={mouseXSpring}
            mouseY={mouseYSpring}
            reduce={!!reduce}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="nb-detail"
        >
          <div className="nb-detail-head">
            <span className="nb-plat" style={{ background: active.example.platHue }}>
              {active.example.glyph}
            </span>
            <div className="nb-detail-body">
              <span className="nb-detail-name">{active.example.name}</span>
              <span className="nb-detail-niche">
                {active.example.platform} · {active.name.toLowerCase()}
              </span>
            </div>
            <span className="nb-detail-stage">Rising</span>
          </div>
          <div className="nb-detail-facts">
            <Fact label="Intent">
              <span className="nb-fact-bar-track">
                <span
                  className="nb-fact-bar"
                  style={{
                    width: `${Math.round(active.example.intent * 100)}%`,
                    background: active.example.platHue,
                  }}
                />
              </span>
              <span className="nb-fact-mono">{active.example.intent.toFixed(2)}</span>
            </Fact>
            <Fact label="Factory unit">
              <span className="nb-fact-mono">{active.example.factoryPrice}</span>
              <span className="nb-fact-sub">on 1688</span>
            </Fact>
            <Fact label="Sell spread">
              <span className="nb-fact-mono nb-fact-hi">{active.example.sellSpread}</span>
              <span className="nb-fact-sub">TikTok Shop</span>
            </Fact>
            <Fact label="First seen">
              <span className="nb-fact-mono">{active.example.firstSeen}</span>
              <span className="nb-fact-sub">ago, logged</span>
            </Fact>
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        .nb-wrap{display:flex;flex-direction:column;gap:24px}
        .nb-head{max-width:640px;margin:0 auto;text-align:center;display:flex;flex-direction:column;gap:8px}
        .nb-label{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(1.7rem,3.8vw,2.7rem);letter-spacing:-.025em;line-height:1.05;color:var(--c-ink)}
        .nb-sub{font-size:.92rem;color:var(--c-muted)}
        .nb-grid{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:6px}
        @media(max-width:760px){.nb-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
        .nb-detail{max-width:720px;margin:0 auto;background:#fff;border:1px solid var(--c-line);border-radius:16px;padding:18px 20px;box-shadow:0 14px 32px -18px rgba(14,21,36,.14);display:flex;flex-direction:column;gap:14px}
        .nb-detail-head{display:flex;align-items:center;gap:14px}
        .nb-plat{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:15px;flex-shrink:0}
        .nb-detail-body{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
        .nb-detail-name{font-family:var(--font-geist-sans);font-weight:700;font-size:1.02rem;color:var(--c-ink)}
        .nb-detail-niche{font-family:var(--font-mono);font-size:.66rem;color:var(--c-muted);letter-spacing:.02em}
        .nb-detail-stage{font-family:var(--font-mono);font-size:.62rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:4px 10px;border-radius:999px;background:color-mix(in oklab,var(--c-accent) 12%,transparent);color:var(--c-accent);border:1px solid color-mix(in oklab,var(--c-accent) 24%,transparent)}
        .nb-detail-facts{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:14px;padding-top:14px;border-top:1px solid var(--c-line)}
        @media(max-width:760px){.nb-detail-facts{grid-template-columns:1fr 1fr;gap:12px}}
        .nb-fact{display:flex;flex-direction:column;gap:5px;min-width:0}
        .nb-fact-lbl{font-family:var(--font-mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted)}
        .nb-fact-inner{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}
        .nb-fact-bar-track{position:relative;flex:1;height:6px;border-radius:999px;background:var(--c-line);overflow:hidden;min-width:60px}
        .nb-fact-bar{display:block;height:100%;border-radius:999px;transition:width .8s cubic-bezier(.22,1,.36,1)}
        .nb-fact-mono{font-family:var(--font-mono);font-weight:700;font-size:.9rem;color:var(--c-ink);white-space:nowrap}
        .nb-fact-hi{color:var(--c-accent)}
        .nb-fact-sub{font-family:var(--font-mono);font-size:.62rem;color:var(--c-muted);letter-spacing:.02em}
      `}</style>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="nb-fact">
      <span className="nb-fact-lbl">{label}</span>
      <div className="nb-fact-inner">{children}</div>
    </div>
  );
}

function Tile({
  niche,
  selected,
  onSelect,
  mouseX,
  mouseY,
  reduce,
}: {
  niche: Niche;
  selected: boolean;
  onSelect: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mouseX: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mouseY: any;
  reduce: boolean;
}) {
  const tileRef = useRef<HTMLButtonElement>(null);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const measure = () => {
      const el = tileRef.current;
      const grid = el?.parentElement;
      if (!el || !grid) return;
      const rect = el.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      setCenter({
        x: rect.left - gridRect.left + rect.width / 2,
        y: rect.top - gridRect.top + rect.height / 2,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const distance = useTransform([mouseX, mouseY], (v) => {
    const [mx, my] = v as [number, number];
    const dx = mx - center.x;
    const dy = my - center.y;
    return Math.sqrt(dx * dx + dy * dy);
  });

  const scale = useTransform(distance, [0, RADIUS], [1.07, 1]);
  const lift = useTransform(distance, [0, RADIUS], [-6, 0]);

  return (
    <motion.button
      ref={tileRef}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`nb-tile ${selected ? "on" : ""}`}
      style={reduce ? undefined : { scale, y: lift }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <span className="nb-tile-plat" style={{ background: niche.example.platHue }}>
        {niche.example.glyph}
      </span>
      <span className="nb-tile-ic" style={{ background: niche.hue }}>
        <i className={`ph-fill ${niche.icon}`} />
      </span>
      <span className="nb-tile-name">{niche.name}</span>
      <span className="nb-tile-example">{niche.example.name}</span>
      <span className="nb-tile-intent">
        <span className="nb-tile-bar-track">
          <span
            className="nb-tile-bar"
            style={{
              width: `${Math.round(niche.example.intent * 100)}%`,
              background: niche.hue,
            }}
          />
        </span>
        <span className="nb-tile-intent-v">{niche.example.intent.toFixed(2)}</span>
      </span>
      <style>{`
        .nb-tile{position:relative;display:flex;flex-direction:column;gap:8px;text-align:left;padding:16px 14px;border-radius:14px;background:#fff;border:1.5px solid var(--c-line);cursor:pointer;overflow:hidden;transition:border-color .25s,box-shadow .25s;will-change:transform}
        .nb-tile:hover{border-color:var(--c-line-strong);box-shadow:0 12px 28px -14px rgba(14,21,36,.14);z-index:2}
        .nb-tile.on{border-color:var(--c-accent);box-shadow:0 12px 28px -12px color-mix(in oklab,var(--c-accent) 30%,transparent),inset 0 0 0 1px var(--c-accent);z-index:3}
        .nb-tile-plat{position:absolute;top:12px;right:12px;width:22px;height:22px;border-radius:7px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:11px;opacity:.9}
        .nb-tile-ic{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;color:#fff;font-size:1.05rem}
        .nb-tile-name{font-family:var(--font-geist-sans);font-weight:700;font-size:.94rem;color:var(--c-ink);line-height:1.15}
        .nb-tile-example{font-family:var(--font-mono);font-size:.66rem;color:var(--c-muted);letter-spacing:.01em;line-height:1.35;height:1.75em;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
        .nb-tile-intent{display:flex;align-items:center;gap:8px;margin-top:4px}
        .nb-tile-bar-track{position:relative;flex:1;height:5px;border-radius:999px;background:var(--c-line);overflow:hidden}
        .nb-tile-bar{display:block;height:100%;border-radius:999px;transition:width 1s cubic-bezier(.22,1,.36,1)}
        .nb-tile-intent-v{font-family:var(--font-mono);font-size:.68rem;font-weight:700;color:var(--c-ink)}
      `}</style>
    </motion.button>
  );
}
