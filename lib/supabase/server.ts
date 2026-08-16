import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when auth is wired up. Routes degrade to a clear 503 rather than crashing. */
export function isSupabaseConfigured() {
  return Boolean(URL && ANON);
}

export function isServiceRoleConfigured() {
  return Boolean(URL && SERVICE);
}

/**
 * Request-scoped client that reads the user's session from cookies and respects RLS.
 * Use this for anything acting *as the user*.
 */
export async function supabaseServer() {
  if (!URL || !ANON) throw new Error("Supabase is not configured");
  const store = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session, so this is safe to swallow.
        }
      },
    },
  });
}

/**
 * Service-role client. Bypasses RLS — never expose to the browser and never
 * accept a user-supplied id without checking the session first.
 */
export function supabaseAdmin() {
  if (!URL || !SERVICE) throw new Error("Supabase service role is not configured");
  return createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
