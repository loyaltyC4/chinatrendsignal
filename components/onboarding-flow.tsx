"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

/*
 * 5-step onboarding flow.
 *
 * Framework copied from TrendTrack (Profile → Goals → Business → Team →
 * Attribution) but adapted for a China-signal / cross-border seller
 * product. Every question is CTS-specific: countries default to sell-to
 * markets, goals map to actual product surfaces (Radar / Analysis /
 * Watchlist / Supplier match), revenue tiers use AUD, attribution
 * sources are the channels this product actually shows up in.
 *
 * Visual language stays consistent with the redesigned landing page:
 * light canvas, electric-blue accent, Geist type, Phosphor icons.
 * A friendly SVG "signal seller" scene sits at the top so the flow
 * has a human presence, not just a form. Progress dots at the bottom
 * mirror TrendTrack.
 *
 * Nothing persists to the database in this pass — on Save Your
 * Profile we route to /dashboard (which auth-gates as it does today).
 * Wiring the answers into the profiles table can happen in a later
 * pass without touching this UI.
 */

type Goal =
  | "products"
  | "suppliers"
  | "competitors"
  | "speed"
  | "niches"
  | "readzh"
  | "other";

type Answers = {
  name: string;
  country: string;
  goals: Set<Goal>;
  otherGoal: string;
  businessType: string;
  revenue: string;
  teamSize: string;
  role: string;
  otherRole: string;
  attribution: string;
};

const COUNTRIES = [
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "OTHER", name: "Somewhere else", flag: "🌍" },
];

const GOALS: Array<{ id: Goal; icon: string; hue: string; title: string; sub: string }> = [
  {
    id: "products",
    icon: "ph-target",
    hue: "var(--c-accent)",
    title: "Find winning products",
    sub: "Bookmark-to-buy intent from Douyin and Xiaohongshu",
  },
  {
    id: "suppliers",
    icon: "ph-factory",
    hue: "var(--c-1688)",
    title: "Match factory suppliers",
    sub: "Median wholesale on 1688, not the cheapest bait price",
  },
  {
    id: "competitors",
    icon: "ph-eye",
    hue: "var(--c-taobao)",
    title: "Track competitors",
    sub: "See who else is already listing what you saved",
  },
  {
    id: "speed",
    icon: "ph-lightning",
    hue: "var(--c-xhs)",
    title: "Beat time-to-list",
    sub: "First-seen dates so you know how much window is left",
  },
  {
    id: "niches",
    icon: "ph-chart-line-up",
    hue: "var(--c-douyin)",
    title: "Explore new niches",
    sub: "One dashboard across pet, kitchen, beauty, baby and more",
  },
  {
    id: "readzh",
    icon: "ph-globe",
    hue: "var(--c-accent)",
    title: "Read Chinese platforms",
    sub: "Every signal translated + explained in English",
  },
];

const BUSINESS_TYPES = [
  { id: "ecom", icon: "ph-storefront", title: "E-commerce store", sub: "I sell products through my own store" },
  { id: "drop", icon: "ph-package", title: "Dropshipper", sub: "I resell without holding stock" },
  { id: "agency", icon: "ph-megaphone", title: "Agency / media buyer", sub: "I run ads or product research for clients" },
  { id: "other", icon: "ph-plus", title: "Something else", sub: "Educator, freelancer, or exploring" },
];

const REVENUE = [
  "Haven't launched yet",
  "Launched, no sales yet",
  "Under A$10K",
  "A$10K – A$100K",
  "A$100K – A$500K",
  "A$500K – A$1M",
  "A$1M+",
];

const TEAM_SIZES = [
  { id: "solo", icon: "ph-user", title: "Just me", sub: "Solo operator" },
  { id: "small", icon: "ph-users", title: "Small team", sub: "2–5 people" },
  { id: "growing", icon: "ph-users-three", title: "Growing team", sub: "6–20 people" },
  { id: "bigger", icon: "ph-buildings", title: "Bigger team", sub: "20+ people" },
];

