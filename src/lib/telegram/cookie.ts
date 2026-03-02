import crypto from "node:crypto";

const COOKIE_NAME = "devlife_player";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

function getSecret(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN required for cookie signing");
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signPlayerCookie(telegramId: number): string {
  const payload = telegramId.toString();
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyPlayerCookie(value: string): number | null {
  if (!value || !value.includes(".")) return null;
  const [payload, sig] = value.split(".");
  const telegramId = parseInt(payload ?? "", 10);
  if (isNaN(telegramId)) return null;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload ?? "")
    .digest("hex");
  return expected === sig ? telegramId : null;
}

export function getPlayerCookieHeader(telegramId: number): string {
  const value = signPlayerCookie(telegramId);
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

export { COOKIE_NAME };
