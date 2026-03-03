import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { fulfillStarPayment } from "@/lib/game/stars-fulfill";

/**
 * POST /api/stars/fulfill
 * Body: { telegram_payment_charge_id: string, product_type: "energy_boost" | "full_restore" }
 * Вызывается после успешной оплаты (Mini App передаёт charge_id или webhook вызывает логику).
 * Идемпотентно по telegram_payment_charge_id.
 */
export async function POST(request: Request) {
  const telegramId = await getTelegramIdFromRequest(request);
  if (!telegramId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const chargeId =
    typeof body.telegram_payment_charge_id === "string"
      ? body.telegram_payment_charge_id.trim()
      : "";
  const productType =
    typeof body.product_type === "string" ? body.product_type.trim() : "";

  if (!chargeId || !productType) {
    return NextResponse.json(
      { ok: false, error: "Missing telegram_payment_charge_id or product_type" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const result = await fulfillStarPayment(supabase, telegramId, chargeId, productType);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? "Fulfill failed" },
      { status: result.error === "Player not found" ? 404 : 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    alreadyApplied: result.alreadyApplied,
    player: result.player,
  });
}
