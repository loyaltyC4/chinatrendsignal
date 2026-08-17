import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { supabaseAdmin, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { getRadar } from "@/lib/signals";

/**
 * GET /api/export — the radar as a CSV, for Operator plans and admins.
 *
 * Export is a paid feature, so the gate lives on the server. The file mirrors what
 * the interface shows, including the honesty rules: an unknown value is an empty
 * cell, never a zero, and the spread column is named `spread_est` so a number we
 * inferred cannot be mistaken for one we measured downstream in a spreadsheet.
 */
export const dynamic = "force-dynamic";

const HEAD = [
  "product",
  "chinese_term",
  "niche",
  "platforms",
  "stage",
  "velocity_pct",
  "intent_score",
  "saves_per_like",
  "wholesale_cny",
  "implied_retail_aud",
  "spread_est",
  "first_detected_at",
  "days_tracked",
  "source_url",
];

function cell(v: unknown) {
  if (v === null || v === undefined || v === "") return "";
  const s = String(v);
  // Prefix formula-leading characters so a cell cannot execute in a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  let plan = "scout";
  let role = "member";
  if (isServiceRoleConfigured()) {
    const { data } = await supabaseAdmin().from("profiles").select("plan, role").eq("id", user!.id).maybeSingle();
    plan = data?.plan ?? "scout";
    role = data?.role ?? "member";
  }
  if (plan !== "operator" && role !== "admin") {
    return NextResponse.json(
      { error: "CSV export is included with the Operator plan.", upgrade: "/settings/billing" },
      { status: 403 },
    );
  }

  const niche = req.nextUrl.searchParams.get("niche");
  const { rows, source } = await getRadar(500);
  const visible = niche ? rows.filter((r) => r.niche === niche) : rows;

  const lines = [HEAD.join(",")];
  for (const r of visible) {
    const spread = r.wholesaleCny > 0 && r.retailAud > 0 ? (r.retailAud / (r.wholesaleCny * 0.213)).toFixed(2) : "";
    lines.push(
      [
        r.product,
        r.zh,
        r.niche,
        (r.sources ?? []).join(" | "),
        r.stage,
        r.velocityPct,
        r.intent > 0 ? r.intent : "",
        r.savesRatio != null ? r.savesRatio.toFixed(3) : "",
        r.wholesaleCny > 0 ? r.wholesaleCny : "",
        r.retailAud > 0 ? r.retailAud : "",
        spread,
        r.firstDetectedAt ?? "",
        r.daysTracked ?? "",
        r.sourceUrl ?? "",
      ]
        .map(cell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const name = `china-trend-signal-${source === "seed" ? "sample-" : ""}${stamp}.csv`;

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "no-store",
    },
  });
}
