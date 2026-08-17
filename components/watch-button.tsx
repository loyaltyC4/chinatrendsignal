"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Loader2 } from "lucide-react";

/**
 * Save-to-watchlist control.
 *
 * Two deliberate choices:
 *  - It renders inside a row that is itself a link, so the click is stopped here.
 *    Without that, saving a product would navigate away from the list you are
 *    working through, which is exactly the wrong thing after a save.
 *  - It is optimistic, but rolls back and shows the real reason on failure. A cap
 *    is a product decision the user should be able to read, not a silent no-op.
 */
export default function WatchButton({
  signalId,
  initial,
  label = true,
}: {
  signalId: string;
  initial: boolean;
  label?: boolean;
}) {
  const [watching, setWatching] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const next = !watching;
    setWatching(next);
    setBusy(true);
    setProblem(null);

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signalId, action: next ? "add" : "remove" }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setWatching(!next);
        setProblem(data?.error ?? "Could not save that");
      } else {
        // Refresh so the dashboard diff, counters and watchlist stay truthful.
        startTransition(() => router.refresh());
      }
    } catch {
      setWatching(!next);
      setProblem("Network dropped, nothing was saved");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={watching}
        title={watching ? "Stop tracking this product" : "Track this product nightly"}
        className={`inline-flex shrink-0 items-center gap-1 rounded-ctl border px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
          watching
            ? "border-accent bg-accentweak text-accent"
            : "border-line text-mut hover:border-linestrong hover:text-ink"
        }`}
      >
        {busy ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        ) : watching ? (
          <Check className="h-3 w-3" aria-hidden />
        ) : (
          <Bookmark className="h-3 w-3" aria-hidden />
        )}
        {label && <span>{watching ? "Tracking" : "Track"}</span>}
      </button>

      {problem && (
        <span
          role="status"
          className="absolute left-0 top-[calc(100%+4px)] z-20 w-[15rem] rounded-ctl border border-line bg-surface px-2 py-1.5 text-[11px] leading-snug text-body shadow-sm"
        >
          {problem}
        </span>
      )}
    </span>
  );
}
