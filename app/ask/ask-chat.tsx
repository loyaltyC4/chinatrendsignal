"use client";

import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "What's moving fastest in beauty this week?",
  "Which signals have saves beating likes?",
  "What did we see first that's still rising?",
  "Which niches have the thinnest supplier competition?",
];

export default function AskChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [note, setNote] = useState("");
  const [dataSource, setDataSource] = useState<string | null>(null);

  async function ask(q: string) {
    if (!q.trim()) return;
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setStatus("loading");
    setNote("");
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const d = await r.json();
      if (r.status === 401) { setStatus("error"); setNote("Your session expired. Sign in again."); return; }
      if (r.status === 402) { setStatus("error"); setNote(`Not enough credits. This costs ${d.required} and you have ${d.balance}.`); return; }
      if (r.status === 429) { setStatus("error"); setNote("You've hit the question limit. It resets shortly."); return; }
      if (d.setupRequired) { setStatus("error"); setNote(d.instructions || "The analyst is not connected yet."); return; }
      if (!r.ok) { setStatus("error"); setNote(d.error || "The analyst failed."); return; }
      setDataSource(d.dataSource ?? null);
      setMessages([...next, { role: "assistant", content: d.answer }]);
      setStatus("idle");
    } catch {
      setStatus("error");
      setNote("Could not reach the server. Try again.");
    }
  }

  return (
    <div className="mx-auto flex max-w-[46rem] flex-col">
        <div>
          <h1 className="display-md text-ink">Ask the radar</h1>
          <p className="mt-1.5 max-w-[58ch] text-[14px] leading-relaxed text-body">
            Plain questions about the signals in your index. Answers are grounded in the rows we
            actually recorded, and the reply says which dataset it read.
          </p>
        </div>

        <div className="mt-6 min-h-[22rem] space-y-4 rounded-card border border-line bg-surface p-4 sm:p-5">
          {messages.length === 0 && status !== "error" && (
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-ctl border border-line p-3.5 text-left text-[13px] leading-relaxed text-body transition-colors hover:border-accent hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-card px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                  m.role === "user" ? "bg-accentstrong text-onaccent" : "border border-line bg-canvas text-body"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {status === "loading" && (
            <div className="flex justify-start" aria-live="polite">
              <div className="w-[70%] space-y-2 rounded-card border border-line bg-canvas px-3.5 py-3">
                <div className="h-3 w-full animate-pulse rounded bg-surface2" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-surface2" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-surface2" />
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="rounded-ctl border border-line bg-negweak px-3 py-2.5 text-[13px] text-neg">{note}</p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a niche, a product, a platform…"
            aria-label="Ask the analyst"
            className="min-w-0 flex-1 rounded-ctl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
          <button
            disabled={status === "loading"}
            className="shrink-0 rounded-ctl bg-accentstrong px-4 py-2.5 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-50"
          >
            Ask
          </button>
        </form>

        <p className="mt-2 font-mono text-[11px] text-mut">
          2 credits per question
          {dataSource === "seed" && " · answered from sample data, not a live pull"}
        </p>
    </div>
  );
}
