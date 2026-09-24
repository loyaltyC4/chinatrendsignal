import type { RadarRow } from "@/lib/signals";
import type { Signal } from "@/components/signal-feed";
import type { Saturation } from "@/lib/saturation";
import { saturationVerdict } from "@/lib/saturation";

/**
 * Listing desk — derived, sellable-facing read of a radar signal.
 *
 * The product's register is data honesty, so every number below is one of:
 *   measured — straight off the signal row (velocity, intent, wholesale).
 *   derived  — computed from a measured input by a stated constant formula
 *              (true-margin math, list price, draft copy). Marked est.
 *   unmeasured — returned as null and rendered as a dash (Etsy saturation until
 *              the cache has a real count for that term).
 *
 * The margin math is the load-bearing piece. Sellers get burned because Etsy's
 * real take is 15–28%, not the advertised ~6.5%: $0.20 listing + 6.5% on the
 * total *including shipping* + 3%+$0.25 processing + a mandatory 12–15% Offsite
 * Ads fee once a shop clears $10k/yr. We price against the conservative case
 * (Offsite Ads firing) so nothing ships that can't hold its margin.
 */

export type ListingStage = Signal["stage"];

export type MarginBreakdown = {
  landedAud: number;        // wholesale CNY → AUD
  listPriceAud: number;     // suggested list, derived
  saleAnchorAud: number;    // retail anchor so Etsy shows the Sale badge
  listingFeeAud: number;    // $0.20 equivalent
  transactionFeeAud: number; // 6.5% of list + shipping-charged
  processingFeeAud: number;  // 3% + $0.25
  offsiteAdsFeeAud: number;  // 15% contingency (mandatory > $10k/yr)
  totalFeesAud: number;
  estNetAud: number;         // list − landed − totalFees
  marginPct: number;         // estNet / list
  /** True when the derived margin clears the 30% floor sellers need to survive ads. */
  viable: boolean;
};

export type EtsyDraft = {
  title: string;
  titleChars: number;
  titleWords: number;
  tags: string[];
  description: string;
  margin: MarginBreakdown;
};

export type ListingDraft = {
  signalId: string;
  product: string;
  zh: string;
  niche: string;
  stage: ListingStage;
  sources: string[];
  firstSeenDays: number | null;
  velocityPct: number;
  intent: number;
  savesRatio: number | null;
  wholesaleCny: number;
  priced: boolean;
  saturation: Saturation;
  saturationVerdict: "open" | "building" | "crowded" | null;
  etsy: EtsyDraft | null;
  tiktok: { hooks: string[]; caption: string; hashtags: string };
  shopify: { title: string; description: string; metaTitle: string; metaDescription: string };
  /** Compliance / IP flag from trend heuristics. true = review before listing. */
  ipRisk: boolean;
  /** Jev opinion (an evaluation model's view, not a measurement). null = untriaged. */
  jevRoute: "auto" | "review" | "kill" | "unverified" | null;
  jevFirstMarket: string | null;
  jevListableProbability: number | null;
};

/* ── margin constants (AUD). Stated once, surfaced as estimates. ── */
const CNY_TO_AUD = 0.213;
const LISTING_FEE = 0.30;       // $0.20 USD ≈ A$0.30
const TXN_PCT = 0.065;          // of (price + shipping charged)
const PROC_PCT = 0.03;
const PROC_FLAT = 0.38;         // $0.25 USD ≈ A$0.38
const OFFSITE_PCT = 0.15;       // worst case; 12% under $10k/yr is the floor
const TARGET_MARKUP = 3.4;
const SALE_ANCHOR = 1.22;
const VIABLE_MARGIN = 0.30;

/** True-margin math. Every fee Etsy can take, against the conservative case. */
export function margin(wholesaleCny: number): MarginBreakdown | null {
  if (!wholesaleCny || wholesaleCny <= 0) return null;
  const landed = round2(wholesaleCny * CNY_TO_AUD);
  const list = round2(landed * TARGET_MARKUP);
  // transaction fee applies to price + shipping charged; we assume free shipping,
  // so it's on the list price. Offsite Ads contingency included so the number is
  // the floor, not the best case.
  const txn = round2(list * TXN_PCT);
  const proc = round2(list * PROC_PCT + PROC_FLAT);
  const ads = round2(list * OFFSITE_PCT);
  const fees = round2(LISTING_FEE + txn + proc + ads);
  const net = round2(list - landed - fees);
  const pct = list > 0 ? net / list : 0;
  return {
    landedAud: landed,
    listPriceAud: list,
    saleAnchorAud: round2(list * SALE_ANCHOR),
    listingFeeAud: LISTING_FEE,
    transactionFeeAud: txn,
    processingFeeAud: proc,
    offsiteAdsFeeAud: ads,
    totalFeesAud: fees,
    estNetAud: net,
    marginPct: round2(pct * 100) / 100,
    viable: pct >= VIABLE_MARGIN,
  };
}

function titleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w[0]!.toUpperCase() + w.slice(1));
}

/**
 * Etsy title, 2025 rules: primary keyword (the product term) front-loaded in the
 * first ~40 chars, ≤15 words, natural language, commas not pipes, no
 * "beautiful/perfect", no price/shipping text, no keyword stacking. We build
 * "Product Term, Differentiator" and hard-cap length so it can't stuff.
 */
function buildEtsyTitle(product: string, niche: string): string {
  const base = titleCase(product.trim());
  const diff = niche && !base.toLowerCase().includes(niche.toLowerCase()) ? niche : "";
  let title = diff ? `${base}, ${diff}` : base;
  if (title.length > 130) title = base.slice(0, 130); // 2026 sweet spot 100–130, hard max 140
  return title;
}

/** 13 tags, multi-word ≤20 chars, no dups; product phrase first; gift phrase in a
 *  tag slot (never the title). */
function buildEtsyTags(product: string, niche: string): string[] {
  const words = product.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const tags = new Set<string>();
  const push = (t: string) => {
    const c = t.trim().slice(0, 20);
    if (c && c.length > 2) tags.add(c);
  };
  push(product.toLowerCase());
  words.forEach(push);
  for (let i = 0; i < words.length - 1; i++) push(`${words[i]} ${words[i + 1]}`);
  push(niche.toLowerCase());
  push("gift for her");
  push("trending now");
  return Array.from(tags).slice(0, 13);
}

function buildEtsyDescription(d: ListingDraft, m: MarginBreakdown): string {
  const first = d.firstSeenDays == null ? "recently" : d.firstSeenDays === 0 ? "today" : `${d.firstSeenDays} day${d.firstSeenDays === 1 ? "" : "s"} ago`;
  const hook = `The ${d.product} moving on ${d.sources[0] ?? "Chinese social"} right now — we first recorded it ${first}, before it reached Western marketplaces.`;
  return `${hook}

DETAILS
This piece is doing numbers on ${d.sources.join(" and ") || "Chinese social"} at the moment. We match the trend to the actual factory before listing, so what you see is what ships.

MATERIALS
See the variant images for the exact finish. Wipe clean with a soft cloth.

WHAT'S INCLUDED
1 × ${d.product}
1 × care card

PERFECT FOR
Refreshing a daily staple, gifting without guessing sizes, and anyone who screenshots styling videos at 1am.

SHIPPING & PROCESSING
Made to order · ships in 3–5 business days · tracked worldwide. We quote a realistic window, not the fastest one — see the note below.

NOTE
Priced at A$${m.listPriceAud.toFixed(2)} against a verified factory cost. We list early and keep the margin honest.`;
}

function buildHooks(product: string, sources: string[]): string[] {
  const src = sources[0] ?? "Xiaohongshu";
  return [
    `POV: you found the ${product.toLowerCase()} everyone on ${src} has right now.`,
    `This is about to be everywhere — you saw the ${product.toLowerCase()} here first.`,
    `The ${product.toLowerCase()} trend is still early. Here's the window.`,
  ];
}

/** Heuristic IP flag: branded/character terms get flagged for review rather than
 *  blocked. Conservative — a flag says "look", not "no". */
function detectIpRisk(product: string, zh: string): boolean {
  const t = `${product} ${zh}`.toLowerCase();
  return /(sanrio|hello kitty|nike|adidas|disney|swarovski|pokemon|marvel|kpop|bts|labubu)/.test(t);
}

/** Assemble the full listing-facing draft for one radar row. Never throws; a row
 *  without a wholesale price returns priced:false and no Etsy money math. */
