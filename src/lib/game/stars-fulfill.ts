import type { SupabaseClient } from "@supabase/supabase-js";
import { rowToPlayer } from "@/lib/db/player";
import {
  getStarProductConfig,
  applyStarProductEnergy,
  type StarProductType,
} from "@/lib/game/stars";
import { findPaymentByChargeId, insertPayment } from "@/lib/db/payments";
import type { Player } from "@/types/player";

export interface FulfillResult {
  ok: boolean;
  alreadyApplied?: boolean;
  player?: Player | null;
  error?: string;
}

/**
 * Начислить энергию за платёж Stars (идемпотентно по telegram_payment_charge_id).
 * Используется из POST /api/stars/fulfill и из webhook при successful_payment.
 */
export async function fulfillStarPayment(
  supabase: SupabaseClient,
  telegramId: number,
  chargeId: string,
  productType: string
): Promise<FulfillResult> {
  const config = getStarProductConfig(productType);
  if (!config) {
    return { ok: false, error: "Invalid product_type" };
  }

  const existing = await findPaymentByChargeId(supabase, chargeId);
  if (existing) {
    const { data: row } = await supabase
      .from("players")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();
    return { ok: true, alreadyApplied: true, player: row ? rowToPlayer(row) : null };
  }

  const { data: row, error: fetchError } = await supabase
    .from("players")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  if (fetchError || !row) {
    return { ok: false, error: "Player not found" };
  }

  const newEnergy = applyStarProductEnergy(row.energy, productType as StarProductType);

  const { error: updateError } = await supabase
    .from("players")
    .update({
      energy: newEnergy,
      energy_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("telegram_id", telegramId);

  if (updateError) {
    return { ok: false, error: "Failed to update energy" };
  }

  const { error: insertError } = await insertPayment(supabase, {
    telegramId,
    productType: productType as StarProductType,
    amountStars: config.price,
    telegramPaymentChargeId: chargeId,
  });

  if (insertError) {
    return { ok: false, error: "Failed to record payment" };
  }

  const { data: updatedRow } = await supabase
    .from("players")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  return { ok: true, player: updatedRow ? rowToPlayer(updatedRow) : null };
}
