import { NextRequest, NextResponse } from "next/server";
import { debitCredits, refundCredits, InsufficientCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";
import { requireUser } from "@/lib/auth";

const BASE = "https://api.justoneapi.com";

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const blocked = await guardPaidRoute(req, "supplier-match", { identity: user.id, limit: 30 });
  if (blocked) return blocked;

  // Accept JSON or a classic form post, so a progressively-enhanced form still works.
  let keyword = "";
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null) as { keyword?: string } | null;
    keyword = body?.keyword?.trim() || "";
  } else {
    const form = await req.formData().catch(() => null);
    keyword = (form?.get("keyword") as string | null)?.trim() || "";
  }
  if (!keyword) {
    return NextResponse.json({ error: "A product keyword is required" }, { status: 400 });
  }

  const token = process.env.JUSTONEAPI_TOKEN;
  if (!token) {
    return NextResponse.json({
      setupRequired: true,
      error: "Supplier matching is not activated yet",
      instructions: "Add JUSTONEAPI_TOKEN in Vercel environment variables for Production and Preview.",
      creditCost: 3,
    }, { status: 503 });
  }

  const reference = crypto.randomUUID();
  let debit;
  try {
    debit = await debitCredits({ userId: user.id, action: "supplier_match", reference });
  } catch (error) {
    if (error instanceof InsufficientCredits) {
      return NextResponse.json({
        error: "Not enough credits for a supplier match.",
        required: error.required,
        balance: error.balance,
      }, { status: 402 });
    }
    return NextResponse.json({ error: "Could not charge credits" }, { status: 500 });
  }

  try {
    const [taobaoRes, wholesaleRes] = await Promise.all([
      fetch(`${BASE}/api/taobao/search-item-list/v1?token=${encodeURIComponent(token)}&keyword=${encodeURIComponent(keyword)}&page=1`, { signal: AbortSignal.timeout(90000) }),
      fetch(`${BASE}/api/1688/search-item-list/v1?token=${encodeURIComponent(token)}&keyword=${encodeURIComponent(keyword)}&page=1`, { signal: AbortSignal.timeout(90000) }),
    ]);
    const [taobao, wholesale] = await Promise.all([taobaoRes.json(), wholesaleRes.json()]);
    if (taobao.code !== 0 && wholesale.code !== 0) throw new Error(taobao.message || wholesale.message || "Supplier search failed");
    return NextResponse.json({
      ok: true,
      keyword,
      data: {
        taobao: taobao.code === 0 ? taobao.data : null,
        wholesale1688: wholesale.code === 0 ? wholesale.data : null,
      },
      credit: debit,
    });
  } catch (error) {
    await refundCredits({ userId: user.id, action: "supplier_match", reference });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Supplier match failed" }, { status: 500 });
  }
}
