import crypto from "node:crypto";

export type ValidateInitDataResult =
  | { ok: true }
  | { ok: false; reason: "no_init_data" | "no_token" | "no_hash" | "invalid_signature" | "parse_error" };

/**
 * Валидация initData от Telegram WebApp (HMAC-SHA256).
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * @see https://gist.github.com/konstantin24121/49da5d8023532d66cc4db1136435a885
 */
export function validateInitData(initData: string): ValidateInitDataResult {
  if (!initData || typeof initData !== "string") {
    return { ok: false, reason: "no_init_data" };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return { ok: false, reason: "no_token" };
  }

  try {
    const encoded = decodeURIComponent(initData);
    const arr = encoded.split("&");

    const hashIdx = arr.findIndex((s) => s.startsWith("hash="));
    if (hashIdx === -1) return { ok: false, reason: "no_hash" };

    const hash = arr[hashIdx]?.split("=")[1];
    arr.splice(hashIdx, 1);

    if (!hash) return { ok: false, reason: "no_hash" };

    arr.sort((a, b) => a.localeCompare(b));
    const dataCheckString = arr.join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
    const calculatedHash = crypto
      .createHmac("sha256", secret)
      .update(dataCheckString)
      .digest("hex");

    if (calculatedHash !== hash) {
      return { ok: false, reason: "invalid_signature" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "parse_error" };
  }
}

/**
 * Извлечь user из initData (без валидации — вызывать после validateInitData).
 */
export function parseInitDataUser(initData: string): {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
} | null {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get("user");
    if (!userStr) return null;
    const user = JSON.parse(decodeURIComponent(userStr)) as {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    return user?.id != null ? user : null;
  } catch {
    return null;
  }
}
