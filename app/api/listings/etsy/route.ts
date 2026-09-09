import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar } from "@/lib/signals";
import { buildListing } from "@/lib/listing";

/**
 * POST /api/listings/etsy  { signalId }
 *
 * Turns one radar signal into an Etsy draft listing.
 *
 * STATUS: scaffold. The Etsy Open API account for this product is not connected
 * yet (no OAuth token / shipping-profile / readiness-state in the environment),
 * so the route does the honest thing: it verifies the caller, resolves the signal,
 * builds the full draft via lib/listing, and returns it with `delivered:false`
 * rather than pretending a listing was created. The moment the Etsy OAuth app
 * creds land in env, the marked block below posts a real draft via
 * POST /v3/application/shops/{shop_id}/listings and flips `delivered` to true.
 *
 * The user id comes from the verified session, never the request body — the same
 * discipline the watchlist and credit routes enforce.
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

  // Resolve against the live read layer so we draft from the same row the desk showed.
  const { rows } = await getRadar(80);
  const target = rows.find((r) => r.id === signalId);
  if (!target) {
    return NextResponse.json({ error: "No such signal" }, { status: 404 });
  }

  const draft = buildListing(target);
  if (!draft.priced || !draft.etsy) {
    return NextResponse.json(
      { error: "This signal has no verified factory price, so there is nothing honest to list yet." },
      { status: 422 },
    );
  }

  /*
   * WIRED PATH (enable once the Etsy app is connected):
   *
   *   const etsy = await etsyClient(user.id);            // OAuth token from the vault
   *   const created = await etsy.createDraftListing({
   *     shop_id: profile.etsy_shop_id,
   *     title: draft.etsy.title,
   *     description: draft.etsy.description,
   *     tags: draft.etsy.tags,
   *     price: draft.etsy.listPriceAud,
   *     taxonomy_id, shipping_profile_id, readiness_state_id, ...
   *   });
   *   return NextResponse.json({ delivered: true, listingId: created.listing_id });
   *
   * Until then we return the assembled draft so the queue can confirm the copy and
   * the seller can paste it by hand — clearly flagged as not yet posted.
   */
  return NextResponse.json({
    delivered: false,
    reason: "etsy_not_connected",
    message: "Etsy is not connected to this account yet, so the draft is returned for hand-posting rather than created.",
    draft: {
      title: draft.etsy.title,
      tags: draft.etsy.tags,
      description: draft.etsy.description,
      listPriceAud: draft.etsy.listPriceAud,
      saleAnchorAud: draft.etsy.saleAnchorAud,
    },
  });
}
