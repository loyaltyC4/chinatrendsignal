import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar, getWatchlistDetail } from "@/lib/signals";

/**
 * The weekly brief.
 *
 * Composition is separated from delivery on purpose: the digest can be rendered and
 * inspected without sending anything, which is the only sane way to work on an email
 * that goes to every account at once.
 *
 * Editorial rules, same as the interface: no invented numbers, no estimated revenue,
 * and if a week produced nothing worth reading we say so rather than padding it.
 */

export type DigestRow = { product: string; zh: string; niche: string; ratio: number | null; days: number | null };

export type Digest = {
  userId: string;
  email: string;
  name: string;
  subject: string;
  /** True when there is genuinely nothing new. Callers should skip sending. */
  empty: boolean;
  newSignals: number;
  movers: DigestRow[];
  watchMoves: Array<{ product: string; movementPct: number }>;
  html: string;
  text: string;
};

/** ISO week reference, used as the idempotency key for one send per account per week. */
export function weekReference(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `weekly:${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export async function buildDigest(profile: {
  id: string;
  email: string | null;
  display_name: string | null;
  niches: string[] | null;
}): Promise<Digest | null> {
  if (!profile.email) return null;

  const { rows, source } = await getRadar(200);
  // Seed data must never be mailed out as if it were a week's findings.
  if (source === "seed") return null;

  const niches = profile.niches ?? [];
  const pool = niches.length ? rows.filter((r) => niches.includes(r.niche)) : rows;

  const weekAgo = Date.now() - 7 * 86_400_000;
  const newSignals = rows.filter((r) => r.firstDetectedAt && new Date(r.firstDetectedAt).getTime() >= weekAgo).length;

  const movers: DigestRow[] = [...pool]
    .filter((r) => r.isProduct !== false)
    .sort((a, b) => (b.savesRatio ?? 0) - (a.savesRatio ?? 0))
    .slice(0, 5)
    .map((r) => ({ product: r.product, zh: r.zh, niche: r.niche, ratio: r.savesRatio, days: r.daysTracked }));

  const watch = await getWatchlistDetail(profile.id);
  const watchMoves = watch
    .filter((w) => w.movementPct != null && Math.abs(w.movementPct) >= 5)
    .sort((a, b) => Math.abs(b.movementPct!) - Math.abs(a.movementPct!))
    .slice(0, 5)
    .map((w) => ({ product: w.product, movementPct: w.movementPct! }));

  const name = (profile.display_name || profile.email).split("@")[0]!;
  const empty = movers.length === 0 && watchMoves.length === 0 && newSignals === 0;

  const subject = empty
    ? "Quiet week on the radar"
    : watchMoves.length
      ? `${watchMoves.length} product${watchMoves.length === 1 ? "" : "s"} on your watchlist moved`
      : `${newSignals} new signal${newSignals === 1 ? "" : "s"} this week`;

  return {
    userId: profile.id,
    email: profile.email,
    name,
    subject,
    empty,
    newSignals,
    movers,
    watchMoves,
    html: renderHtml({ name, newSignals, movers, watchMoves, empty }),
    text: renderText({ name, newSignals, movers, watchMoves, empty }),
  };
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://chinatrendsignal.vercel.app";

function renderHtml(d: {
  name: string;
  newSignals: number;
  movers: DigestRow[];
  watchMoves: Array<{ product: string; movementPct: number }>;
  empty: boolean;
}) {
  // Table-based and inline-styled, because email clients still are what they are.
  const row = (r: DigestRow) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e7e3dc">
        <div style="font:500 15px -apple-system,Segoe UI,Roboto,sans-serif;color:#16130f">${esc(r.product)}</div>
        <div style="font:12px ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a8378">${esc(r.zh)}${r.zh ? " · " : ""}${esc(r.niche)}${
          r.days != null ? ` · first seen ${r.days}d ago` : ""
        }</div>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #e7e3dc;font:600 14px ui-monospace,SFMono-Regular,Menlo,monospace;color:#12b886;white-space:nowrap">
        ${r.ratio != null ? `${r.ratio.toFixed(2)}×` : "—"}
      </td>
    </tr>`;

  const watchRows = d.watchMoves
    .map(
      (w) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e7e3dc;font:15px -apple-system,Segoe UI,Roboto,sans-serif;color:#16130f">${esc(w.product)}</td>
      <td align="right" style="padding:8px 0;border-bottom:1px solid #e7e3dc;font:600 14px ui-monospace,SFMono-Regular,Menlo,monospace;color:${
        w.movementPct >= 0 ? "#0f8a5f" : "#b91c1c"
      };white-space:nowrap">${w.movementPct > 0 ? "+" : ""}${w.movementPct}%</td>
    </tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#faf8f5;padding:28px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
    <tr><td>
      <div style="font:600 13px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#8a8378">China Trend Signal</div>
      <h1 style="margin:14px 0 6px;font:600 26px -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:-.02em;color:#16130f">Your week on the radar</h1>
      <p style="margin:0 0 22px;font:15px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#4a443c">
        ${esc(d.name)}, ${
          d.empty
            ? "this week the index did not turn up anything that clears our bar. Rather than pad this email, here is the honest version: nothing new worth your attention."
            : `we added <b>${d.newSignals}</b> new signal${d.newSignals === 1 ? "" : "s"} to the index this week.`
        }
      </p>

      ${
        d.watchMoves.length
          ? `<div style="font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#8a8378;margin-bottom:8px">Your watchlist moved</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:26px">${watchRows}</table>`
          : ""
      }

      ${
        d.movers.length
          ? `<div style="font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#8a8378;margin-bottom:8px">Highest intent, saves per like</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${d.movers.map(row).join("")}</table>`
          : ""
      }

      <a href="${SITE}/dashboard" style="display:inline-block;margin:26px 0 0;background:#024ff5;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font:600 14px -apple-system,Segoe UI,Roboto,sans-serif">Open the radar</a>

      <p style="margin:26px 0 0;font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8a8378">
        Saves per like is our bookmark-to-buy proxy, measured on Xiaohongshu. We do not estimate store revenue.
        <br><a href="${SITE}/settings" style="color:#8a8378">Turn this email off in settings</a>.
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function renderText(d: {
  name: string;
  newSignals: number;
  movers: DigestRow[];
  watchMoves: Array<{ product: string; movementPct: number }>;
  empty: boolean;
}) {
  const lines = [`China Trend Signal — your week on the radar`, ""];
  lines.push(
    d.empty
      ? `${d.name}, nothing this week cleared our bar. No padding: there is nothing new worth your attention.`
      : `${d.name}, we added ${d.newSignals} new signal${d.newSignals === 1 ? "" : "s"} to the index this week.`,
  );
  if (d.watchMoves.length) {
    lines.push("", "YOUR WATCHLIST MOVED");
    d.watchMoves.forEach((w) => lines.push(`  ${w.movementPct > 0 ? "+" : ""}${w.movementPct}%  ${w.product}`));
  }
  if (d.movers.length) {
    lines.push("", "HIGHEST INTENT (saves per like)");
    d.movers.forEach((m) => lines.push(`  ${m.ratio != null ? m.ratio.toFixed(2) + "x" : "-"}  ${m.product} (${m.niche})`));
  }
  lines.push("", `${SITE}/dashboard`, "", `Turn this email off: ${SITE}/settings`);
  return lines.join("\n");
}

function esc(s: string) {
  return String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
}

/** Accounts opted into the brief. */
export async function digestAudience() {
  if (!isServiceRoleConfigured()) return [];
  const { data } = await supabaseAdmin()
    .from("profiles")
    .select("id, email, display_name, niches, weekly_email")
    .eq("weekly_email", true)
    .not("email", "is", null)
    .limit(500);
  return data ?? [];
}
