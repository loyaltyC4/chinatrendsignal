import Link from "next/link";
import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";
import HeroRadar from "@/components/hero-radar";
import LiveSignals from "@/components/live-signals";
import SourceMarquee from "@/components/source-marquee";
import Faq from "@/components/faq";

export const dynamic = "force-dynamic";

/*
 * Homepage, structured on bidcheck.co.za's section order.
 *
 * WHAT CARRIED OVER (and what it became):
 *   Find, win, manage tenders            -> Find it, cost it, sell it
 *   Latest tenders, published live        -> Latest signals, logged live
 *   Browse by category & province         -> the seven platforms (marquee)
 *   Most bids die on compliance not price -> Most products die on timing not margin
 *   Four qualification steps              -> four validation checks
 *   Your tender agent works while you sleep -> the nightly pull
 *   Intelligence no one gives SA SMMEs    -> intelligence no one gives cross-border sellers
 *   Proof, not promises                   -> measured / inferred / unknown
 *   Three steps, under three minutes      -> kept as-is
 *   One won tender pays for years         -> one winning product pays for years
 *   Questions you should ask + Pricing Qs  -> one merged FAQ
 *   Your next contract is right here      -> closing band
 *
 * WHAT WAS DROPPED: "Every province, on one live map" (no geographic dimension
 * to this product, and a map would be decoration), and "Never lose a bid to a
 * missing form" (compliance-paperwork specific, no analogue here).
 *
 * Eyebrow budget: 11 sections, so 3 permitted. Three used, on sections 4, 6 and 9.
 */

const CHECKS = [
  { t: "Matched to your niche", d: "Signals arrive tagged by category, so you are not reading beauty rows when you sell pet gear." },
  { t: "Intent before you spend", d: "Saves counted against likes, so you can see demand rather than passing attention." },
  { t: "A factory that makes it", d: "Searched against 1688 wholesale listings, median offer taken rather than the bait price." },
  { t: "The date we first saw it", d: "Written once on arrival and never altered, so early is checkable rather than claimed." },
];

const STEPS = [
  { n: "01", t: "Create an account", d: "Email link, no password. The free tier needs no card." },
  { n: "02", t: "Pick your niches", d: "Beauty, pet care, mother and baby, kitchen, sports, home." },
  { n: "03", t: "Read the radar", d: "Sorted by intent, stamped with first-seen dates." },
];

