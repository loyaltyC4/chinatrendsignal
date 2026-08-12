import { NextRequest, NextResponse } from "next/server";

// POST /api/listing — the real listing pipeline.
// Body: { url: string }  (a 1688 / Taobao / XHS product URL)
// Flow: fetch product via JustOne -> pick images -> (rembg + zh->en happen in a worker) -> listing draft.
// NOTE: rembg + the zh->en model run in a Python worker (see /workers/listing_worker.py), because they
// need native deps (onnxruntime, torch) that don't run in a Vercel Node function. This route
// orchestrates: it fetches product data, and if WORKER_URL is set it delegates the heavy image/MT
// work; otherwise it returns the product data with a clear "worker offline" note so the UI still renders.

const JUSTONE = process.env.JUSTONE_API_BASE || "https://api.justoneapi.com";
const TOKEN = process.env.JUSTONEAPI_TOKEN;
const WORKER_URL = process.env.LISTING_WORKER_URL; // e.g. a Railway/Render Python service

export async function POST(req: NextRequest) {
  const { url } = await req.json().catch(() => ({}));
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing product url" }, { status: 400 });
  }
  if (!TOKEN) {
    return NextResponse.json({ error: "Server missing JUSTONEAPI_TOKEN" }, { status: 500 });
  }

  // 1. Resolve platform + item id from the URL
  const platform = detectPlatform(url);
  const itemId = extractId(url);
  if (!platform || !itemId) {
    return NextResponse.json({ error: "Could not parse product URL — paste a full 1688/Taobao item link" }, { status: 422 });
  }

  // 2. Pull product detail from JustOne (cached upstream by them)
  const product = await fetchProduct(platform, itemId);
  if (!product) {
    return NextResponse.json({ error: "Product lookup failed — check the link or try again" }, { status: 502 });
  }

  // 3. Delegate image cleanup + translation to the worker if it's online
  let listing: any = null;
  if (WORKER_URL) {
    try {
      const r = await fetch(`${WORKER_URL}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: product.images, title: product.title, desc: product.desc }),
        signal: AbortSignal.timeout(60000),
      });
      if (r.ok) listing = await r.json();
    } catch { /* worker offline — fall through */ }
  }

  return NextResponse.json({
    ok: true,
    platform,
    itemId,
    product,
    listing,
    workerOnline: Boolean(listing),
    note: listing ? undefined : "Product pulled. Image cleanup + translation run in the listing worker (set LISTING_WORKER_URL).",
  });
}

function detectPlatform(url: string) {
  if (/1688\.com/.test(url)) return "1688";
  if (/taobao\.com|tmall\.com/.test(url)) return "taobao";
  return null;
}
function extractId(url: string) {
  const m = url.match(/(?:id|itemId|item_id)[=\/](\d{6,})/) || url.match(/(\d{8,})/);
  return m ? m[1] : null;
}

async function fetchProduct(platform: string, itemId: string) {
  const path = platform === "1688" ? `/api/1688/get-item-detail/v1` : `/api/taobao/get-item-detail/v3`;
  const u = `${JUSTONE}${path}?token=${TOKEN}&itemId=${itemId}`;
  const r = await fetch(u, { signal: AbortSignal.timeout(90000) });
  const j = await r.json();
  if (j.code !== 0 || !j.data) return null;
  const d = j.data;
  // normalize across platforms (field names differ)
  const images: string[] = d.images || d.imageList || d.item_imgs?.map((x: any) => x.url) || (d.pic_url ? [d.pic_url] : []);
  return {
    title: d.title || d.item_title || "",
    price: d.price || d.price_info?.price || d.promotion_price || "",
    currency: "CNY",
    images: images.slice(0, 6),
    desc: d.desc || d.description || "",
    seller: d.seller?.nick || d.shop?.name || d.nick || "",
    sales: d.sales || d.sold_quantity || d.deal_cnt || null,
    url: d.detail_url || d.item_url || "",
  };
}
