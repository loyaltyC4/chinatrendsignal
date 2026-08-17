import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { stripePost, StripeError, stripeSecret } from "@/lib/stripe";

/**
 * POST /api/stripe/portal — hands the customer to Stripe's billing portal.
 *
 * Cancellation, card updates and invoices all live there. Building our own version of
 * those screens would mean re-implementing Stripe's compliance work badly, and a
 * subscription you cannot cancel yourself is a support ticket by design.
 */
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;
  if (!stripeSecret() || !isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Billing is not switched on yet." }, { status: 503 });
  }

  const { data: profile } = await supabaseAdmin()
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user!.id)
    .maybeSingle();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "There is no payment record on this account yet." },
      { status: 400 },
    );
  }

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const session = await stripePost<{ url: string }>("/billing_portal/sessions", {
      customer: profile.stripe_customer_id,
      return_url: `${origin}/settings/billing`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof StripeError ? e.message : "Could not open the billing portal";
    console.error("stripe portal failed", { userId: user!.id, message });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
