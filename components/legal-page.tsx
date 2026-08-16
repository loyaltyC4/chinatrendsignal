import MarketingNav from "@/components/marketing-nav";
import MarketingFooter from "@/components/marketing-footer";

/** Shared frame for the legal pages Stripe requires before it will process live
 *  payments. Plain prose, generous measure, no decoration. */
export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Array<{ h: string; p: string[] }>;
}) {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <MarketingNav />
      <main id="main" className="mx-auto max-w-[46rem] px-5 py-16 sm:px-8">
        <h1 className="display-lg text-ink">{title}</h1>
        <p className="mt-3 font-mono text-[12px] text-mut">Last updated {updated}</p>

        <div className="mt-10 space-y-9">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-[15px] font-medium text-ink">{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="mt-2.5 text-[14px] leading-[1.7] text-body">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-mut">
          These are working documents for a product in private beta, not legal advice. Have them
          reviewed before taking live payments.
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
