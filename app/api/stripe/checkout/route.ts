import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { isPlanPurchasable, priceIdFor, stripePost, StripeError, type PaidPlan } from "@/lib/stripe";

/**
 * POST /api/stripe/checkout  { plan: "hunter" | "operator" }
 * Returns { url } for the hosted checkout page.
 *
 * The Stripe customer is created here, before checkout, and stored on the profile.
 * That matters: the webhook resolves payments by customer id, so a customer created
 * implicitly by Checkout would arrive with no row to attribute the grant to. We also
 * stamp user_id and price_id into metadata so the webhook has a fallback path and can
 * tell the tiers apart without guessing an amount.
 */
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const body = (await req.json().catch(() => null)) as { plan?: PaidPlan } | null;
  const plan = body?.plan;
  if (plan !== "hunter" && plan !== "operator") {
    return NextResponse.json({ error: "Expected plan hunter or operator" }, { status: 400 });
  }
  if (!isPlanPurchasable(plan)) {
    return NextResponse.json(
      { error: "Card payments are not switched on yet for that plan." },
      { status: 503 },
    );
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const db = supabaseAdmin();
  const { data: profile } = await db
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", user!.id)
    .maybeSingle();

  try {
    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripePost<{ id: string }>(
        "/customers",
        {
          email: user!.email ?? profile?.email ?? undefined,
          metadata: { user_id: user!.id },
        },
        // Keyed by user, so a double-submit cannot create two customers.
        { idempotencyKey: `cts-customer-${user!.id}` },
      );
      customerId = customer.id;
      await db.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user!.id);
    }

    const price = priceIdFor(plan)!;
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

    const session = await stripePost<{ url: string }>("/checkout/sessions", {
      mode: "subscription",
      customer: customerId,
      client_reference_id: user!.id,
      allow_promotion_codes: true,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/settings/billing?upgraded=${plan}`,
      cancel_url: `${origin}/settings/billing?cancelled=1`,
      metadata: { user_id: user!.id, price_id: price, plan },
      subscription_data: { metadata: { user_id: user!.id, price_id: price, plan } },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    if (e instanceof StripeError) {
      console.error("stripe checkout failed", { userId: user!.id, plan, message: e.message });
      return NextResponse.json({ error: e.message }, { status: 502 });
    }
    console.error("stripe checkout crashed", e);
    return NextResponse.json({ error: "Checkout could not start" }, { status: 500 });
  }
}
