import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { answerPreCheckoutQuery } from "@/lib/telegram/bot-api";
import { fulfillStarPayment } from "@/lib/game/stars-fulfill";

interface TelegramUpdate {
  update_id?: number;
  pre_checkout_query?: {
    id: string;
    from?: { id: number };
    currency?: string;
    total_amount?: number;
    invoice_payload?: string;
  };
  message?: {
    message_id?: number;
    from?: { id: number };
    successful_payment?: {
      telegram_payment_charge_id: string;
      invoice_payload: string;
      total_amount?: number;
      currency?: string;
    };
  };
}

/**
 * POST /api/telegram/webhook
 * Принимает Update от Telegram Bot API.
 * - pre_checkout_query → answerPreCheckoutQuery(ok: true)
 * - message.successful_payment → начисляем энергию (fulfillStarPayment)
 * В BotFather задать Webhook URL: https://<your-domain>/api/telegram/webhook
 */
export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let update: TelegramUpdate;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (update.pre_checkout_query) {
    const { id } = update.pre_checkout_query;
    try {
      await answerPreCheckoutQuery(botToken, id, true);
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("[webhook] answerPreCheckoutQuery failed:", e);
      try {
        await answerPreCheckoutQuery(
          botToken,
          id,
          false,
          "Временная ошибка. Попробуйте позже."
        );
      } catch {
        // ignore
      }
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  const sp = update.message?.successful_payment;
  if (sp && update.message?.from?.id) {
    const telegramId = update.message.from.id;
    const chargeId = sp.telegram_payment_charge_id;
    const productType = sp.invoice_payload?.trim() || "";

    if (!chargeId || !productType) {
      console.error("[webhook] successful_payment missing charge_id or payload");
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = createAdminClient();
    const result = await fulfillStarPayment(supabase, telegramId, chargeId, productType);

    if (!result.ok) {
      console.error("[webhook] fulfillStarPayment failed:", result.error);
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
