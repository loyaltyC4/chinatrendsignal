import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell } from "@/components/page-shell";
import IntegrationsClient from "@/components/integrations-client";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

/**
 * /integrations — connect the sales channels the listing desk posts to.
 *
 * Each channel reports its real state: Etsy OAuth is the live one (connect → PKCE
 * → drafts), TikTok Shop and Shopify are copy-only until their APIs are wired and
 * the card says so plainly. We never show a "connected" state we haven't verified
 * server-side — the badge reads from the integration_tokens table, not a cookie.
 */
export type ChannelState = {
  id: "etsy" | "tiktok" | "shopify";
  connected: boolean;
  accountLabel: string | null;
};

export default async function IntegrationsPage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fintegrations");

  let etsy: ChannelState = { id: "etsy", connected: false, accountLabel: null };
  if (isServiceRoleConfigured()) {
    const { data } = await supabaseAdmin()
      .from("integration_tokens")
      .select("account_label, expires_at")
      .eq("user_id", user.id)
      .eq("provider", "etsy")
      .maybeSingle();
    if (data) {
      etsy = { id: "etsy", connected: true, accountLabel: data.account_label ?? null };
    }
  }

  return (
    <Shell active="Integrations">
      <IntegrationsClient
        etsy={etsy}
        etsyConfigured={!!process.env.ETSY_CLIENT_ID}
      />
    </Shell>
  );
}
