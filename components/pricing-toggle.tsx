"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/*
 * Interactive pricing with monthly/yearly toggle. Pattern adapted from
 * 21st.dev's `sshahaider/pricing-4` (Pricing Section with Frequency
 * Toggle) — three tiers, animated price crossfade, popular highlight,
 * yearly discount badge — but rewritten against CTS's design tokens
 * (var(--c-accent), var(--c-ink), Geist type, Phosphor icons) rather
 * than pulling in shadcn's Button / lucide / @number-flow.
 */

type Frequency = "monthly" | "yearly";

type Plan = {
  name: string;
  info: string;
  price: { monthly: number; yearly: number }; // yearly = per-month billed annually
  features: string[];
  cta: { text: string; href: string };
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Scout",
    info: "See what we see, a week late.",
    price: { monthly: 0, yearly: 0 },
    features: ["Weekly trend email", "Top 10, 7-day delayed", "5 lookups a month"],
    cta: { text: "Start free", href: "/login" },
  },
  {
    name: "Hunter",
    info: "The daily edge for active sellers.",
    price: { monthly: 59, yearly: 47 },
    features: [
      "Daily radar, every signal",
      "First-detected date on each",
      "1688 supplier match",
      "10-product watchlist",
    ],
    cta: { text: "Get started", href: "/login" },
    highlighted: true,
  },
  {
    name: "Operator",
    info: "For full-time operators.",
    price: { monthly: 129, yearly: 103 },
    features: [
      "Everything in Hunter, uncapped",
      "Unlimited watchlist",
      "Supplier price history",
      "CSV export",
      "Extra seats +A$39",
    ],
    cta: { text: "Get started", href: "/login" },
  },
];

export default function PricingToggle() {
  const [freq, setFreq] = useState<Frequency>("monthly");

  return (
    <div className="pt-wrap">
      <div className="pt-head">
        <h2 className="pt-title">One winning product pays for years of this.</h2>
        <p className="pt-sub">
          Plain AUD, GST included. Credits never expire and cancelling takes one click.
        </p>
      </div>

      <FrequencyToggle freq={freq} setFreq={setFreq} />

      <div className="pt-grid">
        {PLANS.map((p) => (
          <PricingCard key={p.name} plan={p} freq={freq} />
        ))}
      </div>

      <style>{`
        .pt-wrap{display:flex;flex-direction:column;align-items:center;gap:26px}
        .pt-head{text-align:center;max-width:640px}
        .pt-title{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(2rem,4vw,3.2rem);letter-spacing:-.025em;line-height:1.02;color:var(--c-ink)}
        .pt-sub{margin-top:10px;font-size:15px;line-height:1.55;color:var(--c-muted)}
        .pt-grid{display:grid;grid-template-columns:1fr;gap:20px;width:100%;max-width:1080px;align-items:stretch}
        @media(min-width:820px){.pt-grid{grid-template-columns:1fr 1.05fr 1fr;gap:0;background:var(--c-line);border-radius:18px;overflow:hidden;padding:1px;border:1px solid var(--c-line)}}

        /* Card */
        .pc{position:relative;display:flex;flex-direction:column;background:#fff;padding:26px 24px;transition:box-shadow .3s}
        @media(min-width:820px){.pc{padding:32px 26px;border-radius:0;box-shadow:none}}
        .pc-hi{background:var(--c-surface-2);z-index:1}
        @media(min-width:820px){.pc-hi{background:#fff;box-shadow:0 0 0 2px var(--c-accent) inset;position:relative}}
        .pc-badges{position:absolute;top:14px;right:14px;display:inline-flex;gap:6px;z-index:2}
        .pc-badge{display:inline-flex;align-items:center;gap:5px;font-family:var(--font-mono);font-size:.6rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;border-radius:999px}
        .pc-badge-pop{background:var(--c-accent);color:#fff}
        .pc-badge-pop i{color:#fff;font-size:.72rem}
        .pc-badge-save{background:color-mix(in oklab,var(--c-1688) 12%,transparent);color:var(--c-1688);border:1px solid color-mix(in oklab,var(--c-1688) 24%,transparent)}
        .pc-name{font-family:var(--font-geist-sans);font-weight:700;font-size:1.02rem;color:var(--c-ink)}
        .pc-info{margin-top:6px;font-size:.86rem;color:var(--c-muted)}
        .pc-price{margin-top:22px;display:flex;align-items:baseline;gap:6px;min-height:56px}
        .pc-price-amt{font-family:var(--font-mono);font-weight:700;font-size:2.8rem;letter-spacing:-.035em;color:var(--c-ink);line-height:1;display:inline-block}
        .pc-price-per{font-family:var(--font-mono);font-size:.85rem;color:var(--c-muted);font-weight:500}
        .pc-price-note{margin-top:6px;font-family:var(--font-mono);font-size:.68rem;color:var(--c-muted);letter-spacing:.02em;min-height:16px}
        .pc-features{margin-top:22px;flex:1;display:flex;flex-direction:column;gap:11px;padding-top:22px;border-top:1px solid var(--c-line)}
        .pc-feat{display:flex;align-items:flex-start;gap:9px;font-size:.9rem;line-height:1.4;color:var(--c-ink)}
        .pc-feat i{color:var(--c-accent);font-size:1rem;margin-top:1px;flex-shrink:0}
        .pc-cta{margin-top:28px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border-radius:999px;font-family:var(--font-geist-sans);font-weight:600;font-size:.9rem;transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s,background .2s}
        .pc-cta-primary{background:var(--c-accent);color:#fff;box-shadow:0 8px 22px -8px color-mix(in oklab,var(--c-accent) 55%,transparent)}
        .pc-cta-primary:hover{transform:translateY(-2px);box-shadow:0 14px 30px -8px color-mix(in oklab,var(--c-accent) 70%,transparent)}
        .pc-cta-ghost{background:transparent;color:var(--c-ink);border:1.5px solid var(--c-line-strong)}
        .pc-cta-ghost:hover{transform:translateY(-2px);border-color:var(--c-ink);background:var(--c-surface-2)}
      `}</style>
    </div>
  );
}

