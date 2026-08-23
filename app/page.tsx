import Link from "next/link";
import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";
import Faq from "@/components/faq";

export const dynamic = "force-dynamic";

/*
 * Homepage redesign. Keeps the app's marketing chrome (MarketingNav /
 * MarketingFooter) and the Geist font wiring from layout, and layers the new
 * creative direction on top:
 *
 *   - Hero: "See it in China before the window shuts." with a cooled spectrum on
 *     the emphasis word. Floating product cards removed per the user.
 *   - Source wall: the bidcheck.co.za hero logo-marquee, replicated and switched
 *     to full colour (the original is monochrome via filter:brightness(0)).
 *   - Process: "From signal to listing, in one afternoon." with a flat-vector
 *     people illustration per step (generated in the house style: no black
 *     outlines, flat solid colours, cream background, confetti).
 *   - Three checks: a pillar/bar band adapted from the statistics-card pattern,
 *     with the four real metrics (factory unit, demand, margin, first-seen).
 *   - Pricing, FAQ, closing band.
 */

const BF = "c=1bxeoe1y0zo3oi7mr8z4fruj0nrlDlja6p5";

// Full-colour platform logos via Brandfetch's public embeddable CDN.
// Douyin, Xiaohongshu and 1688 have no clean Brandfetch entry, so they render as
// the brand's coloured glyph tiles (the characters the product already uses).
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

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <MarketingNav />

      <main id="main">
        {/* 1. HERO */}
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

            {/* source marquee, bidcheck hero treatment in full colour */}
            <p className="label mt-14 text-mut">One radar, every platform that matters</p>
            <div className="cts-ticker mt-6" aria-label="Platforms covered">
              <div className="cts-track">
                <div className="cts-set"><LogoSet /></div>
                <div className="cts-set" aria-hidden="true"><LogoSet /></div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PROCESS */}
        <section id="how" className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-card border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/step-spot.jpg" alt="A seller discovering a trending product on their phone beside an open parcel box" className="block h-auto w-full" />
            </div>
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
                  <div key={s.t} className={`flex items-center gap-5 py-5 ${i > 0 ? "border-t border-line" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.img} alt={s.alt} className="h-20 w-20 shrink-0 rounded-[18px] border border-line object-cover" />
                    <div>
                      <p className="text-[15.5px] font-semibold text-ink">{s.t}</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-body">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. THREE CHECKS: pillar band */}
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

        {/* 4. PRICING */}
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

        {/* 5. FAQ */}
        <section className="mx-auto max-w-[46rem] px-5 py-20 sm:px-8">
          <h2 className="display-lg max-w-[20ch] text-ink">Questions you should ask.</h2>
          <div className="mt-8">
            <Faq />
          </div>
        </section>

        {/* 6. CLOSING BAND */}
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

      {/* Marquee + pillar styles, scoped to this page. The marquee replicates
          bidcheck.co.za's hero logo ticker, switched to full colour. */}
      <style>{`
        .cts-ticker{width:100%;max-width:1060px;margin:0 auto;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}
        .cts-track{display:flex;width:max-content;animation:cts-marq 44s linear infinite;will-change:transform}
        .cts-ticker:hover .cts-track{animation-play-state:paused}
        @keyframes cts-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .cts-set{display:flex;align-items:center;flex-shrink:0}
        .cts-logo{display:flex;align-items:center;justify-content:center;height:44px;margin:0 30px;flex-shrink:0}
        .cts-logo img{max-height:30px;width:auto;object-fit:contain;opacity:.85;transition:opacity .3s}
        .cts-ticker:hover .cts-logo img{opacity:1}
        .cts-glyph{width:30px;height:30px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff}

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
      `}</style>
    </div>
  );
}
