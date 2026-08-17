import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell } from "@/components/page-shell";
import AskChat from "./ask-chat";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Ask the radar" };
export const dynamic = "force-dynamic";

/**
 * This page was a client component that rendered <Shell> directly. Shell is an async
 * server component (it reads the session and the credit balance), so putting it inside
 * a client tree meant the HTML rendered but the tree never hydrated: every button on
 * the page was dead, silently. The chat is now its own client component and the page
 * stays a server component, which is the only arrangement where both halves work.
 */
export default async function AskPage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fask");

  return (
    <Shell active="Ask">
      <AskChat />
    </Shell>
  );
}
