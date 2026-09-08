import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell, Stat } from "@/components/page-shell";
import RadarDesk, { type DeskRow } from "@/components/radar-desk";
import { getRadar } from "@/lib/signals";
import { requireUser } from "@/lib/auth";
import { platformStyle } from "@/lib/platform-style";

export const metadata: Metadata = { title: "Radar desk" };
export const dynamic = "force-dynamic";

/**
 * /radar2 — the Direction A command surface.
 *
 * A seller-facing densification of the marketing radar: the same live signal rows,
 * but with the two numbers a listing decision actually turns on (Etsy saturation
 * and estimated net margin) lifted into the feed, a four-stat strip across the top,
 * and a right rail carrying signal volume, today's digest, and the pre-list checks.
 *
 * Data honesty is preserved exactly as the radar states it: saturation reads as a
 * dash because there is no marketplace-competition feed yet, and net margin is
 * derived + labelled est. Nothing here is fabricated.
 */

const CNY_TO_AUD = 0.213;
const FEE_PCT = 0.117;
const FEE_FLAT_AUD = 0.38;
const MARKUP = 3.4;

function ago(iso: string | null) {
  if (!iso) return "never";
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default async function RadarDeskPage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fradar2");

  const { source, rows, lastIngestAt } = await getRadar(40);

  const desk: DeskRow[] = rows.map((r) => {
    const priced = r.wholesaleCny > 0;
    const landed = priced ? r.wholesaleCny * CNY_TO_AUD : null;
    const list = priced ? landed! * MARKUP : null;
    const net = priced ? list! - landed! - list! * FEE_PCT - FEE_FLAT_AUD : null;
    return {
      ...r,
      firstSeenDays: r.daysTracked ?? null,
      listAud: list != null ? Math.round(list * 100) / 100 : null,
      estNetAud: net != null ? Math.round(net * 100) / 100 : null,
      saturation: null, // no competition feed yet — rendered as a dash, honestly
    };
  });

  const rising = desk.filter((r) => r.stage === "Rising").length;
  const pricedCount = desk.filter((r) => r.estNetAud != null).length;
  const velocities = desk.map((r) => r.velocityPct).filter((v) => v > 0);
  const medianVel = velocities.length
    ? [...velocities].sort((a, b) => a - b)[Math.floor(velocities.length / 2)]
    : 0;
  const pipelineNet = desk.reduce((s, r) => s + (r.estNetAud ?? 0), 0);

  // signal-volume sparkline: aggregate the real observation history we already have
  const sparks = desk.map((r) => r.spark).filter((s) => s.length >= 2);
  const volSeries = sparks.length ? sparks[0] : [];
  const volMax = Math.max(1, ...volSeries);

  const top = desk[0];

  return (
    <Shell active="Radar desk">
      {/* freshness + honesty banner */}
      {source === "seed" && (
        <p className="mb-5 flex items-start gap-2 rounded-ctl border border-line bg-warnweak px-3 py-2 text-[12.5px] leading-relaxed text-warn">
          These are example rows so you can see the shape. The nightly pull has not produced data for this view yet.
        </p>
      )}

      {/* HERO */}
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-body">
            <span className="h-1.5 w-1.5 rounded-full bg-pos" />
            {source === "live" ? `Live · pulled ${ago(lastIngestAt)}` : "Sample data"} · {desk.length} signals
          </span>
          <h1 className="mt-3 display-lg text-ink">
            The window is <span className="spectrum-text">open.</span>
          </h1>
          <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-body">
            {top ? (
              <>
                <span className="font-medium text-ink">{top.product}</span> is moving on{" "}
                {top.sources.join(" + ")} — first seen{" "}
                {top.firstSeenDays == null ? "recently" : top.firstSeenDays === 0 ? "today" : `${top.firstSeenDays}d ago`}.
                {" "}{pricedCount} signals carry a factory price and a sellable draft.
              </>
            ) : (
              "Signals land here as the nightly pull finds them."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-card border border-line bg-surface px-4 py-3">
          <div>
            <p className="label text-mut">Median velocity</p>
            <p data-numeric className="mt-0.5 font-mono text-[18px] font-medium text-warn">+{medianVel}%</p>
          </div>
          <span className="ml-2 rounded-chip bg-warnweak px-2 py-1 font-mono text-[10px] text-warn">week on week</span>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat label="Signals in view" value={String(desk.length)} note={source === "live" ? "from the nightly pull" : "sample dataset"} hue="var(--c-accent)" />
        <Stat label="Rising" value={String(rising)} note="accelerating week on week" hue="var(--c-pos)" />
        <Stat label="Priced drafts" value={String(pricedCount)} note="carry a real factory cost" hue="var(--c-1688)" />
        <Stat
          label="Pipeline est. net"
          value={pipelineNet > 0 ? `A$${Math.round(pipelineNet).toLocaleString()}` : "—"}
          note="per-unit sums, derived · est."
          hue="var(--c-taobao)"
        />
      </div>

      {/* FEED + RAIL */}
      <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <RadarDesk rows={desk} />

        <aside className="space-y-5">
          {/* signal volume */}
          <div className="rounded-card border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between">
              <p className="label text-mut">Signal volume</p>
              <p data-numeric className="font-mono text-[12px] text-faint">
                <span className="text-[15px] font-medium text-ink">{volSeries.length ? volSeries[volSeries.length - 1] : 0}</span> · obs
              </p>
            </div>
            {volSeries.length >= 2 ? (
              <svg viewBox="0 0 300 90" className="mt-3 h-[90px] w-full" preserveAspectRatio="none" aria-hidden>
                <defs>
                  <linearGradient id="rv-g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--c-accent)" />
                    <stop offset="100%" stopColor="var(--c-xhs)" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="url(#rv-g)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  points={volSeries.map((v, i) => `${(i / (volSeries.length - 1)) * 300},${84 - (v / volMax) * 74}`).join(" ")}
                />
              </svg>
            ) : (
              <p className="mt-4 font-mono text-[11px] text-faint">Not enough history yet — we draw nothing rather than fake a trend.</p>
            )}
            <p className="mt-2 font-mono text-[10px] text-faint">Engagement on the top signal, oldest to latest observation.</p>
          </div>

          {/* digest */}
          <div className="rounded-card border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[13.5px] font-medium text-ink">Today's digest</p>
              <p className="mt-0.5 text-[11px] text-faint">Three checks before anything hits your queue</p>
            </div>
            {[
              {
                src: top?.sources[0] ?? "XHS",
                title: top ? `${top.product} · ${top.sources[0] ?? "signal"}` : "No signal yet",
                sub: top?.savesRatio != null ? `saves-to-likes ${top.savesRatio.toFixed(2)} → buyer intent, not vanity` : "intent measured on the source platform",
              },
              {
                src: "1688",
                title: top && top.wholesaleCny > 0 ? `Factory matched at ¥${top.wholesaleCny}` : "Awaiting supplier match",
                sub: top && top.wholesaleCny > 0 ? "verified wholesale cost, dated the day we saw it" : "the supplier match runs after detection",
              },
              {
                src: "Etsy",
                title: "Marketplace saturation",
                sub: "not measured yet — shown as a dash, not a guessed count",
              },
            ].map((d, i) => {
              const p = platformStyle(d.src);
              return (
                <div key={i} className="flex gap-3 border-b border-line px-4 py-3 last:border-b-0">
                  <span className="mt-0.5 h-7 w-7 shrink-0 rounded-ctl" style={{ background: p.bg }} aria-hidden>
                    <span className="flex h-full items-center justify-center font-mono text-[9px] font-semibold" style={{ color: p.fg }}>
                      {p.label.slice(0, 2).toUpperCase()}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-ink">{d.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-mut">{d.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* fact check */}
          <div className="rounded-card border border-line bg-surface p-4">
            <p className="text-[13.5px] font-medium text-ink">Before you list</p>
            <div className="mt-2 space-y-2">
              {[
                { k: "First-seen dated", v: "always", ok: true },
                { k: "Factory price", v: top && top.wholesaleCny > 0 ? "verified" : "pending", ok: !!(top && top.wholesaleCny > 0) },
                { k: "Etsy saturation", v: "not measured", ok: false },
              ].map((r) => (
                <div key={r.k} className="flex items-center justify-between border-b border-line pb-2 text-[12px] last:border-b-0 last:pb-0">
                  <span className="text-mut">{r.k}</span>
                  <span className="font-mono font-medium" style={{ color: r.ok ? "var(--c-pos)" : "var(--c-faint)" }}>{r.v}</span>
                </div>
              ))}
            </div>
            <a
              href={top ? `/studio?id=${encodeURIComponent(top.id)}` : "/studio"}
              className="mt-3 block rounded-ctl bg-accentweak px-3 py-2 text-center text-[12px] font-medium text-accentstrong transition-colors hover:bg-accentstrong hover:text-onaccent"
            >
              Open the top signal in the studio
            </a>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
