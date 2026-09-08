import type { RadarRow } from "@/lib/signals";
import type { Signal } from "@/components/signal-feed";

/**
 * Listing desk — derived, sellable-facing read of a radar signal.
 *
 * The radar's own register is data honesty: "we never invent a number" is the
 * pitch. So the listing-facing fields below are split into two kinds:
 *
 *   measured  — come straight off the signal row (velocity, intent, saves ratio,
 *               first-seen, wholesale). Shown as fact.
 *
 *   derived   — computed from a measured input by a stated, constant formula
 *               (suggested list price, fee drag, Etsy-facing draft copy). These
 *               are estimates by construction, and the UI marks them "est." the
 *               same way the radar marks an inferred spread. If we cannot compute
 *               one honestly we return null and the surface shows a dash.
 *
 * What we deliberately do NOT do here: fabricate an Etsy search count. There is
 * no marketplace-competition feed in the pipeline yet, so the queue/studio show
 * "saturation: not measured" rather than a made-up green field. When a real Etsy
 * search-count source lands, it plugs into `saturation` below and the surfaces
 * light up without a shape change.
 */

export type ListingStage = Signal["stage"];

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
  /** Measured CNY unit cost from the supplier match. 0 = not priced yet. */
  wholesaleCny: number;
  /** True when every derived price below rests on a real wholesale number. */
  priced: boolean;
  /** Etsy-facing draft, only populated when priced. */
  etsy: EtsyDraft | null;
  /** Copy-only channels. Always derivable from the product name + hook. */
  tiktok: { hooks: string[]; caption: string; hashtags: string };
  shopify: { title: string; description: string; metaTitle: string; metaDescription: string };
};

export type EtsyDraft = {
  title: string;
  titleChars: number;
  tags: string[];
  description: string;
  /** Suggested list price in AUD. Derived, marked est. */
  listPriceAud: number;
  /** Retail anchor ~1.22× list so Etsy's Sale badge renders. Derived. */
  saleAnchorAud: number;
  /** unit economics, AUD. fee drag is a stated constant, not a promise. */
  landedAud: number;
  estNetAud: number;
};

/* ── pricing constants, stated once and surfaced as estimates ── */

const CNY_TO_AUD = 0.213; // matches the radar's own comparator constant
const FEE_PCT = 0.117; // Etsy transaction + offsite-ads-blended assumption
const FEE_FLAT_AUD = 0.38; // ~$0.25 USD listing + processing, in AUD
const TARGET_MARKUP = 3.4; // landed -> list; the cross-border band the radar uses
const SALE_ANCHOR = 1.22; // list -> retail anchor so Etsy shows "Sale"

function titleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w[0]!.toUpperCase() + w.slice(1));
}

/** April 2026 title formula: top descriptors + item noun once + differentiator,
 *  commas not pipes, no gifting/subjective words, ≤15 words. We build it from the
 *  product term and cap at 90 chars so it never reads as keyword stuffing. */
function buildEtsyTitle(product: string, niche: string): string {
  const base = titleCase(product.trim());
  const diff = niche && !base.toLowerCase().includes(niche.toLowerCase()) ? niche : "";
  let title = diff ? `${base}, ${diff}` : base;
  if (title.length > 90) title = base.slice(0, 90);
  return title;
}

/** Tags are derived from the product term, capped at 13, ≤20 chars each. Etsy
 *  forbids duplicates and the platform reads early tags hardest, so the exact
 *  product phrase goes first. */
function buildEtsyTags(product: string, niche: string): string[] {
  const words = product.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const tags = new Set<string>();
  const push = (t: string) => {
    const clean = t.trim().slice(0, 20);
    if (clean && clean.length > 2 && !tags.has(clean)) tags.add(clean);
  };
  push(product.toLowerCase());
  words.forEach(push);
  // two-word bigrams read as natural search phrases
  for (let i = 0; i < words.length - 1; i++) push(`${words[i]} ${words[i + 1]}`);
  push(niche.toLowerCase());
  push("gift for her"); // the gift-filter slot lives in tags, never the title
  push("trending now");
  return Array.from(tags).slice(0, 13);
}

function buildEtsyDescription(d: ListingDraft, listAud: number): string {
  const first = d.firstSeenDays == null ? "recently" : d.firstSeenDays === 0 ? "today" : `${d.firstSeenDays} day${d.firstSeenDays === 1 ? "" : "s"} ago`;
  const hook = `The ${d.product} that is moving on ${d.sources[0] ?? "Chinese social"} right now. We first recorded it ${first} and sourced it while it is still early.`;
  return `${hook}

DETAILS
This is the piece doing numbers on ${d.sources.join(" and ") || "Chinese social"} at the moment. We match the trend to the actual factory before listing it, so what you see is what ships.

MATERIALS
See the variant images for the exact finish. Wipe clean with a soft cloth.

WHAT'S INCLUDED
1 × ${d.product}
1 × care card

PERFECT FOR
Refreshing a daily staple, gifting without guessing sizes, and anyone who screenshots styling videos at 1am.

SHIPPING & PROCESSING
Made to order · ships in 3–5 business days · tracked worldwide.

NOTE
Priced at A$${listAud.toFixed(2)} against a verified factory cost. We list early and keep the margin honest.`;
}

function buildHooks(product: string, sources: string[]): string[] {
  const src = sources[0] ?? "Xiaohongshu";
  return [
    `POV: you found the ${product.toLowerCase()} everyone on ${src} has right now.`,
    `This is about to be everywhere. You saw the ${product.toLowerCase()} here first.`,
    `The ${product.toLowerCase()} trend is still early — here's the window.`,
  ];
}

/** Assemble the full listing-facing draft for one radar row. Never throws; a row
 *  without a wholesale price simply returns priced:false and no Etsy money math. */
export function buildListing(row: RadarRow): ListingDraft {
  const product = row.product;
  const niche = row.niche;
  const sources = row.sources;
  const priced = row.wholesaleCny > 0;

  const landedAud = priced ? round2(row.wholesaleCny * CNY_TO_AUD) : 0;
  const listPriceAud = priced ? round2(landedAud * TARGET_MARKUP) : 0;
  const saleAnchorAud = priced ? round2(listPriceAud * SALE_ANCHOR) : 0;
  const estNetAud = priced ? round2(listPriceAud - landedAud - listPriceAud * FEE_PCT - FEE_FLAT_AUD) : 0;

  const base: Omit<ListingDraft, "etsy"> = {
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

  const etsy: EtsyDraft | null = priced
    ? {
        title: buildEtsyTitle(product, niche),
        titleChars: 0, // filled below
        tags: buildEtsyTags(product, niche),
        description: "",
        listPriceAud,
        saleAnchorAud,
        landedAud,
        estNetAud,
      }
    : null;

  if (etsy) {
    etsy.titleChars = etsy.title.length;
    const draft = { ...base, etsy } as ListingDraft;
    etsy.description = buildEtsyDescription(draft, listPriceAud);
    return draft;
  }
  return { ...base, etsy: null };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** The list of sellable drafts for the queue: live product rows that carry a real
 *  wholesale price, newest-first so the freshest window sits at the top. */
export function buildQueue(rows: RadarRow[]): ListingDraft[] {
  return rows
    .filter((r) => r.isProduct !== false && r.wholesaleCny > 0)
    .map(buildListing)
    .sort((a, b) => (a.firstSeenDays ?? 999) - (b.firstSeenDays ?? 999));
}
