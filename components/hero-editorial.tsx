import Link from "next/link";

const LOGOS = [
  { src: "/logos/douyin.com.png", alt: "Douyin" },
  { src: "/logos/xiaohongshu.com.png", alt: "Xiaohongshu" },
  { src: "/logos/1688.com.png", alt: "1688" },
  { src: "/logos/taobao.com.png", alt: "Taobao" },
  { src: "/logos/wechat.com.png", alt: "WeChat" },
  { src: "/logos/tiktok.com.png", alt: "TikTok" },
  { src: "/logos/alibaba.com.png", alt: "Alibaba" },
];

export default function HeroEditorial() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#1d4ed8]/20 bg-white px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[.14em] text-[#1d4ed8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1d4ed8]" /> 329 endpoints live
          </p>
          <h1 className="mt-6 font-serif text-[clamp(2.6rem,5vw,4.2rem)] font-bold leading-[1.06] tracking-tight text-ink">
            The product is already selling in China.<br />
            <em className="italic text-grn">You just can&apos;t read it yet.</em>
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-mut">
            We watch Douyin, Xiaohongshu, 1688 and Xingtu in the language they&apos;re written in, so you see the trend, the factory price, and the creator rate card weeks before it reaches TikTok.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="rounded-xl bg-grn px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]">Open the app</Link>
            <Link href="/pricing" className="rounded-xl border border-black/15 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-black/40">See pricing</Link>
          </div>
          <p className="mt-4 font-mono text-[11px] text-mut">Free tier forever · no credit card</p>
        </div>

        {/* brand orbit panel */}
        <div className="relative">
          <div className="relative mx-auto aspect-square w-full max-w-[420px] rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_30px_80px_rgba(26,27,32,.08)]">
            <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(400px_300px_at_70%_20%,rgba(29,78,216,.06),transparent)]" />
            <div className="relative grid h-full grid-cols-3 place-items-center gap-3">
              {LOGOS.map((l, i) => (
                <div key={l.alt} className={`flex items-center justify-center rounded-2xl border border-black/8 bg-white p-2.5 shadow-sm ${i === 3 ? "scale-110 border-grn/30" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.src} alt={l.alt} className="h-10 w-10 object-contain" />
                </div>
              ))}
              <div className="col-span-3 mt-2 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[.14em] text-mut">One radar</p>
                <p className="mt-1 font-serif text-lg font-semibold text-ink">Seven sources, one signal</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[10.5px] text-mut">Douyin · Xiaohongshu · 1688 · Taobao · WeChat · TikTok · Xingtu</p>
        </div>
      </div>
    </section>
  );
}
