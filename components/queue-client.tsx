"use client";

import { useState } from "react";
import Link from "next/link";
import type { ListingDraft } from "@/lib/listing";
import JevChip from "@/components/jev-chip";

/**
 * Post queue — drafts waiting for the seller's click.
 *
 * Every row carries its honesty checks (margin viability, CN scan, factory price,
 * Etsy saturation, IP flag) so the review is a glance, not a dig. A row that fails
 * the 30% margin floor or carries an IP flag can't be posted — the button says why
 * instead of letting a bad listing through. "Post" hands the draft to the Etsy
 * route; TikTok and Shopify stay as copy-only toggles because those channels are
 * not wired — rendered disabled rather than pretending they post.
 */

export default function QueueClient({ drafts }: { drafts: ListingDraft[] }) {
  const [posted, setPosted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const live = drafts.filter((d) => !posted.has(d.signalId));
  const net = live.reduce((s, d) => s + (d.etsy?.margin.estNetAud ?? 0), 0);
  const viableCount = live.filter((d) => d.etsy?.margin.viable && !d.ipRisk).length;

  async function post(d: ListingDraft) {
    setBusy(d.signalId);
    try {
      const res = await fetch("/api/listings/etsy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: d.signalId }),
      });
      if (res.ok) setPosted((s) => new Set(s).add(d.signalId));
    } finally {
      setBusy(null);
    }
  }

  if (!drafts.length) {
    return (
      <div className="rounded-card border border-line bg-surface px-6 py-16 text-center">
        <p className="display-sm text-ink">The queue is empty.</p>
        <p className="mx-auto mt-2 max-w-[52ch] text-[13.5px] text-body">
          Open a signal on the desk and hit <span className="font-medium text-ink">List</span> — the drafted listing
          lands here for review before anything posts.
        </p>
        <Link href="/radar2" className="mt-5 inline-block rounded-ctl bg-accentstrong px-4 py-2 text-[12.5px] font-medium text-onaccent hover:opacity-90">
          Open the desk
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface2 px-4 py-2.5 sm:px-5">
        <span className="label text-mut">Review &amp; post</span>
        <span className="font-mono text-[10.5px] text-faint">nothing publishes without your click</span>
        <div className="ml-auto flex items-center gap-2 font-mono text-[10.5px] text-mut">
          <span data-numeric className="text-ink">{viableCount}</span> viable ·
          <span data-numeric className="text-pos"> A${net.toFixed(2)}</span> est. net combined
        </div>
      </div>

      <ul>
        {drafts.map((d) => {
          const done = posted.has(d.signalId);
          const m = d.etsy?.margin;
          const blocked = !m || !m.viable || d.ipRisk;
          const blockReason = d.ipRisk ? "IP flag" : !m ? "no price" : !m.viable ? "low margin" : null;
          return (
            <li key={d.signalId} className="border-b border-line last:border-b-0">
              <div className="grid grid-cols-[minmax(0,1.8fr)_.8fr_.95fr_.95fr] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface2 max-lg:grid-cols-[minmax(0,1.6fr)_1fr] sm:px-5">
                <div className="min-w-0">
                  <Link href={`/studio?id=${encodeURIComponent(d.signalId)}`} className="truncate text-[13.5px] font-medium tracking-[-.01em] text-ink hover:underline">
                    {d.product}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Check ok label="CN scan clean" />
                    <Check ok label={`${d.etsy?.tags.length ?? 0}/13 tags`} />
                    <Check ok={d.priced} label={d.priced ? "factory priced" : "no price"} />
                    {d.saturation.count != null ? (
                      <Check ok={d.saturationVerdict === "open"} label={`Etsy ${d.saturation.count}`} />
                    ) : (
                      <Check ok={false} muted label="sat. n/a" />
                    )}
                    {d.ipRisk && <Check ok={false} label="IP flag" />}
                    {d.jevRoute && (
                      <JevChip
                        route={d.jevRoute}
                        probability={d.jevListableProbability}
                        firstMarket={d.jevFirstMarket}
                      />
                    )}
                    {d.jevFirstMarket && d.jevFirstMarket !== "etsy" && d.jevRoute !== "kill" && (
                      <Check ok={false} muted label={`Jev prefers ${d.jevFirstMarket}`} />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 max-lg:hidden">
                  <span className="flex h-6 w-6 items-center justify-center rounded-ctl bg-ink font-mono text-[8px] font-semibold text-onaccent" title="Etsy — wired">E</span>
                  <span className="flex h-6 w-6 cursor-not-allowed items-center justify-center rounded-ctl border border-line text-[8px] text-faint" title="TikTok Shop — content kit, not wired">T</span>
                  <span className="flex h-6 w-6 cursor-not-allowed items-center justify-center rounded-ctl border border-line text-[8px] text-faint" title="Shopify — copy only, not wired">S</span>
                </div>

                <div className="text-right max-lg:hidden">
                  {m ? (
                    <>
                      <span data-numeric className="font-mono text-[13px] font-medium text-ink">A${m.listPriceAud.toFixed(2)}</span>
                      <span className="block font-mono text-[9.5px]" style={{ color: m.viable ? "var(--c-pos)" : "var(--c-neg)" }}>
                        {Math.round(m.marginPct * 100)}% · net A${m.estNetAud.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-[11px] text-faint">—</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Link href={`/studio?id=${encodeURIComponent(d.signalId)}`} className="rounded-ctl border border-line px-2.5 py-1.5 font-mono text-[10.5px] text-mut transition-colors hover:text-ink">
                    Edit
                  </Link>
                  <button
                    onClick={() => post(d)}
                    disabled={done || busy === d.signalId || blocked}
                    title={blockReason ? `Blocked: ${blockReason}` : "Post this draft to Etsy"}
                    className={`rounded-ctl px-3 py-1.5 font-mono text-[10.5px] font-medium transition-all ${
                      done ? "cursor-default bg-posweak text-pos" : blocked ? "cursor-not-allowed bg-surface2 text-faint" : "bg-accentstrong text-onaccent hover:opacity-90 active:scale-[.97]"
                    }`}
                  >
                    {done ? "✓ Posted" : busy === d.signalId ? "Posting…" : blocked ? (blockReason ?? "Blocked") : "Post"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Check({ ok, muted, label }: { ok: boolean; muted?: boolean; label: string }) {
  const style = ok
    ? { background: "var(--c-pos-weak)", color: "var(--c-pos)" }
    : muted
      ? { background: "var(--c-surface-2)", color: "var(--c-faint)" }
      : { background: "var(--c-warn-weak)", color: "var(--c-warn)" };
  return (
    <span className="inline-flex items-center gap-1 rounded-chip px-1.5 py-px font-mono text-[9.5px]" style={style}>
      {ok ? "✓" : muted ? "·" : "!"} {label}
    </span>
  );
}
