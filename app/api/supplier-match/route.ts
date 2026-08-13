import { NextRequest, NextResponse } from "next/server";
import { debitCredits } from "@/lib/credits";

const BASE = "https://api.justoneapi.com";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { imageUrl?: string; userId?: string } | null;
  if (!body?.imageUrl || !/^https?:\/\//.test(body.imageUrl)) {
    return NextResponse.json({ error: "A publicly reachable image URL is required" }, { status: 400 });
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
    const debit = await debitCredits({ userId: body.userId, action: "supplier_match", reference: crypto.randomUUID() });
    // Official enabled endpoint: POST /api/taobao/item_search_img/v1 with imageUrl in JSON body.
    const url = `${BASE}/api/taobao/item_search_img/v1?token=${encodeURIComponent(token)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ imageUrl: body.imageUrl }),
      signal: AbortSignal.timeout(90000),
    });
    const payload = await response.json();
    if (payload.code !== 0) throw new Error(payload.message || "Supplier search failed");
    return NextResponse.json({ ok: true, source: "taobao/search-by-image", data: payload.data, credit: debit });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Supplier match failed" }, { status: 500 });
  }
}
