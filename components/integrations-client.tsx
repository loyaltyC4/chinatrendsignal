"use client";

import { useState } from "react";
import type { ChannelState } from "@/app/integrations/page";

/**
 * Integrations — the connect surface for the sales channels.
 *
 * Honest by construction: a channel shows "Connected" only when the server
 * confirmed a token row; "Connect" only appears when the OAuth app is actually
 * configured (ETSY_CLIENT_ID present); otherwise the card says what's missing.
 * TikTok and Shopify are copy-only and say so — no fake "connect" button that
 * leads nowhere.
 */

type Card = {
  id: string;
  name: string;
  hue: string;
  bg: string;
  blurb: string;
  state: ChannelState | null;
  configured: boolean;
  mode: "oauth" | "copy";
  note: string;
};

export default function IntegrationsClient({ etsy, etsyConfigured }: { etsy: ChannelState; etsyConfigured: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);

  const cards: Card[] = [
    {
      id: "etsy",
      name: "Etsy",
      hue: "var(--c-taobao)",
      bg: "var(--c-taobao-weak)",
      blurb: "Post margin-gated drafts straight to Shop Manager → Listings. Titles, tags, and pricing come from the studio.",
      state: etsy,
      configured: etsyConfigured,
      mode: "oauth",
      note: etsy.connected ? "Drafts post to your shop for review — nothing goes live without you." : "Connect to enable one-click draft posting.",
    },
    {
      id: "tiktok",
      name: "TikTok Shop",
      hue: "var(--c-douyin)",
      bg: "var(--c-douyin-weak)",
      blurb: "Trend-anchored content kits: hooks, captions, and hashtags in your voice. Originality policy means we hand you material, not auto-post.",
      state: null,
      configured: false,
      mode: "copy",
      note: "Copy-only for now — the studio's TikTok pane gives you the kit to paste.",
    },
    {
      id: "shopify",
      name: "Shopify",
      hue: "var(--c-1688)",
      bg: "var(--c-1688-weak)",
      blurb: "Brand-voice product copy, long description, and SEO meta for your own storefront.",
      state: null,
      configured: false,
      mode: "copy",
      note: "Copy-only for now — the studio's Shopify pane gives you the copy to paste.",
    },
  ];

  async function connect(id: string) {
    setBusy(id);
    // The connect route 302s to Etsy's consent screen when configured.
    window.location.href = `/api/integrations/${id}/connect`;
  }

  return (
    <div>
      <div className="mb-6">
        <p className="label text-faint">Sell</p>
        <h1 className="mt-1.5 display-lg text-ink">Connect your <span className="spectrum-text">channels.</span></h1>
        <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-body">
          One trend becomes a listing on every channel you sell on. Connect Etsy to post drafts directly; TikTok Shop
          and Shopify hand you copy tailored to each platform until those APIs are wired.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => {
          const connected = c.state?.connected ?? false;
          return (
            <div key={c.id} className="flex flex-col rounded-card border border-line bg-surface p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-ctl font-mono text-[14px] font-semibold" style={{ background: c.bg, color: c.hue }}>
                  {c.name[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink">{c.name}</p>
                  <span
                    className="mt-0.5 inline-flex items-center gap-1.5 rounded-chip px-1.5 py-px font-mono text-[9px]"
                    style={connected ? { background: "var(--c-pos-weak)", color: "var(--c-pos)" } : { background: "var(--c-surface-2)", color: "var(--c-faint)" }}
                  >
                    <span className="h-1 w-1 rounded-full" style={{ background: connected ? "var(--c-pos)" : "var(--c-faint)" }} />
                    {connected ? "Connected" : c.mode === "copy" ? "Copy only" : "Not connected"}
                  </span>
                </div>
              </div>

              <p className="mt-3 flex-1 text-[12.5px] leading-relaxed text-mut">{c.blurb}</p>

              {connected && c.state?.accountLabel && (
                <p className="mt-2 truncate font-mono text-[10.5px] text-faint">{c.state.accountLabel}</p>
              )}

              <div className="mt-4">
                {c.mode === "oauth" ? (
                  connected ? (
                    <button
                      onClick={() => setBusy(c.id)}
                      className="w-full rounded-ctl border border-line py-2.5 text-[12px] font-medium text-mut transition-colors hover:text-ink"
                    >
                      {busy === c.id ? "…" : "Disconnect"}
                    </button>
                  ) : c.configured ? (
                    <button
                      onClick={() => connect(c.id)}
                      className="w-full rounded-ctl bg-accentstrong py-2.5 text-[12.5px] font-semibold text-onaccent transition-opacity hover:opacity-90 active:scale-[.98]"
                    >
                      {busy === c.id ? "Redirecting…" : `Connect ${c.name}`}
                    </button>
                  ) : (
                    <div className="rounded-ctl border border-line bg-surface2 px-3 py-2.5 text-[11px] leading-snug text-mut">
                      Add <span className="font-mono text-ink">ETSY_CLIENT_ID</span> to env to enable OAuth.
                    </div>
                  )
                ) : (
                  <a href="/radar2" className="block rounded-ctl border border-line py-2.5 text-center text-[12px] font-medium text-mut transition-colors hover:text-ink">
                    Open the desk →
                  </a>
                )}
                <p className="mt-2.5 text-center text-[10.5px] leading-relaxed text-faint">{c.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 max-w-[86ch] text-[11.5px] leading-relaxed text-mut">
        Etsy connects via OAuth (PKCE) and only ever creates <span className="font-medium text-ink">drafts</span> — you
        review in Shop Manager before anything is public. We request the minimum scopes needed to write listings and
        read your shop, and you can disconnect any time; that deletes the stored token.
      </p>
    </div>
  );
}
