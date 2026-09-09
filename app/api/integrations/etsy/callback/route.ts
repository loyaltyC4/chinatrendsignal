import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

/**
 * GET /api/integrations/etsy/callback — complete Etsy OAuth (PKCE).
 *
 * Verifies state, swaps the code for access + refresh tokens, resolves the user's
 * shop, stores the token row, and clears the handshake cookie. On any failure we
 * land back on /integrations with a readable reason — never a bare 500.
 */
export const dynamic = "force-dynamic";

const ETSY_TOKEN = "https://api.etsy.com/v3/public/oauth/token";

export async function GET(req: NextRequest) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const fail = (reason: string) => NextResponse.redirect(new URL(`/integrations?etsy=${reason}`, site));

  const { user, error } = await requireUser();
  if (error || !user) return NextResponse.redirect(new URL("/login?next=%2Fintegrations", site));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  if (oauthError) return fail("denied");
  if (!code || !state) return fail("missing_code");

  const cookieStore = await cookies();
  const raw = cookieStore.get("etsy_oauth")?.value;
  if (!raw) return fail("session_expired");

  let handshake: { verifier: string; state: string };
  try {
    handshake = JSON.parse(raw);
  } catch {
    return fail("bad_session");
  }
  if (handshake.state !== state) return fail("state_mismatch");

  const clientId = process.env.ETSY_CLIENT_ID;
  const clientSecret = process.env.ETSY_CLIENT_SECRET;
  if (!clientId || !isServiceRoleConfigured()) return fail("not_configured");

  // Code → tokens
  const tokenRes = await fetch(ETSY_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      ...(clientSecret ? { client_secret: clientSecret } : {}),
      redirect_uri: `${site}/api/integrations/etsy/callback`,
      code,
      code_verifier: handshake.verifier,
    }),
  });
  if (!tokenRes.ok) return fail("token_exchange_failed");
  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  // Resolve the user's shop for the account label (best-effort).
  let shopLabel: string | null = null;
  try {
    const me = await fetch("https://openapi.etsy.com/v3/application/users/me", {
      headers: { "x-api-key": clientId, Authorization: `Bearer ${tokens.access_token}` },
    });
    if (me.ok) {
      const mj = (await me.json()) as { shop_id?: number };
      if (mj.shop_id) {
        const shop = await fetch(`https://openapi.etsy.com/v3/application/shops/${mj.shop_id}`, {
          headers: { "x-api-key": clientId },
        });
        if (shop.ok) shopLabel = ((await shop.json()) as { shop_name?: string }).shop_name ?? null;
      }
    }
  } catch {
    /* label is cosmetic; a null label never blocks the connection */
  }

  const db = supabaseAdmin();
  const { error: upErr } = await db.from("integration_tokens").upsert(
    {
      user_id: user.id,
      provider: "etsy",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      account_label: shopLabel,
    },
    { onConflict: "user_id,provider" },
  );
  if (upErr) return fail("store_failed");

  const res = NextResponse.redirect(new URL("/integrations?etsy=connected", site));
  // Clear the handshake cookie now that the exchange succeeded.
  res.cookies.set("etsy_oauth", "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  return res;
}