export function buildListing(row: RadarRow, sat: Saturation = { count: null, top10AvgReviews: null, measuredAt: null }): ListingDraft {
  const { product, niche, sources } = row;
  const priced = row.wholesaleCny > 0;
  const m = priced ? margin(row.wholesaleCny) : null;

  const base = {
    signalId: row.id,
    product,
    zh: row.zh,
    niche,
    stage: row.stage,
    sources,
    firstSeenDays: row.daysTracked ?? null,
    velocityPct: row.velocityPct,
    intent: row.intent,
    savesRatio: row.savesRatio ?? null,
    wholesaleCny: row.wholesaleCny,
    priced,
    saturation: sat,
    saturationVerdict: saturationVerdict(sat),
    ipRisk: detectIpRisk(product, row.zh),
    jevRoute: row.jevRoute ?? null,
    jevFirstMarket: row.jevFirstMarket ?? null,
    jevListableProbability: row.jevListableProbability ?? null,
    tiktok: {
      hooks: buildHooks(product, sources),
      caption: `The ${product.toLowerCase()} that ${sources[0] ?? "China social"} is obsessed with. Still early on this one. Link in bio.`,
      hashtags: "#fyp #trending #smallbusiness #etsyfinds #chinatok #aesthetic #shopearly",
    },
    shopify: {
      title: titleCase(product),
      description: `We tracked the ${product.toLowerCase()} across ${sources.join(" and ") || "Chinese social"} before sourcing it. Same factory tier as the boutiques, landed cost verified.\n\n• Made to order, ships tracked in 3–5 days\n• First seen ${row.daysTracked == null ? "recently" : `${row.daysTracked}d ago`}`,
      metaTitle: `${titleCase(product)} | Shop`.slice(0, 60),
      metaDescription: `The ${product.toLowerCase()}, sourced from the trend's origin. Made to order, tracked worldwide.`.slice(0, 160),
    },
  };

  const etsy: EtsyDraft | null = m
    ? {
        title: buildEtsyTitle(product, niche),
        titleChars: 0,
        titleWords: 0,
        tags: buildEtsyTags(product, niche),
        description: "",
        margin: m,
      }
    : null;

  if (etsy && m) {
    etsy.titleChars = etsy.title.length;
    etsy.titleWords = etsy.title.trim().split(/\s+/).length;
    const draft = { ...base, etsy } as ListingDraft;
    etsy.description = buildEtsyDescription(draft, m);
    return draft;
  }
  return { ...base, etsy: null };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function emptySat(): Saturation {
  return { count: null, top10AvgReviews: null, measuredAt: null };
}
function satFor(r: RadarRow, sats: Map<string, Saturation>): Saturation {
  return (
    sats.get(r.product.trim().toLowerCase()) ??
    sats.get(r.zh.trim().toLowerCase()) ??
    emptySat()
  );
}

/**
 * The curated shortlist (pain: sellers spread across 47 SKUs and drown). Rank by
 * viable margin × low saturation × fresh window × velocity, and cap it — the
 * point is a small set of high-conviction bets, not another firehose. Unpriced or
 * margin-failing or IP-flagged rows drop out; unmeasured saturation scores
 * neutral, not zero.
 */
export function buildShortlist(rows: RadarRow[], sats: Map<string, Saturation>, cap = 5): ListingDraft[] {
  return rows
    .filter((r) => r.isProduct !== false && r.wholesaleCny > 0)
    .map((r) => buildListing(r, satFor(r, sats)))
    .filter((d) => d.etsy && d.etsy.margin.viable && !d.ipRisk)
    .sort((a, b) => score(b) - score(a))
    .slice(0, cap);
}

function score(d: ListingDraft): number {
  const marginScore = d.etsy ? d.etsy.margin.marginPct : 0;
  const satScore = d.saturationVerdict === "open" ? 1 : d.saturationVerdict === "building" ? 0.5 : d.saturationVerdict === "crowded" ? 0.1 : 0.6;
  const freshScore = d.firstSeenDays == null ? 0.5 : Math.max(0, 1 - d.firstSeenDays / 30);
  const velScore = Math.min(1, d.velocityPct / 200);
  return marginScore * 0.35 + satScore * 0.25 + freshScore * 0.2 + velScore * 0.2;
}

/** The full queue set: priced product rows, newest window first. */
export function buildQueue(rows: RadarRow[], sats: Map<string, Saturation>): ListingDraft[] {
  return rows
    .filter((r) => r.isProduct !== false && r.wholesaleCny > 0)
    .map((r) => buildListing(r, satFor(r, sats)))
    .sort((a, b) => (a.firstSeenDays ?? 999) - (b.firstSeenDays ?? 999));
}
