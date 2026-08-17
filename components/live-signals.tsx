import { getRadar } from "@/lib/signals";
import { platformStyle } from "@/lib/platform-style";

/**
 * "Latest signals, logged live" — the direct analogue of bidcheck's
 * "Latest tenders, published live" band, which is the single strongest section on
 * that page because it proves the product works before asking for anything.
 *
 * Reads the real index. Falls back to the seed set and says so.
 */


export default async function LiveSignals({ limit = 6 }: { limit?: number }) {
  const { rows, source } = await getRadar(limit);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="display-lg max-w-[22ch] text-ink">Latest signals, logged live.</h2>
          <p className="mt-3 max-w-[54ch] text-[15px] leading-relaxed text-body">
            Every row carries the date it entered the index. Saves are counted against likes,
            because a save is someone bookmarking a thing to buy.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-body">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: source === "live" ? "var(--c-pos)" : "var(--c-warn)" }}
          />
          {source === "live" ? "live index" : "sample data"}
        </span>
      </div>

      <div className="mt-7 overflow-hidden rounded-card border border-line bg-surface">
        <div className="grid grid-cols-[minmax(0,2fr)_.9fr_.8fr_.7fr] gap-4 border-b border-line bg-surface2 px-4 py-2.5 sm:px-5">
          <span className="label text-mut">Product</span>
          <span className="label text-mut max-sm:hidden">Source</span>
          <span className="label text-right text-mut">Intent</span>
          <span className="label text-right text-mut">Logged</span>
        </div>

        {rows.length === 0 && (
          <p className="px-5 py-12 text-center text-[13px] text-mut">
            Nothing in the index yet. Rows appear here after the first nightly pull.
          </p>
        )}

        {rows.map((r) => {
          const p = platformStyle(r.sources[0] ?? "");
          return (
            <div
              key={r.id}
              className="grid grid-cols-[minmax(0,2fr)_.9fr_.8fr_.7fr] items-center gap-4 border-b border-line px-4 py-3 last:border-b-0 sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-ink">{r.product}</p>
                <p className="truncate font-mono text-[11px] text-faint">
                  {r.zh || r.niche}
                </p>
              </div>
              <div className="max-sm:hidden">
                <span
                  className="rounded-chip px-1.5 py-0.5 font-mono text-[10px]"
                  style={{ background: p.bg, color: p.fg }}
                >
                  {p.label}
                </span>
              </div>
              <div className="text-right">
                {r.savesRatio != null ? (
                  <span
                    data-numeric
                    className="font-mono text-[13px] font-semibold"
                    style={{ color: r.savesRatio >= 0.7 ? "var(--c-douyin)" : r.savesRatio >= 0.4 ? "var(--c-1688)" : "var(--c-muted)" }}
                  >
                    {r.savesRatio.toFixed(2)}
                  </span>
                ) : (
                  <span className="font-mono text-[12px] text-faint">-</span>
                )}
              </div>
              <div className="text-right">
                <span data-numeric className="font-mono text-[12.5px] text-body">
                  {r.daysTracked == null ? "-" : r.daysTracked === 0 ? "today" : `${r.daysTracked}d`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
