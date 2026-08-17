import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell, PageHead } from "@/components/page-shell";
import SettingsForm from "./settings-form";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar } from "@/lib/signals";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fsettings");

  let profile: { displayName: string; niches: string[]; weeklyEmail: boolean; role: string } = {
    displayName: "",
    niches: [],
    weeklyEmail: true,
    role: "member",
  };

  if (isServiceRoleConfigured()) {
    const { data } = await supabaseAdmin()
      .from("profiles")
      .select("display_name, niches, weekly_email, role")
      .eq("id", user.id)
      .maybeSingle();
    if (data) {
      profile = {
        displayName: data.display_name ?? "",
        niches: data.niches ?? [],
        weeklyEmail: data.weekly_email ?? true,
        role: data.role ?? "member",
      };
    }
  }

  const { rows } = await getRadar(200);
  const allNiches = Array.from(new Set(rows.map((r) => r.niche).filter(Boolean))).sort();

  return (
    <Shell active="Settings">
      <PageHead
        title="Settings"
        sub="Your account, the niches we prioritise for you, and what lands in your inbox."
        aside={
          profile.role === "admin" ? (
            <span className="rounded-chip bg-accentweak px-2 py-1 font-mono text-[10px] text-accent">admin</span>
          ) : null
        }
      />
      <div className="mt-8 max-w-[48rem]">
        <SettingsForm
          email={user.email ?? ""}
          displayName={profile.displayName}
          niches={profile.niches}
          weeklyEmail={profile.weeklyEmail}
          allNiches={allNiches}
        />
      </div>
    </Shell>
  );
}
