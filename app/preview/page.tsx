import HeroEditorial from "@/components/hero-editorial";
import HeroData from "@/components/hero-data";
import Link from "next/link";

export const metadata = { title: "Choose your hero — China Trend Signal" };

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Two directions · pick one</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Two heroes, same platform</h1>
        <p className="mt-2 max-w-[62ch] text-[15px] text-mut">Both use the real platform logos and the same live data. Option 1 is editorial and story-led; Option 2 is data-forward and proof-led. Tell me which one we build on.</p>

        <div className="mt-10 space-y-16">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div><span className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-grn">Direction 1</span><h2 className="mt-1 text-lg font-semibold">The editorial read</h2></div>
              <span className="font-mono text-[10px] text-mut">story-led · warm · founder voice</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-ivory shadow-sm"><HeroEditorial /></div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div><span className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-grn">Direction 2</span><h2 className="mt-1 text-lg font-semibold">The live-proof read</h2></div>
              <span className="font-mono text-[10px] text-mut">data-forward · conversion-led</span>
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-ivory shadow-sm"><HeroData /></div>
          </section>
        </div>

        <div className="mt-12 rounded-2xl border border-black/10 bg-ivory p-6 text-center">
          <p className="font-serif text-xl font-semibold">Which one feels like the product?</p>
          <p className="mt-1 text-sm text-mut">Tell me the number and I&apos;ll make it the homepage, then polish the rest of the page around it.</p>
        </div>
        <div className="mt-6 text-center"><Link href="/" className="text-sm font-semibold text-grn">← Back to current homepage</Link></div>
      </div>
    </div>
  );
}
