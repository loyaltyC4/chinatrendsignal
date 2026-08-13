import Link from "next/link";

// Shared top nav for the product (app) pages — every page reachable from every page.
const LINKS = [
  { href: "/radar", label: "Radar" },
  { href: "/analysis", label: "AI Analysis" },
  { href: "/movers", label: "Movers & Shakers" },
  { href: "/listing", label: "Listing Studio" },
  { href: "/pricing", label: "Pricing" },
];

export default function AppNav({ active }: { active: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/8 bg-[#f4f1ea]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-ink hover:opacity-80 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 26 26" fill="none" aria-hidden="true"><circle cx="13" cy="13" r="11" stroke="#1d4ed8" strokeWidth="2.5"/><circle cx="13" cy="13" r="5.5" stroke="#1d4ed8" strokeWidth="2.5"/><circle cx="13" cy="13" r="1.8" fill="#1d4ed8"/></svg>
          <span>chinatrendsignal</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 transition-colors ${active === l.label ? "bg-grn/10 font-medium text-grn" : "text-[#6b6f78] hover:bg-black/5 hover:text-white"}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/pricing" className="ml-3 hidden whitespace-nowrap rounded-xl bg-grn px-4 py-2 text-sm font-semibold text-[#12220a] transition-colors hover:bg-[#1e40af] sm:block">Get access</Link>
      </div>
    </header>
  );
}
