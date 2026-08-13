import { CREDIT_COSTS, type AnalysisKind } from "./analysis-types";

// Credit ledger adapter. Until Supabase is configured, routes intentionally return setup mode
// instead of pretending a balance was charged. Once the env vars exist, each debit is durable.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const creditCost = (action: AnalysisKind | "supplier_match") => CREDIT_COSTS[action];

export async function debitCredits(input: { userId?: string; action: AnalysisKind | "supplier_match"; reference?: string }) {
  const amount = creditCost(input.action);
  if (!SUPABASE_URL || !SUPABASE_KEY || !input.userId) {
    return { charged: false, setupRequired: true, amount };
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/debit_credits`, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: JSON.stringify({ p_user_id: input.userId, p_delta: amount, p_action: input.action, p_reference: input.reference || null }),
  });
  if (!response.ok) throw new Error("Unable to debit credits");
  const result = await response.json();
  return { charged: true, setupRequired: false, amount, balance: result };
}
