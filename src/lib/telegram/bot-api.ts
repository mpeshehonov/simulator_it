/**
 * Вызовы Telegram Bot API для платежей (Stars).
 * @see https://core.telegram.org/bots/payments-stars
 * @see https://core.telegram.org/bots/api#createinvoicelink
 */

const BOT_API_BASE = "https://api.telegram.org/bot";

export interface CreateInvoiceLinkParams {
  title: string;
  description: string;
  /** 1–128 bytes, для digital goods — передаём productType */
  payload: string;
  /** Для Stars — ровно один элемент */
  prices: { label: string; amount: number }[];
}

/**
 * Создать ссылку на инвойс (Telegram Stars, currency XTR).
 * provider_token для XTR не передаём (omit).
 */
export async function createInvoiceLink(
  botToken: string,
  params: CreateInvoiceLinkParams
): Promise<string> {
  const url = `${BOT_API_BASE}${botToken}/createInvoiceLink`;
  const body: Record<string, unknown> = {
    title: params.title.slice(0, 32),
    description: params.description.slice(0, 255),
    payload: params.payload.slice(0, 128),
    currency: "XTR",
    prices: params.prices,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    result?: string;
    description?: string;
  };

  if (!res.ok || !data.ok || typeof data.result !== "string") {
    throw new Error(data.description ?? "createInvoiceLink failed");
  }

  return data.result;
}

/**
 * Ответ на pre_checkout_query (подтвердить или отменить оплату).
 * @see https://core.telegram.org/bots/api#answerprecheckoutquery
 */
export async function answerPreCheckoutQuery(
  botToken: string,
  preCheckoutQueryId: string,
  ok: boolean,
  errorMessage?: string
): Promise<void> {
  const url = `${BOT_API_BASE}${botToken}/answerPreCheckoutQuery`;
  const body: Record<string, unknown> = {
    pre_checkout_query_id: preCheckoutQueryId,
    ok,
  };
  if (!ok && errorMessage) body.error_message = errorMessage;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.description ?? "answerPreCheckoutQuery failed");
  }
}
