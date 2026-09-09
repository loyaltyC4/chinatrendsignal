import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * GET /api/integrations/etsy/connect — begin Etsy OAuth (PKCE).
 *
 * Generates the code verifier + challenge, stores the verifier in a short-lived
 * httpOnly cookie, and 302s to Etsy's consent screen. The callback route swaps the
 * code for tokens and stores them against the user.
 *
 * If the Etsy app isn't configured (no ETSY_CLIENT_ID), we don't redirect into a
 * broken consent screen — we return to /integrations with a plain note.
 */
export const dynamic = "force-dynamic";

const ETSY_AUTHORIZE = "https://www.etsy.com/oauth/connect";
// Minimum scopes to create draft listings and read the shop. listings_w writes
// drafts; shops_r identifies which shop. We do not request transactions/profile.
const SCOPES = ["listings_r", "listings_w", "shops_r"].join(" ");

function base64url(buf: ArrayBuffer) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireUser();
  if (error || !user) return NextResponse.redirect(new URL("/login?next=%2Fintegrations", req.url));

  const clientId = process.env.ETSY_CLIENT_ID;
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  if (!clientId) {
    return NextResponse.redirect(new URL("/integrations?etsy=not_configured", site));
  }

  // PKCE: verifier stays server-side in a cookie; only the challenge goes to Etsy.
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const challenge = base64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const state = base64url(crypto.getRandomValues(new Uint8Array(16)).buffer);

  const cookieStore = await cookies();
  cookieStore.set("etsy_oauth", JSON.stringify({ verifier, state }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 minutes to complete consent
    path: "/",
  });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${site}/api/integrations/etsy/callback`,
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.redirect(`${ETSY_AUTHORIZE}?${params.toString()}`);
}
