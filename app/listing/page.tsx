import type { Metadata } from "next";
import AppNav from "@/components/app-nav";

export const metadata: Metadata = { title: "Listing Studio — China Trend Signal" };

const ZH_TITLE = "跨境手柄喷雾梳猫狗电动蒸汽喷雾刷按摩梳一键喷雾防飞毛宠物梳子";
const EN_TITLE = "MistSpray Pet Brush — Electric Steam Grooming Comb for Cats & Dogs";

export default function ListingStudioPage() {
  return (
    <div className="min-h-screen bg-[#f4f1ea] font-sans text-[#1a1b20]">
      <AppNav active="Listing Studio" />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-grn">Listing Studio</p>
            <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight sm:text-3xl">From signal to live listing</h1>
            <p className="mt-1 text-sm text-[#6b6f78]">The ¥2.52 steam pet brush, turned into a ready-to-post listing. No Photoshop, no translator.</p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl border border-white/15 px-4 py-2 text-sm text-[#c6d0c6] transition-colors hover:border-white/40">Copy for Shopify</button>
            <button className="rounded-xl bg-grn px-4 py-2 text-sm font-semibold text-[#12220a] transition-colors hover:bg-[#1e40af]">Export listing</button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          {/* left: images */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-black/10 bg-black/[.03] p-5">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">Cleaned product image</p>
              <div className="overflow-hidden rounded-xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brush-clean.png" alt="Steam pet brush isolated on white background" className="w-full object-contain" />
              </div>
              <div className="mt-3 flex items-center justify-between font-mono text-[10.5px] text-[#8a8f96]">
                <span>Background removed · auto-cropped · on white</span>
                <span className="rounded border border-grn/30 bg-grn/10 px-1.5 py-0.5 text-grn">rembg · $0.00</span>
              </div>
            </div>

            {/* before/after note */}
            <div className="rounded-2xl border border-black/10 bg-black/[.03] p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">What we did to the supplier photo</p>
              <ul className="space-y-2 text-[13px] text-[#c6d0c6]">
                <li className="flex gap-2"><span className="text-grn">→</span> Stripped the busy 1688 supplier background</li>
                <li className="flex gap-2"><span className="text-grn">→</span> Auto-cropped to the product, centered on white</li>
                <li className="flex gap-2"><span className="text-grn">→</span> Kept the mist droplets (the hook) intact</li>
              </ul>
            </div>
          </div>

          {/* right: copy */}
          <div className="space-y-5">
            {/* translation */}
            <div className="rounded-2xl border border-black/10 bg-black/[.03] p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">Title — translated &amp; rewritten</p>
              <div className="rounded-lg border border-black/8 bg-black/20 p-3 font-mono text-[11.5px] leading-relaxed text-[#8a8f96]">{ZH_TITLE}</div>
              <div className="my-2 text-center font-mono text-[11px] text-[#8a8f96]">↓ AI translation + rewrite</div>
              <div className="rounded-lg border border-grn/20 bg-grn/5 p-3 text-[15px] font-semibold text-ink">{EN_TITLE}</div>
            </div>

            {/* bullets */}
            <div className="rounded-2xl border border-black/10 bg-black/[.03] p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">Benefit bullets</p>
              <ul className="space-y-2.5 text-[14px] leading-relaxed text-[#3a3f47]">
                <li className="flex gap-2.5"><span className="text-grn">✓</span> One-touch fine mist loosens loose fur before it flies — no more fur storms</li>
                <li className="flex gap-2.5"><span className="text-grn">✓</span> Steam-softened bristles detangle without pulling, so cats actually sit still</li>
                <li className="flex gap-2.5"><span className="text-grn">✓</span> Self-cleaning release button ejects the collected fur in one press</li>
                <li className="flex gap-2.5"><span className="text-grn">✓</span> USB-C rechargeable, 2 weeks per charge on daily use</li>
              </ul>
            </div>

            {/* pricing + meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-black/10 bg-black/[.03] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">Suggested price</p>
                <p className="mt-2 font-mono text-[26px] font-bold text-grn">A$39.95</p>
                <p className="mt-1 text-[11.5px] text-[#8a8f96]">vs ¥2.52 wholesale · 74× spread</p>
              </div>
              <div className="rounded-2xl border border-black/10 bg-black/[.03] p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">Tags / keywords</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["pet grooming", "cat brush", "steam comb", "deshedding", "mist brush"].map((t) => (
                    <span key={t} className="rounded border border-black/10 bg-black/5 px-2 py-0.5 font-mono text-[10px] text-[#6b6f78]">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* description */}
            <div className="rounded-2xl border border-black/10 bg-black/[.03] p-5">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a8f96]">Description</p>
              <p className="text-[13.5px] leading-relaxed text-[#c6d0c6]">
                The grooming brush cats don't run from. A fine, warm mist softens the coat and loosens shed fur before the bristles ever touch it, so brushing stops being a wrestling match. One press of the release button drops the collected fur straight into the bin. Whisper-quiet motor, steam-safe bristles, and a charge that outlasts the season's worst shed.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 font-mono text-[11px] text-[#8a8f96]">Pipeline: supplier photo → rembg background removal → AI zh→en translation → rewritten listing copy → priced from the live spread. Export formats: Shopify CSV, TikTok Shop, generic.</p>
      </div>
    </div>
  );
}
