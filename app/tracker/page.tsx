import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell, PageHead, Stat } from "@/components/page-shell";
import TestLog, { type TestRow } from "./test-log";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar } from "@/lib/signals";

export const metadata: Metadata = { title: "Outcome tracker" };
export const dynamic = "force-dynamic";

/*
 * DESIGN READ: the ledger of whether we were right. Dials: VARIANCE 3, MOTION 2,
 * DENSITY 7. This page exists to be trusted, not admired, so it is the plainest
 * surface in the product — and it is the only place we show money the user typed
 * rather than a number we inferred.
 */
export default async function TrackerPage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Ftracker");

  let rows: TestRow[] = [];
  if (isServiceRoleConfigured()) {
    const { data } = await supabaseAdmin()
      .from("product_tests")
      .select("id, product, niche, spend_aud, revenue_aud, result, note, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    rows = (data ?? []).map((r: any) => ({
      id: r.id,
      product: r.product,
      niche: r.niche ?? "Unclassified",
      spendAud: Number(r.spend_aud ?? 0),
      revenueAud: Number(r.revenue_aud ?? 0),
      result: r.result,
      note: r.note,
      createdAt: r.created_at,
    }));
  }

  const decided = rows.filter((r) => r.result === "winner" || r.result === "killed");
  const winners = rows.filter((r) => r.result === "winner").length;
  const spend = rows.reduce((s, r) => s + r.spendAud, 0);
  const revenue = rows.reduce((s, r) => s + r.revenueAud, 0);
  const net = revenue - spend;
  const winRate = decided.length ? Math.round((winners / decided.length) * 100) : null;

  const { rows: signals } = await getRadar(200);
  const niches = Array.from(new Set(signals.map((s) => s.niche).filter(Boolean))).sort();

  return (
    <Shell active="Tracker">
      <PageHead
        title="Outcome tracker"
        sub="Log what you tested and what came back. This is the record that shows whether our calls were right, including when they were not."
      />

      <div className="mt-7 grid max-w-[54rem] grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        <Stat label="Tests logged" value={String(rows.length)} hue="var(--c-accent)" />
        <Stat
          label="Win rate"
          value={winRate == null ? "-" : `${winRate}%`}
          note={decided.length ? `${winners} of ${decided.length} decided` : "nothing decided yet"}
          hue="var(--c-douyin)"
        />
        <Stat label="Spend logged" value={`A$${Math.round(spend).toLocaleString("en-AU")}`} hue="var(--c-1688)" />
        <Stat
          label="Net"
          value={`${net < 0 ? "-" : ""}A$${Math.abs(Math.round(net)).toLocaleString("en-AU")}`}
          note="return minus spend, as you entered it"
          hue={net >= 0 ? "var(--c-pos)" : "var(--c-neg)"}
        />
      </div>

      <TestLog rows={rows} niches={niches} />

      <p className="mt-4 max-w-[54rem] text-[11.5px] leading-relaxed text-mut">
        Every figure on this page is one you typed. We do not estimate your revenue, and nothing
        here is shared with other accounts or used to advertise a success rate we cannot evidence.
      </p>
    </Shell>
  );
}
