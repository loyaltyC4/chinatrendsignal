import OrbitingCirclesGlobe from "@/components/ui/orbiting-circles-02";

const platforms = ["Douyin", "Xiaohongshu", "1688", "Taobao", "Xingtu", "WeChat", "TikTok Shop"];
const tiers = [
  { name: "Scout", price: "A$0", per: "forever free", features: ["Weekly trend email", "Top-10 list, 7-day delayed", "5 product lookups / mo"], hot: false },
  { name: "Hunter", price: "A$39", per: "/month", features: ["Daily viral radar", "1688/Taobao supplier match", "50 deep-dives / mo", "10-product watchlist alerts"], hot: true },
  { name: "Operator", price: "A$99", per: "/month", features: ["Unlimited deep-dives", "KOL rate cards (XHS + Douyin)", "Supplier price history", "CSV + API export"], hot: false },
  { name: "Agency", price: "A$299", per: "/month · 3 seats", features: ["Shortlist exports w/ quotes + GMV", "Category benchmarks", "Metered REST API", "Priority refresh windows"], hot: false },
];
const pull = [
  { name: "Restaurant summer-job skit", val: "4.02M ❤" },
  { name: "Snack-store haul (coordinated push)", val: "3.85M ❤" },
  { name: 'Drama clip "她的迷盲不迷茫"', val: "1.32M ❤" },
  { name: "Mizone sports campaign", val: "825K ❤" },
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-ivory">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <circle cx="13" cy="13" r="11" stroke="#d8f34e" strokeWidth="2.5" />
        <circle cx="13" cy="13" r="5.5" stroke="#d8f34e" strokeWidth="2.5" />
        <circle cx="13" cy="13" r="1.8" fill="#d8f34e" />
      </svg>
      chinatrendsignal
    </span>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-forest">
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0" style={{ background: "radial-gradient(900px 500px at 85% -5%, rgba(216,243,78,.10), transparent 60%), radial-gradient(700px 500px at 0% 0%, rgba(34,197,94,.12), transparent 55%)" }} />

      {/* nav */}
      <header className="relative z-10 mx-auto max-w-6xl px-6 h-20 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-9 text-[15px] text-[#b9c9b3]">
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#data" className="hover:text-white transition-colors">Live data</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </nav>
        <a href="#waitlist" className="rounded-xl bg-lime px-5 py-2.5 text-sm font-semibold text-[#12220a] hover:bg-[#e5fb70] transition-colors">Sign up for free</a>
      </header>

      {/* hero card */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-[28px] bg-ivory text-center shadow-[0_40px_100px_rgba(0,0,0,.35)] overflow-hidden">
          <div className="px-6 sm:px-12 pt-16 sm:pt-20 pb-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#dcead3] bg-[#eef5ea] px-4 py-2 text-[13.5px] font-medium text-[#3c5a41]">
              <span className="h-2 w-2 rounded-full bg-grn animate-pulse" /> 329 endpoints live · refreshed today
            </span>
            <h1 className="mx-auto mt-7 max-w-[16ch] font-serif text-[clamp(2.6rem,6vw,4.75rem)] font-bold leading-[1.06] tracking-tight text-ink">
              The trend radar for <em className="italic text-grn">cross-border</em> sellers
            </h1>
            <p className="mx-auto mt-6 max-w-[54ch] text-lg text-mut leading-relaxed">
              We watch Douyin, Xiaohongshu, 1688 and Xingtu so you find the product, the factory price, and the creator rate card — weeks before the trend reaches TikTok.
            </p>

            <form action="#waitlist" className="mx-auto mt-9 flex max-w-xl flex-wrap justify-center gap-3">
              <input type="email" required placeholder="Enter email" aria-label="Email address"
                className="min-w-[240px] flex-1 rounded-xl border-[1.5px] border-[#dcdccc] bg-white px-5 py-4 text-base text-ink placeholder:text-[#a3a89c] focus:border-grn focus:outline-none focus:ring-4 focus:ring-grn/15" />
              <button type="submit" className="rounded-xl bg-ink px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-grn">Sign up for free</button>
            </form>
            <p className="mt-4 font-mono text-xs text-[#8a9484] tracking-wide">No credit card required · free tier forever</p>

            <div className="mx-auto mt-7 flex max-w-xl items-center gap-4 text-[13px] text-[#b0b5a6]">
              <span className="h-px flex-1 bg-[#e7e5d9]" /> or <span className="h-px flex-1 bg-[#e7e5d9]" />
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3.5">
              <a href="#" className="inline-flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#dcdccc] bg-white px-7 py-3.5 text-[15px] font-medium text-ink transition-all hover:border-ink hover:-translate-y-px">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.4 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>
                Sign up with Google
              </a>
              <a href="#" className="inline-flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#dcdccc] bg-white px-7 py-3.5 text-[15px] font-medium text-ink transition-all hover:border-ink hover:-translate-y-px">
                <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true"><rect width="10" height="10" x="1" y="1" fill="#f35325"/><rect width="10" height="10" x="12" y="1" fill="#81bc06"/><rect width="10" height="10" x="1" y="12" fill="#05a6f0"/><rect width="10" height="10" x="12" y="12" fill="#ffba08"/></svg>
                Sign up with Microsoft
              </a>
            </div>
            <p className="mt-6 text-xs text-[#a3a89c]">By signing up, you agree to our <a className="text-[#7a8471] underline" href="#">Terms</a> and <a className="text-[#7a8471] underline" href="#">Privacy Policy</a>.</p>
          </div>

          {/* orbit */}
          <div className="mt-14 bg-gradient-to-b from-[#0e241a] to-[#0a1c13] px-6 sm:px-12 pt-12 text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">One radar · seven sources</p>
            <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-semibold text-[#f0f5ea]">Every platform that matters in China commerce, in one orbit</h2>
            <OrbitingCirclesGlobe />
          </div>

          {/* this week's pull */}
          <div id="data" className="bg-gradient-to-b from-[#122f22] via-[#0b2117] to-[#0d1a12] px-6 sm:px-12 pb-16 pt-4 text-left">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime">This week&apos;s pull</h3>
              <span className="font-mono text-[11px] text-[#8fae98]">DOUYIN / XHS / 1688 / XINGTU</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8fae98]">Douyin hot search — top items</p>
                <ul className="text-[12.5px] text-[#d4e2cf]">
                  {pull.map((r, i) => (
                    <li key={i} className="flex justify-between gap-2.5 py-2 border-t border-dashed border-white/10 first:border-t-0">
                      <span className="pr-2">{r.name}</span><b className="font-mono text-lime whitespace-nowrap">{r.val}</b>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8fae98]">XHS · pet supplies</p>
                <p className="font-mono text-[26px] font-bold text-lime">4,760 saves</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[#b9cbb4]">Saves beating likes (6,882) on the top checklist post = bookmark-to-buy intent.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8fae98]">1688 · steam pet brush</p>
                <p className="font-mono text-[26px] font-bold text-lime">¥2.52</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[#b9cbb4]">Wholesale unit. Sells US$18–28 on TikTok Shop. 60 competing offers indexed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* how */}
      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <h2 className="max-w-[22ch] font-serif text-3xl sm:text-[2.9rem] font-bold leading-[1.1] text-ivory">Three checks before <em className="italic text-lime">anything</em> hits your inbox</h2>
        <p className="mt-4 max-w-[58ch] text-[16.5px] leading-relaxed text-[#a9bda3]">No engagement proof, no supplier, no spread — no signal. Every alert carries all three.</p>
        <div className="mt-11 grid gap-4 md:grid-cols-3">
          {[
            { n: "CHECK 1 · DEMAND", t: "Demand is real", p: "We read saves-to-likes ratios on Xiaohongshu, not vanity views. Saves mean intent to buy.", f: "4,760", fs: "saves on this week's top post" },
            { n: "CHECK 2 · SUPPLY", t: "A factory makes it", p: "1688 and Taobao are checked for every candidate, including reverse image search from the viral photo.", f: "¥2.52", fs: "unit wholesale, this week's brush" },
            { n: "CHECK 3 · SPREAD", t: "The margin exists", p: "We compare against live TikTok Shop and Amazon prices. If the spread isn't there, you never see it.", f: "25–40×", fs: "gross spread, current window" },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-white/5 p-7 transition-all hover:-translate-y-1 hover:border-lime/30">
              <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-lime">{s.n}</p>
              <h3 className="mt-4 text-lg font-semibold text-ivory">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a9bda3]">{s.p}</p>
              <p className="mt-5 font-mono text-2xl font-bold text-ivory">{s.f}<span className="mt-1 block font-sans text-xs font-normal text-[#8fae98]">{s.fs}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <h2 className="max-w-[22ch] font-serif text-3xl sm:text-[2.9rem] font-bold leading-[1.1] text-ivory">Pricing, in <em className="italic text-lime">plain AUD</em></h2>
        <p className="mt-4 max-w-[58ch] text-[16.5px] text-[#a9bda3]">GST included. Cancel anytime, keep your exports. Free tier never expires.</p>
        <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div key={t.name} className={`relative rounded-2xl bg-ivory p-7 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,.25)] ${t.hot ? "ring-2 ring-grn" : ""}`}>
              {t.hot && <span className="absolute -top-3 left-6 rounded-full bg-grn px-3 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-[#0a1f10]">MOST POPULAR</span>}
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-mut">{t.name}</p>
              <p className="mt-2.5 text-4xl font-bold tracking-tight text-ink">{t.price}</p>
              <p className="mb-4 text-[13px] text-mut">{t.per}</p>
              <ul className="text-sm text-[#3c463a]">
                {t.features.map((f, i) => <li key={i} className="border-t border-dashed border-[#e0dece] py-2 first:border-t-0">{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* final cta */}
      <section id="waitlist" className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="rounded-[28px] border border-lime/20 bg-gradient-to-br from-[#16381f] to-[#0b2117] px-6 py-16 text-center">
          <h2 className="mx-auto max-w-[20ch] font-serif text-3xl sm:text-[2.9rem] font-bold leading-[1.1] text-white">The next brush is <em className="italic text-lime">already trending.</em></h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[#a9bda3]">Paid tiers open at launch. The waitlist gets first access — and the sample report lands in your inbox today.</p>
          <form action="#" className="mx-auto mt-8 flex max-w-md flex-wrap justify-center gap-3">
            <input type="email" required placeholder="Enter email" aria-label="Email address"
              className="min-w-[220px] flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-white placeholder:text-[#8fae98] focus:border-lime focus:outline-none focus:ring-4 focus:ring-lime/15" />
            <button type="submit" className="rounded-xl bg-lime px-6 py-3.5 font-semibold text-[#12220a] transition-colors hover:bg-[#e5fb70]">Get first access</button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-6 pb-12 font-mono text-[11.5px] text-[#7e947f]">
        <span>chinatrendsignal · Sydney, AUS</span>
        <span>sources: {platforms.join(" / ")}</span>
      </footer>
    </main>
  );
}
