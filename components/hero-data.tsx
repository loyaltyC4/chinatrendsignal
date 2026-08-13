import Link from "next/link";

const LOGOS = [
  { src: "/logos/douyin.com.png", alt: "Douyin", stat: "+214% pet brush" },
  { src: "/logos/xiaohongshu.com.png", alt: "Xiaohongshu", stat: "4,760 saves" },
  { src: "/logos/1688.com.png", alt: "1688", stat: "¥2.52 wholesale" },
  { src: "/logos/taobao.com.png", alt: "Taobao", stat: "60 offers" },
  { src: "/logos/tiktok.com.png", alt: "TikTok", stat: "12 listings" },
];

export default function HeroData() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-[24ch] text-center">
          <h1 className="font-serif text-[clamp(2.4rem,4.8vw,4rem)] font-bold leading-[1.06] tracking-tight text-ink">
            See the product go viral in China <em className="italic text-grn">before TikTok does</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[54ch] text-lg leading-relaxed text-mut">
            Real engagement, real factory prices, real creator rate cards. Refreshed daily across seven platforms.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/dashboard" className="rounded-xl bg-grn px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]">Open the radar</Link>
            <Link href="/pricing" className="rounded-xl border border-black/15 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-black/40">Pricing</Link>
          </div>
        </div>

        {/* live proof strip */}
        <div className="mt-14">
          <p className="text-center font-mono text-[10px] uppercase tracking-[.16em] text-mut">Pulled live · Aug 13</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LOGOS.map((l) => (
              <div key={l.alt} className="rounded-2xl border border-black/10 bg-ivory p-4 text-center transition-transform hover:-translate-y-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.src} alt={l.alt} className="mx-auto h-10 w-10 object-contain" />
                <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-wide text-mut">{l.alt}</p>
                <p className="mt-1 font-mono text-[13px] font-bold text-grn">{l.stat}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center font-mono text-[11px] text-mut">329 endpoints · Douyin · XHS · 1688 · Taobao · WeChat · TikTok · Xingtu</p>
        </div>
      </div>
    </section>
  );
}
