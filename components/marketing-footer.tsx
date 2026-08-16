import Link from "next/link";
import Logo from "@/components/logo";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-6 px-5 py-9 sm:px-8">
        <div>
          <Logo />
          <p className="mt-2.5 max-w-[38ch] text-[12.5px] leading-relaxed text-mut">
            Product intelligence from the Chinese platforms where trends start.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-mut">
          <Link href="/pricing" className="transition-colors hover:text-ink">Pricing</Link>
          <Link href="/login" className="transition-colors hover:text-ink">Sign in</Link>
          <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
          <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
        </nav>
      </div>
      <div className="mx-auto max-w-[1160px] border-t border-line px-5 py-5 sm:px-8">
        <p className="text-[11.5px] text-faint">
          © {new Date().getFullYear()} China Trend Signal. Engagement figures are read from public
          platform data and timestamped. We do not estimate store revenue.
        </p>
      </div>
    </footer>
  );
}
