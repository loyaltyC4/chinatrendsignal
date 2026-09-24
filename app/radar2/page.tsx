import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell, Stat } from "@/components/page-shell";
import RadarDesk, { type DeskRow } from "@/components/radar-desk";
import { getRadar } from "@/lib/signals";
import { getSaturation } from "@/lib/saturation";
import { getAmazonEvidence, emptyAmazonEvidence } from "@/lib/evidence";
import { buildListing, buildShortlist } from "@/lib/listing";
import { requireUser } from "@/lib/auth";
import { platformStyle } from "@/lib/platform-style";

export const metadata: Metadata = { title: "Radar desk" };
export const dynamic = "force-dynamic";

/**
 * /radar2 — the Direction A command surface.
 *
 * The seller-facing densification of the marketing radar. On top of the live
 * signal rows it lifts the two numbers a listing decision turns on (measured Etsy
 * saturation + true-margin est. net), a four-stat strip, and a right rail with
 * the curated weekly shortlist (the "focus" workflow — a small set of
 * high-conviction bets instead of a firehose), today's digest, and the pre-list
 * checks.
 *
 * Honesty is preserved exactly as the radar states it: saturation is a measured
 * count or a dash, and every money figure is derived + labelled est.
 */

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

  const { source, rows, lastIngestAt } = await getRadar(60);

  // One batched saturation read for every term in view.
  const terms = rows.flatMap((r) => [r.product, r.zh]).filter(Boolean);
  const sats = await getSaturation(terms);
  // One batched evidence read for every row in view — the desk never calls SP-API inline.
  const evidence = await getAmazonEvidence(rows.map((r) => r.id));

  const desk: DeskRow[] = rows.map((r) => {
    const d = buildListing(
      r,
      sats.get(r.product.trim().toLowerCase()) ?? sats.get(r.zh.trim().toLowerCase()) ?? undefined,
    );
    return {
      ...r,
      firstSeenDays: d.firstSeenDays,
      saturation: d.saturation,
      saturationVerdict: d.saturationVerdict,
      estNetAud: d.etsy?.margin.estNetAud ?? null,
      marginPct: d.etsy?.margin.marginPct ?? null,
      listAud: d.etsy?.margin.listPriceAud ?? null,
      amazon: evidence.get(r.id) ?? emptyAmazonEvidence(),
    };
  });

  const shortlist = buildShortlist(rows, sats, 4);

  const rising = desk.filter((r) => r.stage === "Rising").length;
  const pricedCount = desk.filter((r) => r.estNetAud != null).length;
  const viableCount = desk.filter((r) => (r.marginPct ?? 0) >= 0.3).length;
  const measured = desk.filter((r) => r.saturation.count != null).length;
  const openField = desk.filter((r) => r.saturationVerdict === "open").length;
  const pipelineNet = desk.reduce((s, r) => s + (r.estNetAud ?? 0), 0);

  const top = desk[0];

  return (
    <Shell active="Radar desk">
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
          <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-body">
            {top ? (
              <>
                <span className="font-medium text-ink">{top.product}</span> is moving on {top.sources.join(" + ")} — first seen{" "}
                {top.firstSeenDays == null ? "recently" : top.firstSeenDays === 0 ? "today" : `${top.firstSeenDays}d ago`}.{" "}
                {viableCount} signals clear the 30% margin floor after Etsy's full fee stack.
              </>
            ) : (
              "Signals land here as the nightly pull finds them."
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-card border border-line bg-surface px-4 py-3">
          <div>
            <p className="label text-mut">Saturation measured</p>
            <p data-numeric className="mt-0.5 font-mono text-[18px] font-medium text-ink">
              {measured}<span className="text-[12px] text-faint"> / {desk.length}</span>
            </p>
          </div>
          <span className="ml-2 rounded-chip bg-accentweak px-2 py-1 font-mono text-[10px] text-accent">{openField} open</span>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4">
        <Stat label="Signals in view" value={String(desk.length)} note={source === "live" ? "from the nightly pull" : "sample dataset"} hue="var(--c-accent)" />
        <Stat label="Rising" value={String(rising)} note="accelerating week on week" hue="var(--c-pos)" />
        <Stat label="Margin-viable" value={String(viableCount)} note={`of ${pricedCount} priced · ≥30% net`} hue="var(--c-1688)" />
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
          {/* weekly shortlist — the focus workflow */}
          <div className="rounded-card border border-line bg-surface">
            <div className="border-b border-line px-4 py-3">
              <p className="text-[13.5px] font-medium text-ink">This week's best bets</p>
              <p className="mt-0.5 text-[11px] text-faint">margin × low saturation × fresh window · capped on purpose</p>
            </div>
            {shortlist.length ? (
              shortlist.map((d, i) => {
                const p = platformStyle(d.sources[0] ?? "");
                return (
                  <Link
                    key={d.signalId}
                    href={`/studio?id=${encodeURIComponent(d.signalId)}`}
                    className="flex gap-3 border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-surface2"
                  >
                    <span className="mt-0.5 font-mono text-[10px] font-semibold text-faint">0{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-medium text-ink">{d.product}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded-chip px-1.5 py-px font-mono text-[9px]" style={{ background: p.bg, color: p.fg }}>{p.label}</span>
                        <span data-numeric className="font-mono text-[10px] text-pos">A${d.etsy!.margin.estNetAud.toFixed(2)}</span>
                        <span className="font-mono text-[9px] text-faint">{Math.round(d.etsy!.margin.marginPct * 100)}% · est.</span>
                      </div>
                    </div>
                    <span className="self-center font-mono text-[11px] text-faint">
                      {d.firstSeenDays == null ? "—" : d.firstSeenDays === 0 ? "today" : `${d.firstSeenDays}d`}
                    </span>
                  </Link>
                );
              })
            ) : (
              <p className="px-4 py-6 font-mono text-[11px] text-faint">No margin-clean picks yet — the nightly pull will refill this.</p>
            )}
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
                title: top && top.saturation.count != null ? `${top.saturation.count.toLocaleString()} live listings` : "Saturation not measured",
                sub: top && top.saturation.count != null ? "measured count on the destination platform" : "the scraper hasn't covered this term — shown as a dash",
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
                { k: "Etsy saturation", v: top && top.saturation.count != null ? `${top.saturation.count}` : "not measured", ok: !!(top && top.saturation.count != null) },
              ].map((r) => (
                <div key={r.k} className="flex items-center justify-between border-b border-line pb-2 text-[12px] last:border-b-0 last:pb-0">
                  <span className="text-mut">{r.k}</span>
                  <span className="font-mono font-medium" style={{ color: r.ok ? "var(--c-pos)" : "var(--c-faint)" }}>{r.v}</span>
                </div>
              ))}
            </div>
            {top && (
              <Link
                href={`/studio?id=${encodeURIComponent(top.id)}`}
                className="mt-3 block rounded-ctl bg-accentweak px-3 py-2 text-center text-[12px] font-medium text-accentstrong transition-colors hover:bg-accentstrong hover:text-onaccent"
              >
                Open the top signal in the studio
              </Link>
            )}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
