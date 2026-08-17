import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isServiceRoleConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/stripe/webhook — grant credits and set the plan when a customer pays.
 * Handles checkout.session.completed (first payment) and invoice.payment_succeeded (renewals).
 *
 * TWO BUGS FIXED HERE — both would have surfaced on the first real payment:
 *  1. The insert targeted columns that do not exist. It wrote customer_id/delta/reason;
 *     credit_ledger defines user_id/delta/action/reference. Every grant would have failed.
 *  2. CREDITS_PER_PRICE was an empty map behind a `?? 50` fallback, so an A$129 Operator
 *     payment granted exactly as many credits as A$59 Hunter.
 *
 * Price IDs come from env so one build works against both Stripe test and live keys.
 * Env: STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_HUNTER, STRIPE_PRICE_OPERATOR.
 */

type PlanKey = "hunter" | "operator";
type StripeEvent = { type?: string; data?: { object?: any } };

function planTable(): Record<string, { plan: PlanKey; credits: number }> {
  const table: Record<string, { plan: PlanKey; credits: number }> = {};
  const hunter = process.env.STRIPE_PRICE_HUNTER;
  const operator = process.env.STRIPE_PRICE_OPERATOR;
  if (hunter) table[hunter] = { plan: "hunter", credits: 100 };
  if (operator) table[operator] = { plan: "operator", credits: 300 };
  return table;
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "unconfigured" }, { status: 500 });

  let event: StripeEvent;
  try {
    event = verifyStripeSignature(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const type = event?.type;
  if (type !== "checkout.session.completed" && type !== "invoice.payment_succeeded") {
    return NextResponse.json({ received: true, ignored: type });
  }

  const obj = event.data?.object ?? {};
  const customerId: string | undefined = obj.customer;
  const priceId: string | undefined = obj.lines?.data?.[0]?.price?.id || obj.metadata?.price_id;

  if (!customerId) {
    // Nothing to attribute the payment to. Return 200 so Stripe stops retrying, but log it.
    console.error("stripe webhook: no customer on event", { type, id: obj.id });
    return NextResponse.json({ received: true, warning: "no customer" });
  }

  const entry = priceId ? planTable()[priceId] : undefined;
  if (!entry) {
    // Unknown price: do NOT guess an amount. Silently granting a default is exactly
    // how the previous version made every tier worth 50 credits.
    console.error("stripe webhook: unmapped price id", { priceId, customerId });
    return NextResponse.json({ received: true, warning: "unmapped price" });
  }

  const granted = await grantCredits({
    customerId,
    plan: entry.plan,
    credits: entry.credits,
    reference: `stripe:${obj.id}`,
  });

  return NextResponse.json({ received: true, granted });
}

/** HMAC-SHA256 over `${t}.${payload}`, compared in constant time. */
function verifyStripeSignature(payload: string, header: string, secret: string): StripeEvent {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) throw new Error("malformed signature header");

  // Reject replays of an old signed payload.
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) throw new Error("timestamp outside tolerance");

  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(v1, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error("bad signature");

  return JSON.parse(payload) as StripeEvent;
}

/**
 * Resolve the Stripe customer to our user, then write the grant against the columns
 * the schema actually defines. `reference` is unique, so a Stripe retry of the same
 * event cannot double-credit.
 */
async function grantCredits(input: {
  customerId: string;
  plan: PlanKey;
  credits: number;
  reference: string;
}) {
  if (!isServiceRoleConfigured()) {
    console.error("grantCredits: supabase not configured", { customerId: input.customerId });
    return false;
  }
  const db = supabaseAdmin();

  const { data: profile, error: lookupError } = await db
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", input.customerId)
    .maybeSingle();

  if (lookupError || !profile) {
    console.error("grantCredits: no profile for stripe customer", { customerId: input.customerId });
    return false;
  }

  const { error: ledgerError } = await db.from("credit_ledger").insert({
    user_id: profile.id,
    delta: input.credits,
    action: `purchase:${input.plan}`,
    reference: input.reference,
  });

  // 23505 = unique violation, i.e. this event was already processed. Not an error.
  if (ledgerError && ledgerError.code !== "23505") {
    console.error("grantCredits: ledger insert failed", ledgerError);
    return false;
  }

  await db.from("profiles").update({ plan: input.plan }).eq("id", profile.id);
  return true;
}
