import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { watchlistCap, type Profile } from "@/lib/dashboard";

/**
 * POST /api/watchlist  { signalId, action: "add" | "remove" }
 *
 * The watchlist is the retention primitive, so the plan cap is enforced HERE rather
 * than only in the UI: a hidden button is not a limit. Free accounts get a small
 * taste of it so the value is felt before it is paywalled.
 *
 * The user id always comes from the verified session, never the body.
 */
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as {
    signalId?: string;
    action?: "add" | "remove";
  } | null;

  const signalId = body?.signalId;
  const action = body?.action;
  if (!signalId || (action !== "add" && action !== "remove")) {
    return NextResponse.json({ error: "Expected signalId and action" }, { status: 400 });
  }
  // Seed rows carry synthetic ids. Saving one would fail the foreign key with a
  // useless 500, so say plainly what the problem is.
  if (!/^[0-9a-f-]{36}$/i.test(signalId)) {
    return NextResponse.json(
      { error: "That row is sample data, so there is nothing real to track yet." },
      { status: 400 },
    );
  }

  const db = supabaseAdmin();

  if (action === "remove") {
    const { error } = await db.from("watchlist").delete().eq("user_id", user!.id).eq("signal_id", signalId);
    if (error) return NextResponse.json({ error: "Could not remove" }, { status: 500 });
    const { count } = await db
      .from("watchlist")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user!.id);
    return NextResponse.json({ watching: false, count: count ?? 0 });
  }

  const [{ data: profile }, { count }] = await Promise.all([
    db.from("profiles").select("plan").eq("id", user!.id).maybeSingle(),
    db.from("watchlist").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
  ]);

  const plan = ((profile?.plan as Profile["plan"]) ?? "scout");
  const cap = watchlistCap(plan);
  const used = count ?? 0;

  // Already-saved rows must not be rejected by the cap, so check membership first.
  const { data: existing } = await db
    .from("watchlist")
    .select("id")
    .eq("user_id", user!.id)
    .eq("signal_id", signalId)
    .maybeSingle();

  if (existing) return NextResponse.json({ watching: true, count: used });

  if (used >= cap) {
    return NextResponse.json(
      {
        error:
          plan === "operator"
            ? `You are tracking ${used} products, which is the ceiling we can watch nightly.`
            : `Your ${plan} plan tracks ${cap} products. Upgrade to watch more.`,
        limit: cap,
        upgrade: plan !== "operator",
      },
      { status: 403 },
    );
  }

  const { error } = await db.from("watchlist").insert({ user_id: user!.id, signal_id: signalId });
  // 23505 = already there because of a double click. Not an error worth surfacing.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  return NextResponse.json({ watching: true, count: used + 1, limit: cap });
}
