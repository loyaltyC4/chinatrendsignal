import AppNav from "@/components/app-nav";
import Link from "next/link";

const STAGES = [
  {
    step: "01 · Discover",
    desc: "Find what's moving before the West sees it.",
    features: [
      { name: "Radar", href: "/radar", note: "Live trend feed ranked by momentum + margin", status: "Live" },
      { name: "Movers & Shakers", href: "/movers", note: "Rank gainers across every platform, with crossover flags", status: "Live" },
    ],
  },
  {
    step: "02 · Validate",
    desc: "Decide if it's worth your money before you spend it.",
    features: [
      { name: "AI Analysis", href: "/analysis", note: "Signal verdict, niche scorecard, complaint mining", status: "Live engine" },
      { name: "Supplier Match", href: "/analysis", note: "Viral product → exact 1688/Taobao factory + margin", status: "Live" },
    ],
  },
  {
    step: "03 · Launch",
    desc: "Turn a validated product into a listing in minutes.",
    features: [
      { name: "Listing Studio", href: "/listing", note: "Clean photo, translated + rewritten copy, priced", status: "Live" },
      { name: "Creator Match", href: "/analysis", note: "Which KOLs to contact + draft outreach w/ rate card", status: "Engine ready" },
    ],
  },
  {
    step: "04 · Compound",
    desc: "Reports, tracking and intelligence that learn over time.",
    features: [
      { name: "Weekly Report", href: "/reports", note: "Auto-generated niche intelligence, weekly", status: "Scaffold" },
      { name: "Ask the Radar", href: "/ask", note: "Plain-English analyst chat over your data", status: "Scaffold" },
      { name: "Outcome Tracker", href: "/tracker", note: "Did it work? Learns what converts for you", status: "Scaffold" },
      { name: "Agency Briefs", href: "/agency", note: "White-label China-entry reports for clients", status: "Scaffold" },
    ],
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Dashboard" />
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Your command centre</p>
            <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">From signal to sale, in one flow</h1>
            <p className="mt-2 max-w-[60ch] text-[15px] text-mut">The product is a pipeline, not a pile of tools. Move left to right: discover the trend, validate it, cost it, source it, list it, promote it.</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-ivory px-4 py-3"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-mut">Credits</p><p className="mt-1 font-mono text-xl font-bold text-ink">—</p><Link href="/pricing" className="mt-1 block text-xs font-semibold text-grn">Top up</Link></div>
        </div>

        <div className="mt-10 space-y-8">
          {STAGES.map((s) => (
            <section key={s.step}>
              <div className="flex items-baseline justify-between gap-3"><h2 className="font-serif text-xl font-bold text-ink">{s.step}</h2><p className="text-sm text-mut">{s.desc}</p></div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {s.features.map((f) => (
                  <Link key={f.name} href={f.href} className="group rounded-2xl border border-black/10 bg-ivory p-5 transition-all hover:-translate-y-0.5 hover:border-grn/40 hover:shadow-md">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="text-[15px] font-semibold text-ink group-hover:text-grn">{f.name}</p><p className="mt-1 text-[13px] leading-relaxed text-mut">{f.note}</p></div>
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${f.status === "Live" ? "bg-grn/10 text-grn" : f.status === "Live engine" ? "bg-[#1d4ed8]/10 text-[#1d4ed8]" : "bg-black/5 text-mut"}`}>{f.status}</span>
                    </div>
                    <p className="mt-3 font-mono text-[10px] text-grn opacity-0 transition-opacity group-hover:opacity-100">Open →</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
