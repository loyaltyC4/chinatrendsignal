import Link from "next/link";
import Logo from "@/components/logo";
import ThemeToggle from "@/components/theme-toggle";

/** Marketing nav. One line, 60px, three links. A nav bar that eats 15% of the
 *  viewport is an agency habit, not a product one.
 *
 *  The section links are root-relative (/#how) rather than bare fragments. This
 *  component also renders on /pricing, /terms and /privacy, where those sections do
 *  not exist, so a bare #how did nothing at all when clicked. */
export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-[1160px] items-center justify-between gap-6 px-5 py-3 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 text-[13.5px] text-mut md:flex">
          <Link href="/#how" className="transition-colors hover:text-ink">How it works</Link>
          <Link href="/#proof" className="transition-colors hover:text-ink">The data</Link>
          <Link href="/pricing" className="transition-colors hover:text-ink">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden text-[13.5px] text-mut transition-colors hover:text-ink sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-ctl bg-accentstrong px-3.5 py-1.5 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
