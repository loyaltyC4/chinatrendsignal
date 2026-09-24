"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ListingDraft } from "@/lib/listing";

/**
 * Listing studio — where a radar signal becomes a sellable, compliant draft.
 *
 * One signal in, platform-specific copy out. Etsy is the deep pane: a 2025-rules
 * title editor (primary keyword front-loaded, ≤15 words, ≤130 chars, commas only),
 * a 13-tag editor, and a lane-voice description — all validated live. TikTok Shop
 * ships a content kit (hooks + caption + hashtags, copy-only) because originality
 * mandates make auto-posting video pointless; Shopify gets brand-voice copy.
 *
 * The right rail is the part sellers usually get wrong: a true-margin calculator
 * carrying Etsy's real 15–28% fee stack (listing + transaction on total +
 * processing + the mandatory Offsite Ads contingency), so nothing ships that
 * can't hold its margin. Every money figure is derived and labelled est.
 */

type Pane = "etsy" | "tiktok" | "shopify";

export default function StudioClient({ draft }: { draft: ListingDraft }) {
  const [pane, setPane] = useState<Pane>("etsy");
  const etsy = draft.etsy;
  const [title, setTitle] = useState(etsy?.title ?? "");
  const [tags, setTags] = useState<string[]>(etsy?.tags ?? []);
  const [desc, setDesc] = useState(etsy?.description ?? "");
  const [tagInput, setTagInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);

  const titleWords = title.trim().split(/\s+/).filter(Boolean).length;
  const titleChars = title.length;

  const formula = useMemo(
    () => [
      { key: "kw", label: "keyword first", hit: title.toLowerCase().startsWith(draft.product.split(" ")[0]!.toLowerCase()) },
      { key: "comma", label: "commas, no pipes", hit: title.includes(",") && !title.includes("|") },
      { key: "short", label: "≤ 15 words", hit: titleWords > 0 && titleWords <= 15 },
      { key: "len", label: "≤ 130 chars", hit: titleChars > 0 && titleChars <= 130 },
      { key: "clean", label: "no filler words", hit: !/beautiful|perfect|stunning|gorgeous|free shipping|on sale/i.test(title) },
    ],
    [title, titleWords, titleChars, draft.product],
  );

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    });
  }

  function addTag() {
    const v = tagInput.trim().slice(0, 20).toLowerCase();
    if (!v || tags.length >= 13 || tags.includes(v)) return;
    setTags((t) => [...t, v]);
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

  const m = etsy?.margin;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      {/* ── LEFT: the platform panes ── */}
      <div className="min-w-0 rounded-card border border-line bg-surface">
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
          {draft.ipRisk && (
            <span className="rounded-chip bg-negweak px-2 py-1 font-mono text-[10px] text-neg" title="Branded/character term detected — review IP before listing">IP review</span>
          )}
          <span className="ml-auto rounded-chip bg-surface2 px-2 py-1 font-mono text-[10px] text-mut">DRAFT · autosaved</span>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-line bg-surface2 px-5 py-3">
          {paneBtn(pane, setPane, "etsy", "Etsy", "FULL DRAFT", true)}
          {paneBtn(pane, setPane, "tiktok", "TikTok Shop", "CONTENT KIT", false)}
          {paneBtn(pane, setPane, "shopify", "Shopify", "COPY", false)}
        </div>

        <div className="p-5">
          {pane === "etsy" && (
            !etsy ? (
              <p className="rounded-ctl border border-line bg-warnweak px-4 py-6 text-[13px] text-warn">
                This signal has no verified factory price yet, so there is no honest Etsy draft to write. The studio
                fills in the moment the supplier match lands.
              </p>
            ) : (
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <p className="label text-mut">Title · 2025 rules</p>
                  <span data-numeric className={`font-mono text-[10.5px] ${titleChars > 140 ? "text-neg" : titleChars <= 130 ? "text-pos" : "text-faint"}`}>
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
                    <span key={f.key} className={`rounded-chip px-2 py-1 font-mono text-[9.5px] transition-colors ${f.hit ? "bg-posweak text-pos" : "bg-surface2 text-faint"}`}>
                      {f.hit ? "✓ " : ""}{f.label}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-faint">Mobile truncates ~58 chars — your primary keyword is already in the first 40.</p>

                <div className="mb-1 mt-6 flex items-baseline justify-between">
                  <p className="label text-mut">Tags · 13 max, ≤ 20 chars</p>
                  <span data-numeric className={`font-mono text-[10.5px] ${tags.length > 13 ? "text-neg" : "text-pos"}`}>{tags.length} / 13</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, i) => (
                    <span key={t} className={`inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-[12px] font-medium ${i < 3 && /gift/.test(t) ? "bg-[var(--c-1688-weak)] text-[var(--c-1688)]" : "bg-surface2 text-ink"}`}>
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

          {pane === "tiktok" && (
            <div>
              <p className="label mb-2 text-mut">Hook script · TikTok bans templated content — react, don't copy</p>
              <div className="space-y-2">
                {draft.tiktok.hooks.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-ctl border border-line bg-surface2 px-3.5 py-3">
                    <span className="pt-0.5 font-mono text-[10px] font-medium text-accent">0{i + 1}</span>
                    <p className="flex-1 text-[13px] leading-relaxed text-ink">{h}</p>
                    <CopyBtn onClick={() => copy(h, `h${i}`)} done={copied === `h${i}`} />
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-ctl border border-line bg-warnweak px-3.5 py-2.5 text-[11px] leading-relaxed text-warn">
                Show your face or voice and the actual product — product-only or text-to-speech clips get suppressed under
                the Sept 2025 originality policy.
              </p>
              <CopyBlock label="Caption · hook-first" text={draft.tiktok.caption} k="cap" copied={copied} onCopy={copy} />
              <CopyBlock label="Hashtag stack · mixed reach + intent" text={draft.tiktok.hashtags} k="tags" copied={copied} onCopy={copy} mono />
            </div>
          )}

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

      {/* ── RIGHT: true margin, gates, source, action ── */}
      <aside className="space-y-5">
        <div className="rounded-card border border-line bg-surface">
          <div className="border-b border-line px-4 py-3">
            <p className="text-[13.5px] font-medium text-ink">True margin</p>
            <p className="mt-0.5 text-[11px] text-faint">every Etsy fee, conservative case · est.</p>
          </div>
          <div className="px-4 py-2">
            {m ? (
              <>
                <Row k="1688 landed" v={`A$${m.landedAud.toFixed(2)}`} />
                <Row k="List price" v={`A$${m.listPriceAud.toFixed(2)}`} />
                <Row k="Listing fee" v={`−A$${m.listingFeeAud.toFixed(2)}`} dim />
                <Row k="Transaction 6.5%" v={`−A$${m.transactionFeeAud.toFixed(2)}`} dim />
                <Row k="Processing 3%+" v={`−A$${m.processingFeeAud.toFixed(2)}`} dim />
                <Row k="Offsite Ads 15%" v={`−A$${m.offsiteAdsFeeAud.toFixed(2)}`} dim />
                <div className="flex items-baseline justify-between border-t border-line py-2.5">
                  <span className="text-[12.5px] font-medium text-ink">You keep / unit</span>
                  <span data-numeric className="font-mono text-[16px] font-medium" style={{ color: m.viable ? "var(--c-pos)" : "var(--c-neg)" }}>
                    A${m.estNetAud.toFixed(2)}
                  </span>
                </div>
                <div className="pb-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface2">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, m.marginPct * 100)}%`, background: m.viable ? "var(--c-pos)" : "var(--c-neg)" }} />
                  </div>
                  <p className="mt-1.5 font-mono text-[10px]" style={{ color: m.viable ? "var(--c-pos)" : "var(--c-neg)" }}>
                    {Math.round(m.marginPct * 100)}% net margin {m.viable ? "· clears the 30% floor" : "· below the 30% floor — repriced or skip"}
                  </p>
                </div>
              </>
            ) : (
              <p className="py-4 font-mono text-[11px] text-faint">No factory price yet, so no honest margin to show.</p>
            )}
          </div>
          {m && (
            <p className="mx-4 mb-4 rounded-ctl bg-[var(--c-1688-weak)] px-3 py-2 text-[11px] leading-relaxed text-[var(--c-1688)]">
              List at A${m.listPriceAud.toFixed(2)}, anchor A${m.saleAnchorAud.toFixed(2)} — Etsy renders the Sale badge and the
              margin holds even when Offsite Ads fires.
            </p>
          )}
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <p className="text-[13.5px] font-medium text-ink">Before you post</p>
          <div className="mt-2.5 space-y-2.5">
            <Gate ok label="First-seen dated" sub={`recorded ${draft.firstSeenDays == null ? "recently" : `${draft.firstSeenDays}d ago`}, never back-dated`} />
            <Gate ok={draft.priced} label="Factory price verified" sub={draft.priced ? `¥${draft.wholesaleCny} wholesale, dated` : "supplier match still running"} />
            <Gate
              ok={draft.saturation.count != null}
              muted={draft.saturation.count == null}
              label="Etsy saturation"
              sub={draft.saturation.count != null ? `${draft.saturation.count.toLocaleString()} live listings · ${draft.saturationVerdict}` : "not measured — shown as a dash, not a guess"}
            />
            <Gate ok={!draft.ipRisk} muted={!draft.ipRisk} label="IP / trademark scan" sub={draft.ipRisk ? "branded term detected — review before listing" : "no branded or character terms found"} />
          </div>
        </div>

        <div className="rounded-card border border-line bg-surface p-4">
          <button
            onClick={() => setPosted(true)}
            disabled={!etsy || posted || draft.ipRisk}
            className={`w-full rounded-ctl py-3 text-[13px] font-semibold transition-all ${
              posted ? "cursor-default bg-posweak text-pos" : etsy && !draft.ipRisk ? "bg-accentstrong text-onaccent hover:opacity-90 active:scale-[.98]" : "cursor-not-allowed bg-surface2 text-faint"
            }`}
          >
            {posted ? "✓ Sent to queue" : draft.ipRisk ? "Resolve IP flag first" : "Post draft to Etsy"}
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

function paneBtn(pane: Pane, setPane: (p: Pane) => void, p: Pane, label: string, badge: string, live: boolean) {
  return (
    <button
      key={p}
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
}

function Row({ k, v, dim }: { k: string; v: string; dim?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-2 last:border-b-0">
      <span className="text-[12px] text-mut">{k}</span>
      <span data-numeric className={`font-mono text-[12px] ${dim ? "text-mut" : "font-medium text-ink"}`}>{v}</span>
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
