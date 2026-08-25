import Link from "next/link";
import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";
import Faq from "@/components/faq";
import ReadTheRoom from "@/components/read-the-room";
import ProcessStepper from "@/components/process-stepper";
import RadarLive from "@/components/radar-live";
import HeroAnim from "@/components/hero-anim";
import PricingToggle from "@/components/pricing-toggle";

export const dynamic = "force-dynamic";

/*
 * Homepage redesign v2. Layers Mint Studio's section patterns onto CTS's
 * existing design system (Geist + electric-blue tokens + platform hues),
 * with CTS content throughout.
 *
 * SECTIONS (top to bottom):
 *  1. Hero (existing)
 *  1b. Trust strip: colour logo marquee (own section, below hero)
 *  2. Process: "From signal to listing" — unboxed illustrations per step
 *  3. NEW: "Listing created in seconds" — brand-scan mockup (Mint Studio "Brand DNA" pattern)
 *  4. NEW: "Built for every seller" — pill-tag niches (Mint Studio "Built for any business" pattern)
 *  5. Three checks: pillar band (existing)
 *  6. NEW: "Stop guessing. Read the room." — intelligence section (Mint Studio "intel" pattern)
 *  7. Pricing, FAQ, closing band (existing)
 */

const BF = "c=1bxeoe1y0zo3oi7mr8z4fruj0nrlDlja6p5";

const LOGOS: { name: string; url?: string; glyph?: string; hue?: string }[] = [
  { name: "Douyin", glyph: "抖", hue: "#161823" },
  { name: "Xiaohongshu", glyph: "红", hue: "#f5325b" },
  { name: "1688", glyph: "16", hue: "#f08c00" },
  { name: "Taobao", url: `https://cdn.brandfetch.io/idlrqqrUF6/w/820/h/342/theme/dark/logo.png?${BF}` },
  { name: "Amazon", url: `https://cdn.brandfetch.io/idawOgYOsG/theme/dark/logo.svg?${BF}` },
  { name: "TikTok Shop", url: `https://cdn.brandfetch.io/id-0D6OFrq/theme/dark/logo.svg?${BF}` },
  { name: "JD.com", url: `https://cdn.brandfetch.io/id8PjUiayu/w/400/h/400/theme/dark/icon.png?${BF}` },
  { name: "Temu", url: `https://cdn.brandfetch.io/idLrvqDAxL/w/800/h/800/theme/dark/logo.png?${BF}` },
  { name: "Shopee", url: `https://cdn.brandfetch.io/idgVhUUiaD/w/820/h/262/theme/dark/logo.png?${BF}` },
  { name: "Kuaishou", url: `https://cdn.brandfetch.io/idQGoFpFbH/w/1024/h/1024/theme/dark/icon.png?${BF}` },
  { name: "Weibo", url: `https://cdn.brandfetch.io/idUtZ6JgLw/theme/dark/logo.svg?${BF}` },
  { name: "Bilibili", url: `https://cdn.brandfetch.io/idJarLS8mp/theme/dark/logo.svg?${BF}` },
  { name: "Zhihu", url: `https://cdn.brandfetch.io/idm5wK3FJf/w/800/h/375/theme/dark/logo.png?${BF}` },
  { name: "Instagram", url: `https://cdn.brandfetch.io/ido5G85nya/theme/dark/symbol.svg?${BF}` },
  { name: "YouTube", url: `https://cdn.brandfetch.io/idVfYwcuQz/theme/dark/logo.svg?${BF}` },
];

// "Built for every seller" — niche pills (Mint Studio niches pattern)
const NICHES_A = [
  { t: "Pet supplies", ic: "ph-paw-paw" },
  { t: "Baby and kids", ic: "ph-baby" },
  { t: "Kitchen", ic: "ph-cooking-pot" },
  { t: "Beauty", ic: "ph-sparkle" },
  { t: "Fitness", ic: "ph-barbell" },
  { t: "Home", ic: "ph-house-line" },
  { t: "Phone accessories", ic: "ph-device-mobile" },
  { t: "Outdoor", ic: "ph-mountains" },
];

const NICHES_B = [
  { t: "Demand proof", ic: "ph-heart" },
  { t: "Supplier match", ic: "ph-factory" },
  { t: "Margin spread", ic: "ph-chart-line-up" },
  { t: "First-seen date", ic: "ph-calendar" },
  { t: "Reverse image", ic: "ph-magnifying-glass" },
  { t: "KOL rate card", ic: "ph-microphone" },
  { t: "Price history", ic: "ph-trend-up" },
  { t: "Export-ready", ic: "ph-file-arrow-out" },
];

// "Stop guessing. Read the room." — credibility stats (Mint Studio intel pattern)
const CRED_STATS = [
  { num: "4", label: "platforms", color: "var(--c-accent)" },
  { num: "1", label: "index", color: "var(--c-xhs)" },
  { num: "25-40×", label: "gross spread", color: "var(--c-1688)" },
  { num: "7d", label: "free tier delay", color: "var(--c-taobao)" },
];

const PILLARS = [
  { val: "¥14", top: "Factory unit", bot: "verified on 1688", h: "33%", lead: false },
  { val: "0.96", top: "Demand", bot: "saves-to-likes on XHS", h: "52%", lead: false },
  { val: "25-40×", top: "Margin", bot: "1688 vs TikTok Shop", h: "99%", lead: true },
  { val: "6d", top: "First seen", bot: "logged in the index", h: "44%", lead: false },
];

function LogoSet() {
  return LOGOS.map((l) => (
    <div key={l.name} className="cts-logo" title={l.name}>
      {l.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={l.url} alt={l.name} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
      ) : (
        <span className="cts-glyph" style={{ background: l.hue }}>{l.glyph}</span>
      )}
    </div>
  ));
}

