import Link from "next/link";
import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-canvas">
      <MarketingNav />
      <main id="main" className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col justify-center px-5 py-24 sm:px-8">
        <p data-numeric className="font-mono text-[13px] text-accent">404</p>
        <h1 className="display-lg mt-3 max-w-[18ch] text-ink">That page is not in the index.</h1>
        <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-body">
          The link may be old, or the page may have been removed when we cut the product back to
          its core. Both routes below definitely work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-ctl bg-accentstrong px-5 py-2.5 text-[14px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px">
            Back to the homepage
          </Link>
          <Link href="/radar" className="rounded-ctl border border-linestrong px-5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-surface2 active:translate-y-px">
            Open the radar
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