const ROLES = [
  { id: "founder", icon: "ph-crown-simple", title: "Founder / Owner" },
  { id: "sourcing", icon: "ph-package", title: "Product / Sourcing lead" },
  { id: "marketing", icon: "ph-megaphone", title: "Marketing / Ads lead" },
  { id: "ops", icon: "ph-truck", title: "Ops / Logistics" },
  { id: "other", icon: "ph-plus", title: "Something else" },
];

const ATTRIBUTION = [
  { id: "youtube", icon: "ph-youtube-logo", title: "YouTube" },
  { id: "tiktok", icon: "ph-tiktok-logo", title: "TikTok" },
  { id: "x", icon: "ph-x-logo", title: "X (Twitter)" },
  { id: "reddit", icon: "ph-reddit-logo", title: "Reddit" },
  { id: "linkedin", icon: "ph-linkedin-logo", title: "LinkedIn" },
  { id: "friend", icon: "ph-users", title: "A friend told me" },
  { id: "search", icon: "ph-magnifying-glass", title: "Organic search" },
  { id: "other", icon: "ph-plus", title: "Somewhere else" },
];

const STEP_META = [
  { title: "Say hi, we're glad you're here.", sub: "This is how you'll appear inside China Trend Signal." },
  { title: "What are you here to do?", sub: "You can pick multiple — we'll shape the dashboard around it." },
  { title: "Tell us about your business.", sub: "So we can tailor the numbers to your scale." },
  { title: "About your team.", sub: "We'll adapt collaboration features and the UI density." },
  { title: "How did you find us?", sub: "So we can invest in the channels that reach real sellers." },
];

const TOTAL_STEPS = 5;

export default function OnboardingFlow() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [ans, setAns] = useState<Answers>({
    name: "",
    country: "AU",
    goals: new Set(),
    otherGoal: "",
    businessType: "",
    revenue: "",
    teamSize: "",
    role: "",
    otherRole: "",
    attribution: "",
  });

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return ans.name.trim().length > 1;
      case 1:
        return ans.goals.size > 0 || ans.otherGoal.trim().length > 0;
      case 2:
        return ans.businessType.length > 0 && ans.revenue.length > 0;
      case 3:
        return ans.teamSize.length > 0 && ans.role.length > 0;
      case 4:
        return ans.attribution.length > 0;
      default:
        return false;
    }
  }, [step, ans]);

  function next() {
    if (!canProceed) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      setSubmitting(true);
      // Persistence is a future pass. Just route to the dashboard.
      setTimeout(() => router.push("/dashboard"), 350);
    }
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  const meta = STEP_META[step];

  return (
    <div className="ob-wrap">
      <header className="ob-header">
        <Link href="/" className="ob-brand" aria-label="Back to China Trend Signal">
          <span className="ob-brand-mark" aria-hidden="true">
            <span className="ob-brand-ring" />
            <span className="ob-brand-dot" />
          </span>
          <span className="ob-brand-name">chinatrendsignal</span>
        </Link>
        <span className="ob-step-count">
          Step <b>{step + 1}</b> of {TOTAL_STEPS}
        </span>
      </header>

      <main className="ob-main">
        <div className="ob-scene" aria-hidden="true">
          <SellerScene step={step} reduce={!!reduce} />
        </div>

        <motion.h1
          key={`title-${step}`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="ob-title"
        >
          {meta.title}
        </motion.h1>
        <motion.p
          key={`sub-${step}`}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="ob-sub"
        >
          {meta.sub}
        </motion.p>

        <div className="ob-body">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? undefined : { opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="ob-panel"
            >
              {step === 0 && <StepProfile ans={ans} setAns={setAns} />}
              {step === 1 && <StepGoals ans={ans} setAns={setAns} />}
              {step === 2 && <StepBusiness ans={ans} setAns={setAns} />}
              {step === 3 && <StepTeam ans={ans} setAns={setAns} />}
              {step === 4 && <StepAttribution ans={ans} setAns={setAns} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="ob-ctas">
          {step > 0 && (
            <button type="button" onClick={back} className="ob-btn ob-btn-back">
              <i className="ph ph-arrow-left" /> Back
            </button>
          )}
          <button
            type="button"
            onClick={next}
            disabled={!canProceed || submitting}
            className="ob-btn ob-btn-next"
          >
            {step === TOTAL_STEPS - 1 ? (submitting ? "Setting things up…" : "Save your profile") : "Continue"}
            {step < TOTAL_STEPS - 1 && <i className="ph ph-arrow-right" />}
          </button>
        </div>

        <div className="ob-dots" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span key={i} className={`ob-dot ${i === step ? "on" : ""} ${i < step ? "done" : ""}`} />
          ))}
        </div>
      </main>

      <footer className="ob-foot">
        <span>
          By continuing you agree to the{" "}
          <Link href="/terms" className="ob-foot-link">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="ob-foot-link">
            Privacy Policy
          </Link>
          .
        </span>
      </footer>

      <ObStyles />
    </div>
  );
}

