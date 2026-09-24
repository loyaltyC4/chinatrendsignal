"use client";

/**
 * Jev triage chip — renders the evaluation model's ROUTE, not a fact.
 *
 * The distinction matters to this product's honesty contract: velocity, saves
 * ratio and wholesale price are measurements; the Jev route is a derived opinion
 * with a stated confidence, so the chip says so in its tooltip and the UI labels
 * it the same way "est." labels a derived price. A null route renders nothing —
 * untriaged rows just don't carry an opinion, which is the honest state.
 *
 * Route bands (lib/jev.ts): auto = high confidence + demand + novelty; kill =
 * not a listable product / confidence too low; review = everything between.
 */

const TONE: Record<string, { bg: string; fg: string }> = {
  auto: { bg: "var(--c-pos-weak)", fg: "var(--c-pos)" },
  review: { bg: "var(--c-warn-weak)", fg: "var(--c-warn)" },
  kill: { bg: "var(--c-neg-weak)", fg: "var(--c-neg)" },
  unverified: { bg: "var(--c-surface-2)", fg: "var(--c-faint)" },
};

export default function JevChip({
  route,
  probability,
  firstMarket,
  confidence,
}: {
  route: "auto" | "review" | "kill" | "unverified";
  probability?: number | null;
  firstMarket?: string | null;
  confidence?: number | null;
}) {
  const tone = TONE[route] ?? TONE.unverified;
  const tip = [
    `Jev triage: ${route} — an opinion with stated confidence, not a measurement`,
    probability != null ? `listable probability ${(probability * 100).toFixed(0)}%` : null,
    confidence != null ? `market confidence ${(confidence * 100).toFixed(0)}%` : null,
    firstMarket && route !== "kill" ? `suggested first market: ${firstMarket}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-chip px-1.5 py-px font-mono text-[9.5px]"
      style={{ background: tone.bg, color: tone.fg }}
      title={tip}
    >
      <span aria-hidden>◆</span> jev·{route}
      {firstMarket && route !== "kill" && <span className="opacity-70">→{firstMarket}</span>}
    </span>
  );
}
