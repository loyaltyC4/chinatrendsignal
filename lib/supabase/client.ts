"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client. Only ever sees the anon key, and every query it makes is
 * constrained by the RLS policies in the schema.
 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Supabase is not configured in this environment");
  return createBrowserClient(url, anon);
}
