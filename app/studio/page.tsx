import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shell } from "@/components/page-shell";
import StudioClient from "@/components/studio-client";
import { getRadar } from "@/lib/signals";
import { buildListing } from "@/lib/listing";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Listing studio" };
export const dynamic = "force-dynamic";

/**
 * /studio?id=<signalId> — turn one radar signal into platform-specific listings.
 *
 * Server side we resolve the signal from the live read layer and build the
 * derived listing draft (pricing, Etsy copy, channel copy) via lib/listing. The
 * interactive editing lives in StudioClient. An unknown id falls back to the
 * top priced signal rather than dead-ending the user.
 */
export default async function StudioPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fstudio");

  const { id } = await searchParams;
  const { rows } = await getRadar(60);

  const target = rows.find((r) => r.id === id) ?? rows.find((r) => r.wholesaleCny > 0) ?? rows[0];

  if (!target) {
    return (
      <Shell active="Listing studio">
        <div className="rounded-card border border-line bg-surface px-6 py-16 text-center">
          <p className="display-sm text-ink">No signals to list yet.</p>
          <p className="mx-auto mt-2 max-w-[52ch] text-[13.5px] text-body">
            The studio turns a radar signal into a listing. Once the nightly pull surfaces a priced product, it will
            be waiting here.
          </p>
          <Link href="/radar2" className="mt-5 inline-block rounded-ctl bg-accentstrong px-4 py-2 text-[12.5px] font-medium text-onaccent hover:opacity-90">
            Back to the desk
          </Link>
        </div>
      </Shell>
    );
  }

  const draft = buildListing(target);

  return (
    <Shell active="Listing studio">
      <StudioClient draft={draft} />
    </Shell>
  );
}