const PILL_HUES = [
  "var(--c-xhs)", "var(--c-1688)", "var(--c-taobao)", "var(--c-douyin)",
  "var(--c-accent)", "var(--c-xhs)", "var(--c-1688)", "var(--c-taobao)",
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <MarketingNav />
      <main id="main">
        {/* 1. HERO — animated (21st.dev hero-1 chrome + rotating emphasis word) */}
        <HeroAnim />

        {/* 1b. TRUST STRIP — colour logo marquee, its own section below the hero */}
        <section className="border-b border-line bg-surface2/30">
          <div className="mx-auto max-w-[1160px] px-5 py-8 text-center sm:px-8">
            <p className="text-[12.5px] font-medium text-mut">One radar, every platform that matters</p>
            <div className="cts-ticker mt-5" aria-label="Platforms covered">
              <div className="cts-track">
                <div className="cts-set"><LogoSet /></div>
                <div className="cts-set" aria-hidden="true"><LogoSet /></div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROCESS — interactive stepper with real product-UI mockups */}
        <section id="how" className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="display-lg text-ink">
              From <span className="text-accent">signal</span> to listing, in one afternoon.
            </h2>
            <p className="mx-auto mt-4 max-w-[52ch] text-[15px] leading-relaxed text-body">
              Every alert lands with the product, the factory, and the margin already checked.
              You go from seeing a trend to listing it while the window is still open.
            </p>
          </div>
          <div className="mt-12">
            <ProcessStepper />
          </div>
        </section>

        {/* 3. RADAR LIVE — animated feed of the actual product surface */}
        <section className="cts-rlv-sec" id="radar-live">
          <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
            <div className="cts-rlv-top">
              <span className="cts-bd-eyebrow">Your radar</span>
              <h2 className="display-lg text-ink">
                What you see the moment you sign in.
              </h2>
              <p className="cts-rlv-sub text-body">
                Real feed shape, real columns. Every row is one candidate scored on
                bookmark-to-buy intent, matched to a factory price, and stamped with the
                date we first saw it.
              </p>
            </div>
            <div className="mt-8">
              <RadarLive />
            </div>
          </div>
        </section>

        {/* 4. BUILT FOR EVERY SELLER — pill niches (Mint Studio "Built for any business" pattern) */}
        <section className="cts-niches" id="niches">
          <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
            <div className="cts-nv2-block">
              <h3 className="cts-nv2-label text-ink">Built for <span className="spectrum-text">every seller.</span></h3>
              <div className="cts-nv2-grid">
                {NICHES_A.map((n, i) => (
                  <span key={n.t} className="cts-nv2-pill" style={{ transitionDelay: `${i * 0.05}s` }}>
                    <span className="cts-nv2-ic" style={{ background: PILL_HUES[i % 8] }}>
                      <i className={`ph-fill ${n.ic}`} />
                    </span>
                    {n.t}
                  </span>
                ))}
              </div>
            </div>
            <div className="cts-nv2-block">
              <h3 className="cts-nv2-label text-ink">Every signal, <span className="spectrum-text">on tap.</span></h3>
              <div className="cts-nv2-grid">
                {NICHES_B.map((n, i) => (
                  <span key={n.t} className="cts-nv2-pill" style={{ transitionDelay: `${i * 0.05}s` }}>
                    <span className="cts-nv2-ic" style={{ background: PILL_HUES[(i + 4) % 8] }}>
                      <i className={`ph-fill ${n.ic}`} />
                    </span>
                    {n.t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. THREE CHECKS — pillar band (existing) */}
        <section className="border-y border-line bg-surface2/40">
          <div className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-[680px] text-center">
              <h2 className="display-lg text-ink">Three checks before anything hits your inbox.</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-body">
                No engagement proof, no supplier, no spread: no signal. Every alert carries all
                three, logged with the date we first saw it.
              </p>
            </div>
            <div className="cts-pillars mx-auto mt-14 flex max-w-[880px] items-stretch gap-3" id="pillarsStage">
              {PILLARS.map((p) => (
                <div key={p.top} className="cts-pillar">
                  <div className="cts-track2">
                    <div
                      className={`cts-bar ${p.lead ? "cts-bar-lead" : ""}`}
                      style={{ height: p.h }}
                    >
                      <div className="cts-val">{p.val}</div>
                    </div>
                    {p.lead && (
                      <div className="cts-tip">
                        gross spread, current window
                        <span className="cts-tip-dot" />
                      </div>
                    )}
                  </div>
                  <p className="cts-lbl"><b>{p.top}</b>{p.bot}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. STOP GUESSING. READ THE ROOM. — intelligence section (Mint Studio "intel" pattern) */}
        <section className="cts-intel" id="intel">
          <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
            {/* Credibility stats row */}
            <div className="cts-cred">
              <span className="label text-mut">Read from the source</span>
              <h3 className="cts-cred-line text-ink">Not just trends. <span className="spectrum-text">It&apos;s signal intelligence.</span></h3>
              <div className="cts-cred-stats">
                {CRED_STATS.map((s, i) => (
                  <div key={s.label} className="cts-cstat">
                    <b style={{ color: s.color }}>{s.num}</b>
                    <span>{s.label}</span>
                    {i < CRED_STATS.length - 1 && <div className="cts-cdiv" />}
                  </div>
                ))}
              </div>
              <div className="cts-cred-wire"><span className="cts-spark" /></div>
              <div className="cts-cred-logos">
                <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-faint opacity-70">Read from</span>
                <span className="cts-glyph" style={{ background: "var(--c-douyin)" }}>抖</span>
                <span className="cts-glyph" style={{ background: "var(--c-xhs)" }}>红</span>
                <span className="cts-glyph" style={{ background: "var(--c-1688)" }}>16</span>
                <span className="cts-glyph" style={{ background: "var(--c-taobao)" }}>淘</span>
              </div>
            </div>
            {/* Headline + interactive console */}
            <div className="cts-intel-head">
              <h2 className="display-lg text-ink">Stop guessing.<br />Read the room.</h2>
              <p className="text-[15px] text-mut">One product, five signals, read together.</p>
            </div>
            <ReadTheRoom />
          </div>
        </section>

        {/* 7. PRICING — interactive toggle (21st.dev pricing-4 pattern, CTS tokens) */}
        <section id="pricing" className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <PricingToggle />
        </section>

        {/* 8. FAQ */}
        <section className="mx-auto max-w-[46rem] px-5 py-20 sm:px-8">
          <h2 className="display-lg max-w-[20ch] text-ink">Questions you should ask.</h2>
          <div className="mt-8">
            <Faq />
          </div>
        </section>

        {/* 9. CLOSING BAND */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-[1160px] px-5 py-20 text-center sm:px-8">
            <hr className="spectrum-rule mx-auto mb-10 w-24 rounded-full" />
            <h2 className="display-lg mx-auto max-w-[22ch] text-ink">
              Your next product is trending in China right now.
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-body">
              Start free. No card, no password, and the first-seen dates are there from day one.
            </p>
            <Link href="/login" className="mt-8 inline-block rounded-ctl bg-accentstrong px-6 py-3 text-[14px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px">
              Get started
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />

      {/* Scoped styles: marquee (existing) + new Mint Studio-adapted sections */}
      <style>{`
        /* Marquee */
        .cts-ticker{width:100%;max-width:1060px;margin:0 auto;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}
        .cts-track{display:flex;width:max-content;animation:cts-marq 44s linear infinite;will-change:transform}
        .cts-ticker:hover .cts-track{animation-play-state:paused}
        @keyframes cts-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .cts-set{display:flex;align-items:center;flex-shrink:0}
        .cts-logo{display:flex;align-items:center;justify-content:center;height:40px;margin:0 26px;flex-shrink:0}
        .cts-logo img{max-height:26px;width:auto;object-fit:contain;opacity:.85;transition:opacity .3s}
        .cts-ticker:hover .cts-logo img{opacity:1}
        .cts-glyph{width:26px;height:26px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff}

        /* Pillar band */
        .cts-pillars{height:380px}
        .cts-pillar{position:relative;flex:1;display:flex;flex-direction:column}
        .cts-track2{position:relative;flex:1;border-radius:40px;overflow:hidden;background-color:var(--c-surface-2);background-image:linear-gradient(135deg,var(--c-line) 25%,transparent 25.5%,transparent 50%,var(--c-line) 50.5%,var(--c-line) 75%,transparent 75.5%,transparent);background-size:10px 10px}
        /* Bars default to visible so the section is never blank if scroll-reveal doesn't fire (fullpage screenshots, slow hydration, etc). The .lit class only *replays* the entry animation. */
        .cts-bar{position:absolute;bottom:0;left:0;right:0;border-radius:40px;background:#b9b4ab;padding:12px;display:flex;align-items:flex-start;justify-content:center;transform-origin:bottom;transform:scaleY(1);opacity:1}
        .cts-pillars.lit .cts-bar{animation:cts-grow .9s cubic-bezier(.34,1.4,.44,1) both}
        .cts-bar-lead{background:var(--c-accent);box-shadow:0 30px 60px -25px color-mix(in oklab, var(--c-accent) 55%, transparent)}
        @keyframes cts-grow{from{transform:scaleY(0);opacity:0}to{transform:scaleY(1);opacity:1}}
        .cts-val{display:flex;align-items:center;justify-content:center;height:52px;padding:0 18px;border-radius:999px;background:rgba(255,255,255,.2);font-family:var(--font-mono);font-weight:700;font-size:20px;letter-spacing:-.02em;color:#fff;white-space:nowrap}
        .cts-pillar:not(:has(.cts-bar-lead)) .cts-val{background:rgba(14,21,36,.14)}
        .cts-tip{position:absolute;z-index:3;left:50%;top:-50px;transform:translateX(-50%);background:var(--c-ink);color:var(--c-canvas);font-size:12.5px;font-weight:600;padding:8px 16px;border-radius:12px;white-space:nowrap}
        .cts-tip-dot{position:absolute;left:50%;bottom:-24px;transform:translateX(-50%);width:14px;height:14px;border-radius:50%;background:var(--c-ink);border:3px solid var(--c-canvas)}
        .cts-lbl{margin-top:14px;text-align:center;font-size:13px;color:var(--c-muted);font-weight:500;line-height:1.4}
        .cts-lbl b{display:block;font-size:14px;font-weight:700;color:var(--c-ink)}
        @media(max-width:760px){.cts-pillars{height:260px;gap:6px}.cts-val{font-size:14px;height:40px;padding:0 10px}.cts-track2,.cts-bar{border-radius:24px}.cts-lbl{font-size:10.5px}}
        @media (prefers-reduced-motion:reduce){.cts-track{animation:none}.cts-pillars.lit .cts-bar{animation:none}.cts-bar{transform:scaleY(1) !important;opacity:1 !important}}

        /* Section eyebrow (shared) */
        .cts-bd-eyebrow{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--c-accent);background:color-mix(in oklab,var(--c-accent) 10%,transparent);border:1px solid color-mix(in oklab,var(--c-accent) 25%,transparent);padding:5px 11px;border-radius:999px;margin-bottom:16px}

        /* Process stepper */
        .cts-rlv-sec{padding:clamp(80px,12vh,120px) 0;position:relative;background:var(--c-surface);border-top:1px solid var(--c-line);border-bottom:1px solid var(--c-line)}
        .cts-rlv-top{max-width:680px;margin-bottom:30px}
        .cts-rlv-sub{font-size:clamp(1.02rem,1.4vw,1.2rem);color:var(--c-muted);margin-top:14px;max-width:56ch}
        .ps-wrap{display:flex;flex-direction:column;gap:20px}
        .ps-rail{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
        .ps-tab{position:relative;display:inline-flex;align-items:center;gap:9px;padding:11px 20px 11px 15px;border-radius:999px;background:#fff;border:1.5px solid var(--c-line);color:var(--c-muted);font-family:var(--font-geist-sans);font-weight:600;font-size:.9rem;cursor:pointer;transition:transform .22s cubic-bezier(.34,1.56,.64,1),border-color .22s,color .22s,box-shadow .22s;overflow:hidden}
        .ps-tab:hover{transform:translateY(-2px);border-color:var(--c-line-strong);color:var(--c-ink);box-shadow:0 6px 18px rgba(14,21,36,.08)}
        .ps-tab.on{background:var(--c-ink);color:#fff;border-color:var(--c-ink)}
        .ps-num{font-family:var(--font-mono);font-size:.68rem;font-weight:700;letter-spacing:.06em;padding:3px 7px;border-radius:6px;background:color-mix(in oklab,var(--c-accent) 12%,transparent);color:var(--c-accent);flex-shrink:0}
        .ps-tab.on .ps-num{background:var(--c-accent);color:#fff}
        .ps-lbl{white-space:nowrap}
        .ps-bar{position:absolute;left:0;bottom:0;height:2.5px;width:0;background:var(--c-accent)}
        .ps-bar.run{animation:ps-bar-fill 5000ms linear forwards}
        @keyframes ps-bar-fill{from{width:0}to{width:100%}}
        .ps-panel{display:grid;grid-template-columns:.9fr 1.1fr;gap:34px;align-items:center;margin-top:12px}
        @media(max-width:920px){.ps-panel{grid-template-columns:1fr;gap:22px}}
        .ps-copy{max-width:44ch}
        .ps-eyebrow{font-family:var(--font-mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-accent);font-weight:700}
        .ps-title{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(1.6rem,3vw,2.3rem);letter-spacing:-.02em;line-height:1.05;color:var(--c-ink);margin-top:10px}
        .ps-body{font-size:15px;color:var(--c-muted);line-height:1.6;margin-top:14px}
        .ps-stage{position:relative;min-height:360px}
        .ps-view{position:absolute;inset:0;display:none;opacity:0;transform:translateY(8px);transition:opacity .5s ease,transform .5s cubic-bezier(.22,1,.36,1)}
        .ps-view.on{display:flex;opacity:1;transform:none}
        @media(max-width:920px){.ps-stage{min-height:340px}}

        /* Shared mockup chrome */
        .mock{position:relative;flex:1;background:#fff;border:1px solid var(--c-line);border-radius:18px;box-shadow:0 26px 60px -26px rgba(14,21,36,.24);padding:20px;display:flex;flex-direction:column;gap:14px}
        .mock-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--c-line)}
        .mock-title{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-geist-sans);font-weight:700;font-size:.92rem;color:var(--c-ink)}
        .mock-title i{color:var(--c-accent);font-size:1.05rem}
        .mock-pill{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:.62rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted);background:var(--c-surface-2);border:1px solid var(--c-line);padding:4px 10px;border-radius:999px}
        .mock-pill i{font-size:.78rem;color:var(--c-accent)}
        .mock-pill-live{color:var(--c-accent);background:color-mix(in oklab,var(--c-accent) 10%,transparent);border-color:color-mix(in oklab,var(--c-accent) 25%,transparent)}
        .mock-pill-win{color:var(--c-1688);background:rgba(240,140,0,.1);border-color:rgba(240,140,0,.25)}
        .mock-dot{width:6px;height:6px;border-radius:50%;background:var(--c-accent);animation:rtr-blink 1.3s infinite}
        .mock-caption{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:.68rem;color:var(--c-muted);padding-top:10px;border-top:1px solid var(--c-line)}
        .mock-caption i{color:var(--c-accent);font-size:.85rem}

        /* Radar mockup rows (Spot step) */
        .mock-radar .mock-rows{display:flex;flex-direction:column;gap:10px}
        .mr{display:grid;grid-template-columns:32px 1fr 130px 66px 40px;gap:11px;align-items:center;padding:9px 12px;border-radius:12px;background:var(--c-surface-2);border:1px solid var(--c-line);transition:background .25s}
        .mr:hover{background:#fff}
        .mr-dim{opacity:.68}
        .mr-plat{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;color:#fff;font-weight:700;font-size:13px}
        .mr-name{font-family:var(--font-geist-sans);font-weight:600;font-size:.9rem;color:var(--c-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mr-intent{display:flex;align-items:center;gap:8px}
        .mr-bar-track{position:relative;flex:1;height:6px;border-radius:999px;background:var(--c-line);overflow:hidden;min-width:0}
        .mr-bar{display:block;height:100%;border-radius:999px;background:var(--c-xhs);transition:width 1s cubic-bezier(.22,1,.36,1);width:0}
        .mr-intent-v{font-family:var(--font-mono);font-size:.72rem;font-weight:700;color:var(--c-ink);flex-shrink:0}
        .mr-stage{font-family:var(--font-mono);font-size:.6rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--c-surface);border:1px solid var(--c-line);color:var(--c-muted);text-align:center}
        .mr-rising{background:color-mix(in oklab,var(--c-accent) 12%,transparent);border-color:color-mix(in oklab,var(--c-accent) 24%,transparent);color:var(--c-accent)}
        .mr-first{font-family:var(--font-mono);font-size:.72rem;color:var(--c-muted);text-align:right}

        /* 1688 supplier match mockup */
        .mock-match .mm-search{display:flex;align-items:center;gap:9px;padding:10px 14px;background:var(--c-surface-2);border:1px solid var(--c-line);border-radius:999px;font-family:var(--font-mono);font-size:.78rem;color:var(--c-ink)}
        .mock-match .mm-search i{color:var(--c-1688)}
        .mm-search-ct{margin-left:auto;font-family:var(--font-mono);font-size:.65rem;color:var(--c-muted);padding:3px 9px;background:#fff;border-radius:999px;border:1px solid var(--c-line)}
        .mm-rows{display:flex;flex-direction:column;gap:10px}
        .mm-row{display:grid;grid-template-columns:40px 1fr auto;gap:12px;align-items:center;padding:10px 12px;border-radius:12px;background:var(--c-surface-2);border:1px solid var(--c-line);opacity:0;transform:translateX(-8px);transition:opacity .5s ease,transform .5s cubic-bezier(.22,1,.36,1)}
        .ps-view.on .mm-row{opacity:1;transform:none}
        .mm-row.mm-top{background:#fff;border-color:color-mix(in oklab,var(--c-1688) 40%,transparent);box-shadow:0 6px 18px -8px rgba(240,140,0,.28)}
        .mm-thumb{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;color:#fff;font-size:1.15rem;flex-shrink:0}
        .mm-body{display:flex;flex-direction:column;gap:3px;min-width:0}
        .mm-name{font-family:var(--font-geist-sans);font-weight:600;font-size:.86rem;color:var(--c-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mm-meta{font-family:var(--font-mono);font-size:.66rem;color:var(--c-muted);display:flex;align-items:center;gap:6px}
        .mm-meta i{color:var(--c-1688);font-size:.72rem}
        .mm-dot{opacity:.5}
        .mm-price{font-family:var(--font-mono);font-weight:700;font-size:1rem;color:var(--c-ink);white-space:nowrap}
        .mm-row.mm-top .mm-price{color:var(--c-1688)}

        /* Watchlist mockup */
        .mock-list .wl-hero{display:grid;grid-template-columns:52px 1fr auto;gap:14px;align-items:center;padding:14px;background:linear-gradient(135deg,color-mix(in oklab,var(--c-xhs) 8%,transparent),transparent);border:1px solid color-mix(in oklab,var(--c-xhs) 20%,transparent);border-radius:14px}
        .wl-thumb{width:52px;height:52px;border-radius:12px;display:grid;place-items:center;color:#fff;font-size:1.55rem}
        .wl-body{display:flex;flex-direction:column;gap:2px}
        .wl-name{font-family:var(--font-geist-sans);font-weight:700;font-size:.98rem;color:var(--c-ink)}
        .wl-sub{font-family:var(--font-mono);font-size:.68rem;color:var(--c-muted)}
        .wl-delta{display:flex;flex-direction:column;align-items:flex-end}
        .wl-delta-num{font-family:var(--font-geist-sans);font-weight:800;font-size:1.55rem;line-height:1;color:var(--c-accent);letter-spacing:-.02em;transition:opacity .6s ease .3s}
        .wl-delta-lbl{font-family:var(--font-mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted);margin-top:2px}
        .wl-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
        .wl-fact{display:flex;flex-direction:column;gap:3px;padding:11px 13px;border-radius:11px;background:var(--c-surface-2);border:1px solid var(--c-line)}
        .wl-fact-lbl{font-family:var(--font-mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--c-muted)}
        .wl-fact-val{font-family:var(--font-mono);font-weight:700;font-size:1rem;color:var(--c-ink)}
        .wl-fact-hi{color:var(--c-accent)}
        .wl-cta{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:12px;background:var(--c-ink);color:#fff}
        .wl-cta-lbl{font-size:.85rem;font-weight:500}
        .wl-cta-btn{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-geist-sans);font-weight:600;font-size:.82rem;color:#fff;background:transparent;border:none;cursor:default;padding:0}
        .wl-cta-btn i{font-size:.9rem}

        /* Radar Live: full-width live feed */
        .rlv-wrap{display:flex;flex-direction:column;gap:16px}
        .rlv-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        @media(max-width:640px){.rlv-stats{grid-template-columns:repeat(2,1fr)}}
        .rlv-stat{display:flex;flex-direction:column;gap:4px;padding:14px 16px;background:#fff;border:1px solid var(--c-line);border-radius:14px}
        .rlv-stat-lbl{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:.62rem;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted)}
        .rlv-stat-pulse{width:6px;height:6px;border-radius:50%;animation:rtr-blink 1.5s infinite}
        .rlv-stat-val{font-family:var(--font-geist-sans);font-weight:800;font-size:1.55rem;line-height:1;letter-spacing:-.02em}
        .rlv-panel{position:relative;background:#fff;border:1px solid var(--c-line);border-radius:18px;box-shadow:0 26px 60px -30px rgba(14,21,36,.28);overflow:hidden}
        .rlv-bar{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--c-line);background:var(--c-surface-2)}
        .rlv-bar-title{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-geist-sans);font-weight:700;font-size:.92rem;color:var(--c-ink)}
        .rlv-bar-title i{color:var(--c-accent)}
        .rlv-bar-right{display:inline-flex;align-items:center;gap:10px}
        .rlv-live{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:.62rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--c-accent);background:color-mix(in oklab,var(--c-accent) 10%,transparent);border:1px solid color-mix(in oklab,var(--c-accent) 25%,transparent);padding:4px 10px;border-radius:999px}
        .rlv-live-dot{width:6px;height:6px;border-radius:50%;background:var(--c-accent);animation:rtr-blink 1.3s infinite}
        .rlv-tick{font-family:var(--font-mono);font-size:.6rem;color:var(--c-accent);opacity:0;animation:rlv-tick 2.4s ease-out}
        @keyframes rlv-tick{0%{opacity:0;transform:translateY(4px)}20%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(0)}}
        .rlv-thead{display:grid;grid-template-columns:96px minmax(0,1.4fr) minmax(0,1.2fr) 68px 88px 76px;gap:14px;padding:10px 18px;font-family:var(--font-mono);font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted);background:var(--c-surface-2);border-bottom:1px solid var(--c-line)}
        @media(max-width:760px){.rlv-thead{display:none}}
        .rlv-rows{display:flex;flex-direction:column}
        .rlv-row{display:grid;grid-template-columns:96px minmax(0,1.4fr) minmax(0,1.2fr) 68px 88px 76px;gap:14px;padding:14px 18px;border-bottom:1px solid var(--c-line);align-items:center;transition:background .25s}
        .rlv-row:last-child{border-bottom:none}
        .rlv-row:hover{background:var(--c-surface-2)}
        .rlv-row-new{animation:rlv-in .5s cubic-bezier(.22,1,.36,1);background:color-mix(in oklab,var(--c-accent) 5%,transparent)}
        @keyframes rlv-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
        @media(max-width:760px){
          .rlv-row{grid-template-columns:64px minmax(0,1fr) 76px;grid-template-areas:"plat name intent-v" "plat niche stage" "intent intent intent";gap:6px 12px;padding:12px 14px}
          .rlv-col-plat{grid-area:plat;justify-self:start}
          .rlv-col-name .rlv-name{grid-area:name}
          .rlv-col-name .rlv-niche{grid-area:niche;font-size:.66rem}
          .rlv-col-intent{grid-area:intent}
          .rlv-col-spread,.rlv-col-first{display:none}
          .rlv-col-stage{grid-area:stage;justify-self:end}
        }
        .rlv-col{display:flex;align-items:center;gap:8px;min-width:0;font-size:.86rem;color:var(--c-ink)}
        .rlv-col-plat{gap:10px}
        .rlv-plat{display:grid;place-items:center;width:32px;height:32px;border-radius:9px;color:#fff;font-weight:700;font-size:13px;flex-shrink:0}
        .rlv-plat-name{font-family:var(--font-mono);font-size:.66rem;font-weight:700;color:var(--c-muted);letter-spacing:.04em}
        @media(max-width:760px){.rlv-plat-name{display:none}}
        .rlv-col-name{flex-direction:column;align-items:flex-start;gap:2px;min-width:0}
        .rlv-name{font-family:var(--font-geist-sans);font-weight:600;font-size:.9rem;color:var(--c-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
        .rlv-niche{font-family:var(--font-mono);font-size:.62rem;color:var(--c-muted);letter-spacing:.02em}
        .rlv-col-intent{gap:9px}
        .rlv-bar-track{position:relative;flex:1;height:6px;border-radius:999px;background:var(--c-line);overflow:hidden;min-width:0}
        .rlv-bar-fill{display:block;height:100%;border-radius:999px;transition:width 1s cubic-bezier(.22,1,.36,1)}
        .rlv-intent-v{font-family:var(--font-mono);font-size:.72rem;font-weight:700;color:var(--c-ink);flex-shrink:0;min-width:34px;text-align:right}
        .rlv-mono{font-family:var(--font-mono);font-size:.8rem;font-weight:700;color:var(--c-ink)}
        .rlv-col-first{color:var(--c-muted);font-weight:500}
        .rlv-pill{font-family:var(--font-mono);font-size:.6rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:var(--c-surface);border:1px solid var(--c-line);color:var(--c-muted);text-align:center}
        .rlv-pill-rising{background:color-mix(in oklab,var(--c-accent) 12%,transparent);border-color:color-mix(in oklab,var(--c-accent) 24%,transparent);color:var(--c-accent)}
        .rlv-pill-warm{background:rgba(240,140,0,.12);border-color:rgba(240,140,0,.24);color:#a36b00}
        .rlv-pill-watch{background:var(--c-surface-2)}
        .rlv-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-top:1px solid var(--c-line);background:var(--c-surface-2)}
        .rlv-foot-lbl{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:.68rem;color:var(--c-muted)}
        .rlv-foot-lbl i{color:var(--c-accent);font-size:.82rem}
        .rlv-foot-cta{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-geist-sans);font-weight:600;font-size:.8rem;color:var(--c-ink)}
        .rlv-foot-cta i{color:var(--c-accent);font-size:.85rem}
        @media(prefers-reduced-motion:reduce){.rlv-row-new{animation:none;background:transparent}.rlv-bar-fill,.mr-bar,.wl-delta-num{transition:none!important}.rlv-tick,.rlv-live-dot,.mock-dot,.rlv-stat-pulse{animation:none!important}}

        /* Niches (Built for any business pattern) */
        .cts-niches{padding:clamp(80px,12vh,120px) 0;background:var(--c-surface);border-top:1px solid var(--c-line);border-bottom:1px solid var(--c-line)}
        .cts-nv2-block{max-width:880px;margin:0 auto 42px;text-align:center;opacity:1;transform:none;transition:opacity .6s,transform .6s cubic-bezier(.22,1,.36,1)}
        .cts-nv2-block:not(.lit){opacity:0;transform:translateY(18px)}
        .cts-nv2-block:last-child{margin-bottom:0}
        .cts-nv2-label{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(1.7rem,3.8vw,2.7rem);letter-spacing:-.025em;line-height:1.05;margin-bottom:22px}
        .cts-nv2-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
        .cts-nv2-pill{display:inline-flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--c-line);border-radius:999px;padding:9px 18px 9px 9px;font-weight:600;font-size:1rem;color:var(--c-ink);box-shadow:0 1px 3px rgba(14,21,36,.06);opacity:1;transform:none;transition:opacity .5s ease,transform .55s cubic-bezier(.34,1.56,.64,1),border-color .25s,box-shadow .25s}
        .cts-nv2-block:not(.lit) .cts-nv2-pill{opacity:0;transform:translateY(16px) scale(.92)}
        .cts-nv2-pill:hover{transform:translateY(-3px);box-shadow:0 0 0 2px var(--c-accent),0 6px 20px rgba(14,21,36,.1)}
        .cts-nv2-ic{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;color:#fff;font-size:.85rem;flex-shrink:0}
        @media(max-width:640px){.cts-nv2-pill{font-size:.9rem;padding:8px 15px 8px 8px}.cts-nv2-ic{width:22px;height:22px;font-size:.75rem}}

        /* Intelligence (Stop guessing. Read the room. pattern) */
        .cts-intel{padding:clamp(60px,8vh,90px) 0 clamp(60px,8vh,90px)}
        .cts-cred{max-width:940px;margin:0 auto 36px;display:flex;flex-direction:column;align-items:center;gap:20px;text-align:center;padding-bottom:34px;border-bottom:1px solid var(--c-line)}
        .cts-cred-line{font-family:var(--font-geist-sans);font-weight:700;font-size:clamp(1.3rem,2.6vw,2rem);letter-spacing:-.02em;line-height:1.05;color:var(--c-ink)}
        .cts-cred-stats{display:flex;align-items:center;justify-content:center;gap:clamp(14px,3vw,38px);flex-wrap:wrap}
        .cts-cstat{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:92px}
        .cts-cstat b{font-family:var(--font-geist-sans);font-weight:800;font-size:clamp(2rem,3.6vw,3rem);line-height:1;letter-spacing:-.025em}
        .cts-cstat span{font-family:var(--font-mono);font-size:.61rem;letter-spacing:.08em;text-transform:uppercase;color:var(--c-muted)}
        .cts-cdiv{width:1px;height:38px;background:var(--c-line-strong);flex-shrink:0}
        .cts-cred-wire{position:relative;height:2px;width:min(560px,82%);border-radius:2px;background:linear-gradient(90deg,transparent,var(--c-line-strong) 28%,var(--c-line-strong) 72%,transparent);overflow:hidden}
        .cts-spark{position:absolute;top:-1px;bottom:-1px;left:-120px;width:120px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--c-accent),var(--c-xhs),var(--c-1688),var(--c-taobao),transparent);box-shadow:0 0 10px color-mix(in oklab,var(--c-accent) 45%,transparent);animation:cts-spark-flow 7s cubic-bezier(.65,0,.35,1) infinite}
        @keyframes cts-spark-flow{from{left:-120px}to{left:100%}}
        .cts-cred-logos{display:flex;gap:clamp(16px,3vw,30px);align-items:center;flex-wrap:wrap;justify-content:center}
        .cts-cred-logos .cts-glyph{width:28px;height:28px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;opacity:.5;transition:opacity .3s}
        .cts-cred-logos:hover .cts-glyph{opacity:.8}
        .cts-intel-head{max-width:680px;margin-bottom:24px;display:flex;flex-direction:column;gap:13px}
        .cts-intel-head h2{font-weight:800;font-size:clamp(2.4rem,6vw,4.6rem);letter-spacing:-.035em;line-height:.94}
        @media (prefers-reduced-motion:reduce){.cts-spark{animation:none}}

        /* Read the room: interactive console (Mint Studio "room" pattern) */
        .rtr-console{position:relative;display:grid;grid-template-columns:280px 1fr;gap:22px;background:var(--c-ink);border-radius:22px;padding:26px;overflow:hidden;margin-top:8px}
        @media(max-width:860px){.rtr-console{grid-template-columns:1fr;border-radius:18px;padding:18px 16px}}
        .rtr-glow{position:absolute;width:340px;height:340px;border-radius:50%;background:var(--c-accent);filter:blur(120px);opacity:.16;top:-130px;right:-90px;pointer-events:none}
        .rtr-glow.g2{background:var(--c-xhs);left:-110px;right:auto;top:auto;bottom:-140px;opacity:.12}
        .rtr-rail{position:relative;z-index:2;display:flex;flex-direction:column;gap:8px}
        .rtr-signal{position:relative;display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.82);cursor:pointer;text-align:left;width:100%;transition:background .25s,border-color .25s,transform .25s;overflow:hidden}
        .rtr-signal:hover{background:rgba(255,255,255,.1);transform:translateX(3px)}
        .rtr-si{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-size:1rem;background:rgba(255,255,255,.1);color:#fff;flex-shrink:0;transition:background .25s,color .25s}
        .rtr-sg{flex:1;min-width:0;display:flex;flex-direction:column}
        .rtr-sg b{font-family:var(--font-geist-sans);font-weight:600;font-size:.9rem;color:#fff}
        .rtr-sg span{font-size:.71rem;color:rgba(255,255,255,.55);line-height:1.3}
        .rtr-schev{color:rgba(255,255,255,.3);font-size:.85rem;transition:transform .25s,color .25s}
        .rtr-signal.active{background:var(--c-accent);border-color:var(--c-accent)}
        .rtr-signal.active .rtr-sg b,.rtr-signal.active .rtr-sg span,.rtr-signal.active .rtr-schev{color:#fff}
        .rtr-signal.active .rtr-sg span{color:rgba(255,255,255,.75)}
        .rtr-signal.active .rtr-si{background:rgba(255,255,255,.18);color:#fff}
        .rtr-signal.active .rtr-schev{transform:translateX(3px)}
        .rtr-sbar{position:absolute;left:0;bottom:0;height:2.5px;width:0;background:rgba(255,255,255,.6)}
        .rtr-sbar.run{animation:rtr-bar-fill 4200ms linear forwards}
        @keyframes rtr-bar-fill{from{width:0}to{width:100%}}
        @media(max-width:860px){
          .rtr-rail{flex-direction:row;flex-wrap:nowrap;overflow-x:auto;gap:8px;scrollbar-width:none}
          .rtr-rail::-webkit-scrollbar{display:none}
          .rtr-signal{flex:0 0 auto;width:auto;flex-direction:column;gap:5px;text-align:center;padding:10px 14px}
          .rtr-signal .rtr-sg span,.rtr-signal .rtr-schev{display:none}
          .rtr-signal .rtr-sg b{font-size:.78rem;white-space:nowrap}
          .rtr-signal:hover{transform:none}
        }
        .rtr-panel{position:relative;z-index:2;background:#fff;border-radius:18px;min-height:400px;padding:26px;overflow:hidden;display:flex;flex-direction:column}
        @media(max-width:560px){.rtr-panel{padding:20px 16px;min-height:420px}}
        .rtr-scanline{position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,var(--c-accent),transparent);z-index:9;opacity:.85;animation:rtr-scan 3.6s linear infinite}
        @keyframes rtr-scan{0%{transform:translateY(0)}100%{transform:translateY(400px)}}
        .rtr-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:4px}
        .rtr-tag{font-family:var(--font-mono);font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--c-accent)}
        .rtr-live{font-family:var(--font-mono);font-size:.62rem;color:var(--c-muted);display:inline-flex;align-items:center;gap:6px;border:1px solid var(--c-line);border-radius:999px;padding:4px 10px;flex-shrink:0}
        .rtr-live .lv{width:6px;height:6px;border-radius:50%;background:var(--c-accent);animation:rtr-blink 1.3s infinite}
        @keyframes rtr-blink{50%{opacity:.25}}
        .rtr-title{font-family:var(--font-geist-sans);font-weight:800;font-size:1.4rem;letter-spacing:-.01em;margin:8px 0 4px;color:var(--c-ink)}
        .rtr-cap{font-size:.9rem;color:var(--c-muted);margin-bottom:18px;max-width:52ch}
        .rtr-stage{flex:1;position:relative;min-height:230px}
        .rtr-view{position:absolute;inset:0;display:none;flex-direction:column;justify-content:center}
        .rtr-view.on{display:flex}
        .rtr-bars-wrap{position:relative;padding-bottom:30px}
        .rtr-bars{display:flex;align-items:flex-end;gap:16px;height:190px;padding:0 4px}
        .rtr-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;height:100%}
        .rtr-bar-track{position:relative;width:100%;max-width:56px;height:100%;display:flex;align-items:flex-end}
        .rtr-bar-fill{width:100%;border-radius:10px 10px 0 0;transition:height 1s cubic-bezier(.22,1,.36,1);position:relative;opacity:.7}
        .rtr-bar-col.top .rtr-bar-fill{opacity:1}
        .rtr-bar-val{position:absolute;top:-22px;left:0;right:0;text-align:center;font-family:var(--font-mono);font-size:.72rem;font-weight:700;color:var(--c-ink)}
        .rtr-bar-lbl{font-size:.72rem;color:var(--c-muted);font-weight:600;text-align:center}
        .rtr-flag{position:absolute;bottom:0;left:0;font-family:var(--font-mono);font-size:.74rem;color:var(--c-accent);display:inline-flex;align-items:center;gap:7px}
        .rtr-gauge-wrap{display:flex;flex-direction:column;align-items:center;gap:18px}
        .rtr-gauge{position:relative;width:230px;height:130px}
        .rtr-gauge svg{width:100%;height:100%;overflow:visible}
        .rtr-needle{position:absolute;left:115px;top:115px;width:78px;height:3px;border-radius:2px;background:var(--c-ink);transform-origin:0 50%;margin-top:-1.5px;transition:transform 1.2s cubic-bezier(.34,1.4,.5,1)}
        .rtr-gauge-val{position:absolute;left:0;right:0;bottom:-4px;text-align:center;font-family:var(--font-geist-sans);font-weight:800;font-size:1.7rem;color:var(--c-ink)}
        .rtr-gauge-val small{display:block;font-family:var(--font-mono);font-size:.62rem;font-weight:400;color:var(--c-accent);letter-spacing:.05em;margin-top:2px}
        .rtr-senti-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
        .rtr-chip{font-size:.76rem;font-weight:600;padding:6px 12px;border-radius:999px;opacity:0;transform:translateY(6px);transition:opacity .4s,transform .4s;background:var(--c-surface-2);color:var(--c-muted)}
        .rtr-chip.in{opacity:1;transform:none}
        .rtr-chip.pos.in{background:color-mix(in oklab, var(--c-accent) 14%, transparent);color:var(--c-accent)}
        .rtr-chip.amb.in{background:rgba(240,140,0,.14);color:#a36b00}
        .rtr-ads{display:flex;flex-direction:column;gap:13px;width:100%;max-width:440px;margin:0 auto}
        .rtr-ad{background:var(--c-surface-2);border:1px solid var(--c-line);border-radius:14px;padding:12px 14px;position:relative}
        .rtr-ad-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
        .rtr-ad-top b{font-size:.86rem;font-weight:700;color:var(--c-ink)}
        .rtr-ad-days{font-family:var(--font-mono);font-size:.68rem;color:var(--c-muted)}
        .rtr-ad-track{height:8px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 1px var(--c-line);overflow:hidden}
        .rtr-ad-fill{height:100%;width:0;border-radius:999px;background:var(--c-accent);transition:width 1.1s cubic-bezier(.22,1,.36,1)}
        .rtr-ad.win .rtr-ad-fill{background:linear-gradient(90deg,var(--c-accent),var(--c-xhs))}
        .rtr-ad-flag{position:absolute;top:-9px;right:12px;font-family:var(--font-mono);font-size:.6rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;background:var(--c-accent);color:#fff;padding:3px 9px;border-radius:999px;opacity:0;transform:translateY(4px) scale(.9);transition:opacity .4s .5s,transform .4s .5s}
        .rtr-ad-flag.in{opacity:1;transform:none}
        .rtr-terms{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;padding:8px 4px}
        .rtr-term{font-family:var(--font-mono);font-weight:700;border-radius:999px;padding:7px 14px;background:var(--c-surface-2);color:var(--c-muted);opacity:0;transform:scale(.7);transition:opacity .45s cubic-bezier(.34,1.56,.64,1),transform .45s cubic-bezier(.34,1.56,.64,1);font-size:.82rem}
        .rtr-term.in{opacity:1;transform:none}
        .rtr-term.lg.in{font-size:1.12rem;background:color-mix(in oklab, var(--c-accent) 14%, transparent);color:var(--c-accent)}
        .rtr-term.md.in{font-size:.96rem}
        .rtr-compet-wrap{display:flex;flex-direction:column;gap:14px}
        .rtr-compet{display:flex;flex-direction:column;gap:11px;width:100%;max-width:460px;margin:0 auto}
        .rtr-ct{display:flex;align-items:center;gap:12px;background:var(--c-surface-2);border:1px solid var(--c-line);border-radius:14px;padding:11px 14px;opacity:0;transform:translateX(-10px);transition:opacity .5s,transform .5s}
        .rtr-ct.in{opacity:1;transform:none}
        .rtr-cdot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .rtr-cnm{font-size:.86rem;font-weight:600;color:var(--c-ink);flex-shrink:0;width:76px}
        .rtr-cnote{flex:1;font-size:.78rem;color:var(--c-muted)}
        .rtr-ctrend{font-family:var(--font-mono);font-size:.72rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;color:var(--c-accent);flex-shrink:0}
        .rtr-window{margin-top:2px;font-size:.82rem;color:var(--c-muted);text-align:center;max-width:460px;margin-left:auto;margin-right:auto}
        @media(prefers-reduced-motion:reduce){
          .rtr-live .lv,.rtr-sbar.run{animation:none!important}
          .rtr-scanline{display:none!important}
          .rtr-bar-fill,.rtr-ad-fill,.rtr-needle{transition:none!important}
          .rtr-chip,.rtr-term,.rtr-ct,.rtr-ad-flag{transition:none!important}
        }
      `}</style>

      {/* No-JS fallback: reveal everything if JavaScript is disabled.
          (ReadTheRoom is a React client component, so it needs no
          noscript override — React itself needs JS to render at all,
          same as the rest of this app.) */}
      <noscript><style>{`
        .cts-nv2-block, .cts-pillars { opacity:1 !important; transform:none !important; }
        .cts-nv2-pill { opacity:1 !important; transform:none !important; }
      `}</style></noscript>

      {/* Scroll-reveal: add .lit class to stages when they enter viewport.
          Uses a re-scan loop that creates a fresh observer each tick,
          so it catches elements rendered by React after first paint. */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          function reveal(el){
            if(!el || el.classList.contains('lit')) return;
            var io = new IntersectionObserver(function(entries){
              entries.forEach(function(e){
                if(e.isIntersecting){
                  e.target.classList.add('lit');
                  e.target.classList.add('live');
                  io.unobserve(e.target);
                }
              });
            }, { threshold: 0.15 });
            io.observe(el);
          }
          function scan(){
            document.querySelectorAll('.cts-nv2-block, .cts-pillars').forEach(reveal);
          }
          scan();
          var tries = 0;
          var iv = setInterval(function(){
            scan();
            if(++tries >= 12) clearInterval(iv);
          }, 350);
        })();
      ` }} />
    </div>
  );
}