/* ── STEPS ── */

function StepProfile({
  ans,
  setAns,
}: {
  ans: Answers;
  setAns: React.Dispatch<React.SetStateAction<Answers>>;
}) {
  return (
    <div className="ob-profile">
      <div className="ob-avatar-slot" aria-hidden="true">
        <div className="ob-avatar">
          <i className="ph-fill ph-user" />
        </div>
        <span className="ob-avatar-lbl">Photo optional</span>
      </div>
      <div className="ob-fields">
        <label className="ob-field">
          <span className="ob-field-lbl">Full name</span>
          <input
            type="text"
            autoFocus
            className="ob-input"
            placeholder="e.g. Sam Chen"
            value={ans.name}
            onChange={(e) => setAns((a) => ({ ...a, name: e.target.value }))}
          />
        </label>
        <label className="ob-field">
          <span className="ob-field-lbl">Where do you sell into?</span>
          <span className="ob-select-wrap">
            <span className="ob-flag" aria-hidden="true">
              {COUNTRIES.find((c) => c.code === ans.country)?.flag ?? "🌍"}
            </span>
            <select
              className="ob-select"
              value={ans.country}
              onChange={(e) => setAns((a) => ({ ...a, country: e.target.value }))}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <i className="ph ph-caret-down ob-select-chev" />
          </span>
        </label>
      </div>
    </div>
  );
}

function StepGoals({
  ans,
  setAns,
}: {
  ans: Answers;
  setAns: React.Dispatch<React.SetStateAction<Answers>>;
}) {
  function toggle(id: Goal) {
    setAns((a) => {
      const next = new Set(a.goals);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...a, goals: next };
    });
  }
  return (
    <div className="ob-grid ob-grid-goals">
      {GOALS.map((g) => {
        const on = ans.goals.has(g.id);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => toggle(g.id)}
            aria-pressed={on}
            className={`ob-card ${on ? "on" : ""}`}
            style={{ ["--card-hue" as string]: g.hue }}
          >
            <span className="ob-card-ic" style={{ background: g.hue }}>
              <i className={`ph-fill ${g.icon}`} />
            </span>
            <span className="ob-card-body">
              <span className="ob-card-title">{g.title}</span>
              <span className="ob-card-sub">{g.sub}</span>
            </span>
            <span className={`ob-check ${on ? "on" : ""}`} aria-hidden="true">
              <i className="ph-fill ph-check" />
            </span>
          </button>
        );
      })}
      <label className="ob-other">
        <i className="ph ph-plus" />
        <input
          type="text"
          className="ob-other-input"
          placeholder="Something else — tell us"
          value={ans.otherGoal}
          onChange={(e) => setAns((a) => ({ ...a, otherGoal: e.target.value }))}
        />
      </label>
    </div>
  );
}

