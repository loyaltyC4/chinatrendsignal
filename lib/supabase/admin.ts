import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client, deliberately in its own module.
 *
 * It previously lived alongside the cookie-based server client, which imports
 * next/headers at module scope. Anything needing only the admin client (the Stripe
 * webhook, the cron job) therefore pulled next/headers in too and failed to build.
 * Splitting them keeps the request-scoped and request-free clients independent.
 *
 * Bypasses RLS. Never expose to the browser, and never accept a user-supplied id
 * without checking the session first.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isServiceRoleConfigured() {
  return Boolean(URL && SERVICE);
}

export function supabaseAdmin() {
  if (!URL || !SERVICE) throw new Error("Supabase service role is not configured");
  return createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
