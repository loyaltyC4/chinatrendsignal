"use client";

import { useState } from "react";

type Offer = { title: string; price: number | null; url: string | null };

/**
 * Supplier search panel.
 *
 * Replaces a plain HTML form that POSTed form-encoded data to a JSON route — it
 * returned 400 and navigated the user off the page to raw JSON. This is a real
 * client component with loading, empty, error, signed-out and out-of-credit states.
 */
export default function SupplierSearch({ initialKeyword }: { initialKeyword: string }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [note, setNote] = useState("");
  /** True when the failure is ours (provider down, quota, timeout) rather than the
   *  user's. It changes the tone of the message: our fault is not an alarm. */
  const [ours, setOurs] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setState("loading");
    setNote("");
    setOurs(false);
    setOffers([]);
    try {
      const r = await fetch("/api/supplier-match", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const d = await r.json();

      if (r.status === 401) { setState("error"); setNote("Your session expired. Sign in again to run a match."); return; }
      if (r.status === 402) { setState("error"); setNote(`Not enough credits. This costs ${d.required} and you have ${d.balance}.`); return; }
      if (r.status === 429) { setState("error"); setNote("You've hit the limit for supplier matches. It resets shortly."); return; }
      if (d.setupRequired) { setState("error"); setNote(d.instructions || "Supplier matching is not connected yet."); return; }
      if (!r.ok) {
        setState("error");
        setOurs(Boolean(d.ours));
        setNote(d.error || "Supplier match failed.");
        return;
      }
      if (d.note) setNote(d.note);

      // Verified shape: data.data.OFFER.items[].data
      const raw = d.data?.wholesale1688?.data?.OFFER?.items ?? [];
      const parsed: Offer[] = raw.slice(0, 6).map((i: any) => {
        const node = i?.data ?? i;
        const priceKey = Object.keys(node || {}).find((k) => /price/i.test(k) && !/origin|market/i.test(k));
        const price = priceKey ? Number(String(node[priceKey]).match(/[\d.]+/)?.[0]) : null;
        return {
          title: node?.title || node?.subject || node?.name || "Untitled offer",
          price: Number.isFinite(price) ? price : null,
          url: node?.url || node?.detailUrl || null,
        };
      });
      setOffers(parsed);
      setState("done");
    } catch {
      setState("error");
      setNote("Could not reach the server. Try again.");
    }
  }

  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <h2 className="display-sm text-ink">Find the factory</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-body">
        Search 1688 wholesale listings for this product and read the real offer prices. Costs
        3 credits per search.
      </p>

      <form onSubmit={search} className="mt-4 flex gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          aria-label="Product keyword"
          placeholder="喷雾梳"
          className="min-w-0 flex-1 rounded-ctl border border-line bg-canvas px-3 py-2 text-[13.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
        />
        <button
          disabled={state === "loading"}
          className="shrink-0 rounded-ctl bg-accentstrong px-3.5 py-2 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-50"
        >
          {state === "loading" ? "Searching…" : "Search"}
        </button>
      </form>

      {state === "loading" && (
        <div className="mt-4 space-y-2" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 animate-pulse rounded-ctl bg-surface2" />
          ))}
        </div>
      )}

      {state === "error" && (
        <p
          className={`mt-4 rounded-ctl border border-line px-3 py-2.5 text-[13px] leading-relaxed ${
            ours ? "bg-warnweak text-warn" : "bg-negweak text-neg"
          }`}
        >
          {note}
        </p>
      )}

      {state === "done" && note && (
        <p className="mt-4 rounded-ctl border border-line bg-warnweak px-3 py-2.5 text-[12.5px] leading-relaxed text-warn">
          {note}
        </p>
      )}

      {state === "done" && offers.length === 0 && (
        <p className="mt-4 rounded-ctl border border-line bg-surface2 px-3 py-2.5 text-[13px] text-mut">
          No offers came back for that term. Try the Chinese product noun rather than a full
          caption.
        </p>
      )}

      {state === "done" && offers.length > 0 && (
        <ul className="mt-4 divide-y divide-[var(--c-line)] overflow-hidden rounded-ctl border border-line">
          {offers.map((o, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="min-w-0 truncate text-[13px] text-ink">{o.title}</span>
              <span data-numeric className="shrink-0 font-mono text-[12.5px] font-medium text-ink">
                {o.price != null ? `¥${o.price}` : "-"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
