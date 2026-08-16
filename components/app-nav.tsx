import Link from "next/link";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";

/**
 * Product nav. Six items, one line, 56px tall — a nav that eats 15% of the viewport
 * is a marketing-site habit that has no place above a data table.
 *
 * Scope is the frozen v1 set: Listing Studio and Agency were cut, Movers folded into
 * Radar as a filter.
 */
const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/radar", label: "Radar" },
  { href: "/analysis", label: "Analysis" },
  { href: "/reports", label: "Reports" },
  { href: "/ask", label: "Ask" },
  { href: "/tracker", label: "Tracker" },
];

export default function AppNav({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto text-[13.5px]">
          {LINKS.map((l) => {
            const on = active === l.label;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={on ? "page" : undefined}
                className={`whitespace-nowrap rounded-ctl px-2.5 py-1.5 transition-colors ${
                  on ? "bg-surface2 font-medium text-ink" : "text-mut hover:bg-surface2 hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Link
            href="/pricing"
            className="hidden whitespace-nowrap rounded-ctl bg-accentstrong px-3 py-1.5 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px sm:block"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </header>
  );
}
