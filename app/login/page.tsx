"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  not_configured: "Sign-in isn't connected yet. Try again shortly.",
  missing_code: "That sign-in link was incomplete. Request a new one below.",
  exchange_failed: "That link has expired or was already used. Request a new one below.",
};

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const urlError = params.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setMessage("");
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not send the link. Try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-black/10 bg-ivory p-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-grn/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-ink">Check your email</h2>
        <p className="mx-auto mt-2 max-w-[38ch] text-sm text-mut">
          We sent a sign-in link to <span className="font-medium text-ink">{email}</span>. It expires in an hour.
        </p>
        <button
          onClick={() => { setStatus("idle"); setMessage(""); }}
          className="mt-6 text-sm font-medium text-grn underline underline-offset-4 hover:opacity-80"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-ivory p-8">
      <h1 className="font-serif text-3xl leading-tight text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-mut">
        No password. We email you a link that signs you straight in.
      </p>

      {(urlError || status === "error") && (
        <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message || ERRORS[urlError || ""] || "Something went wrong. Try again."}
        </p>
      )}

      <form onSubmit={sendLink} className="mt-6 space-y-3">
        <label htmlFor="email" className="block font-mono text-[11px] uppercase tracking-[.12em] text-mut">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-[#a3a89c] focus:border-grn"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-xl bg-grn py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1e40af] disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-[#a3a89c]">
        New here? The same link creates your account. The free tier never expires and we
        don&apos;t ask for a card.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-forest px-5 py-16">
      <div className="w-full max-w-[27rem]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 font-semibold tracking-tight text-ink">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <circle cx="13" cy="13" r="11" stroke="#1d4ed8" strokeWidth="2.5" />
            <circle cx="13" cy="13" r="5.5" stroke="#1d4ed8" strokeWidth="2.5" />
            <circle cx="13" cy="13" r="1.8" fill="#1d4ed8" />
          </svg>
          chinatrendsignal
        </Link>
        <Suspense fallback={<div className="rounded-2xl border border-black/10 bg-ivory p-8 text-sm text-mut">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-[#a3a89c]">
          <Link href="/" className="underline underline-offset-4 hover:text-mut">Back to the site</Link>
        </p>
      </div>
    </main>
  );
}
