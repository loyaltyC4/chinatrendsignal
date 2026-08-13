export type AnalysisKind =
  | "signal_explanation"
  | "niche_scorecard"
  | "complaint_miner"
  | "listing_copy"
  | "creator_match"
  | "weekly_report";

export type SourceRecord = {
  platform: string;
  url?: string;
  title?: string;
  engagement?: { likes?: number; saves?: number; comments?: number; shares?: number };
  text?: string;
};

export type ProductContext = {
  id?: string;
  name: string;
  chineseName?: string;
  category: string;
  supplier?: { url?: string; wholesaleCny?: number; seller?: string; shippingDays?: number };
  market?: { retailAud?: number; tiktokShopListings?: number; amazonListings?: number; amazonRankGain?: number };
  signals?: { velocityPct?: number; intentScore?: number; stage?: "Rising" | "Peaking" | "Fading" };
  reviews?: SourceRecord[];
  creators?: Array<{ name: string; followers?: number; engagementRate?: number; quoteCny?: number; niche?: string }>;
};

export type EnrichmentResult = {
  kind: AnalysisKind;
  title: string;
  executiveSummary: string;
  verdict?: "Test" | "Watch" | "Pass";
  score?: number;
  hook?: string;
  buyer?: string;
  risk?: string;
  actions: string[];
  evidence: string[];
  complaints?: Array<{ theme: string; severity: "low" | "medium" | "high"; opportunity: string }>;
  listing?: { title: string; bullets: string[]; description: string; tags: string[] };
  creatorBrief?: { recommended: string[]; outreachDraft: string };
  model: string;
  generatedAt: string;
};

export const CREDIT_COSTS: Record<AnalysisKind | "supplier_match", number> = {
  signal_explanation: 2,
  niche_scorecard: 3,
  complaint_miner: 5,
  listing_copy: 5,
  creator_match: 4,
  weekly_report: 10,
  supplier_match: 3,
};
