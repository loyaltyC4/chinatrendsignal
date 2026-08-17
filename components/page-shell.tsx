import AppFrame from "@/components/app-frame";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar } from "@/lib/signals";

/**
 * Shared frame for every signed-in page. Fetches only what the chrome needs
 * (plan, credits, and a lightweight index for the command palette) so individual
 * pages stay responsible for their own content.
 */
export async function Shell({ active, children }: { active?: string; children: React.ReactNode }) {
  const { user } = await requireUser();

  let credits = 0;
  let plan = "scout";
  if (user && isServiceRoleConfigured()) {
    const db = supabaseAdmin();
    const [{ data: p }, { data: bal }] = await Promise.all([
      db.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
      db.rpc("credit_balance", { p_user_id: user.id }),
    ]);
    plan = p?.plan ?? "scout";
    credits = typeof bal === "number" ? bal : 0;
  }

  const { rows } = await getRadar(120);
  // Deduplicated by product and niche: the same product is often captured from several
  // posts, and a palette listing "lipstick" three identical times looks like a bug even
  // though the rows are genuinely distinct.
  const seen = new Set<string>();
  const paletteIndex = rows
    .filter((r) => {
      const key = `${r.product}|${r.niche}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((r) => ({ id: r.id, product: r.product, zh: r.zh, niche: r.niche }));

  return (
    <AppFrame credits={credits} plan={plan} email={user?.email ?? null} signals={paletteIndex}>
      <main id="main" className="mx-auto max-w-[1180px] px-4 py-7 sm:px-7 sm:py-9">
        {children}
      </main>
    </AppFrame>
  );
}

export function PageHead({
  title,
  sub,
  aside,
}: {
  title: string;
  sub?: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="display-md text-ink">{title}</h1>
        {sub && <p className="mt-1.5 max-w-[62ch] text-[14px] leading-relaxed text-body">{sub}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}

/** Freshness / provenance pill. The product's pitch is data honesty, so the
 *  interface states plainly which dataset you are looking at. */
export function SourceBadge({ live, when }: { live: boolean; when: string }) {
  if (live) {
    return (
      <span className="inline-flex items-center gap-2 rounded-ctl border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-body">
        <span className="h-1.5 w-1.5 rounded-full bg-pos" />
        Live · pulled {when}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-ctl border border-line bg-warnweak px-2.5 py-1.5 font-mono text-[11px] text-warn">
      <span className="h-1.5 w-1.5 rounded-full bg-warn" />
      Sample data
    </span>
  );
}

/** Metric tile. No card chrome; hairline and spacing carry the structure. */
export function Stat({
  label,
  value,
  note,
  hue,
}: {
  label: string;
  value: string;
  note?: string;
  hue?: string;
}) {
  return (
    <div className="border-l-2 pl-3.5" style={{ borderColor: hue ?? "var(--c-line)" }}>
      <p className="label text-mut">{label}</p>
      <p data-numeric className="mt-1.5 font-mono text-[26px] font-medium leading-none tracking-[-.02em] text-ink">
        {value}
      </p>
      {note && <p className="mt-1.5 text-[11.5px] leading-snug text-mut">{note}</p>}
    </div>
  );
}
