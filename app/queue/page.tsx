import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shell, Stat } from "@/components/page-shell";
import QueueClient from "@/components/queue-client";
import { getRadar } from "@/lib/signals";
import { buildQueue } from "@/lib/listing";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Post queue" };
export const dynamic = "force-dynamic";

/**
 * /queue — drafts ready to go live.
 *
 * The sellable set is the live radar's priced product rows, newest-window first.
 * Stats up top are the operator's glance: how many are ready, the combined est.
 * net, and the freshest (most urgent) window in the queue.
 */
export default async function QueuePage() {
  const { user, error } = await requireUser();
  if (error || !user) redirect("/login?next=%2Fqueue");

  const { rows } = await getRadar(80);
  const drafts = buildQueue(rows);

  const net = drafts.reduce((s, d) => s + (d.etsy?.estNetAud ?? 0), 0);
  const freshest = drafts.length ? Math.min(...drafts.map((d) => d.firstSeenDays ?? 999)) : null;

  return (
    <Shell active="Post queue">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-faint">Post queue</p>
          <h1 className="mt-1.5 display-lg text-ink">Drafts ready to <span className="spectrum-text">go live.</span></h1>
          <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-body">
            Priced, scanned and written to the Etsy standard. Review a row, then post — the draft lands in Shop
            Manager → Listings, never straight to live.
          </p>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3">
        <Stat label="Ready to post" value={String(drafts.length)} note="drafts written & priced" hue="var(--c-accent)" />
        <Stat
          label="Combined est. net"
          value={net > 0 ? `A$${Math.round(net).toLocaleString()}` : "—"}
          note="per-unit sums, derived · est."
          hue="var(--c-pos)"
        />
        <Stat
          label="Freshest window"
          value={freshest != null && freshest < 999 ? (freshest === 0 ? "today" : `${freshest}d`) : "—"}
          note="post the newest first"
          hue="var(--c-1688)"
        />
      </div>

      <div className="mt-7">
        <QueueClient drafts={drafts} />
      </div>
    </Shell>
  );
}
