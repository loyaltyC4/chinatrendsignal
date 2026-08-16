import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabaseServer } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string | null };

/**
 * Resolve the caller's session, or return the response to short-circuit with.
 *
 * Every paid route calls this BEFORE touching Claude or JustOne. The identity it
 * returns is the one the credit ledger is debited against — routes must never
 * trust a userId from the request body, which is how the pre-auth code worked.
 */
export async function requireUser(): Promise<
  { user: SessionUser; error: null } | { user: null; error: NextResponse }
> {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      error: NextResponse.json(
        {
          setupRequired: true,
          error: "Accounts are not connected yet",
          instructions:
            "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel for Production and Preview.",
        },
        { status: 503 },
      ),
    };
  }

  const supabase = await supabaseServer();
  // getUser() revalidates the JWT against Supabase. getSession() only reads the
  // cookie, which a client can forge, so it must not be used for authorisation.
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Sign in to use this.", signInUrl: "/login" },
        { status: 401 },
      ),
    };
  }

  return { user: { id: data.user.id, email: data.user.email ?? null }, error: null };
}
