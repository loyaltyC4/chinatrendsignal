import type { Metadata } from "next";
import Link from "next/link";
import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "A$0, A$59 or A$129 a month in plain AUD. Credits never expire, cancel in one click, and every figure is timestamped.",
};

const TIERS = [
  {
    name: "Scout",
    price: "A$0",
    per: "forever",
    line: "See what we see, a week late.",
    feats: ["Weekly trend email", "Top 10, 7-day delayed", "5 product lookups a month"],
    cta: "Start free",
  },
  {
    name: "Hunter",
    price: "A$59",
    per: "/month",
    line: "The daily edge for active sellers.",
    feats: [
      "Daily radar, every signal",
      "First-detected date on every row",
      "1688 supplier match and margin",
      "10-product watchlist",
      "Signal analysis on any row",
    ],
    cta: "Start Hunter",
    featured: true,
  },
  {
    name: "Operator",
    price: "A$129",
    per: "/month",
    line: "For full-time operators.",
    feats: [
      "Everything in Hunter, uncapped",
      "Unlimited watchlist",
      "Supplier price history",
      "CSV export",
      "Weekly report per niche",
      "Extra seats at A$39",
    ],
    cta: "Start Operator",
  },
];

const CREDITS = [
  ["Signal analysis", "2"],
  ["Opportunity score", "3"],
  ["Supplier match", "3"],
  ["Weekly report", "10"],
];

export default function PricingPage() {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <MarketingNav />

      <main id="main" className="mx-auto max-w-[1160px] px-5 sm:px-8">
        <section className="pt-16 pb-12">
          <h1 className="display-xl max-w-[14ch] text-ink">Plain pricing, in AUD.</h1>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-body">
            GST included. Cancel in one click from the portal. The free tier does not expire and
            never asks for a card.
          </p>
        </section>

        <section className="grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
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
                <span data-numeric className="font-mono text-[36px] font-medium tracking-[-.035em] text-ink">
                  {t.price}
                </span>
                <span className="font-mono text-[13px] text-mut">{t.per}</span>
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
                {t.cta}
              </Link>
            </div>
          ))}
        </section>

        <section className="grid gap-10 py-20 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="display-md text-ink">What a credit buys</h2>
            <p className="mt-3 max-w-[48ch] text-[14px] leading-relaxed text-body">
              Reading the radar is flat-rate and never costs credits. Only the expensive
              operations are metered, and unused credits stay on your account indefinitely.
            </p>
            <dl className="mt-6 divide-y divide-[var(--c-line)] border-y border-line">
              {CREDITS.map(([action, cost]) => (
                <div key={action} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[13.5px] text-body">{action}</dt>
                  <dd data-numeric className="font-mono text-[13px] font-medium text-ink">{cost} cr</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="display-md text-ink">What we promise</h2>
            <dl className="mt-6 space-y-6">
              {[
                ["Credits never expire", "Buy them now, use them next year. If our data layer goes down for a week, your balance is untouched when it comes back."],
                ["No auto-charge traps", "Credits top up when you click buy, or when a subscription you chose renews. Never silently."],
                ["Cancel in one click", "Self-serve in the portal, effective immediately. No retention maze, no charge after cancelling."],
                ["Numbers we can stand behind", "Engagement is read from the platform and timestamped. Anything inferred is labelled. We do not estimate store revenue."],
              ].map(([t, d]) => (
                <div key={t}>
                  <dt className="text-[14px] font-medium text-ink">{t}</dt>
                  <dd className="mt-1.5 max-w-[52ch] text-[13.5px] leading-relaxed text-body">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
