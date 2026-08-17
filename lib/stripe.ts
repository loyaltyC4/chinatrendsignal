/**
 * Minimal Stripe client over fetch.
 *
 * No SDK on purpose. We use three endpoints (customers, checkout sessions, billing
 * portal sessions), the REST surface is stable, and the official package pulls a
 * large dependency into every serverless bundle for those three calls. The signature
 * verification the webhook needs is 20 lines of node:crypto, already written.
 *
 * Everything is keyed off env, so one build works against test and live keys.
 */

const API = "https://api.stripe.com/v1";

export type PaidPlan = "hunter" | "operator";

export function stripeSecret() {
  return process.env.STRIPE_SECRET_KEY;
}

export function priceIdFor(plan: PaidPlan) {
  return plan === "hunter" ? process.env.STRIPE_PRICE_HUNTER : process.env.STRIPE_PRICE_OPERATOR;
}

/** True only when we could actually complete a checkout. The billing page reads this
 *  and disables the buttons rather than sending someone into a broken flow. */
export function isStripeConfigured() {
  return Boolean(stripeSecret() && (process.env.STRIPE_PRICE_HUNTER || process.env.STRIPE_PRICE_OPERATOR));
}

export function isPlanPurchasable(plan: PaidPlan) {
  return Boolean(stripeSecret() && priceIdFor(plan));
}

/** Stripe takes form-encoded bodies with bracketed paths for nesting. */
function encode(params: Record<string, unknown>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") out.push(...encode(item as Record<string, unknown>, `${key}[${i}]`));
        else out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
      });
    } else if (typeof v === "object") {
      out.push(...encode(v as Record<string, unknown>, key));
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return out;
}

export class StripeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "StripeError";
  }
}

export async function stripePost<T = any>(
  path: string,
  params: Record<string, unknown>,
  opts: { idempotencyKey?: string } = {},
): Promise<T> {
  const key = stripeSecret();
  if (!key) throw new StripeError("Stripe is not configured", 503);

  const headers: Record<string, string> = {
    authorization: `Bearer ${key}`,
    "content-type": "application/x-www-form-urlencoded",
  };
  // Retrying a create without this can produce two subscriptions for one intent.
  if (opts.idempotencyKey) headers["idempotency-key"] = opts.idempotencyKey;

  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers,
    body: encode(params).join("&"),
  });

  const json = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    // Stripe's own message is safe to surface: it is written for the merchant.
    throw new StripeError(json?.error?.message ?? `Stripe returned ${res.status}`, res.status);
  }
  return json as T;
}
