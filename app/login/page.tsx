"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  not_configured: "Sign-in isn't connected yet. Try again shortly.",
  missing_code: "That sign-in link was incomplete. Request a new one below.",
  exchange_failed: "That link has expired or was already used. Request a new one below.",
};

type Mode = "password" | "link";

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/dashboard";
  const urlError = params.get("error");

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("busy");
    setMessage("");
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      // Full reload so the server components pick up the fresh session cookie.
      router.push(next);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error && /invalid login/i.test(err.message)
          ? "That email and password combination isn't right."
          : err instanceof Error
            ? err.message
            : "Could not sign in. Try again.",
      );
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("busy");
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
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accentweak">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent)" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16v12H4z" /><path d="m4 7 8 6 8-6" />
          </svg>
        </div>
        <h2 className="display-sm text-ink">Check your email</h2>
        <p className="mx-auto mt-2 max-w-[38ch] text-sm text-mut">
          We sent a sign-in link to <span className="font-medium text-ink">{email}</span>. It expires in an hour.
        </p>
        <button
          onClick={() => { setStatus("idle"); setMessage(""); }}
          className="mt-6 text-sm font-medium text-accent underline underline-offset-4 hover:opacity-80"
        >
          Use a different email
        </button>
      </div>
    );
  }

  const busy = status === "busy";

  return (
    <div className="rounded-card border border-line bg-surface p-8">
      <h1 className="display-md text-ink">Sign in</h1>
      <p className="mt-2 text-sm text-mut">
        Use a password, or have a one-time link emailed to you.
      </p>

      {/* mode switch */}
      <div className="mt-6 flex gap-1 rounded-ctl border border-line bg-canvas p-1" role="tablist">
        {(["password", "link"] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => { setMode(m); setStatus("idle"); setMessage(""); }}
            className={`flex-1 rounded-[4px] py-1.5 text-[12.5px] font-medium transition-colors ${
              mode === m ? "bg-surface text-ink shadow-card" : "text-mut hover:text-ink"
            }`}
          >
            {m === "password" ? "Password" : "Email link"}
          </button>
        ))}
      </div>

      {(urlError || status === "error") && (
        <p className="mt-5 rounded-ctl border border-line bg-negweak px-4 py-3 text-sm text-neg">
          {message || ERRORS[urlError || ""] || "Something went wrong. Try again."}
        </p>
      )}

      <form onSubmit={mode === "password" ? signInWithPassword : sendLink} className="mt-5 space-y-4">
        <div className="space-y-2">
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
            className="w-full rounded-ctl border border-line bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
        </div>

        {mode === "password" && (
          <div className="space-y-2">
            <label htmlFor="password" className="block font-mono text-[11px] uppercase tracking-[.12em] text-mut">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-ctl border border-line bg-canvas px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-accent"
            />
            <p className="text-[12px] text-mut">
              Change it any time from Settings once you are in.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-ctl bg-accentstrong py-3 text-[15px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-60"
        >
          {busy ? "Working…" : mode === "password" ? "Sign in" : "Email me a sign-in link"}
        </button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-faint">
        New here? The email link creates your account. The free tier never expires and we
        don&apos;t ask for a card.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main id="main" className="flex min-h-[100dvh] items-center justify-center bg-canvas px-5 py-16">
      <div className="w-full max-w-[27rem]">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 font-semibold tracking-tight text-ink">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <circle cx="13" cy="13" r="11" stroke="var(--c-accent)" strokeWidth="2.2" />
            <circle cx="13" cy="13" r="5.5" stroke="var(--c-accent)" strokeWidth="2.2" />
            <circle cx="13" cy="13" r="1.8" fill="var(--c-accent)" />
          </svg>
          chinatrendsignal
        </Link>
        <Suspense fallback={<div className="rounded-card border border-line bg-surface p-8 text-sm text-mut">Loading…</div>}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-xs text-faint">
          <Link href="/" className="underline underline-offset-4 hover:text-mut">Back to the site</Link>
        </p>
      </div>
    </main>
  );
}
