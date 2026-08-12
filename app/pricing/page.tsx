import type { Metadata } from "next";
import AppNav from "@/components/app-nav";

export const metadata: Metadata = {
  title: "Pricing — China Trend Signal",
  description: "Flat subscription for the radar. Never-expiring credits for the studio. Cancel anytime, no traps.",
};

const SUBS = [
  { name: "Scout", price: "A$0", per: "forever", tag: "See what we see, a week late.",
    feats: ["Weekly trend email", "Radar top-10 (7-day delayed)", "5 product lookups / mo"], cta: "Start free", hot: false },
  { name: "Hunter", price: "A$39", per: "/month", tag: "The daily edge for active sellers.",
    feats: ["Live daily radar — every signal", "Saturation counter on each", "1688/Taobao supplier matching", "Watchlist alerts (10 products)"], cta: "Start Hunter", hot: true },
  { name: "Operator", price: "A$99", per: "/month", tag: "For full-time operators.",
    feats: ["Everything in Hunter, unlimited", "KOL rate cards (XHS + Douyin)", "Supplier price history", "Priority refresh + API export"], cta: "Start Operator", hot: false },
  { name: "Agency", price: "A$299", per: "/month", tag: "For agencies running China entry.",
    feats: ["3 seats", "Shortlist exports w/ quotes + GMV", "Category benchmark reports", "Metered REST API"], cta: "Talk to us", hot: false },
];

const PACKS = [
  { name: "Starter pack", credits: 50, price: "A$25", per: "one-off", note: "Try the studio", per_cr: "A$0.50/cr" },
  { name: "Builder pack", credits: 150, price: "A$60", per: "one-off", note: "Most popular", per_cr: "A$0.40/cr", hot: true },
  { name: "Scale pack", credits: 500, price: "A$150", per: "one-off", note: "Best value", per_cr: "A$0.30/cr" },
];

const COSTS = [
  { a: "Listing build (clean + translate + copy)", c: "5 cr" },
  { a: "Extra image cleanup (per image)", c: "1 cr" },
  { a: "KOL deep-dive report", c: "3 cr" },
  { a: "Apify competitor spy run (per target)", c: "10 cr" },
  { a: "Category benchmark report", c: "15 cr" },
];

const TRUST = [
  { t: "Credits never expire", d: "Buy them today, use them next year. If the data layer ever goes down for a week, your balance is untouched — it's still there when it's back." },
  { t: "No auto-charge traps", d: "Credits top up only when you click buy, or when a Stripe payment you chose clears. We will never silently bill you." },
  { t: "Cancel in one click", d: "Self-serve, in the portal, effective immediately. No 'contact support to cancel,' no retention maze, no charge-after-cancel." },
  { t: "Real data, labeled honestly", d: "We show engagement and intent with timestamps. We never invent a revenue number." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f4f1ea] font-sans text-[#1a1b20]">
      <AppNav active="Pricing" />
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">

        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-grn">Pricing</p>
          <h1 className="mx-auto mt-4 max-w-[22ch] font-serif text-3xl font-bold tracking-tight sm:text-5xl">
            Subscribe for the radar. <em className="italic text-grn">Credits</em> for the studio.
          </h1>
          <p className="mx-auto mt-4 max-w-[62ch] text-[16.5px] leading-relaxed text-[#6b6f78]">
            Two things, kept separate on purpose. A flat subscription keeps the radar on — read it all day, it never touches a credit. Credits are one-off packs for the heavy studio work, and they never expire. That's the whole model.
          </p>
        </div>

        <p className="mt-14 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a8f96]">Step 1 — the subscription (the radar)</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SUBS.map((t) => (
            <div key={t.name} className={`relative flex flex-col rounded-2xl bg-ivory p-6 transition-all hover:-translate-y-1 ${t.hot ? "ring-2 ring-grn" : ""}`}>
              {t.hot && <span className="absolute -top-3 left-6 rounded-full bg-grn px-3 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-[#0a1f10]">MOST POPULAR</span>}
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mut">{t.name}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-ink">{t.price}<span className="text-sm font-normal text-mut"> {t.per}</span></p>
              <p className="mt-1 text-[12.5px] text-mut">{t.tag}</p>
              <ul className="mt-4 flex-1 text-[13px] text-[#3c463a]">
                {t.feats.map((f, i) => <li key={i} className="border-t border-dashed border-[#e0dece] py-2 first:border-t-0">{f}</li>)}
              </ul>
              <a href="#" className={`mt-5 rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${t.hot ? "bg-ink text-white hover:bg-grn" : "border border-[#dcdccc] text-ink hover:border-ink"}`}>{t.cta}</a>
            </div>
          ))}
        </div>

        <p className="mt-16 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a8f96]">Step 2 — credit packs (the studio), only when you need them</p>
        <div className="mx-auto mt-6 grid max-w-3xl gap-5 sm:grid-cols-3">
          {PACKS.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 ${p.hot ? "border-grn/50 bg-grn/5" : "border-black/10 bg-black/[.03]"}`}>
              {p.hot && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-grn px-3 py-0.5 font-mono text-[10px] font-bold text-[#12220a]">MOST POPULAR</span>}
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6b6f78]">{p.name}</p>
              <p className="mt-3 font-mono text-3xl font-bold text-grn">{p.credits}<span className="text-sm font-normal text-[#6b6f78]"> cr</span></p>
              <p className="mt-1 text-lg font-semibold text-ink">{p.price} <span className="text-xs font-normal text-[#8a8f96]">{p.per}</span></p>
              <p className="mt-1 font-mono text-[10.5px] text-[#8a8f96]">{p.per_cr}</p>
              <p className="mt-2 text-[12px] text-[#6b6f78]">{p.note}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <h2 className="text-center font-serif text-2xl font-bold text-ink">What a credit buys</h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-black/[.03]">
            {COSTS.map((c, i) => (
              <div key={i} className="flex items-center justify-between border-b border-black/5 px-6 py-4 last:border-b-0">
                <span className="text-sm text-[#3a3f47]">{c.a}</span>
                <span className="rounded-md border border-grn/25 bg-grn/10 px-2.5 py-1 font-mono text-[12px] font-bold text-grn">{c.c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-grn/20 bg-gradient-to-br from-[#1d4ed8] to-[#f4f1ea] p-8 sm:p-10">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-grn">Read this before you buy anywhere</p>
          <h2 className="mx-auto mt-3 max-w-[24ch] text-center font-serif text-2xl font-bold text-white sm:text-3xl">How we're not the tools you've been burned by</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {TRUST.map((t) => (
              <div key={t.t}>
                <p className="flex items-center gap-2 font-semibold text-ink"><span className="text-grn">✓</span>{t.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#6b6f78]">{t.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center font-mono text-[11px] leading-relaxed text-[#8a8f96]">
            You've had credits expire. You've been charged after canceling. You've watched a balance burn in a week.<br className="hidden sm:block" />
            We built the opposite, on purpose.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-2xl space-y-4">
          {[
            ["Do I need a subscription to buy credits?", "Yes — any tier works, including free Scout. The subscription is the radar; credits are the studio add-on."],
            ["What happens to my credits if I cancel?", "Nothing. They're yours. Credits never expire and aren't tied to an active subscription."],
            ["What if the data layer is down?", "Your credits are untouched. Downtime never consumes balance, and failed calls are never billed."],
            ["GST?", "Prices include GST where it applies. ABN invoices from Stripe."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-xl border border-black/8 bg-black/[.03] p-5">
              <p className="text-sm font-semibold text-ink">{q}</p>
              <p className="mt-1.5 text-sm text-[#6b6f78]">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
