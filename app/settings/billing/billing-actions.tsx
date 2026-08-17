"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Checkout and portal buttons.
 *
 * When Stripe is not configured the button stays visibly disabled with the real
 * reason attached, rather than opening a flow that dies on the third screen. When it
 * is configured, failures are shown verbatim — Stripe's error messages are written
 * for the merchant and are more useful than "something went wrong".
 */

function useRedirect(path: string, payload?: Record<string, unknown>) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setProblem(null);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload ?? {}),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      setProblem(data?.error ?? "Could not reach Stripe");
    } catch {
      setProblem("Network dropped before Stripe answered");
    } finally {
      setBusy(false);
    }
  }

  return { busy, problem, go };
}

export function UpgradeButton({
  plan,
  label,
  purchasable,
}: {
  plan: "hunter" | "operator";
  label: string;
  purchasable: boolean;
}) {
  const { busy, problem, go } = useRedirect("/api/stripe/checkout", { plan });

  if (!purchasable) {
    return (
      <button
        disabled
        title="Stripe keys are not set for this plan yet"
        className="mt-5 w-full cursor-not-allowed rounded-ctl border border-line py-2 text-[12.5px] font-medium text-mut"
      >
        Checkout not connected
      </button>
    );
  }

  return (
    <div className="mt-5">
      <button
        onClick={go}
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-ctl bg-accent py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        {busy ? "Opening Stripe" : label}
      </button>
      {problem && <p className="mt-2 text-[11.5px] leading-snug text-neg">{problem}</p>}
    </div>
  );
}

export function ManageBillingButton({ enabled }: { enabled: boolean }) {
  const { busy, problem, go } = useRedirect("/api/stripe/portal");

  return (
    <div>
      <button
        onClick={go}
        disabled={busy || !enabled}
        title={enabled ? "Cards, invoices and cancellation" : "No payment record on this account yet"}
        className="inline-flex items-center gap-1.5 rounded-ctl border border-line px-3 py-1.5 text-[12.5px] font-medium text-body transition-colors hover:border-linestrong hover:text-ink disabled:cursor-not-allowed disabled:text-mut disabled:hover:border-line"
      >
        {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        Manage payment and invoices
      </button>
      {problem && <p className="mt-2 text-[11.5px] text-neg">{problem}</p>}
    </div>
  );
}
