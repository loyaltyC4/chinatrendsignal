import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell, PageHead } from "@/components/page-shell";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { planAllowance, watchlistCap, type Profile } from "@/lib/dashboard";
import { isPlanPurchasable } from "@/lib/stripe";
import { UpgradeButton, ManageBillingButton } from "./billing-actions";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

const TIERS = [
  { id: "scout", name: "Scout", price: "A$0", per: "forever", feats: ["Weekly brief", "Top 10, 7-day delayed", "5 lookups a month"] },
  { id: "hunter", name: "Hunter", price: "A$59", per: "per month", feats: ["Daily radar, every signal", "First-detected dates", "Supplier match", "10-product watchlist"] },
  { id: "operator", name: "Operator", price: "A$129", per: "per month", feats: ["Everything uncapped", "Unlimited watchlist", "Price history", "CSV export", "Seats at A$39"] },
];

const COSTS = [
  ["Signal analysis", "2"],
  ["Opportunity score", "3"],
  ["Supplier match", "3"],
  ["Weekly report", "10"],
];

/** Downgrading is a cancellation, and cancellations belong in Stripe's portal where
 *  the proration and end-of-period rules are handled properly. */
function ManageBillingScoutNote() {
  return (
    <p className="mt-5 rounded-ctl border border-line px-2.5 py-2 text-[11.5px] leading-snug text-mut">
      To move back to Scout, cancel from the payment portal below.
    </p>
  );
}