const TIERS = [
  { name: "Scout", price: "A$0", per: "forever", line: "See what we see, a week late.",
    feats: ["Weekly trend email", "Top 10, 7-day delayed", "5 lookups a month"] },
  { name: "Hunter", price: "A$59", per: "/month", line: "The daily edge for active sellers.",
    feats: ["Daily radar, every signal", "First-detected date on each", "1688 supplier match", "10-product watchlist"], featured: true },
  { name: "Operator", price: "A$129", per: "/month", line: "For full-time operators.",
    feats: ["Everything in Hunter, uncapped", "Unlimited watchlist", "Supplier price history", "CSV export", "Extra seats +A$39"] },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <MarketingNav />

      <main id="main">
        {/* 1. HERO: asymmetric split over a spectrum wash built from the platform hues */}
        <section className="spectrum-wash">
          <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-5 pt-16 pb-14 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pt-20">
            <div>
              <h1 className="display-xl max-w-[16ch] text-ink">
                See it in China <span className="spectrum-text">before</span> the window shuts.
              </h1>
              <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-body">
                We index what Chinese shoppers are saving on Douyin and Xiaohongshu, match it to a
                factory price on 1688, and log the date we first saw it.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/login" className="rounded-ctl bg-accentstrong px-5 py-2.5 text-[14px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px">
                  Get started
                </Link>
                <Link href="/pricing" className="rounded-ctl border border-linestrong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface2 active:translate-y-px">
                  See pricing
                </Link>
              </div>
              {/* platform legend: the four hues, stated once, so the coding reads as intentional */}
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  ["Douyin", "var(--c-douyin)"],
                  ["Xiaohongshu", "var(--c-xhs)"],
                  ["1688", "var(--c-1688)"],
                  ["Taobao", "var(--c-taobao)"],
                ].map(([name, hue]) => (
                  <span key={name} className="flex items-center gap-1.5 font-mono text-[11px] text-mut">
                    <span className="h-2 w-2 rounded-full" style={{ background: hue }} />
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <HeroRadar />
          </div>
        </section>

        {/* 2. LIVE FEED: full-width data band */}
        <section className="border-y border-line bg-surface2/40">
          <div className="mx-auto max-w-[1160px] px-5 py-18 sm:px-8">
            <LiveSignals limit={6} />
          </div>
        </section>

        {/* 3. SOURCES: marquee, the only one on the page */}
        <section className="border-b border-line bg-surface py-9">
          <SourceMarquee />
        </section>

        {/* 4. THE WEDGE: statement plus a four-check strip */}
        <section id="how" className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <span className="label text-accent">Why sellers lose</span>
          <h2 className="display-lg mt-3 max-w-[24ch] text-ink">
            Most products die on timing, not on margin.
          </h2>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-body">
            By the time a product surfaces in a Western ad-spy tool, the creatives are already
            running and the price is already falling. The margin was never the problem. The
            fortnight you lost was.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {CHECKS.map((c, i) => {
              const hue = ["var(--c-xhs)", "var(--c-taobao)", "var(--c-1688)", "var(--c-douyin)"][i];
              return (
                <div key={c.t} className="relative bg-surface p-6">
                  <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: hue }} />
                  <span
                    data-numeric
                    className="flex h-8 w-8 items-center justify-center rounded-md font-mono text-[12px] font-semibold"
                    style={{ background: `color-mix(in oklab, ${hue} 14%, transparent)`, color: hue }}
                  >
                    {i + 1}
                  </span>
                  <p className="mt-4 text-[14.5px] font-medium leading-snug text-ink">{c.t}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-mut">{c.d}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. THE NIGHTLY PULL: split, reversed from the hero */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
            <dl className="divide-y divide-[var(--c-line)] border-y border-line">
              {[
                ["19:00 UTC", "The pull starts on a schedule, not when someone remembers."],
                ["Product first", "Constrained to commercial content, so it returns merchandise rather than viral cats."],
                ["Deduped", "A product seen again updates in place. Its first-seen date does not move."],
                ["Logged", "Every run records which endpoints answered and which failed."],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 py-4">
                  <dt className="font-mono text-[11.5px] text-accent">{k}</dt>
                  <dd className="text-[13.5px] leading-relaxed text-body">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h2 className="display-lg max-w-[20ch] text-ink">The radar pulls while you sleep.</h2>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-body">
                A scheduled job reads the Chinese platforms overnight, extracts the actual product
                from each post, and prices it against wholesale listings. You wake up to a sorted
                index rather than an empty search box.
              </p>
            </div>
          </div>
        </section>

        {/* 6. INTELLIGENCE: asymmetric trio, deliberately not three equal cards */}
        <section className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <span className="label text-accent">What you get that others do not</span>
          <h2 className="display-lg mt-3 max-w-[26ch] text-ink">
            Nobody else is watching the upstream.
          </h2>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <div className="flex flex-col justify-between rounded-card border border-line bg-surface p-7">
              <div>
                <p className="text-[15.5px] font-medium text-ink">The Chinese platforms, not the Western mirror</p>
                <p className="mt-2.5 max-w-[46ch] text-[14px] leading-relaxed text-body">
                  Every competitor in this category reads TikTok Shop, which is where a trend
                  arrives, not where it starts. We read Douyin and Xiaohongshu, which is where
                  Chinese shoppers find things first.
                </p>
              </div>
              <p data-numeric className="mt-8 font-mono text-[30px] font-medium leading-none tracking-[-.03em] text-ink">
                4 platforms<span className="text-accent">.</span> 1 index<span className="text-accent">.</span>
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-card border border-line bg-surface p-6">
                <p className="text-[15px] font-medium text-ink">Saves, not views</p>
                <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-body">
                  Ranked by bookmark count rather than vanity engagement, which is the difference
                  between something people liked and something people intend to buy.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-6">
                <p className="text-[15px] font-medium text-ink">The factory price attached</p>
                <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-body">
                  The extracted product term is searched on 1688, so the wholesale figure sits on
                  the same row as the demand signal instead of in another tab.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PROOF: definition list */}
        <section id="proof" className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="display-lg max-w-[18ch] text-ink">Proof, not promises.</h2>
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-body">
                Three states, applied to every figure in the product. If a number is not one of
                these, it does not ship.
              </p>
            </div>
            <dl className="divide-y divide-[var(--c-line)] border-y border-line">
              {[
                ["Measured", "Read off the platform, with the time we read it recorded alongside."],
                ["Inferred", "Calculated rather than observed. Marked est. everywhere it appears."],
                ["Unknown", "Rendered as a dash. Never filled in with a plausible-looking guess."],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="font-mono text-[12px] uppercase tracking-wider text-accent">{k}</dt>
                  <dd className="text-[13.5px] leading-relaxed text-body">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 8. THREE STEPS: numbered horizontal */}
        <section className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <h2 className="display-lg max-w-[20ch] text-ink">Three steps, under three minutes.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => {
              const hue = ["var(--c-xhs)", "var(--c-1688)", "var(--c-douyin)"][i];
              return (
                <li key={step.n} className="pt-5" style={{ borderTop: `2px solid ${hue}` }}>
                  <span data-numeric className="font-mono text-[12px]" style={{ color: hue }}>{step.n}</span>
                  <p className="mt-2 text-[16px] font-medium text-ink">{step.t}</p>
                  <p className="mt-2 max-w-[38ch] text-[13.5px] leading-relaxed text-body">{step.d}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* 9. PRICING */}
        <section className="border-y border-line bg-surface2/40">
          <div className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
            <span className="label text-accent">Pricing</span>
            <h2 className="display-lg mt-3 max-w-[24ch] text-ink">
              One winning product pays for years of this.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-body">
              Plain AUD, GST included. Credits never expire and cancelling takes one click.
            </p>

            <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
              {TIERS.map((t) => (
                <div key={t.name} className={`flex flex-col p-7 ${t.featured ? "bg-surface2" : "bg-surface"}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[15px] font-medium text-ink">{t.name}</span>
                    {t.featured && (
                      <span className="rounded-chip bg-accentweak px-1.5 py-0.5 font-mono text-[9.5px] text-accent">
                        most popular
                      </span>
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
          </div>
        </section>

        {/* 10. FAQ: accordion */}
        <section className="mx-auto max-w-[46rem] px-5 py-20 sm:px-8">
          <h2 className="display-lg max-w-[20ch] text-ink">Questions you should ask.</h2>
          <div className="mt-8">
            <Faq />
          </div>
        </section>

        {/* 11. CLOSING BAND */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-[1160px] px-5 py-20 text-center sm:px-8">
            <hr className="spectrum-rule mx-auto mb-10 w-24 rounded-full" />
            <h2 className="display-lg mx-auto max-w-[22ch] text-ink">
              Your next product is trending in China right now.
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-body">
              Start free. No card, no password, and the first-seen dates are there from day one.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-block rounded-ctl bg-accentstrong px-6 py-3 text-[14px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px"
            >
              Get started
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
