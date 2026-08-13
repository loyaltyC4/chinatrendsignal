"use client";
import { useState } from "react";
import AppNav from "@/components/app-nav";

const STARTERS = [
  "What is moving in pet care this week?",
  "Which products are rising in China but still thin on TikTok Shop?",
  "Show me a low-saturation product under ¥10 wholesale.",
  "Which niche should I avoid because returns are high?",
];

type Msg = { role: "user" | "assistant"; content: string };

export default function AskPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "setup">("idle");
  const [note, setNote] = useState("");

  async function ask(q: string) {
    if (!q.trim()) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next); setInput(""); setStatus("loading"); setNote("");
    const response = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: q, history: next.slice(-8) }) });
    const data = await response.json();
    if (data.setupRequired) { setStatus("setup"); setNote(data.instructions); return; }
    if (!response.ok) { setStatus("error"); setNote(data.error || "The analyst could not answer"); return; }
    setMessages([...next, { role: "assistant", content: data.answer }]); setStatus("idle");
  }

  return (
    <div className="min-h-screen bg-forest font-sans text-ink">
      <AppNav active="Ask the Radar" />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl flex-col px-5 py-8 sm:px-8">
        <div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-grn">Ask the Radar</p><h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">Ask the analyst anything</h1><p className="mt-2 text-sm text-mut">Plain-English answers grounded in your live China trend data. The analyst reads the radar for you.</p></div>
        <div className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-black/10 bg-ivory p-4 sm:p-5">
          {messages.length === 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => <button key={s} onClick={() => ask(s)} className="rounded-xl border border-black/10 bg-white p-4 text-left text-sm text-ink transition-colors hover:border-grn/40 hover:bg-grn/5">{s}</button>)}
            </div>
          )}
          {messages.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-grn text-white" : "bg-black/5 text-ink"}`}>{m.content}</div></div>)}
          {status === "loading" && <div className="flex justify-start"><div className="rounded-2xl bg-black/5 px-4 py-3 text-sm text-mut">Reading the radar…</div></div>}
          {status === "setup" && <div className="rounded-xl border border-[#1d4ed8]/20 bg-[#1d4ed8]/5 p-4 text-sm text-[#334155]"><b>Analyst ready, provider not connected.</b><br />{note}</div>}
          {status === "error" && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{note}</div>}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="mt-4 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a niche, a product, a platform…" aria-label="Ask the analyst" className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-ink placeholder:text-[#9ca3af] focus:border-grn focus:outline-none focus:ring-4 focus:ring-grn/10" />
          <button disabled={status === "loading"} className="rounded-xl bg-grn px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-50">Ask</button>
        </form>
        <p className="mt-2 font-mono text-[10px] text-mut">2 credits per question when credits are live · answers grounded in your tracked signals</p>
      </main>
    </div>
  );
}
