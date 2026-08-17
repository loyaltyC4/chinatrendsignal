"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";

/**
 * Grouped sidebar.
 *
 * The taste skill warns against reaching for a left sidebar by reflex. It is the
 * right call here anyway: eight destinations across three job stages plus account
 * needs grouping, and a top nav would either wrap or hide half of it behind a
 * hamburger on desktop. Hand-built rather than imported so it matches the token
 * system and carries no motion gimmicks.
 */

const GROUPS: Array<{ label: string; items: Array<{ href: string; name: string; hue?: string }> }> = [
  {
    label: "Discover",
    items: [
      { href: "/dashboard", name: "Today", hue: "var(--c-accent)" },
      { href: "/radar", name: "Radar", hue: "var(--c-xhs)" },
      { href: "/watchlist", name: "Watchlist", hue: "var(--c-douyin)" },
    ],
  },
  {
    label: "Validate",
    items: [
      { href: "/analysis", name: "Analysis", hue: "var(--c-1688)" },
      { href: "/ask", name: "Ask", hue: "var(--c-taobao)" },
    ],
  },
  {
    label: "Compound",
    items: [
      { href: "/reports", name: "Reports", hue: "var(--c-douyin)" },
      { href: "/tracker", name: "Tracker", hue: "var(--c-taobao)" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings", name: "Settings" },
      { href: "/settings/billing", name: "Billing" },
    ],
  },
];

export default function AppSidebar({
  credits,
  plan,
  email,
  onOpenPalette,
}: {
  credits: number;
  plan: string;
  email: string | null;
  onOpenPalette?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-6">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="label px-2.5 text-faint">{g.label}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items.map((it) => {
              const active = pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(it.href));
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-ctl px-2.5 py-2 text-[13.5px] transition-colors ${
                      active ? "bg-surface2 font-medium text-ink" : "text-body hover:bg-surface2 hover:text-ink"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full transition-opacity"
                      style={{ background: it.hue ?? "var(--c-faint)", opacity: active ? 1 : 0.35 }}
                    />
                    {it.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* mobile bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle navigation"
            className="flex h-8 w-8 items-center justify-center rounded-ctl border border-line text-mut"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-b border-line bg-surface px-4 py-5 lg:hidden">{nav}</div>
      )}

      {/* desktop rail */}
      <aside className="sticky top-0 hidden h-[100dvh] w-[232px] shrink-0 flex-col border-r border-line bg-canvas px-4 py-5 lg:flex">
        <div className="px-1.5">
          <Logo />
        </div>

        <button
          onClick={onOpenPalette}
          className="mt-6 flex items-center justify-between rounded-ctl border border-line bg-surface px-2.5 py-2 text-[13px] text-mut transition-colors hover:border-linestrong hover:text-ink"
        >
          <span className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            Search
          </span>
          <kbd className="rounded-chip border border-line bg-canvas px-1.5 py-px font-mono text-[10px] text-faint">⌘K</kbd>
        </button>

        <div className="mt-7 flex-1 overflow-y-auto">{nav}</div>

        {/* plan footer, doubles as the billing entry point */}
        <div className="mt-4 rounded-card border border-line bg-surface p-3">
          <div className="flex items-baseline justify-between">
            <span className="label text-faint">Plan</span>
            <span className="font-mono text-[11px] capitalize text-body">{plan}</span>
          </div>
          <p data-numeric className="mt-2 font-mono text-[20px] font-medium leading-none text-ink">
            {credits}
            <span className="ml-1 text-[11px] font-normal text-mut">credits</span>
          </p>
          <Link
            href="/settings/billing"
            className="mt-3 block rounded-ctl bg-accentstrong py-1.5 text-center text-[12px] font-medium text-onaccent transition-opacity hover:opacity-90"
          >
            Manage plan
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between px-1.5">
          <span className="truncate font-mono text-[10.5px] text-faint" title={email ?? ""}>
            {email ?? "signed in"}
          </span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
