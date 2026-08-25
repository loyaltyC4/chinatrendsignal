import Link from "next/link";
import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";
import Faq from "@/components/faq";

export const dynamic = "force-dynamic";

/*
 * Homepage redesign v2. Layers Mint Studio's section patterns onto CTS's
 * existing design system (Geist + electric-blue tokens + platform hues),
 * with CTS content throughout.
 *
 * SECTIONS (top to bottom):
 *  1. Hero + colour logo marquee (existing)
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

const STEPS = [
  {
    img: "/step-spot.jpg",
    alt: "A person holding a magnifying glass up to a phone, spotting a trend",
    t: "We spot the demand",
    d: "Saves beating likes on Xiaohongshu means bookmark-to-buy intent, not vanity views.",
  },
  {
    img: "/step-match.jpg",
    alt: "A person comparing a parcel box with a product photo on a phone",
    t: "We match the factory",
    d: "1688 and Taobao are checked for every candidate, including reverse image search from the viral photo.",
  },
  {
    img: "/step-list.jpg",
    alt: "A person celebrating a listing launching from a laptop",
    t: "You list it first",
    d: "The alert carries the unit cost and the live TikTok Shop spread, so you can price and list the same day.",
  },
];

// "Listing created in seconds" — extracted signal cards (Brand DNA pattern)
const SIGNAL_CARDS = [
  { label: "Platform", value: "Xiaohongshu · pet supplies", hue: "var(--c-xhs)", ic: "ph-rss" },
  { label: "Demand", value: "0.96 saves-to-likes", hue: "var(--c-xhs)", ic: "ph-heart" },
  { label: "Factory unit", value: "¥14 on 1688", hue: "var(--c-1688)", ic: "ph-factory" },
  { label: "Sell spread", value: "US$18-28 TikTok Shop", hue: "var(--c-taobao)", ic: "ph-storefront-logo" },
  { label: "First seen", value: "6 days ago, logged", hue: "var(--c-douyin)", ic: "ph-calendar" },
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

const TIERS = [
  { name: "Scout", price: "A$0", per: "forever", line: "See what we see, a week late.",
    feats: ["Weekly trend email", "Top 10, 7-day delayed", "5 lookups a month"], featured: false },
  { name: "Hunter", price: "A$59", per: "/month", line: "The daily edge for active sellers.",
    feats: ["Daily radar, every signal", "First-detected date on each", "1688 supplier match", "10-product watchlist"], featured: true },
  { name: "Operator", price: "A$129", per: "/month", line: "For full-time operators.",
    feats: ["Everything in Hunter, uncapped", "Unlimited watchlist", "Supplier price history", "CSV export", "Extra seats +A$39"], featured: false },
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
        {/* 1. HERO + colour logo marquee */}
        <section className="spectrum-wash">
          <div className="mx-auto max-w-[1160px] px-5 pt-20 pb-16 text-center sm:px-8 lg:pt-24">
            <h1 className="display-xl mx-auto max-w-[17ch] text-ink">
              See it in China <span className="spectrum-text">before</span> the window shuts.
            </h1>
            <p className="mx-auto mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-body">
              We index what Chinese shoppers are saving on Douyin and Xiaohongshu, match it to a
              factory price on 1688, and log the date we first saw it.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login" className="rounded-ctl bg-accentstrong px-5 py-2.5 text-[14px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px">
                Get started
              </Link>
              <Link href="/pricing" className="rounded-ctl border border-linestrong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface2 active:translate-y-px">
                See pricing
              </Link>
            </div>
            <p className="label mt-14 text-mut">One radar, every platform that matters</p>
            <div className="cts-ticker mt-6" aria-label="Platforms covered">
              <div className="cts-track">
                <div className="cts-set"><LogoSet /></div>
                <div className="cts-set" aria-hidden="true"><LogoSet /></div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROCESS — unboxed illustrations, one per step */}
        <section id="how" className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="display-lg text-ink">
                From <span className="text-accent">signal</span> to listing, in one afternoon.
              </h2>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-body">
                Every alert lands with the product, the factory, and the margin already checked.
                You go from seeing a trend to listing it while the window is still open.
              </p>
              <div className="mt-8">
                {STEPS.map((s, i) => (
                  <div key={s.t} className={`flex items-center gap-6 py-6 ${i > 0 ? "border-t border-line" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.img} alt={s.alt} className="h-28 w-28 shrink-0 rounded-full object-cover" />
                    <div>
                      <p className="text-[15.5px] font-semibold text-ink">{s.t}</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-body">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/step-spot.jpg" alt="A seller discovering a trending product on their phone beside an open parcel box" className="block h-auto w-full rounded-card" />
          </div>
        </section>

        {/* 3. LISTING CREATED IN SECONDS — brand-scan mockup (Mint Studio "Brand DNA" pattern) */}
        <section className="cts-bdna" id="signal-scan">
          <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
            <div className="cts-bdna-top">
              <span className="cts-bd-eyebrow">Signal scan</span>
              <h2 className="display-lg text-ink">Your listing, read in seconds.</h2>
              <p className="cts-bdna-sub text-body">
                We scan the Chinese platforms and extract the demand, supply, and margin signals
                that make a product worth listing, then stamp every alert with the date we first saw it.
              </p>
            </div>
            <div className="cts-bdna-stage" id="scanStage">
              {/* Left: browser mockup with real illustration inside */}
              <div className="cts-bdna-browser">
                <div className="cts-bdna-bar">
                  <span className="d d1" /> <span className="d d2" /> <span className="d d3" />
                  <span className="u">xiaohongshu.com/discovery/item/steam-pet-brush</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/step-spot.jpg" alt="A Xiaohongshu post about a trending steam pet brush" className="cts-bdna-hero-img" />
              </div>
              {/* Right: extracted signal cards */}
              <div className="cts-bdna-out">
                {SIGNAL_CARDS.map((c, i) => (
                  <div key={c.label} className="cts-bdna-row" style={{ transitionDelay: `${i * 0.12}s` }}>
                    <span className="cts-bdna-node" style={{ borderColor: c.hue, color: c.hue }}>
                      <i className={`ph-fill ${c.ic}`} />
                    </span>
                    <div className="cts-bdna-rc">
                      <span className="cts-bdna-lbl">{c.label}</span>
                      <span className="text-[14px] font-medium text-ink">{c.value}</span>
                    </div>
                  </div>
                ))}
                <span className="cts-bdna-caption text-mut">
                  <i className="ph-fill ph-check-circle" style={{ color: "var(--c-accent)" }} />
                  From post to listing-ready signal, in seconds.
                </span>
              </div>
              {/* Connecting SVG lines (animated draw on scroll) */}
              <svg className="cts-bdna-conn" viewBox="0 0 500 400" preserveAspectRatio="none" aria-hidden="true">
                <path d="M250 80 C 180 80 180 160 110 160" stroke="var(--c-xhs)" />
                <path d="M250 140 C 180 140 180 200 110 200" stroke="var(--c-xhs)" />
                <path d="M250 200 C 180 200 180 240 110 240" stroke="var(--c-1688)" />
                <path d="M250 260 C 180 260 180 280 110 280" stroke="var(--c-taobao)" />
                <path d="M250 320 C 180 320 180 320 110 320" stroke="var(--c-douyin)" />
              </svg>
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
            <div className="cts-pillars mx-auto mt-14 flex max-w-[880px] items-stretch gap-3">
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
              <span className="label text-mut"><span className="inline-block h-[7px] w-[7px] rounded-full bg-accent" />Read from the source</span>
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
            {/* Headline + mirror stage */}
            <div className="cts-intel-head">
              <span className="label text-mut"><span className="inline-block h-[7px] w-[7px] rounded-full bg-accent" />Read the room</span>
              <h2 className="display-lg text-ink">Stop guessing.<br />Read the room.</h2>
              <p className="text-[15px] text-mut">AI-driven signal analysis for winning products.</p>
            </div>
            <div className="cts-mir-stage" id="mirStage">
              <svg className="cts-mir-lines" viewBox="0 0 1180 380" preserveAspectRatio="none" aria-hidden="true">
                <path d="M120 250 C 210 250 210 165 300 165" stroke="var(--c-douyin)" />
                <path d="M120 300 C 250 300 250 335 380 335" stroke="var(--c-xhs)" />
                <path d="M150 120 C 240 120 250 90 340 90" stroke="var(--c-taobao)" />
                <path d="M300 300 C 380 300 380 235 470 235" stroke="var(--c-accent)" />
                <path d="M300 150 C 400 150 410 110 500 110" stroke="var(--c-taobao)" />
                <path d="M330 330 C 470 330 520 345 620 345" stroke="var(--c-1688)" />
                <path d="M470 120 C 560 120 560 200 650 200" stroke="var(--c-xhs)" />
                <path d="M470 300 C 560 300 560 250 650 250" stroke="var(--c-accent)" />
                <path d="M620 150 C 720 150 740 120 840 120" stroke="var(--c-douyin)" />
                <path d="M620 320 C 720 320 760 300 860 290" stroke="var(--c-accent)" />
                <path d="M650 210 C 760 210 800 180 900 175" stroke="var(--c-xhs)" />
                <path d="M780 130 C 880 130 900 160 1000 160" stroke="var(--c-1688)" />
                <path d="M780 290 C 880 290 900 260 1000 255" stroke="var(--c-taobao)" />
                <path d="M900 190 C 980 190 1020 165 1100 160" stroke="var(--c-douyin)" />
                <circle className="cts-mir-node" cx="120" cy="250" r="6" />
                <circle className="cts-mir-node" cx="300" cy="165" r="6" />
                <circle className="cts-mir-node" cx="500" cy="110" r="6" />
                <circle className="cts-mir-node" cx="650" cy="200" r="6" />
                <circle className="cts-mir-node" cx="840" cy="120" r="6" />
                <circle className="cts-mir-node" cx="1000" cy="160" r="6" />
                <circle className="cts-mir-node" cx="1100" cy="160" r="6" />
              </svg>
            </div>
          </div>
        </section>

        {/* 7. PRICING */}
        <section id="pricing" className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <h2 className="display-lg text-ink">One winning product pays for years of this.</h2>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-body">
            Plain AUD, GST included. Credits never expire and cancelling takes one click.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className={`flex flex-col p-7 ${t.featured ? "bg-surface2" : "bg-surface"}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[15px] font-medium text-ink">{t.name}</span>
                  {t.featured && (
                    <span className="rounded-chip bg-accentweak px-1.5 py-0.5 font-mono text-[9.5px] text-accent">most popular</span>
                  )}
                </div>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span data-numeric className="font-mono text-[34px] font-medium tracking-[-.035em] text-ink">{t.price}</span>
                  <span className="font-mono text-[12.5px] text-mut">{t.per}</span>
                </p>
                <p className="mt-2 text-[13.5px] text-mut">{t.line}</p>
                <ul className="mt-6 flex-1 space-y-2.5 border-t border-line pt-6">
                  {t.feats.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13.5px] leading-snug text-body">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-7 rounded-ctl px-4 py-2.5 text-center text-[13.5px] font-medium transition-opacity hover:opacity-90 active:translate-y-px ${
                    t.featured ? "bg-accentstrong text-onaccent" : "border border-linestrong text-ink"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
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
        .cts-logo{display:flex;align-items:center;justify-content:center;height:44px;margin:0 30px;flex-shrink:0}
        .cts-logo img{max-height:30px;width:auto;object-fit:contain;opacity:.85;transition:opacity .3s}
        .cts-ticker:hover .cts-logo img{opacity:1}
        .cts-glyph{width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff}

        /* Pillar band */
        .cts-pillars{height:380px}
        .cts-pillar{position:relative;flex:1;display:flex;flex-direction:column}
        .cts-track2{position:relative;flex:1;border-radius:40px;overflow:hidden;background-color:var(--c-surface-2);background-image:linear-gradient(135deg,var(--c-line) 25%,transparent 25.5%,transparent 50%,var(--c-line) 50.5%,var(--c-line) 75%,transparent 75.5%,transparent);background-size:10px 10px}
        .cts-bar{position:absolute;bottom:0;left:0;right:0;border-radius:40px;background:#b9b4ab;padding:12px;display:flex;align-items:flex-start;justify-content:center;transform-origin:bottom;animation:cts-grow .9s cubic-bezier(.34,1.4,.44,1) both}
        .cts-bar-lead{background:var(--c-accent);box-shadow:0 30px 60px -25px color-mix(in oklab, var(--c-accent) 55%, transparent)}
        @keyframes cts-grow{from{transform:scaleY(0);opacity:0}to{transform:scaleY(1);opacity:1}}
        .cts-val{display:flex;align-items:center;justify-content:center;height:52px;padding:0 18px;border-radius:999px;background:rgba(255,255,255,.2);font-family:var(--font-mono);font-weight:700;font-size:20px;letter-spacing:-.02em;color:#fff;white-space:nowrap}
        .cts-pillar:not(:has(.cts-bar-lead)) .cts-val{background:rgba(14,21,36,.14)}
        .cts-tip{position:absolute;z-index:3;left:50%;top:-50px;transform:translateX(-50%);background:var(--c-ink);color:var(--c-canvas);font-size:12.5px;font-weight:600;padding:8px 16px;border-radius:12px;white-space:nowrap}
        .cts-tip-dot{position:absolute;left:50%;bottom:-24px;transform:translateX(-50%);width:14px;height:14px;border-radius:50%;background:var(--c-ink);border:3px solid var(--c-canvas)}
        .cts-lbl{margin-top:14px;text-align:center;font-size:13px;color:var(--c-muted);font-weight:500;line-height:1.4}
        .cts-lbl b{display:block;font-size:14px;font-weight:700;color:var(--c-ink)}
        @media(max-width:760px){.cts-pillars{height:260px;gap:6px}.cts-val{font-size:14px;height:40px;padding:0 10px}.cts-track2,.cts-bar{border-radius:24px}.cts-lbl{font-size:10.5px}}
        @media (prefers-reduced-motion:reduce){.cts-track,.cts-bar{animation:none}}

        /* Signal scan (Brand DNA pattern) */
        .cts-bdna{padding:clamp(80px,12vh,120px) 0;position:relative}
        .cts-bdna-top{max-width:680px;margin-bottom:30px}
        .cts-bd-eyebrow{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--c-accent);background:color-mix(in oklab,var(--c-accent) 10%,transparent);border:1px solid color-mix(in oklab,var(--c-accent) 25%,transparent);padding:5px 11px;border-radius:999px;margin-bottom:16px}
        .cts-bdna-sub{font-size:clamp(1.02rem,1.4vw,1.2rem);color:var(--c-muted);margin-top:14px;max-width:54ch}
        .cts-bdna-stage{position:relative;display:grid;grid-template-columns:1.02fr .98fr;gap:30px;align-items:center}
        @media(max-width:920px){.cts-bdna-stage{grid-template-columns:1fr;gap:22px}}
        .cts-bdna-conn{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;overflow:visible}
        @media(max-width:920px){.cts-bdna-conn{display:none}}
        .cts-bdna-conn path{fill:none;stroke-width:2;stroke-linecap:round;stroke-dasharray:300;stroke-dashoffset:0;transition:stroke-dashoffset 1.3s}
        .cts-bdna-stage:not(.lit) .cts-bdna-conn path{stroke-dashoffset:300}
        .cts-bdna-browser{position:relative;z-index:2;background:#fff;border:1px solid var(--c-line);border-radius:18px;box-shadow:0 26px 60px -26px rgba(14,21,36,.28);overflow:hidden}
        .cts-bdna-bar{display:flex;align-items:center;gap:9px;padding:11px 14px;border-bottom:1px solid var(--c-line);background:var(--c-surface-2)}
        .cts-bdna-bar .d{width:10px;height:10px;border-radius:50%}
        .cts-bdna-bar .d1{background:#ff5f57}.cts-bdna-bar .d2{background:var(--c-accent)}.cts-bdna-bar .d3{background:#22c55e}
        .cts-bdna-bar .u{flex:1;display:flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--c-line);border-radius:999px;padding:6px 12px;font-family:var(--font-mono);font-size:.72rem;color:var(--c-muted)}
        .cts-bdna-bar .u i{color:var(--c-accent);font-size:.85rem}
        .cts-bdna-hero-img{position:relative;width:100%;height:auto;display:block;aspect-ratio:1/0.94;object-fit:cover}
        .cts-bdna-out{position:relative;z-index:2;display:flex;flex-direction:column;gap:13px}
        .cts-bdna-row{display:flex;align-items:center;gap:14px;opacity:1;transform:none;transition:opacity .5s,transform .5s cubic-bezier(.22,1,.36,1)}
        .cts-bdna-stage:not(.lit) .cts-bdna-row{opacity:0;transform:translateX(14px)}
        .cts-bdna-node{flex-shrink:0;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#fff;border:1.5px solid var(--c-accent);color:var(--c-accent);font-size:1rem;box-shadow:0 4px 12px color-mix(in oklab,var(--c-accent) 18%,transparent)}
        .cts-bdna-rc{flex:1;min-width:0;background:#fff;border:1px solid var(--c-line);border-radius:14px;padding:12px 15px;box-shadow:0 1px 2px rgba(14,21,36,.04)}
        .cts-bdna-lbl{font-family:var(--font-mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c-faint);display:block;margin-bottom:8px}
        .cts-bdna-caption{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:.72rem;color:var(--c-muted);margin-top:26px}
        .cts-bdna-caption i{color:var(--c-accent)}

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
        .cts-mir-stage{position:relative;height:380px;max-width:1100px;margin:6px auto 0}
        .cts-mir-lines{position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;overflow:visible}
        .cts-mir-lines path{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1600;stroke-dashoffset:0;transition:stroke-dashoffset 1.9s}
        .cts-mir-stage:not(.lit) .cts-mir-lines path{stroke-dashoffset:1600}
        .cts-mir-node{fill:#fff;stroke-width:2.5;opacity:1;transition:opacity .5s .9s}
        .cts-mir-stage:not(.lit) .cts-mir-node{opacity:0}
        @media (prefers-reduced-motion:reduce){.cts-spark,.cts-mir-lines path{animation:none}.cts-mir-lines path{stroke-dashoffset:0}.cts-mir-node{opacity:1}}
      `}</style>

      {/* Scroll-reveal: add .lit class to stages when they enter viewport.
          Re-scans every 800ms until React hydration completes, so it
          catches elements rendered after first paint. */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function(){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(e){
              if(e.isIntersecting){
                e.target.classList.add('lit');
                e.target.classList.add('live');
                io.unobserve(e.target);
              }
            });
          }, { threshold: 0.2 });
          function scan(){
            var els = document.querySelectorAll('.cts-bdna-stage, .cts-nv2-block, .cts-mir-stage');
            if(els.length === 0){ return; }
            els.forEach(function(el){ io.observe(el); });
          }
          scan();
          // Re-scan until React hydrates and the elements exist
          var tries = 0;
          var iv = setInterval(function(){
            scan();
            if(++tries > 10) clearInterval(iv);
          }, 400);
        })();
      ` }} />
    </div>
  );
}
