import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";

/** Saves the caller's own profile. The id comes from the verified session, never
 *  from the body, so one account cannot write another's row. */
export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as {
    displayName?: string;
    niches?: string[];
    weeklyEmail?: boolean;
  } | null;
  if (!body) return NextResponse.json({ error: "Expected a body" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body.displayName === "string") patch.display_name = body.displayName.slice(0, 80).trim() || null;
  if (Array.isArray(body.niches)) patch.niches = body.niches.filter((n) => typeof n === "string").slice(0, 20);
  if (typeof body.weeklyEmail === "boolean") patch.weekly_email = body.weeklyEmail;

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabaseAdmin().from("profiles").update(patch).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Could not save" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
