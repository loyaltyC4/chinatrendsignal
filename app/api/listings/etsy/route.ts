import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar } from "@/lib/signals";
import { getSaturation } from "@/lib/saturation";
import { buildListing } from "@/lib/listing";

/**
 * POST /api/listings/etsy  { signalId }
 *
 * Turns one radar signal into an Etsy draft listing.
 *
 * When the account has a connected Etsy token (integration_tokens) AND the env
 * carries the shipping/readiness ids, this creates a real DRAFT via
 * POST /v3/application/shops/{shop_id}/listings and returns delivered:true. When
 * either is missing it does the honest thing — verifies the caller, builds the
 * full draft via lib/listing, and returns it with delivered:false so the seller
 * can hand-post, rather than pretending a listing was created.
 *
 * The user id comes from the verified session, never the request body. The draft
 * is always a draft (`state: "draft"`, `is_draft: true`) — this route never
 * publishes.
 */
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { signalId?: string } | null;
  const signalId = body?.signalId;
  if (!signalId) {
    return NextResponse.json({ error: "Expected signalId" }, { status: 400 });
  }

  const { rows } = await getRadar(80);
  const target = rows.find((r) => r.id === signalId);
  if (!target) {
    return NextResponse.json({ error: "No such signal" }, { status: 404 });
  }

  const sats = await getSaturation([target.product, target.zh]);
  const draft = buildListing(
    target,
    sats.get(target.product.trim().toLowerCase()) ?? sats.get(target.zh.trim().toLowerCase()) ?? undefined,
  );

  if (!draft.priced || !draft.etsy) {
    return NextResponse.json(
      { error: "This signal has no verified factory price, so there is nothing honest to list yet." },
      { status: 422 },
    );
  }
  if (draft.ipRisk) {
    return NextResponse.json(
      { error: "This signal is flagged for IP review, so it can't be auto-listed. Review it in the studio first." },
      { status: 422 },
    );
  }

  const db = supabaseAdmin();
  const { data: tokenRow } = await db
    .from("integration_tokens")
    .select("access_token")
    .eq("user_id", user.id)
    .eq("provider", "etsy")
    .maybeSingle();

  const shopId = process.env.ETSY_SHOP_ID;
  const shippingProfileId = process.env.ETSY_SHIPPING_PROFILE_ID;
  const readinessStateId = process.env.ETSY_READINESS_STATE_ID;
  const clientId = process.env.ETSY_CLIENT_ID;

  const wired = !!(tokenRow?.access_token && shopId && shippingProfileId && readinessStateId && clientId);

  if (wired) {
    const create = await fetch(`https://openapi.etsy.com/v3/application/shops/${shopId}/listings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": clientId!,
        Authorization: `Bearer ${tokenRow!.access_token}`,
      },
      body: JSON.stringify({
        quantity: 10,
        title: draft.etsy.title,
        description: draft.etsy.description,
        price: draft.etsy.margin.listPriceAud,
        tags: draft.etsy.tags,
        who_made: "i_design",
        when_made: "made_to_order",
        is_supply: false,
        state: "draft",
        is_draft: true,
        shipping_profile_id: Number(shippingProfileId),
        readiness_state_id: Number(readinessStateId),
      }),
    });
    if (create.ok) {
      const created = (await create.json()) as { listing_id?: number };
      return NextResponse.json({ delivered: true, listingId: created.listing_id ?? null, draft: true });
    }
    // Fall through to the honest scaffold on any API failure rather than erroring
    // the queue — the seller can still hand-post the draft.
  }

  return NextResponse.json({
    delivered: false,
    reason: wired ? "etsy_api_error" : "etsy_not_connected",
    message: wired
      ? "Etsy rejected the draft — the assembled copy is returned for hand-posting."
      : "Etsy is not connected to this account yet, so the draft is returned for hand-posting rather than created.",
    draft: {
      title: draft.etsy.title,
      tags: draft.etsy.tags,
      description: draft.etsy.description,
      listPriceAud: draft.etsy.margin.listPriceAud,
      saleAnchorAud: draft.etsy.margin.saleAnchorAud,
    },
  });
}
