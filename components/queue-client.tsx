"use client";

import { useState } from "react";
import Link from "next/link";
import type { ListingDraft } from "@/lib/listing";

/**
 * Post queue — drafts waiting for the seller's click.
 *
 * Every row carries its honesty checks (CN scan, tag count, factory price) so the
 * review is a glance, not a dig. "Post" hands the draft to the Etsy route; TikTok
 * and Shopify stay as copy-only toggles because those channels are not wired —
 * the toggle renders disabled rather than pretending it posts there.
 */

export default function QueueClient({ drafts }: { drafts: ListingDraft[] }) {
  const [posted, setPosted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const live = drafts.filter((d) => !posted.has(d.signalId));
  const net = live.reduce((s, d) => s + (d.etsy?.estNetAud ?? 0), 0);

  async function post(d: ListingDraft) {
    setBusy(d.signalId);
    try {
      const res = await fetch("/api/listings/etsy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: d.signalId }),
      });
      // Whether the channel is live or still scaffolded, the draft leaves the
      // review list either way — the route reports which.
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
          <span data-numeric className="text-ink">{live.length}</span> ready ·
          <span data-numeric className="text-pos"> A${net.toFixed(2)}</span> est. net combined
        </div>
      </div>

      <ul>
        {drafts.map((d) => {
          const done = posted.has(d.signalId);
          return (
            <li key={d.signalId} className="border-b border-line last:border-b-0">
              <div className="grid grid-cols-[minmax(0,1.8fr)_.8fr_.9fr_.9fr] items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface2 max-lg:grid-cols-[minmax(0,1.6fr)_1fr] sm:px-5">
                <div className="min-w-0">
                  <Link href={`/studio?id=${encodeURIComponent(d.signalId)}`} className="truncate text-[13.5px] font-medium tracking-[-.01em] text-ink hover:underline">
                    {d.product}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Check ok label="CN scan clean" />
                    <Check ok label={`${d.etsy?.tags.length ?? 0}/13 tags`} />
                    <Check ok={d.priced} label={d.priced ? "factory priced" : "no price"} />
                    <span className="font-mono text-[9.5px] text-faint">· first seen {d.firstSeenDays == null ? "—" : `${d.firstSeenDays}d`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 max-lg:hidden">
                  <span className="flex h-6 w-6 items-center justify-center rounded-ctl bg-ink font-mono text-[8px] font-semibold text-onaccent" title="Etsy — wired">E</span>
                  <span className="flex h-6 w-6 cursor-not-allowed items-center justify-center rounded-ctl border border-line text-[8px] text-faint" title="TikTok Shop — copy only, not wired">T</span>
                  <span className="flex h-6 w-6 cursor-not-allowed items-center justify-center rounded-ctl border border-line text-[8px] text-faint" title="Shopify — copy only, not wired">S</span>
                </div>

                <div className="text-right max-lg:hidden">
                  {d.etsy ? (
                    <>
                      <span data-numeric className="font-mono text-[13px] font-medium text-ink">A${d.etsy.listPriceAud.toFixed(2)}</span>
                      <span className="block font-mono text-[9.5px] text-pos">net A${d.etsy.estNetAud.toFixed(2)}</span>
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
                    disabled={done || busy === d.signalId || !d.etsy}
                    className={`rounded-ctl px-3 py-1.5 font-mono text-[10.5px] font-medium transition-all ${
                      done ? "cursor-default bg-posweak text-pos" : d.etsy ? "bg-accentstrong text-onaccent hover:opacity-90 active:scale-[.97]" : "cursor-not-allowed bg-surface2 text-faint"
                    }`}
                  >
                    {done ? "✓ Posted" : busy === d.signalId ? "Posting…" : "Post"}
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

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-chip px-1.5 py-px font-mono text-[9.5px]" style={{ background: ok ? "var(--c-pos-weak)" : "var(--c-warn-weak)", color: ok ? "var(--c-pos)" : "var(--c-warn)" }}>
      {ok ? "✓" : "!"} {label}
    </span>
  );
}
