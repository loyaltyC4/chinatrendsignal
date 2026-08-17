"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Settings. Grouped into three concerns with real save states on each, rather than
 * one giant form with a single button at the bottom that saves everything.
 * Labels sit above inputs; nothing uses placeholder-as-label.
 */
export default function SettingsForm({
  email,
  displayName,
  niches,
  weeklyEmail,
  mailerReady,
  allNiches,
}: {
  email: string;
  displayName: string;
  niches: string[];
  weeklyEmail: boolean;
  /** False when no email provider is configured, so the copy can say so plainly
   *  instead of promising a Monday email nothing will send. */
  mailerReady: boolean;
  allNiches: string[];
}) {
  const [name, setName] = useState(displayName);
  const [picked, setPicked] = useState<string[]>(niches);
  const [weekly, setWeekly] = useState(weeklyEmail);
  const [profileState, setProfileState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [profileMsg, setProfileMsg] = useState("");

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwState, setPwState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const [pwMsg, setPwMsg] = useState("");

  async function saveProfile() {
    setProfileState("busy");
    setProfileMsg("");
    try {
      const r = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name, niches: picked, weeklyEmail: weekly }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save");
      setProfileState("saved");
      setTimeout(() => setProfileState("idle"), 2500);
    } catch (e) {
      setProfileState("error");
      setProfileMsg(e instanceof Error ? e.message : "Could not save");
    }
  }

  async function savePassword() {
    if (pw.length < 10) {
      setPwState("error");
      setPwMsg("Use at least 10 characters.");
      return;
    }
    if (pw !== pw2) {
      setPwState("error");
      setPwMsg("The two passwords do not match.");
      return;
    }
    setPwState("busy");
    setPwMsg("");
    try {
      const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
      if (error) throw error;
      setPw("");
      setPw2("");
      setPwState("saved");
      setTimeout(() => setPwState("idle"), 3000);
    } catch (e) {
      setPwState("error");
      setPwMsg(e instanceof Error ? e.message : "Could not change the password");
    }
  }

  const toggle = (n: string) =>
    setPicked((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

  return (
    <div className="space-y-5">
      {/* PROFILE */}
      <section className="rounded-card border border-line bg-surface p-6">
        <h2 className="display-sm text-ink">Profile</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block font-mono text-[11px] uppercase tracking-[.1em] text-mut">
              Display name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-ctl border border-line bg-canvas px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block font-mono text-[11px] uppercase tracking-[.1em] text-mut">
              Email
            </label>
            <input
              id="email"
              value={email}
              readOnly
              className="w-full cursor-not-allowed rounded-ctl border border-line bg-surface2 px-3 py-2.5 text-[14px] text-mut"
            />
            <p className="text-[12px] text-mut">Changing your email is not self-serve yet.</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <span className="block font-mono text-[11px] uppercase tracking-[.1em] text-mut">
            Niches you care about
          </span>
          <p className="text-[12.5px] text-mut">
            We prioritise these in the nightly pull and lead with them in the weekly email.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {allNiches.length === 0 && (
              <span className="text-[13px] text-mut">No niches indexed yet.</span>
            )}
            {allNiches.map((n) => {
              const on = picked.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggle(n)}
                  aria-pressed={on}
                  className={`rounded-ctl border px-2.5 py-1.5 font-mono text-[11.5px] transition-colors ${
                    on ? "border-accent bg-accentweak text-accent" : "border-line text-mut hover:border-linestrong hover:text-ink"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-6 flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={weekly}
            onChange={(e) => setWeekly(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--c-accent)]"
          />
          <span>
            <span className="block text-[13.5px] text-ink">Send me the weekly brief</span>
            <span className="block text-[12.5px] text-mut">
              {mailerReady
                ? "One email, Monday evening, covering your niches only."
                : "Saved as a preference. Sending is not switched on yet, so no email will arrive until it is."}
            </span>
          </span>
        </label>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={saveProfile}
            disabled={profileState === "busy"}
            className="rounded-ctl bg-accentstrong px-4 py-2 text-[13px] font-medium text-onaccent transition-opacity hover:opacity-90 active:translate-y-px disabled:opacity-60"
          >
            {profileState === "busy" ? "Saving…" : "Save changes"}
          </button>
          {profileState === "saved" && <span className="font-mono text-[12px] text-pos">Saved</span>}
          {profileState === "error" && <span className="font-mono text-[12px] text-neg">{profileMsg}</span>}
        </div>
      </section>

      {/* PASSWORD */}
      <section className="rounded-card border border-line bg-surface p-6">
        <h2 className="display-sm text-ink">Password</h2>
        <p className="mt-1.5 max-w-[56ch] text-[13.5px] leading-relaxed text-body">
          If you were given a temporary password, change it here now. You can also keep using
          one-time email links instead.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="pw" className="block font-mono text-[11px] uppercase tracking-[.1em] text-mut">
              New password
            </label>
            <input
              id="pw"
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-ctl border border-line bg-canvas px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-accent"
            />
            <p className="text-[12px] text-mut">At least 10 characters.</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="pw2" className="block font-mono text-[11px] uppercase tracking-[.1em] text-mut">
              Confirm
            </label>
            <input
              id="pw2"
              type="password"
              autoComplete="new-password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="w-full rounded-ctl border border-line bg-canvas px-3 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={savePassword}
            disabled={pwState === "busy"}
            className="rounded-ctl border border-linestrong px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface2 active:translate-y-px disabled:opacity-60"
          >
            {pwState === "busy" ? "Updating…" : "Change password"}
          </button>
          {pwState === "saved" && <span className="font-mono text-[12px] text-pos">Password updated</span>}
          {pwState === "error" && <span className="font-mono text-[12px] text-neg">{pwMsg}</span>}
        </div>
      </section>

      {/* SESSION */}
      <section className="rounded-card border border-line bg-surface p-6">
        <h2 className="display-sm text-ink">Session</h2>
        <p className="mt-1.5 text-[13.5px] text-body">Sign out of this browser.</p>
        <button
          onClick={async () => {
            await supabaseBrowser().auth.signOut();
            window.location.href = "/";
          }}
          className="mt-4 rounded-ctl border border-linestrong px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface2 active:translate-y-px"
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
