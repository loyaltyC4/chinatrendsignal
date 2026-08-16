import { NextRequest, NextResponse } from "next/server";
import { debitCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";

const BASE = "https://api.justoneapi.com";

export async function POST(req: NextRequest) {
  // Stopgap until auth + ledger enforcement land. See lib/guard.ts.
  const blocked = guardPaidRoute(req, "supplier-match", { limit: 10 });
  if (blocked) return blocked;

  const body = await req.json().catch(() => null) as { keyword?: string; userId?: string } | null;
  const keyword = body?.keyword?.trim();
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
  try {
    const debit = await debitCredits({ userId: body?.userId, action: "supplier_match", reference: crypto.randomUUID() });
    const [taobaoRes, wholesaleRes] = await Promise.all([
      fetch(`${BASE}/api/taobao/search-item-list/v1?token=${encodeURIComponent(token)}&keyword=${encodeURIComponent(keyword)}&page=1`, { signal: AbortSignal.timeout(90000) }),
      fetch(`${BASE}/api/1688/search-item-list/v1?token=${encodeURIComponent(token)}&keyword=${encodeURIComponent(keyword)}&page=1`, { signal: AbortSignal.timeout(90000) }),
    ]);
    const [taobao, wholesale] = await Promise.all([taobaoRes.json(), wholesaleRes.json()]);
    if (taobao.code !== 0 && wholesale.code !== 0) throw new Error(taobao.message || wholesale.message || "Supplier search failed");
    return NextResponse.json({ ok: true, keyword, data: { taobao: taobao.code === 0 ? taobao.data : null, wholesale1688: wholesale.code === 0 ? wholesale.data : null }, credit: debit });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Supplier match failed" }, { status: 500 });
  }
}
