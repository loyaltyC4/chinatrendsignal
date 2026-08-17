import { NextRequest, NextResponse } from "next/server";
import { debitCredits, refundCredits, InsufficientCredits } from "@/lib/credits";
import { guardPaidRoute } from "@/lib/guard";
import { requireUser } from "@/lib/auth";
import { isJustOneConfigured, wholesaleSearch, taobaoSearch, type JustOneResult } from "@/lib/justone";

/**
 * POST /api/supplier-match — read live 1688 and Taobao listings for a keyword.
 *
 * Rewritten to go through lib/justone rather than raw fetch, for one reason: the raw
 * version surfaced the provider's own string to the user, so an empty account balance
 * on OUR data provider rendered in the interface as the bare words "INSUFFICIENT
 * BALANCE" next to a credits panel. A user can only read that as "my credits ran out",
 * which is both alarming and false. Provider faults are now translated, marked as ours,
 * and state plainly that the credits were returned.
 */
export const maxDuration = 60;

/** Turns a provider failure into something a customer can act on. */
function explain(code: number, message: string) {
  if (code === 601 || /insufficient balance/i.test(message)) {
    return {
      text: "Our supplier-data provider is out of quota, so we could not read 1688 right now. This is on us, not your account — your credits have been returned.",
      ours: true,
    };
  }
  if (code === 600) {
    return {
      text: "Our access to this supplier endpoint is not enabled. Your credits have been returned and we are on it.",
      ours: true,
    };
  }
  if (code === -4) {
    return {
      text: "The supplier lookup timed out before 1688 answered. Your credits have been returned — try again in a minute.",
      ours: true,
    };
  }
  return {
    text: `We could not complete the supplier search (${message}). Your credits have been returned.`,
    ours: true,
  };
}

export async function POST(req: NextRequest) {
  const { user, error: authError } = await requireUser();
  if (authError) return authError;

  const blocked = await guardPaidRoute(req, "supplier-match", { identity: user.id, limit: 30 });
  if (blocked) return blocked;

  // Accept JSON or a classic form post, so a progressively-enhanced form still works.
  let keyword = "";
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as { keyword?: string } | null;
    keyword = body?.keyword?.trim() || "";
  } else {
    const form = await req.formData().catch(() => null);
    keyword = (form?.get("keyword") as string | null)?.trim() || "";
  }
  if (!keyword) {
    return NextResponse.json({ error: "A product keyword is required" }, { status: 400 });
  }

  if (!isJustOneConfigured()) {
    return NextResponse.json(
      {
        setupRequired: true,
        error: "Supplier matching is not activated yet",
        instructions: "Add JUSTONEAPI_TOKEN in Vercel environment variables for Production and Preview.",
        creditCost: 3,
      },
      { status: 503 },
    );
  }

  const reference = crypto.randomUUID();
  let debit;
  try {
    debit = await debitCredits({ userId: user.id, action: "supplier_match", reference });
  } catch (error) {
    if (error instanceof InsufficientCredits) {
      return NextResponse.json(
        {
          error: `Not enough credits for a supplier match. It costs ${error.required} and you have ${error.balance}.`,
          required: error.required,
          balance: error.balance,
        },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: "Could not charge credits" }, { status: 500 });
  }

  let wholesale: JustOneResult<any>;
  let taobao: JustOneResult<any>;
  try {
    [wholesale, taobao] = await Promise.all([wholesaleSearch(keyword), taobaoSearch(keyword)]);
  } catch (error) {
    await refundCredits({ userId: user.id, action: "supplier_match", reference });
    return NextResponse.json(
      { error: "The supplier lookup failed before it reached 1688. Your credits have been returned.", ours: true },
      { status: 502 },
    );
  }

  // Both sides down is a failure. One side down still gives a usable answer, so it is
  // returned with a note rather than thrown away after charging for it.
  if (!wholesale.ok && !taobao.ok) {
    await refundCredits({ userId: user.id, action: "supplier_match", reference });
    const detail = explain(wholesale.code, wholesale.message);
    return NextResponse.json({ error: detail.text, ours: detail.ours, code: wholesale.code }, { status: 502 });
  }

  return NextResponse.json({
    ok: true,
    keyword,
    partial: !wholesale.ok || !taobao.ok,
    note: !wholesale.ok
      ? "Taobao answered but 1688 did not, so retail comparators are shown without factory prices."
      : !taobao.ok
        ? "1688 answered but Taobao did not, so factory prices are shown without retail comparators."
        : null,
    data: {
      taobao: taobao.ok ? taobao.data : null,
      wholesale1688: wholesale.ok ? wholesale.data : null,
    },
    credit: debit,
  });
}
