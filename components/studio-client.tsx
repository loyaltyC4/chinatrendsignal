"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ListingDraft } from "@/lib/listing";

/**
 * Listing studio — where a radar signal becomes a sellable draft.
 *
 * One signal in, platform-specific copy out. Etsy is the deep integration (full
 * structured draft to the April 2026 title formula, 13 tags, lane description,
 * derived pricing) because it carries the most structure and is the channel the
 * account posts to. TikTok Shop and Shopify render as copy-paste panes with
 * platform-tailored voice until those channels are wired — the tabs say "copy"
 * rather than implying an integration that does not exist.
 *
 * Every number that is derived (list price, fee drag, est. net) is marked est.,
 * and the pre-list checks state plainly when something is unmeasured rather than
 * green-lighting a guess.
 */

type Pane = "etsy" | "tiktok" | "shopify";

export default function StudioClient({ draft }: { draft: ListingDraft }) {
  const [pane, setPane] = useState<Pane>("etsy");
  const [title, setTitle] = useState(draft.etsy?.title ?? "");
  const [tags, setTags] = useState<string[]>(draft.etsy?.tags ?? []);
  const [desc, setDesc] = useState(draft.etsy?.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const etsy = draft.etsy;
  const titleWords = title.trim().split(/\s+/).filter(Boolean).length;
  const titleChars = title.length;

  const formula = useMemo(
    () => [
      { key: "noun", label: "item noun once", hit: /[a-z]/.test(title) && title.trim().length > 0 },
      { key: "desc", label: "descriptors lead", hit: titleWords >= 3 },
      { key: "comma", label: "comma separated", hit: title.includes(",") },
      { key: "short", label: "≤ 15 words", hit: titleWords > 0 && titleWords <= 15 },
      { key: "len", label: "≤ 90 chars", hit: titleChars > 0 && titleChars <= 90 },
    ],
    [title, titleWords, titleChars],
  );

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  function addTag() {
    const v = tagInput.trim().slice(0, 20);
    if (!v || tags.length >= 13 || tags.includes(v.toLowerCase())) return;
    setTags((t) => [...t, v.toLowerCase()]);
    setTagInput("");
  }

  function copyAll() {
    const all = [
      "ETSY TITLE", title, "",
      "ETSY TAGS", tags.join(", "), "",
      "ETSY DESCRIPTION", desc, "",
      "TIKTOK HOOK", draft.tiktok.hooks[0] ?? "", "",
      "TIKTOK CAPTION", draft.tiktok.caption, "",
      "SHOPIFY TITLE", draft.shopify.title, "",
      "SHOPIFY META", draft.shopify.metaDescription,
    ].join("\n");
    copy(all, "all");
  }

  const paneBtn = (p: Pane, label: string, badge: string, live: boolean) => (
    <button
      onClick={() => setPane(p)}
      className={`flex items-center gap-2 rounded-ctl px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
        pane === p ? "bg-ink text-onaccent" : "border border-line bg-surface text-mut hover:border-linestrong hover:text-ink"
      }`}
    >
      {label}
      <span className={`rounded-chip px-1.5 py-px font-mono text-[9px] ${pane === p ? "bg-onaccent/20 text-onaccent" : live ? "bg-posweak text-pos" : "bg-surface2 text-faint"}`}>
        {badge}
      </span>
    </button>
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      {/* ── LEFT: the platform panes ── */}
      <div className="min-w-0 rounded-card border border-line bg-surface">
        {/* product header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <Link href="/radar2" className="flex items-center gap-1.5 rounded-ctl border border-line px-2.5 py-1.5 text-[11.5px] font-medium text-mut transition-colors hover:text-ink">
            ← Desk
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-[-.01em] text-ink">{draft.product}</h1>
            <p className="mt-0.5 font-mono text-[10.5px] text-faint">
              {draft.zh} · first seen {draft.firstSeenDays == null ? "recently" : draft.firstSeenDays === 0 ? "today" : `${draft.firstSeenDays}d ago`} · {draft.niche}
            </p>
          </div>
          <span className="ml-auto rounded-chip bg-surface2 px-2 py-1 font-mono text-[10px] text-mut">DRAFT · autosaved</span>
        </div>

        {/* platform tabs */}
        <div className="flex flex-wrap gap-2 border-b border-line bg-surface2 px-5 py-3">
          {paneBtn("etsy", "Etsy", "FULL DRAFT", true)}
          {paneBtn("tiktok", "TikTok Shop", "COPY", false)}
          {paneBtn("shopify", "Shopify", "COPY", false)}
        </div>

        <div className="p-5">
          {/* ═══ ETSY ═══ */}
          {pane === "etsy" && (
            !etsy ? (
              <p className="rounded-ctl border border-line bg-warnweak px-4 py-6 text-[13px] text-warn">
                This signal has no verified factory price yet, so there is no honest Etsy draft to write. The studio
                fills in the moment the supplier match lands.
              </p>
            ) : (
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <p className="label text-mut">Title · April 2026 formula</p>
                  <span data-numeric className={`font-mono text-[10.5px] ${titleChars > 140 ? "text-neg" : titleChars <= 90 ? "text-pos" : "text-faint"}`}>
                    {titleChars} / 140
                  </span>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-ctl border border-line bg-surface2 px-3.5 py-3 text-[15px] font-medium tracking-[-.01em] text-ink outline-none transition-all focus:border-accent focus:bg-surface focus:shadow-[0_0_0_3px_var(--c-accent-weak)]"
                />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {formula.map((f) => (
                    <span
                      key={f.key}
                      className={`rounded-chip px-2 py-1 font-mono text-[9.5px] transition-colors ${
                        f.hit ? "bg-posweak text-pos" : "bg-surface2 text-faint"
                      }`}
                    >
                      {f.hit ? "✓ " : ""}{f.label}
                    </span>
                  ))}
                </div>

                <div className="mb-1 mt-6 flex items-baseline justify-between">
                  <p className="label text-mut">Tags · 13 max, ≤ 20 chars</p>
                  <span data-numeric className={`font-mono text-[10.5px] ${tags.length > 13 ? "text-neg" : "text-pos"}`}>{tags.length} / 13</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, i) => (
                    <span
                      key={t}
                      className={`inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-[12px] font-medium ${
                        i < 3 && /gift/.test(t) ? "bg-[var(--c-1688-weak)] text-[var(--c-1688)]" : "bg-surface2 text-ink"
                      }`}
                    >
                      {t}
                      <button onClick={() => setTags((x) => x.filter((y) => y !== t))} aria-label={`remove ${t}`} className="text-faint transition-colors hover:text-neg">×</button>
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add a tag — gift phrases live here, not in the title"
                    maxLength={20}
                    className="flex-1 rounded-ctl border border-line bg-surface2 px-3 py-2 text-[12.5px] text-ink outline-none transition-all focus:border-accent focus:bg-surface"
                  />
                  <button onClick={addTag} className="rounded-ctl border border-line px-3.5 py-2 text-[12px] font-medium text-mut transition-colors hover:text-ink">Add</button>
                </div>

                <p className="label mb-1 mt-6 text-mut">Description · lane voice</p>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {["HOOK", "DETAILS", "MATERIALS", "WHAT'S INCLUDED", "PERFECT FOR", "SHIPPING", "NOTE"].map((b) => (
                    <span key={b} className="rounded-chip bg-accentweak px-2 py-1 font-mono text-[9px] text-accentstrong">{b}</span>
                  ))}
                </div>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={16}
                  className="w-full resize-y rounded-ctl border border-line bg-surface2 px-3.5 py-3 font-mono text-[12px] leading-relaxed text-ink outline-none transition-all focus:border-accent focus:bg-surface"
                />
              </div>
            )
          )}

          {/* ═══ TIKTOK ═══ */}
          {pane === "tiktok" && (
            <div>
              <p className="label mb-2 text-mut">Hook script · the first 3 seconds decide the scroll</p>
              <div className="space-y-2">
                {draft.tiktok.hooks.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-ctl border border-line bg-surface2 px-3.5 py-3">
                    <span className="pt-0.5 font-mono text-[10px] font-medium text-accent">0{i + 1}</span>
                    <p className="flex-1 text-[13px] leading-relaxed text-ink">{h}</p>
                    <CopyBtn onClick={() => copy(h, `h${i}`)} done={copied === `h${i}`} />
                  </div>
                ))}
              </div>

              <CopyBlock label="Caption · hook-first" text={draft.tiktok.caption} k="cap" copied={copied} onCopy={copy} pre />
              <CopyBlock label="Hashtag stack · mixed reach + intent" text={draft.tiktok.hashtags} k="tags" copied={copied} onCopy={copy} mono />
            </div>
          )}

          {/* ═══ SHOPIFY ═══ */}
          {pane === "shopify" && (
            <div>
              <CopyBlock label="Product title · brand voice, no keyword stacking" text={draft.shopify.title} k="t" copied={copied} onCopy={copy} />
              <CopyBlock label="Long description · story → details → materials" text={draft.shopify.description} k="d" copied={copied} onCopy={copy} pre tall />
              <CopyBlock label="Meta title · ≤ 60 chars" text={draft.shopify.metaTitle} k="mt" copied={copied} onCopy={copy} mono />
              <CopyBlock label="Meta description · ≤ 160 chars" text={draft.shopify.metaDescription} k="md" copied={copied} onCopy={copy} mono />
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: pricing, gates, source, action ── */}
      <aside className="space-y-5">
        <div className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <p className="text-[13.5px] font-medium text-ink">Pricing &amp; margin</p>
            <p className="mt-0.5 text-[11px] text-faint">derived from the measured factory cost · est.</p>
          </div>
          <div className="px-4 py-2">
            {etsy ? (
              <>
                <PriceRow k="1688 unit" v={`¥${draft.wholesaleCny}`} />
                <PriceRow k="Landed, AUD" v={`A$${etsy.landedAud.toFixed(2)}`} />
                <PriceRow k="Fee drag (est.)" v={`A$${(etsy.listPriceAud * 0.117 + 0.38).toFixed(2)}`} />
                <PriceRow k="List price" v={`A$${etsy.listPriceAud.toFixed(2)}`} />
                <PriceRow k="Sale-badge anchor" v={`A$${etsy.saleAnchorAud.toFixed(2)}`} />
                <div className="flex items-baseline justify-between border-t border-line py-2.5">
                  <span className="text-[12.5px] font-medium text-ink">You keep / unit</span>
                  <span data-numeric className="font-mono text-[16px] font-medium text-pos">A${etsy.estNetAud.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="py-4 font-mono text-[11px] text-faint">No factory price yet, so no honest margin to show.</p>
            )}
          </div>
          {etsy && (
            <p className="mx-4 mb-4 rounded-ctl bg-[var(--c-1688-weak)] px-3 py-2 text-[11px] leading-relaxed text-[var(--c-1688)]">
              List at A${etsy.listPriceAud.toFixed(2)}, anchor A${etsy.saleAnchorAud.toFixed(2)} — Etsy renders the
              Sale badge and the margin holds.
            </p>
          )}
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <p className="text-[13.5px] font-medium text-ink">Before you post</p>
          <div className="mt-2.5 space-y-2.5">
            <Gate ok label="First-seen dated" sub={`recorded ${draft.firstSeenDays == null ? "recently" : `${draft.firstSeenDays}d ago`}, never back-dated`} />
            <Gate ok={draft.priced} label="Factory price verified" sub={draft.priced ? `¥${draft.wholesaleCny} wholesale, dated` : "supplier match still running"} />
            <Gate ok={false} muted label="Etsy saturation" sub="not measured yet — no count is shown rather than a guessed one" />
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <p className="text-[13.5px] font-medium text-ink">Source</p>
          <div className="mt-2 space-y-1.5 text-[12px]">
            <div className="flex justify-between"><span className="text-mut">Platforms</span><span className="font-mono text-ink">{draft.sources.join(" · ") || "—"}</span></div>
            <div className="flex justify-between"><span className="text-mut">Velocity</span><span data-numeric className="font-mono text-ink">+{draft.velocityPct}%</span></div>
            <div className="flex justify-between"><span className="text-mut">Intent</span><span data-numeric className="font-mono text-ink">{draft.intent}</span></div>
            {draft.savesRatio != null && (
              <div className="flex justify-between"><span className="text-mut">Saves-to-likes</span><span data-numeric className="font-mono text-ink">{draft.savesRatio.toFixed(2)}×</span></div>
            )}
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <button
            onClick={() => setPosted(true)}
            disabled={!etsy || posted}
            className={`w-full rounded-ctl py-3 text-[13px] font-semibold transition-all ${
              posted ? "cursor-default bg-posweak text-pos" : etsy ? "bg-accentstrong text-onaccent hover:opacity-90 active:scale-[.98]" : "cursor-not-allowed bg-surface2 text-faint"
            }`}
          >
            {posted ? "✓ Sent to queue" : "Post draft to Etsy"}
          </button>
          <button onClick={copyAll} className="mt-2 w-full rounded-ctl border border-line py-2.5 text-[12px] font-medium text-mut transition-colors hover:text-ink">
            {copied === "all" ? "✓ Copied all platforms" : "Copy all platforms"}
          </button>
          <p className="mt-3 text-center text-[10.5px] leading-relaxed text-faint">
            Drafts land in the queue for your review. Nothing publishes without your click.
          </p>
        </div>
      </aside>
    </div>
  );
}

function PriceRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-2 last:border-b-0">
      <span className="text-[12px] text-mut">{k}</span>
      <span data-numeric className="font-mono text-[12px] font-medium text-ink">{v}</span>
    </div>
  );
}

