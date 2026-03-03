import type { SupabaseClient } from "@supabase/supabase-js";
import type { StarProductType } from "@/lib/game/stars";

export interface PaymentRow {
  id: string;
  telegram_id: number;
  product_type: string;
  amount_stars: number;
  telegram_payment_charge_id: string | null;
  created_at: string;
}

/**
 * Найти платёж по ID заряда Telegram (идемпотентность).
 */
export async function findPaymentByChargeId(
  supabase: SupabaseClient,
  telegramPaymentChargeId: string
): Promise<PaymentRow | null> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("telegram_payment_charge_id", telegramPaymentChargeId)
    .single();
  if (error || !data) return null;
  return data as PaymentRow;
}

/**
 * Записать платёж после успешного начисления.
 */
export async function insertPayment(
  supabase: SupabaseClient,
  params: {
    telegramId: number;
    productType: StarProductType;
    amountStars: number;
    telegramPaymentChargeId: string | null;
  }
): Promise<{ error: unknown }> {
  const { error } = await supabase.from("payments").insert({
    telegram_id: params.telegramId,
    product_type: params.productType,
    amount_stars: params.amountStars,
    telegram_payment_charge_id: params.telegramPaymentChargeId,
  });
  return { error };
}
