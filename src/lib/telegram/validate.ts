import crypto from "node:crypto";

/**
 * Валидация initData от Telegram WebApp (HMAC-SHA256).
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData: string): boolean {
  if (!initData || typeof initData !== "string") return false;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    params.delete("hash");

    if (!hash) return false;

    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");

    const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();

    const calculatedHash = crypto
      .createHmac("sha256", secret)
      .update(dataCheckString)
      .digest("hex");

    return calculatedHash === hash;
  } catch {
    return false;
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
