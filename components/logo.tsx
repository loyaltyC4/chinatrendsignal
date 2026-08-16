import Link from "next/link";

/**
 * Concentric-radar mark. Preserved from the original brand per the redesign
 * protocol — the logo is one of the things you never change silently.
 */
export default function Logo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-2 text-ink transition-opacity hover:opacity-70"
      aria-label="China Trend Signal, home"
    >
      <svg width="20" height="20" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <circle cx="13" cy="13" r="11" stroke="var(--c-accent)" strokeWidth="2.2" />
        <circle cx="13" cy="13" r="5.5" stroke="var(--c-accent)" strokeWidth="2.2" />
        <circle cx="13" cy="13" r="1.9" fill="var(--c-accent)" />
      </svg>
      {!compact && (
        <span className="text-[14.5px] font-semibold tracking-[-.02em]">chinatrendsignal</span>
      )}
    </Link>
  );
}
