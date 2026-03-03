import { NextResponse } from "next/server";
import { getTelegramIdFromRequest } from "@/lib/telegram/auth";
import { getStarProductConfig } from "@/lib/game/stars";
import { createInvoiceLink } from "@/lib/telegram/bot-api";

const PRODUCT_TITLES: Record<string, string> = {
  energy_boost: "Буст энергии",
  full_restore: "Полное восстановление",
};

const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  energy_boost: "+20 энергии в Симулятор айтишника",
  full_restore: "Восстановить энергию до 10 в Симулятор айтишника",
};

/**
 * POST /api/stars
 * Body: { productType: "energy_boost" | "full_restore" }
 * Создаёт инвойс через Bot API (createInvoiceLink), возвращает invoice_url для WebApp.openInvoice.
 * Для digital goods используем валюту XTR (Telegram Stars), provider_token не передаём.
 */
export async function POST(request: Request) {
  const telegramId = await getTelegramIdFromRequest(request);
  if (!telegramId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productType = typeof body.productType === "string" ? body.productType.trim() : "";

  const config = getStarProductConfig(productType);
  if (!config) {
    return NextResponse.json(
      { ok: false, error: "Invalid productType. Use energy_boost or full_restore" },
      { status: 400 }
    );
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json(
      { ok: false, error: "Payments not configured (TELEGRAM_BOT_TOKEN)" },
      { status: 503 }
    );
  }

  try {
    const invoiceUrl = await createInvoiceLink(botToken, {
      title: PRODUCT_TITLES[productType] ?? config.productType,
      description: PRODUCT_DESCRIPTIONS[productType] ?? "",
      payload: productType,
      prices: [{ label: "Энергия", amount: config.price }],
    });

    return NextResponse.json({
      ok: true,
      productType: config.productType,
      price: config.price,
      invoice_url: invoiceUrl,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "createInvoiceLink failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
