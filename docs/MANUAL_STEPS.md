# DevLife 8-bit — Шаги для ручного выполнения

Список действий, которые нужно сделать вручную (не автоматизированы через код).

---

## 1. Окружение

```bash
cp .env.local.example .env.local
```

Заполни в `.env.local`:

| Переменная | Описание |
|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon (public) ключ |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role ключ (серверный) |
| `TELEGRAM_BOT_TOKEN` | Токен бота для валидации initData |

---

## 2. Supabase

1. Создать проект на [supabase.com](https://supabase.com)
2. Применить миграцию: `supabase/migrations/001_players.sql`
   - Через Supabase Dashboard → SQL Editor
   - Или через CLI: `supabase db push`
3. (Опционально) Добавить RLS-политики для доступа по `telegram_id` (сейчас в миграции только `enable row level security`)

---

## 3. Telegram Bot

1. Создать бота через [@BotFather](https://t.me/BotFather)
2. Получить `TELEGRAM_BOT_TOKEN`
3. Настроить Mini App в BotFather:
   - `/mybots` → выбрать бота → Bot Settings → Menu Button
   - Указать URL мини-приложения (например `https://your-domain.vercel.app`)

---

## 4. UI-библиотеки

✅ **Уже установлено:** shadcn/ui + pixelact-ui (Button, Card, Badge, Dialog, Input).

Добавить ещё компоненты при необходимости:

```bash
npx shadcn@latest add "https://pixelactui.com/r/{name}.json"
# Пример: https://pixelactui.com/r/toast.json
```

---

## 5. Проверка

- `npm run dev` — запуск dev-сервера
- `npm run build` — сборка
- `npm run lint` — линтер

---

## Что уже реализовано в коде

- Константы (энергия, экономика, собеседование, Stars)
- Типы (GameEvent, SkillBranch, InterviewQuestion)
- Профессии и ветки навыков
- Формулы (доход, EXP, шанс собеседования)
- Пул событий (универсальные + фронтенд + senior)
- Вопросы для собеседования по профессиям
- API routes и страницы (заглушки, требуют доработки)
