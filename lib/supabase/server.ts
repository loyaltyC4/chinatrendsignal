import { createServerClient } from "@supabase/ssr";


const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when auth is wired up. Routes degrade to a clear 503 rather than crashing. */
export function isSupabaseConfigured() {
  return Boolean(URL && ANON);
}


/**
 * Request-scoped client that reads the user's session from cookies and respects RLS.
 * Use this for anything acting *as the user*.
 */
export async function supabaseServer() {
  if (!URL || !ANON) throw new Error("Supabase is not configured");
  // Imported lazily rather than at module scope. A static next/headers edge in the
  // module graph made Turbopack reject any route that transitively imported this
  // file, even legitimate App Router route handlers.
  const { cookies } = await import("next/headers");
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

// Re-exported so existing imports keep working. The implementation lives in
// ./admin, which must stay free of next/headers.
export { supabaseAdmin, isServiceRoleConfigured } from "./admin";