function when(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; cancelled?: string }>;
}) {
  const { upgraded, cancelled } = await searchParams;
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fsettings%2Fbilling");

  let plan: Profile["plan"] = "scout";
  let credits = 0;
  let hasCustomer = false;
  let ledger: Array<{ id: string; delta: number; action: string; created_at: string }> = [];

  if (isServiceRoleConfigured()) {
    const db = supabaseAdmin();
    const [{ data: p }, { data: bal }, { data: rows }] = await Promise.all([
      db.from("profiles").select("plan, stripe_customer_id").eq("id", user.id).maybeSingle(),
      db.rpc("credit_balance", { p_user_id: user.id }),
      db.from("credit_ledger").select("id, delta, action, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    plan = (p?.plan as Profile["plan"]) ?? "scout";
    hasCustomer = Boolean(p?.stripe_customer_id);
    credits = typeof bal === "number" ? bal : 0;
    ledger = rows ?? [];
  }

  const allowance = planAllowance(plan);
  const usedPct = Math.min(100, Math.round(((allowance - Math.min(credits, allowance)) / allowance) * 100));

  return (
    <Shell active="Billing">
      <PageHead
        title="Billing and credits"
        sub="Your plan, your balance, and every credit movement on the account."
      />

      {/* Returning from Stripe. The plan itself is set by the webhook, so this states
          what is actually true rather than claiming the upgrade already applied. */}
      {upgraded && (
        <div className="mt-6 max-w-[52rem] rounded-card border border-line bg-posweak px-4 py-3 text-[13px] leading-relaxed text-pos">
          <b className="font-medium">Payment received.</b> Your {upgraded} plan and credits land the
          moment Stripe confirms the charge, usually within seconds. Reload if this page still shows
          the old plan.
        </div>
      )}
      {cancelled && (
        <div className="mt-6 max-w-[52rem] rounded-card border border-line bg-surface2 px-4 py-3 text-[13px] leading-relaxed text-body">
          Checkout was closed, so nothing was charged and your plan is unchanged.
        </div>
      )}

      {/* balance + meter */}
      <section className="mt-8 grid max-w-[52rem] gap-5 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="label text-mut">Balance</p>
          <p data-numeric className="mt-2.5 font-mono text-[38px] font-medium leading-none tracking-[-.03em] text-ink">
            {credits}
          </p>
          <div className="mt-5">
            <div className="flex items-baseline justify-between font-mono text-[10.5px] text-mut">
              <span>against a {allowance}-credit cycle</span>
              <span data-numeric>{usedPct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface3">
              <div
                className="h-full rounded-full"
                style={{ width: `${usedPct}%`, background: usedPct > 85 ? "var(--c-neg)" : "var(--c-accent)" }}
              />
            </div>
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-mut">
            Credits never expire. If our data layer goes down, your balance is untouched when it
            returns.
          </p>
        </div>

        <div className="rounded-card border border-line bg-surface p-5">
          <p className="label text-mut">What a credit buys</p>
          <dl className="mt-3 divide-y divide-[var(--c-line)]">
            {COSTS.map(([action, cost]) => (
              <div key={action} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[13px] text-body">{action}</dt>
                <dd data-numeric className="font-mono text-[12.5px] font-medium text-ink">{cost} cr</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12.5px] text-mut">Reading the radar costs nothing.</p>
        </div>
      </section>

      {/* plans */}
      <section className="mt-10">
        <h2 className="display-sm text-ink">Your plan</h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
          {TIERS.map((t) => {
            const current = t.id === plan;
            return (
              <div key={t.id} className={`flex flex-col p-5 ${current ? "bg-surface2" : "bg-surface"}`}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[14.5px] font-medium text-ink">{t.name}</span>
                  {current && (
                    <span className="rounded-chip bg-accentweak px-1.5 py-0.5 font-mono text-[9.5px] text-accent">
                      current
                    </span>
                  )}
                </div>
                <p className="mt-3.5 flex items-baseline gap-1.5">
                  <span data-numeric className="font-mono text-[26px] font-medium tracking-[-.03em] text-ink">{t.price}</span>
                  <span className="font-mono text-[11.5px] text-mut">{t.per}</span>
                </p>
                <ul className="mt-4 flex-1 space-y-2 border-t border-line pt-4">
                  {t.feats.map((f) => (
                    <li key={f} className="flex gap-2 text-[12.5px] leading-snug text-body">
                      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                {current ? (
                  <button
                    disabled
                    className="mt-5 cursor-default rounded-ctl border border-line bg-surface py-2 text-[12.5px] font-medium text-mut"
                  >
                    Current plan
                  </button>
                ) : t.id === "scout" ? (
                  <ManageBillingScoutNote />
                ) : (
                  <UpgradeButton
                    plan={t.id as "hunter" | "operator"}
                    label={`Upgrade to ${t.name}`}
                    purchasable={isPlanPurchasable(t.id as "hunter" | "operator")}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[62ch] text-[12.5px] leading-relaxed text-mut">
            Plans are monthly and cancel any time from the payment portal. Your watchlist
            currently holds up to <span data-numeric className="font-mono">{watchlistCap(plan)}</span>{" "}
            products.
          </p>
          <ManageBillingButton enabled={hasCustomer} />
        </div>
      </section>

      {/* ledger */}
      <section className="mt-10 max-w-[52rem]">
        <h2 className="display-sm text-ink">Credit history</h2>
        <div className="mt-4 overflow-hidden rounded-card border border-line bg-surface">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-line bg-surface2 px-4 py-2.5 sm:px-5">
            <span className="label text-mut">Action</span>
            <span className="label text-right text-mut">Change</span>
            <span className="label text-right text-mut">Date</span>
          </div>
          {ledger.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-mut">
              No movements yet. Your welcome credits appear here once granted.
            </p>
          ) : (
            ledger.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line px-4 py-2.5 last:border-b-0 sm:px-5"
              >
                <span className="truncate font-mono text-[12.5px] text-body">{l.action.replace(/_/g, " ")}</span>
                <span
                  data-numeric
                  className="text-right font-mono text-[12.5px] font-medium"
                  style={{ color: l.delta >= 0 ? "var(--c-pos)" : "var(--c-muted)" }}
                >
                  {l.delta >= 0 ? "+" : ""}{l.delta}
                </span>
                <span data-numeric className="text-right font-mono text-[11.5px] text-faint">{when(l.created_at)}</span>
              </div>
            ))
          )}
        </div>
        <Link href="/settings" className="mt-4 inline-block text-[13px] text-accent transition-opacity hover:opacity-70">
          Back to settings
        </Link>
      </section>
    </Shell>
  );
}