function FrequencyToggle({
  freq,
  setFreq,
}: {
  freq: Frequency;
  setFreq: (f: Frequency) => void;
}) {
  return (
    <div className="ft-wrap" role="group" aria-label="Billing frequency">
      <button
        type="button"
        className={`ft-opt ${freq === "monthly" ? "on" : ""}`}
        onClick={() => setFreq("monthly")}
        aria-pressed={freq === "monthly"}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`ft-opt ${freq === "yearly" ? "on" : ""}`}
        onClick={() => setFreq("yearly")}
        aria-pressed={freq === "yearly"}
      >
        Yearly
        <span className="ft-save">Save 20%</span>
      </button>
      <motion.div
        className="ft-thumb"
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          left: freq === "monthly" ? "4px" : "50%",
          right: freq === "monthly" ? "50%" : "4px",
        }}
        aria-hidden="true"
      />
      <style>{`
        .ft-wrap{position:relative;display:inline-flex;align-items:stretch;background:var(--c-surface-2);border:1px solid var(--c-line);border-radius:999px;padding:4px;gap:0}
        .ft-opt{position:relative;z-index:2;display:inline-flex;align-items:center;gap:7px;padding:9px 22px;border-radius:999px;font-family:var(--font-geist-sans);font-weight:600;font-size:.86rem;color:var(--c-muted);background:transparent;border:none;cursor:pointer;transition:color .2s}
        .ft-opt.on{color:var(--c-ink)}
        .ft-save{font-family:var(--font-mono);font-size:.58rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:2px 6px;border-radius:6px;background:color-mix(in oklab,var(--c-accent) 12%,transparent);color:var(--c-accent)}
        .ft-opt.on .ft-save{background:color-mix(in oklab,var(--c-accent) 18%,transparent)}
        .ft-thumb{position:absolute;top:4px;bottom:4px;background:#fff;border-radius:999px;box-shadow:0 2px 8px rgba(14,21,36,.08);z-index:1;transition:left .3s cubic-bezier(.34,1.56,.64,1),right .3s cubic-bezier(.34,1.56,.64,1)}
      `}</style>
    </div>
  );
}

function PricingCard({ plan, freq }: { plan: Plan; freq: Frequency }) {
  const raw = plan.price[freq];
  const priceText = raw === 0 ? "A$0" : `A$${raw}`;
  const perText =
    raw === 0
      ? "forever"
      : freq === "monthly"
      ? "/mo"
      : "/mo, billed yearly";
  const savings =
    freq === "yearly" && plan.price.monthly > 0
      ? Math.round(((plan.price.monthly - plan.price.yearly) / plan.price.monthly) * 100)
      : 0;

  return (
    <div className={`pc ${plan.highlighted ? "pc-hi" : ""}`}>
      <div className="pc-badges">
        {plan.highlighted && (
          <span className="pc-badge pc-badge-pop">
            <i className="ph-fill ph-star" /> Popular
          </span>
        )}
        <AnimatePresence>
          {savings > 0 && (
            <motion.span
              key="save"
              className="pc-badge pc-badge-save"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              -{savings}%
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="pc-name">{plan.name}</div>
      <div className="pc-info">{plan.info}</div>

      <div className="pc-price">
        <span className="pc-price-amt" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${plan.name}-${freq}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "inline-block" }}
            >
              {priceText}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="pc-price-per">{perText}</span>
      </div>
      <div className="pc-price-note">
        {raw === 0 ? "no card required" : freq === "yearly" ? `A$${plan.price.yearly * 12} billed once` : "cancel anytime"}
      </div>

      <ul className="pc-features">
        {plan.features.map((f) => (
          <li key={f} className="pc-feat">
            <i className="ph-fill ph-check-circle" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={plan.cta.href}
        className={`pc-cta ${plan.highlighted ? "pc-cta-primary" : "pc-cta-ghost"}`}
      >
        {plan.cta.text}
      </Link>
    </div>
  );
}