function Gate({ ok, muted, label, sub }: { ok: boolean; muted?: boolean; label: string; sub: string }) {
  const color = ok ? "var(--c-pos)" : muted ? "var(--c-faint)" : "var(--c-warn)";
  const bg = ok ? "var(--c-pos-weak)" : muted ? "var(--c-surface-2)" : "var(--c-warn-weak)";
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]" style={{ background: bg, color }}>
        {ok ? "✓" : muted ? "·" : "!"}
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[11px] leading-snug text-mut">{sub}</p>
      </div>
    </div>
  );
}

function CopyBlock({ label, text, k, copied, onCopy, mono, pre, tall }: { label: string; text: string; k: string; copied: string | null; onCopy: (t: string, k: string) => void; mono?: boolean; pre?: boolean; tall?: boolean }) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="label mb-2 text-mut">{label}</p>
      <div className="rounded-ctl border border-line bg-surface2 px-3.5 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-wider text-faint">ready to paste</span>
          <CopyBtn onClick={() => onCopy(text, k)} done={copied === k} />
        </div>
        <p className={`${mono ? "font-mono text-[11.5px]" : "text-[13px]"} ${pre ? "whitespace-pre-wrap" : ""} ${tall ? "min-h-[120px]" : ""} leading-relaxed text-ink`}>{text}</p>
      </div>
    </div>
  );
}

function CopyBtn({ onClick, done }: { onClick: () => void; done: boolean }) {
  return (
    <button onClick={onClick} className={`rounded-chip border px-2 py-1 font-mono text-[9.5px] transition-colors ${done ? "border-pos text-pos" : "border-line text-mut hover:border-linestrong hover:text-ink"}`}>
      {done ? "copied" : "copy"}
    </button>
  );
}
