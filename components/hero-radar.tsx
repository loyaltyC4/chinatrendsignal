import { getRadar } from "@/lib/signals";
import { platformStyle } from "@/lib/platform-style";

/**
 * The hero asset is the real radar, reading the real database — not a screenshot,
 * not a mockup, and emphatically not a fake product UI built out of divs. Every
 * product studied (Linear, Stripe, Vercel, Attio, Clay, Hex) uses genuine product
 * surface as its marketing visual, and for a product selling data honesty it would
 * be absurd to fake it.
 *
 * When the cache is empty this labels itself as sample data rather than pretending.
 */
export default async function HeroRadar() {
  const { rows, source } = await getRadar(6);

  return (
    <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-lift">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface2 px-4 py-2.5">
        <span className="label text-mut">Radar</span>
        <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-mut">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: source === "live" ? "var(--c-pos)" : "var(--c-warn)" }}
          />
          {source === "live" ? "live index" : "sample"}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1.7fr)_.7fr_.6fr] gap-3 border-b border-line px-4 py-2">
        <span className="label text-faint">Product</span>
        <span className="label text-right text-faint">Velocity</span>
        <span className="label text-right text-faint">First seen</span>
      </div>

      <ul>
        {rows.map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-[minmax(0,1.7fr)_.7fr_.6fr] items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-semibold uppercase"
                style={{ background: platformStyle(r.sources[0] ?? "").bg, color: platformStyle(r.sources[0] ?? "").fg }}
                aria-hidden
              >
                {platformStyle(r.sources[0] ?? "").label.slice(0, 2)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">{r.product}</span>
                <span className="block truncate font-mono text-[10.5px]" style={{ color: platformStyle(r.sources[0] ?? "").fg }}>
                  {r.zh ? `${r.zh} · ` : ""}{platformStyle(r.sources[0] ?? "").label}
                </span>
              </span>
            </div>
            <span
              data-numeric
              className="text-right font-mono text-[12px] font-medium"
              style={{ color: r.velocityPct > 0 ? "var(--c-pos)" : "var(--c-muted)" }}
            >
              {r.velocityPct > 0 ? "+" : ""}
              {r.velocityPct}%
            </span>
            <span data-numeric className="text-right font-mono text-[12px] text-body">
              {r.daysTracked == null ? "-" : r.daysTracked === 0 ? "today" : `${r.daysTracked}d`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
