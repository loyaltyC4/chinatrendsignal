import { CREDIT_COSTS, type AnalysisKind } from "./analysis-types";
import { isServiceRoleConfigured, supabaseAdmin } from "@/lib/supabase/admin";

// NOTE: the previous version read process.env.SUPABASE_URL, which is never set —
// the configured variable is NEXT_PUBLIC_SUPABASE_URL. It therefore always took the
// no-op branch and every paid action ran free. Both clients now come from one place.

export type CreditAction = AnalysisKind | "supplier_match" | "ask";

export const creditCost = (action: CreditAction) => CREDIT_COSTS[action];

export class InsufficientCredits extends Error {
  constructor(public required: number, public balance: number) {
    super("insufficient credits");
    this.name = "InsufficientCredits";
  }
}

/** Current balance for a user. Null when the ledger is not wired up. */
export async function creditBalance(userId: string): Promise<number | null> {
  if (!isServiceRoleConfigured()) return null;
  const { data, error } = await supabaseAdmin().rpc("credit_balance", { p_user_id: userId });
  if (error) return null;
  return typeof data === "number" ? data : null;
}

/**
 * Debit a user's ledger for an action.
 *
 * `userId` is the session identity from requireUser(), never a value from the
 * request body. The debit runs BEFORE the paid upstream call, so a failure to
 * charge cannot yield a free Claude/JustOne request; the caller refunds if the
 * upstream then fails. `reference` is unique in the schema, making retries
 * idempotent.
 */
export async function debitCredits(input: {
  userId: string;
  action: CreditAction;
  reference: string;
}): Promise<{ charged: boolean; amount: number; balance: number | null }> {
  const amount = creditCost(input.action);

  if (!isServiceRoleConfigured()) {
    // Never silently grant a free paid call.
    throw new Error("The credit ledger is not configured");
  }

  const { data, error } = await supabaseAdmin().rpc("debit_credits", {
    p_user_id: input.userId,
    p_delta: amount,
    p_action: input.action,
    p_reference: input.reference,
  });

  if (error) {
    if ((error.message || "").includes("insufficient credits")) {
      const balance = (await creditBalance(input.userId)) ?? 0;
      throw new InsufficientCredits(amount, balance);
    }
    throw new Error("Unable to debit credits");
  }

  return { charged: true, amount, balance: typeof data === "number" ? data : null };
}

/**
 * Return credits after a failed upstream call. Best-effort: a refund failure is
 * logged rather than thrown, because the user already has an error to read and
 * masking it with a second one helps nobody.
 */
export async function refundCredits(input: {
  userId: string;
  action: CreditAction;
  reference: string;
}) {
  if (!isServiceRoleConfigured()) return;
  try {
    await supabaseAdmin().from("credit_ledger").insert({
      user_id: input.userId,
      delta: creditCost(input.action),
      action: `refund:${input.action}`,
      reference: `refund:${input.reference}`,
    });
  } catch (err) {
    console.error("refundCredits failed", { reference: input.reference, err });
  }
}
