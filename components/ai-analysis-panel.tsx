"use client";

import { useState } from "react";
import type { AnalysisKind, EnrichmentResult, ProductContext } from "@/lib/analysis-types";

/**
 * Frozen v1 scope: complaint mining, listing copy and creator matching were cut —
 * none had demand evidence. What remains is the two things the research supported.
 *
 * Copy note: never "AI-powered". Documented seller sentiment is that experienced
 * buyers are actively sceptical of AI validation claims, having been burned by
 * confident-and-wrong answers. The framing is that it reads the data we recorded.
 */
const ACTIONS: Array<{ kind: AnalysisKind; label: string; desc: string; credits: number }> = [
  { kind: "signal_explanation", label: "Explain the move", desc: "Hook, buyer, risk", credits: 2 },
  { kind: "niche_scorecard", label: "Score it", desc: "Demand, margin, saturation", credits: 3 },
];

export default function AiAnalysisPanel({ context }: { context: ProductContext }) {
  const [kind, setKind] = useState<AnalysisKind>("signal_explanation");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<EnrichmentResult | null>(null);

  async function run(next: AnalysisKind) {
    setKind(next);
    setStatus("loading");
    setMessage("");
    setResult(null);
    try {
      const r = await fetch("/api/enrich", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: next, context }),
      });
      const d = await r.json();
      if (r.status === 401) { setStatus("error"); setMessage("Your session expired. Sign in again."); return; }
      if (r.status === 402) { setStatus("error"); setMessage(`Not enough credits. This costs ${d.required} and you have ${d.balance}.`); return; }
      if (r.status === 429) { setStatus("error"); setMessage("You've hit the limit for this action. It resets shortly."); return; }
      if (d.setupRequired) { setStatus("error"); setMessage(d.instructions || "Not connected yet."); return; }
      if (!r.ok) { setStatus("error"); setMessage(d.error || "Analysis failed."); return; }
      setResult(d.result);
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="display-sm text-ink">Why this moved</h2>
          <p className="mt-1.5 max-w-[46ch] text-[13.5px] leading-relaxed text-body">
            Reads the engagement, supplier and timing data we recorded for this signal and
            explains what changed. It does not predict winners.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {ACTIONS.map((a) => (
          <button
            key={a.kind}
            onClick={() => run(a.kind)}
            disabled={status === "loading"}
            className={`rounded-ctl border p-3 text-left transition-colors active:translate-y-px disabled:opacity-60 ${
              kind === a.kind ? "border-accent bg-accentweak" : "border-line hover:border-linestrong"
            }`}
          >
            <span className="block text-[13.5px] font-medium text-ink">{a.label}</span>
            <span className="mt-0.5 block text-[12px] text-mut">{a.desc}</span>
            <span data-numeric className="mt-2 block font-mono text-[10.5px] text-accent">{a.credits} credits</span>
          </button>
        ))}
      </div>

      {status === "loading" && (
        <div className="mt-5 space-y-2" aria-live="polite">
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-surface2" />
          <div className="h-3 w-full animate-pulse rounded bg-surface2" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-surface2" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-surface2" />
        </div>
      )}

      {status === "error" && (
        <p className="mt-5 rounded-ctl border border-line bg-negweak px-3 py-2.5 text-[13px] text-neg">{message}</p>
      )}

      {status === "idle" && (
        <p className="mt-5 rounded-ctl border border-line bg-surface2 px-3 py-2.5 text-[12.5px] text-mut">
          Pick an action above. Nothing is charged until you do.
        </p>
      )}

      {result && (
        <div className="mt-5 rounded-ctl border border-line bg-canvas p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[14px] font-medium text-ink">{result.title}</h3>
            {result.verdict && (
              <span
                className="shrink-0 rounded-chip px-1.5 py-0.5 font-mono text-[10px]"
                style={{
                  background: result.verdict === "Test" ? "var(--c-pos-weak)" : result.verdict === "Pass" ? "var(--c-neg-weak)" : "var(--c-warn-weak)",
                  color: result.verdict === "Test" ? "var(--c-pos)" : result.verdict === "Pass" ? "var(--c-neg)" : "var(--c-warn)",
                }}
              >
                {result.verdict}
              </span>
            )}
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-body">{result.executiveSummary}</p>
          {result.actions.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {result.actions.map((a) => (
                <li key={a} className="flex gap-2 text-[13px] leading-relaxed text-body">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {a}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
