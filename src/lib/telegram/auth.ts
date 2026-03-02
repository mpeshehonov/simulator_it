import { cookies } from "next/headers";
import { validateInitData, parseInitDataUser } from "./validate";
import { verifyPlayerCookie, COOKIE_NAME, getPlayerCookieHeader } from "./cookie";

export { getPlayerCookieHeader };

/**
 * Получить telegram_id из запроса:
 * 1. Сначала из подписанной cookie (после /api/auth/telegram)
 * 2. Иначе из заголовка X-Telegram-Init-Data (валидация + парсинг)
 */
export async function getTelegramIdFromRequest(request: Request): Promise<number | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (cookie) {
    const id = verifyPlayerCookie(cookie);
    if (id != null) return id;
  }

  const initData = request.headers.get("x-telegram-init-data");
  if (initData && validateInitData(initData).ok) {
    const user = parseInitDataUser(initData);
    return user?.id ?? null;
  }

  return null;
}
