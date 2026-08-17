"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";
import { OmniCommandPalette, type OmniSource, type OmniItem } from "@/components/ui/omni-command-palette";

/**
 * The signed-in frame: sidebar plus a command palette.
 *
 * The palette is the retention lever. Once someone learns Cmd-K, jumping to a
 * product or a page stops costing them navigation, and a tool that is fast to
 * reach is a tool that stays open. Two sources: destinations, and the live signal
 * index.
 */
export default function AppFrame({
  credits,
  plan,
  email,
  signals,
  children,
}: {
  credits: number;
  plan: string;
  email: string | null;
  signals: Array<{ id: string; product: string; zh: string; niche: string }>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const go = useCallback((href: string) => router.push(href), [router]);

  const sources: OmniSource[] = useMemo(
    () => [
      {
        id: "pages",
        label: "Go to",
        fetch: () =>
          [
            { href: "/dashboard", label: "Today" },
            { href: "/radar", label: "Radar" },
            { href: "/watchlist", label: "Watchlist" },
            { href: "/analysis", label: "Analysis" },
            { href: "/ask", label: "Ask the radar" },
            { href: "/reports", label: "Weekly report" },
            { href: "/tracker", label: "Outcome tracker" },
            { href: "/settings", label: "Settings" },
            { href: "/settings/billing", label: "Billing and credits" },
          ].map<OmniItem>((p) => ({
            id: `page:${p.href}`,
            label: p.label,
            groupId: "pages",
            onAction: () => go(p.href),
          })),
      },
      {
        id: "signals",
        label: "Products in your index",
        minQuery: 1,
        emptyHint: "No product matches that.",
        fetch: (q: string) => {
          const needle = q.toLowerCase();
          return signals
            .filter(
              (s) =>
                s.product.toLowerCase().includes(needle) ||
                s.zh.includes(q) ||
                s.niche.toLowerCase().includes(needle),
            )
            .slice(0, 8)
            .map<OmniItem>((s) => ({
              id: `sig:${s.id}`,
              label: s.product,
              subtitle: [s.zh, s.niche].filter(Boolean).join(" · "),
              groupId: "signals",
              keywords: [s.zh, s.niche],
              onAction: () =>
                go(
                  `/analysis?id=${encodeURIComponent(s.id)}`,
                ),
            }));
        },
      },
    ],
    [signals, go],
  );

  return (
    <div className="flex min-h-[100dvh] bg-canvas lg:flex-row">
      <AppSidebar
        credits={credits}
        plan={plan}
        email={email}
        onOpenPalette={() => setPaletteOpen(true)}
      />
      <div className="min-w-0 flex-1">{children}</div>

      <OmniCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        sources={sources}
        placeholder="Search products, or jump to a page…"
        storageKey="cts-omni"
        showRecents
      />
    </div>
  );
}
