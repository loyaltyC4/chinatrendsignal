import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { buildDigest, digestAudience, weekReference } from "@/lib/digest";

/**
 * GET /api/cron/weekly — sends the weekly brief.
 *
 * Auth is the same shared-secret header the ingest cron uses. Three safeguards, each
 * because the failure it prevents is embarrassing in public:
 *  - `?preview=1` renders one digest and sends nothing, so the email can be reviewed.
 *  - email_sends has a unique (user_id, reference) pair keyed to the ISO week, so a
 *    retried cron cannot mail the same brief twice.
 *  - a digest with nothing in it is skipped rather than sent as an empty newsletter.
 *
 * Env: CRON_SECRET, RESEND_API_KEY, EMAIL_FROM.
 */
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 503 });
  }

  const audience = await digestAudience();
  const preview = req.nextUrl.searchParams.get("preview") === "1";
  const reference = weekReference();

  if (preview) {
    const first = audience[0];
    if (!first) return NextResponse.json({ mode: "preview", note: "Nobody is opted in yet." });
    const digest = await buildDigest(first as any);
    return NextResponse.json({
      mode: "preview",
      reference,
      audience: audience.length,
      sender: senderState(),
      digest: digest && { subject: digest.subject, empty: digest.empty, text: digest.text },
    });
  }

  const sender = senderState();
  if (!sender.configured) {
    return NextResponse.json(
      {
        error: "No email sender configured. Set RESEND_API_KEY and EMAIL_FROM.",
        audience: audience.length,
        reference,
      },
      { status: 503 },
    );
  }

  const db = supabaseAdmin();
  let sent = 0;
  let skipped = 0;
  const failures: Array<{ userId: string; reason: string }> = [];

  for (const profile of audience) {
    const digest = await buildDigest(profile as any);
    if (!digest || digest.empty) {
      skipped++;
      continue;
    }

    // Claim the send BEFORE calling the provider. If the insert conflicts, this week's
    // brief already went out; if the send then fails we record that on the same row.
    const { error: claimError } = await db
      .from("email_sends")
      .insert({ user_id: digest.userId, kind: "weekly", reference, status: "sending" });
    if (claimError) {
      skipped++;
      continue;
    }

    const result = await sendEmail({
      to: digest.email,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
    });

    await db
      .from("email_sends")
      .update({ status: result.ok ? "sent" : "failed", detail: result.ok ? null : result.error.slice(0, 300) })
      .eq("user_id", digest.userId)
      .eq("reference", reference);

    if (result.ok) sent++;
    else failures.push({ userId: digest.userId, reason: result.error });
  }

  return NextResponse.json({ reference, audience: audience.length, sent, skipped, failures });
}

function senderState() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  return { configured: Boolean(key && from), from: from ?? null };
}

async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false as const, error: `Resend ${res.status}: ${body}` };
    }
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "send failed" };
  }
}