function StepBusiness({
  ans,
  setAns,
}: {
  ans: Answers;
  setAns: React.Dispatch<React.SetStateAction<Answers>>;
}) {
  return (
    <div className="ob-two-block">
      <div className="ob-block">
        <span className="ob-block-lbl">What best describes your business?</span>
        <div className="ob-grid ob-grid-2">
          {BUSINESS_TYPES.map((b) => {
            const on = ans.businessType === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setAns((a) => ({ ...a, businessType: b.id }))}
                aria-pressed={on}
                className={`ob-card ${on ? "on" : ""}`}
                style={{ ["--card-hue" as string]: "var(--c-accent)" }}
              >
                <span className="ob-card-ic" style={{ background: "var(--c-accent)" }}>
                  <i className={`ph-fill ${b.icon}`} />
                </span>
                <span className="ob-card-body">
                  <span className="ob-card-title">{b.title}</span>
                  <span className="ob-card-sub">{b.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="ob-block">
        <span className="ob-block-lbl">How much revenue have you done so far?</span>
        <div className="ob-grid ob-grid-2">
          {REVENUE.map((r) => {
            const on = ans.revenue === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setAns((a) => ({ ...a, revenue: r }))}
                aria-pressed={on}
                className={`ob-pill ${on ? "on" : ""}`}
              >
                <i className="ph ph-currency-circle-dollar" />
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepTeam({
  ans,
  setAns,
}: {
  ans: Answers;
  setAns: React.Dispatch<React.SetStateAction<Answers>>;
}) {
  return (
    <div className="ob-two-block">
      <div className="ob-block">
        <span className="ob-block-lbl">Team size?</span>
        <div className="ob-grid ob-grid-2">
          {TEAM_SIZES.map((t) => {
            const on = ans.teamSize === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setAns((a) => ({ ...a, teamSize: t.id }))}
                aria-pressed={on}
                className={`ob-card ${on ? "on" : ""}`}
                style={{ ["--card-hue" as string]: "var(--c-accent)" }}
              >
                <span className="ob-card-ic" style={{ background: "var(--c-accent)" }}>
                  <i className={`ph-fill ${t.icon}`} />
                </span>
                <span className="ob-card-body">
                  <span className="ob-card-title">{t.title}</span>
                  <span className="ob-card-sub">{t.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="ob-block">
        <span className="ob-block-lbl">Your role in the company?</span>
        <div className="ob-grid ob-grid-2">
          {ROLES.map((r) => {
            const on = ans.role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setAns((a) => ({ ...a, role: r.id }))}
                aria-pressed={on}
                className={`ob-pill ${on ? "on" : ""}`}
              >
                <i className={`ph ${r.icon}`} />
                {r.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepAttribution({
  ans,
  setAns,
}: {
  ans: Answers;
  setAns: React.Dispatch<React.SetStateAction<Answers>>;
}) {
  return (
    <div className="ob-grid ob-grid-attr">
      {ATTRIBUTION.map((a) => {
        const on = ans.attribution === a.id;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => setAns((prev) => ({ ...prev, attribution: a.id }))}
            aria-pressed={on}
            className={`ob-card ob-card-slim ${on ? "on" : ""}`}
            style={{ ["--card-hue" as string]: "var(--c-accent)" }}
          >
            <span className="ob-card-ic ob-card-ic-neutral">
              <i className={`ph-fill ${a.icon}`} />
            </span>
            <span className="ob-card-title">{a.title}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── SELLER SCENE (human touch) ── */

function SellerScene({ step, reduce }: { step: number; reduce: boolean }) {
  // Slight hue rotation across steps so the scene subtly shifts as you progress.
  const hues = [
    "var(--c-accent)",
    "var(--c-xhs)",
    "var(--c-1688)",
    "var(--c-taobao)",
    "var(--c-douyin)",
  ];
  const primary = hues[step];
  return (
    <motion.svg
      viewBox="0 0 240 120"
      width="240"
      height="120"
      key={step}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      {/* soft ground blob */}
      <ellipse cx="120" cy="108" rx="90" ry="7" fill={primary} opacity="0.08" />

      {/* seller — head */}
      <circle cx="88" cy="46" r="14" fill="#f3d4b8" stroke={primary} strokeWidth="1.2" />
      <path d="M75 44c0-9 7-14 13-14s13 5 13 14c0 3-1 5-2 5-3-3-8-4-11-4s-8 1-11 4c-1 0-2-2-2-5z" fill={primary} />
      {/* eyes */}
      <circle cx="84" cy="47" r="1.2" fill="#161613" />
      <circle cx="92" cy="47" r="1.2" fill="#161613" />
      {/* smile */}
      <path d="M84 52c1 1.5 3 2 4 2s3-.5 4-2" stroke="#161613" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* body */}
      <path d="M72 100l4-30c1-6 5-10 12-10h0c7 0 11 4 12 10l4 30z" fill={primary} />
      {/* arm holding tablet */}
      <path d="M102 78l14-4" stroke="#f3d4b8" strokeWidth="6" strokeLinecap="round" />

      {/* tablet / phone */}
      <rect x="118" y="60" width="42" height="54" rx="5" fill="#fff" stroke="#161613" strokeWidth="1.2" />
      <rect x="122" y="66" width="34" height="6" rx="1.5" fill={primary} opacity="0.5" />
      {/* mini bars = intent bars */}
      <rect x="122" y="76" width="22" height="3.5" rx="1.5" fill="var(--c-xhs)" />
      <rect x="122" y="83" width="30" height="3.5" rx="1.5" fill="var(--c-1688)" />
      <rect x="122" y="90" width="16" height="3.5" rx="1.5" fill="var(--c-taobao)" />
      <rect x="122" y="97" width="26" height="3.5" rx="1.5" fill="var(--c-douyin)" />

      {/* floating signals — small colored dots orbiting */}
      <motion.g
        animate={reduce ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="176" cy="46" r="6" fill="var(--c-xhs)" />
        <text x="176" y="49" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="700">红</text>
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { y: [0, 4, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
        <circle cx="196" cy="70" r="6" fill="var(--c-1688)" />
        <text x="196" y="73" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="700">16</text>
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <circle cx="60" cy="34" r="6" fill="var(--c-douyin)" />
        <text x="60" y="37" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="700">抖</text>
      </motion.g>
      <motion.g
        animate={reduce ? undefined : { y: [0, 3, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        <circle cx="46" cy="66" r="6" fill="var(--c-taobao)" />
        <text x="46" y="69" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="700">淘</text>
      </motion.g>

      {/* thin connecting lines */}
      <path d="M60 38 Q80 42 84 44" stroke="var(--c-douyin)" strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M52 66 Q66 72 78 78" stroke="var(--c-taobao)" strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M170 50 Q160 65 158 66" stroke="var(--c-xhs)" strokeWidth="0.7" fill="none" opacity="0.4" />
      <path d="M190 70 Q170 80 160 90" stroke="var(--c-1688)" strokeWidth="0.7" fill="none" opacity="0.4" />
    </motion.svg>
  );
}

/* ── STYLES ── */

function ObStyles() {
  return (
    <style>{`
      .ob-wrap{min-height:100dvh;background:var(--c-canvas);color:var(--c-ink);display:flex;flex-direction:column;font-family:var(--font-geist-sans)}
      .ob-wrap::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(600px 300px at 20% -10%, color-mix(in oklab, var(--c-accent) 6%, transparent), transparent 70%),radial-gradient(500px 260px at 100% 100%, color-mix(in oklab, var(--c-xhs) 5%, transparent), transparent 70%)}
      .ob-header,.ob-main,.ob-foot{position:relative;z-index:1}

      /* Header */
      .ob-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid var(--c-line);background:color-mix(in oklab,var(--c-canvas) 92%,transparent);backdrop-filter:blur(8px)}
      .ob-brand{display:inline-flex;align-items:center;gap:10px;color:var(--c-ink);text-decoration:none;font-weight:700}
      .ob-brand-mark{position:relative;width:22px;height:22px;display:grid;place-items:center}
      .ob-brand-ring{position:absolute;inset:0;border-radius:50%;border:2px solid var(--c-accent);opacity:.5;animation:ob-ring 3s cubic-bezier(.4,0,.2,1) infinite}
      .ob-brand-dot{position:relative;width:8px;height:8px;border-radius:50%;background:var(--c-accent)}
      @keyframes ob-ring{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.35);opacity:0}}
      .ob-brand-name{font-family:var(--font-geist-sans);letter-spacing:-.01em;font-size:.95rem}
      .ob-step-count{font-family:var(--font-geist-mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted)}
      .ob-step-count b{color:var(--c-ink);font-weight:700}

      /* Main */
      .ob-main{flex:1;max-width:820px;width:100%;margin:0 auto;padding:36px 20px 32px;display:flex;flex-direction:column;align-items:center}
      .ob-scene{margin-bottom:12px}
      .ob-title{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(1.9rem,3.6vw,2.6rem);letter-spacing:-.03em;line-height:1.02;text-align:center;max-width:20ch;color:var(--c-ink)}
      .ob-sub{margin-top:10px;font-size:15px;color:var(--c-muted);text-align:center;max-width:52ch;line-height:1.5}
      .ob-body{width:100%;margin-top:28px;position:relative;min-height:280px}
      .ob-panel{display:flex;flex-direction:column;gap:22px}

      /* Fields (step 1) */
      .ob-profile{display:flex;flex-direction:column;gap:20px;align-items:center}
      .ob-avatar-slot{display:flex;flex-direction:column;align-items:center;gap:8px}
      .ob-avatar{width:72px;height:72px;border-radius:50%;background:color-mix(in oklab,var(--c-accent) 10%,var(--c-surface));border:2px dashed color-mix(in oklab,var(--c-accent) 30%,transparent);display:grid;place-items:center;color:var(--c-accent);font-size:2rem;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
      .ob-avatar:hover{transform:scale(1.05)}
      .ob-avatar-lbl{font-family:var(--font-geist-mono);font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted)}
      .ob-fields{display:grid;grid-template-columns:1fr 1fr;gap:14px;width:100%;max-width:620px}
      @media(max-width:560px){.ob-fields{grid-template-columns:1fr}}
      .ob-field{display:flex;flex-direction:column;gap:6px}
      .ob-field-lbl{font-family:var(--font-geist-mono);font-size:.66rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted)}
      .ob-input,.ob-select{width:100%;padding:12px 14px;border-radius:12px;border:1.5px solid var(--c-line);background:var(--c-surface);color:var(--c-ink);font-family:inherit;font-size:.95rem;transition:border-color .2s,box-shadow .2s;outline:none;appearance:none;-webkit-appearance:none}
      .ob-input:focus,.ob-select:focus{border-color:var(--c-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--c-accent) 15%,transparent)}
      .ob-select-wrap{position:relative}
      .ob-flag{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:1.1rem;pointer-events:none}
      .ob-select{padding-left:42px;padding-right:38px;cursor:pointer}
      .ob-select-chev{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:var(--c-muted);font-size:.9rem;pointer-events:none}

      /* Cards grid */
      .ob-grid{display:grid;gap:10px;width:100%;max-width:720px;margin:0 auto}
      .ob-grid-goals{grid-template-columns:1fr 1fr}
      .ob-grid-attr{grid-template-columns:1fr 1fr}
      .ob-grid-2{grid-template-columns:1fr 1fr}
      @media(max-width:560px){.ob-grid-goals,.ob-grid-attr,.ob-grid-2{grid-template-columns:1fr}}
      .ob-two-block{display:flex;flex-direction:column;gap:26px;width:100%;max-width:720px;margin:0 auto}
      .ob-block{display:flex;flex-direction:column;gap:12px}
      .ob-block-lbl{font-family:var(--font-geist-mono);font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted);text-align:center}

      .ob-card{position:relative;display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;border:1.5px solid var(--c-line);background:var(--c-surface);color:var(--c-ink);cursor:pointer;text-align:left;transition:transform .22s cubic-bezier(.34,1.56,.64,1),border-color .22s,box-shadow .22s,background .22s}
      .ob-card:hover{transform:translateY(-2px);border-color:var(--c-line-strong);box-shadow:0 8px 22px -12px rgba(14,21,36,.14)}
      .ob-card.on{border-color:var(--card-hue);background:color-mix(in oklab,var(--card-hue) 6%,var(--c-surface));box-shadow:0 8px 22px -8px color-mix(in oklab,var(--card-hue) 40%,transparent)}
      .ob-card-slim{padding:12px 14px}
      .ob-card-ic{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;color:#fff;font-size:1rem;flex-shrink:0}
      .ob-card-ic-neutral{background:var(--c-surface-2);color:var(--c-ink);border:1px solid var(--c-line)}
      .ob-card.on .ob-card-ic-neutral{background:var(--card-hue);color:#fff;border-color:transparent}
      .ob-card-body{display:flex;flex-direction:column;gap:2px;flex:1;min-width:0}
      .ob-card-title{font-weight:600;font-size:.94rem;line-height:1.2}
      .ob-card-sub{font-size:.78rem;color:var(--c-muted);line-height:1.35}
      .ob-check{width:22px;height:22px;border-radius:50%;background:var(--c-surface-2);border:1.5px solid var(--c-line);display:grid;place-items:center;color:transparent;font-size:.72rem;flex-shrink:0;transition:all .22s}
      .ob-card.on .ob-check{background:var(--card-hue);border-color:var(--card-hue);color:#fff}

      /* Pills for revenue and roles */
      .ob-pill{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border-radius:12px;border:1.5px solid var(--c-line);background:var(--c-surface);color:var(--c-ink);cursor:pointer;font-size:.88rem;font-weight:500;transition:transform .2s cubic-bezier(.34,1.56,.64,1),border-color .2s,background .2s}
      .ob-pill:hover{transform:translateY(-1px);border-color:var(--c-line-strong)}
      .ob-pill.on{border-color:var(--c-accent);background:color-mix(in oklab,var(--c-accent) 6%,var(--c-surface));color:var(--c-accent)}
      .ob-pill i{color:var(--c-muted);font-size:.95rem}
      .ob-pill.on i{color:var(--c-accent)}

      /* Other free-text option */
      .ob-other{grid-column:1/-1;display:flex;align-items:center;gap:9px;padding:12px 14px;border-radius:12px;border:1.5px dashed var(--c-line);background:transparent;color:var(--c-muted);transition:border-color .2s}
      .ob-other:focus-within{border-color:var(--c-accent);color:var(--c-ink)}
      .ob-other i{font-size:1rem;color:inherit}
      .ob-other-input{flex:1;border:none;background:transparent;outline:none;color:var(--c-ink);font-family:inherit;font-size:.88rem}

      /* CTAs */
      .ob-ctas{width:100%;max-width:520px;margin:32px auto 0;display:flex;gap:10px}
      .ob-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 22px;border-radius:999px;font-weight:600;font-size:.95rem;font-family:inherit;cursor:pointer;border:none;transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,background .22s,color .22s}
      .ob-btn-back{background:transparent;color:var(--c-ink);border:1.5px solid var(--c-line-strong);flex:0 0 auto;padding:13px 22px}
      .ob-btn-back:hover{transform:translateY(-2px);background:var(--c-surface-2)}
      .ob-btn-next{background:var(--c-accent);color:#fff;box-shadow:0 12px 26px -10px color-mix(in oklab,var(--c-accent) 55%,transparent)}
      .ob-btn-next:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 34px -10px color-mix(in oklab,var(--c-accent) 70%,transparent)}
      .ob-btn-next:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
      .ob-btn i{font-size:.9em}

      /* Progress dots */
      .ob-dots{margin-top:24px;display:flex;justify-content:center;gap:8px}
      .ob-dot{width:8px;height:8px;border-radius:50%;background:var(--c-line-strong);transition:all .3s cubic-bezier(.34,1.56,.64,1)}
      .ob-dot.on{width:26px;border-radius:4px;background:var(--c-accent)}
      .ob-dot.done{background:color-mix(in oklab,var(--c-accent) 45%,transparent)}

      /* Footer */
      .ob-foot{padding:20px 24px;text-align:center;font-family:var(--font-geist-mono);font-size:.7rem;color:var(--c-muted);border-top:1px solid var(--c-line)}
      .ob-foot-link{color:var(--c-ink);text-decoration:underline;text-decoration-color:var(--c-line-strong);text-underline-offset:2px}
      .ob-foot-link:hover{color:var(--c-accent);text-decoration-color:var(--c-accent)}

      @media (prefers-reduced-motion:reduce){
        .ob-brand-ring{animation:none}
      }
    `}</style>
  );
}
