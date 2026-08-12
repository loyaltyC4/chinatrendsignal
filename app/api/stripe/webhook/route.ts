import { NextRequest, NextResponse } from "next/server";

// POST /api/stripe/webhook — grant credits when a customer pays.
// Handles: checkout.session.completed (first payment) and invoice.payment_succeeded (renewals).
// Credits are the metered currency for heavy studio actions (listing builds, bg removal at scale,
// deep API pulls, Apify spy runs). Base radar reading is flat-rate and does NOT burn credits.
//
// Env needed:
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (credits ledger lives in Supabase)

const CREDITS_PER_PRICE: Record<string, number> = {
  // map Stripe price IDs -> credits granted per billing cycle
  // [price_hunter]: 50, [price_operator]: 250, [price_agency]: 1000
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return NextResponse.json({ error: "unconfigured" }, { status: 500 });

  let event: any;
  try {
    event = verifyStripeSignature(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const type = event?.type;
  if (type === "checkout.session.completed" || type === "invoice.payment_succeeded") {
    const obj = event.data.object;
    const customerId = obj.customer;
    const priceId = obj.lines?.data?.[0]?.price?.id || obj.metadata?.price_id;
    const credits = CREDITS_PER_PRICE[priceId] ?? 50;
    await grantCredits(customerId, credits, `payment:${obj.id}`);
  }
  return NextResponse.json({ received: true });
}

// Minimal Stripe webhook signature verification (HMAC-SHA256 over `${t}.${payload}`)
import crypto from "crypto";
function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const t = parts["t"], v1 = parts["v1"];
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  if (expected !== v1) throw new Error("bad signature");
  return JSON.parse(payload);
}

async function grantCredits(customerId: string, amount: number, ref: string) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.log("grantCredits (no supabase):", customerId, amount, ref); return; }
  await fetch(`${url}/rest/v1/credit_ledger`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({ customer_id: customerId, delta: amount, reason: ref }),
  });
}
