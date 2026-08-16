import AppNav from "@/components/app-nav";

/** Shared product-page frame so every surface has identical rhythm and width. */
export function Shell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <AppNav active={active} />
      <main id="main" className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
        {children}
      </main>
    </div>
  );
}

export function PageHead({
  title,
  sub,
  aside,
}: {
  title: string;
  sub?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="display-md text-ink">{title}</h1>
        {sub && <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-body">{sub}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}

/** Freshness / provenance pill. The product's whole pitch is data honesty, so the
 *  interface states plainly which dataset you are looking at. */
export function SourceBadge({ live, when }: { live: boolean; when: string }) {
  if (live) {
    return (
      <span className="inline-flex items-center gap-2 rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-body">
        <span className="h-1.5 w-1.5 rounded-full bg-pos" />
        Live · pulled {when}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-ctl border border-line bg-warnweak px-2.5 py-1.5 font-mono text-[11px] text-warn">
      <span className="h-1.5 w-1.5 rounded-full bg-warn" />
      Sample data
    </span>
  );
}

/** Metric tile. No card chrome; hairline and spacing carry the structure. */
export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-l border-line pl-3.5 first:border-l-0 first:pl-0">
      <p className="label text-mut">{label}</p>
      <p data-numeric className="mt-1.5 font-mono text-[26px] font-medium leading-none tracking-[-.02em] text-ink">
        {value}
      </p>
      {note && <p className="mt-1.5 text-[11.5px] leading-snug text-mut">{note}</p>}
    </div>
  );
}
