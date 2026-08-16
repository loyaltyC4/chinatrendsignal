import Link from "next/link";
import Image from "next/image";
import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";
import HeroRadar from "@/components/hero-radar";

export const dynamic = "force-dynamic";

const SOURCES = [
  { src: "/logos/douyin.com.png", alt: "Douyin" },
  { src: "/logos/xiaohongshu.com.png", alt: "Xiaohongshu" },
  { src: "/logos/1688.com.png", alt: "1688" },
  { src: "/logos/taobao.com.png", alt: "Taobao" },
  { src: "/logos/alibaba.com.png", alt: "Alibaba" },
  { src: "/logos/tiktok.com.png", alt: "TikTok Shop" },
  { src: "/logos/wechat.com.png", alt: "WeChat" },
];

const TIERS = [
  {
    name: "Scout",
    price: "A$0",
    per: "forever",
    line: "See what we see, a week late.",
    feats: ["Weekly trend email", "Top 10, 7-day delayed", "5 lookups a month"],
  },
  {
    name: "Hunter",
    price: "A$59",
    per: "/month",
    line: "The daily edge for active sellers.",
    feats: ["Daily radar, every signal", "First-detected date on each", "1688 supplier match", "10-product watchlist"],
    featured: true,
  },
  {
    name: "Operator",
    price: "A$129",
    per: "/month",
    line: "For full-time operators.",
    feats: ["Everything in Hunter, uncapped", "Unlimited watchlist", "Supplier price history", "CSV export", "Extra seats +A$39"],
  },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <MarketingNav />

      <main id="main">
        {/* Hero: asymmetric split. The right column is the real product, not an image of it. */}
        <section className="mx-auto grid max-w-[1160px] items-center gap-12 px-5 pt-16 pb-14 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pt-20">
          <div>
            <h1 className="display-xl max-w-[15ch] text-ink">
              See it in China before it lands on TikTok.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-body">
              We track Douyin, Xiaohongshu and 1688 so you get the product and the factory price
              while the window is still open.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="rounded-ctl bg-accentstrong px-5 py-2.5 text-[14px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px"
              >
                Get started
              </Link>
              <Link
                href="/pricing"
                className="rounded-ctl border border-linestrong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface2 active:translate-y-px"
              >
                See pricing
              </Link>
            </div>
          </div>

          <HeroRadar />
        </section>

        {/* Source strip. Logos only, no category labels underneath. */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-center gap-x-10 gap-y-6 px-5 py-8 sm:px-8">
            {SOURCES.map((s) => (
              <Image
                key={s.alt}
                src={s.src}
                alt={s.alt}
                width={28}
                height={28}
                className="h-7 w-7 object-contain opacity-55 grayscale transition-all hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </section>

        {/* Three checks, asymmetric: one lead panel plus two stacked. Deliberately not
            three equal cards. */}
        <section id="how" className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <span className="label text-accent">Before anything reaches you</span>
          <h2 className="display-lg mt-3 max-w-[20ch] text-ink">
            Three checks, or it never shows up.
          </h2>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
            <div className="flex flex-col justify-between rounded-card border border-line bg-surface p-7">
              <div>
                <p className="text-[15px] font-medium text-ink">Demand is real</p>
                <p className="mt-2 max-w-[44ch] text-[14px] leading-relaxed text-body">
                  We rank Xiaohongshu posts by saves, not by views. A save is someone bookmarking
                  a thing to buy later, which is the closest public proxy for intent there is.
                </p>
              </div>
              <p data-numeric className="mt-8 font-mono text-[34px] font-medium leading-none tracking-[-.03em] text-ink">
                saves <span className="text-accent">&gt;</span> likes
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-card border border-line bg-surface p-6">
                <p className="text-[15px] font-medium text-ink">A factory makes it</p>
                <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-body">
                  Every candidate is searched against 1688 wholesale listings. We take the median
                  offer, not the cheapest, because the cheapest is usually bait.
                </p>
              </div>
              <div className="rounded-card border border-line bg-surface p-6">
                <p className="text-[15px] font-medium text-ink">We log when we saw it</p>
                <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-body">
                  Every signal carries the date it entered our index. That date is written once
                  and never changed, so the claim that we were early is something you can check.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Honesty section. Full-width band, different layout family again. */}
        <section id="proof" className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-[1160px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="display-lg max-w-[18ch] text-ink">
                We would rather show a dash than a guess.
              </h2>
              <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-body">
                Tools in this category are widely distrusted for inventing store revenue. One
                seller reported a competitor showing $200k against a store that had not cleared
                $1k. So we do not estimate revenue at all.
              </p>
            </div>
            <dl className="divide-y divide-[var(--c-line)] border-y border-line">
              {[
                ["Measured", "Engagement counts read from the platform, with the time we read them."],
                ["Inferred", "Anything calculated rather than observed is marked est. in the interface."],
                ["Unknown", "A value we do not have renders as a dash. It is never filled in."],
              ].map(([term, desc]) => (
                <div key={term} className="grid grid-cols-[7.5rem_1fr] gap-4 py-4">
                  <dt className="font-mono text-[12px] uppercase tracking-wider text-accent">{term}</dt>
                  <dd className="text-[13.5px] leading-relaxed text-body">{desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Pricing summary */}
        <section className="mx-auto max-w-[1160px] px-5 py-20 sm:px-8">
          <h2 className="display-lg max-w-[16ch] text-ink">Plain pricing, in AUD.</h2>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-body">
            GST included. Cancel in one click. Credits never expire.
          </p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className={`flex flex-col p-6 ${t.featured ? "bg-surface2" : "bg-surface"}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-medium text-ink">{t.name}</span>
                  {t.featured && (
                    <span className="rounded-chip bg-accentweak px-1.5 py-0.5 font-mono text-[9.5px] text-accent">
                      most popular
                    </span>
                  )}
                </div>
                <p className="mt-4 flex items-baseline gap-1">
                  <span data-numeric className="font-mono text-[30px] font-medium tracking-[-.03em] text-ink">
                    {t.price}
                  </span>
                  <span className="font-mono text-[12px] text-mut">{t.per}</span>
                </p>
                <p className="mt-2 text-[13px] text-mut">{t.line}</p>
                <ul className="mt-5 flex-1 space-y-2 border-t border-line pt-5">
                  {t.feats.map((f) => (
                    <li key={f} className="flex gap-2 text-[13px] leading-snug text-body">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-6 rounded-ctl px-4 py-2 text-center text-[13px] font-medium transition-opacity hover:opacity-90 active:translate-y-px ${
                    t.featured
                      ? "bg-accentstrong text-onaccent"
                      : "border border-linestrong text-ink"
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Closing band */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-[1160px] px-5 py-20 text-center sm:px-8">
            <h2 className="display-lg mx-auto max-w-[20ch] text-ink">
              The next one is trending in China right now.
            </h2>
            <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-body">
              Start on the free tier. No card, no password, and the first-seen dates are there
              from day one.
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
