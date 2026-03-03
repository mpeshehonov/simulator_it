# Монетизация Telegram Stars — Релиз 3

Оплата энергии через [Telegram Stars](https://core.telegram.org/bots/payments-stars). Используется токен бота из `TELEGRAM_BOT_TOKEN`.

## Что подключено

- **Миграция** `supabase/migrations/20250302130000_payments.sql` — таблица `payments` (идемпотентность по `telegram_payment_charge_id`).
- **Конфиг продуктов** `src/lib/game/stars.ts` — `energy_boost` (29 ⭐, +20 энергии), `full_restore` (9 ⭐, до 10).
- **Bot API** `src/lib/telegram/bot-api.ts` — `createInvoiceLink` (XTR, без provider_token), `answerPreCheckoutQuery`.
- **API**
  - `POST /api/stars` — авторизация по initData/cookie, body `{ productType }`. Создаёт инвойс через Bot API, возвращает `{ ok, invoice_url, price }`. Frontend вызывает `WebApp.openInvoice(invoice_url)`.
  - `POST /api/stars/fulfill` — body `{ telegram_payment_charge_id, product_type }`, начисляет энергию (вызывается вручную или при необходимости из Mini App после оплаты).
  - `POST /api/telegram/webhook` — принимает Update от Telegram: `pre_checkout_query` → подтверждаем; `message.successful_payment` → вызываем `fulfillStarPayment`.
- **Общая логика начисления** `src/lib/game/stars-fulfill.ts` — `fulfillStarPayment(supabase, telegramId, chargeId, productType)`.
- **UI** — блок «Буст энергии» на главной; по клику запрос к `POST /api/stars` и открытие инвойса.

## Настройка бота

1. **@BotFather** → бот → Payments → включить (для digital goods используется Telegram Stars, провайдер не нужен).
2. **Webhook** (обязательно для автоматического начисления после оплаты):
   - В BotFather или через API: `setWebhook` с URL `https://<ваш-домен>/api/telegram/webhook`.
   - Без webhook Telegram не пришлёт `successful_payment`, энергия не начислится автоматически.
3. **Переменная окружения** `TELEGRAM_BOT_TOKEN` — тот же токен, что для валидации initData и cookie.

## Цикл оплаты

1. Пользователь в Mini App нажимает «+20 энергии» или «Полное восстановление».
2. Frontend: `POST /api/stars` с `productType` и initData.
3. Backend: проверка продукта, вызов `createInvoiceLink` (Bot API), возврат `invoice_url`.
4. Frontend: `WebApp.openInvoice(invoice_url, callback)`.
5. Пользователь платит в интерфейсе Telegram.
6. Telegram шлёт на webhook `pre_checkout_query` → мы отвечаем `answerPreCheckoutQuery(ok: true)`.
7. Telegram шлёт на webhook `message.successful_payment` с `telegram_payment_charge_id` и `invoice_payload` (наш productType).
8. Webhook вызывает `fulfillStarPayment` → обновление энергии, запись в `payments`.
9. В Mini App по закрытию инвойса вызывается callback; при success вызываем `onPurchased()` (refresh игрока).

## Тестирование

- [Документация Telegram](https://core.telegram.org/bots/payments-stars): тестовое окружение, тестовые Stars.
- Убедиться, что webhook доступен по HTTPS и что в логах нет ошибок при `pre_checkout_query` / `successful_payment`.
