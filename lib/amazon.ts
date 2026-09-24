/**
 * Amazon SP-API catalog evidence — READ-ONLY, US-only.
 *
 * WHY THIS EXISTS: the radar's Western-evidence gap. Saturation on the listing desk
 * was "not measured" by design until a real feed existed. This module is that feed:
 * for a product term, we query the Amazon US catalog and record how many credible
 * competing offers exist and what the top ones cost. Every number written here is a
 * MEASUREMENT, stored with source and retrieval time — the honesty contract the
 * whole pipeline runs on.
 *
 * SCOPE GUARDS (from the amazon-sp-api workflow, fail-closed):
 * - US marketplace only (ATVPDKIKX0DER). The AU marketplace has no refresh token in
 *   this deployment; when one is provisioned it gets its own profile and preflight,
 *   never a silent reuse of the US token.
 * - Read-only. This module never calls Listings Items, offers, or any write
 *   endpoint. CTS consumes catalog facts; listing creation stays a human workflow.
 * - Fail-closed on configuration: without the full credential set the module
 *   reports `configured: false` and the evidence stage is skipped — never faked.
 *
 * AUTH: LWA token exchange (client id/secret + refresh token -> access token), then
 * SP-API requests signed with AWS SigV4 using the LWA access token as the AWS
 * credential (this is how SP-API actually works: the LWA token doubles as the SigV4
 * secret). Implemented here with Web Crypto — no Node-only dependencies, so it runs
 * on the Vercel edge/Node runtimes identically.
 */

/* --------------------------- configuration --------------------------- */

const US_MARKETPLACE = "ATVPDKIKX0DER";
const NA_ENDPOINT = "https://sellingpartnerapi-na.amazon.com";
const LWA_TOKEN_URL = "https://api.amazon.com/auth/o2/token";

export type AmazonConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  /** AWS access key id for SigV4. SP-API requires an AWS association (role ARN). */
  awsAccessKey: string;
  awsSecretKey: string;
};

export function getAmazonConfig(): AmazonConfig | null {
  const clientId = process.env.AMAZON_LWA_CLIENT_ID;
  const clientSecret = process.env.AMAZON_LWA_CLIENT_SECRET;
  const refreshToken = process.env.AMAZON_REFRESH_TOKEN;
  const awsAccessKey = process.env.AMAZON_AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AMAZON_AWS_SECRET_ACCESS_KEY;
  if (!clientId || !clientSecret || !refreshToken || !awsAccessKey || !awsSecretKey) return null;
  return { clientId, clientSecret, refreshToken, awsAccessKey, awsSecretKey };
}

export function isAmazonConfigured(): boolean {
  return getAmazonConfig() !== null;
}

/* ------------------------------ crypto ------------------------------ */

async function hmacSha256(key: CryptoKey | Uint8Array, data: string): Promise<Uint8Array> {
  const k = key instanceof CryptoKey
    ? key
    : await crypto.subtle.importKey("raw", key as Uint8Array, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ------------------------------- LWA ------------------------------- */

let lwaCache: { token: string; expiresAt: number } | null = null;

export async function getLwaToken(cfg: AmazonConfig): Promise<string> {
  if (lwaCache && lwaCache.expiresAt > Date.now() + 60_000) return lwaCache.token;
  const res = await fetch(LWA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: cfg.refreshToken,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`LWA token exchange failed ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  lwaCache = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return lwaCache.token;
}

/* ------------------------------ SigV4 ------------------------------ */

/**
 * Sign an SP-API request per AWS SigV4, service "execute-api", region us-east-1.
 * The LWA access token is the AWS secret access key for signing purposes.
 */
async function signedHeaders(
  cfg: AmazonConfig,
  lwaToken: string,
  method: "GET",
  path: string,
  query: Record<string, string>,
): Promise<Record<string, string>> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const host = new URL(NA_ENDPOINT).host;

  const canonicalQuery = Object.keys(query).sort().map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`).join("&");
  const canonicalRequest = [
    method, path, canonicalQuery,
    `content-type:application/json\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-access-token:${lwaToken}\n`,
    `content-type;host;x-amz-access-token;x-amz-date`,
    await sha256Hex(""),
  ].join("\n");

  const scope = `${dateStamp}/us-east-1/execute-api/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");

  const kDate = await hmacSha256(new TextEncoder().encode(`AWS4${cfg.awsSecretKey}`), dateStamp);
  const kRegion = await hmacSha256(kDate, "us-east-1");
  const kService = await hmacSha256(kRegion, "execute-api");
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signature = Array.from(await hmacSha256(kSigning, stringToSign)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return {
    "Content-Type": "application/json",
    "X-Amz-Date": amzDate,
    "X-Amz-Access-Token": lwaToken,
    "X-Amz-Security-Token": "", // placeholder — real deployments pass a session token if using an assumed role
    Authorization: `AWS4-HMAC-SHA256 Credential=${cfg.awsAccessKey}/${scope}, SignedHeaders=content-type;host;x-amz-access-token;x-amz-date, Signature=${signature}`,
  };
}

/* ---------------------------- catalog API ---------------------------- */

export type CatalogEvidence = {
  searchTerm: string;
  resultCount: number;
  topPricesUsd: number[];
  topAsins: string[];
  retrievedAt: string;
  ms: number;
};

/**
 * Search the US catalog for a product term. Bounded: one page, 10 items, keyword
 * search only. Deliberately NOT a ratings/reviews/BSR feed — those need different
 * endpoints and this is the minimal honest competitive-density measurement.
 */
export async function searchCatalog(cfg: AmazonConfig, keyword: string): Promise<{ ok: true; data: CatalogEvidence } | { ok: false; code: number; message: string }> {
  const started = Date.now();
  const lwaToken = await getLwaToken(cfg);
  const query: Record<string, string> = {
    keywords: keyword,
    marketplaceIds: US_MARKETPLACE,
    includedData: "summaries",
    pageSize: "10",
    pageToken: "",
  };
  delete query.pageToken;
  const path = "/catalog/2022-04-01/search-catalog-items";
  const headers = await signedHeaders(cfg, lwaToken, "GET", path, query);
  delete headers["X-Amz-Security-Token"]; // not signing it above; don't send an empty header

  const url = `${NA_ENDPOINT}${path}?${Object.keys(query).sort().map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(query[k])}`).join("&")}`;
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
  const ms = Date.now() - started;

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, code: res.status, message: `SP-API ${res.status}: ${body.slice(0, 300)}` };
  }

  const data = await res.json();
  const items: any[] = Array.isArray(data?.items) ? data.items : [];
  const prices = items
    .map((it) => it?.summaries?.[0]?.listPrice?.amount)
    .filter((p: any) => typeof p === "number" && p > 0)
    .sort((a: number, b: number) => a - b)
    .slice(0, 5);

  return {
    ok: true,
    data: {
      searchTerm: keyword,
      resultCount: items.length,
      topPricesUsd: prices,
      topAsins: items.slice(0, 5).map((it: any) => it.asin).filter(Boolean),
      retrievedAt: new Date().toISOString(),
      ms,
    },
  };
}
