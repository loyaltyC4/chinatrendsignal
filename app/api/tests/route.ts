import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";

/**
 * Outcome tracker CRUD.
 *
 * The tracker used to hold its rows in React state, which meant every logged test
 * vanished on reload. That is worse than not having the feature: it invites someone
 * to record real spend and then loses it. Rows now live in product_tests, owner-only
 * under RLS, and the user id always comes from the session.
 */

const RESULTS = new Set(["pending", "testing", "winner", "killed"]);

function money(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 10_000_000);
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;
  if (!isServiceRoleConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await req.json().catch(() => null)) as {
    product?: string;
    niche?: string;
    signalId?: string;
  } | null;

  const product = body?.product?.trim();
  if (!product) return NextResponse.json({ error: "A product name is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin()
    .from("product_tests")
    .insert({
      user_id: user!.id,
      product: product.slice(0, 140),
      niche: body?.niche?.trim().slice(0, 60) || "Unclassified",
      signal_id: body?.signalId && /^[0-9a-f-]{36}$/i.test(body.signalId) ? body.signalId : null,
    })
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Could not log that test" }, { status: 500 });
  return NextResponse.json({ ok: true, id: data?.id });
}

export async function PATCH(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;
  if (!isServiceRoleConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await req.json().catch(() => null)) as {
    id?: string;
    result?: string;
    spendAud?: number;
    revenueAud?: number;
    note?: string;
  } | null;

  if (!body?.id) return NextResponse.json({ error: "Expected an id" }, { status: 400 });

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.result === "string") {
    if (!RESULTS.has(body.result)) return NextResponse.json({ error: "Unknown result" }, { status: 400 });
    patch.result = body.result;
  }
  if (body.spendAud !== undefined) patch.spend_aud = money(body.spendAud);
  if (body.revenueAud !== undefined) patch.revenue_aud = money(body.revenueAud);
  if (typeof body.note === "string") patch.note = body.note.slice(0, 500);

  // Scoped by user_id as well as id, so guessing another account's row id changes nothing.
  const { error } = await supabaseAdmin()
    .from("product_tests")
    .update(patch)
    .eq("id", body.id)
    .eq("user_id", user!.id);

  if (error) return NextResponse.json({ error: "Could not update" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;
  if (!isServiceRoleConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Expected an id" }, { status: 400 });

  const { error } = await supabaseAdmin().from("product_tests").delete().eq("id", id).eq("user_id", user!.id);
  if (error) return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
