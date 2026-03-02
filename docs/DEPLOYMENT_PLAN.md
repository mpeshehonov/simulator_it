# DevLife 8-bit — План деплоя на Vercel

Цель: задеплоить игру и базово запустить её (игра в Telegram Mini App или в браузере).

---

## Текущее состояние

| Компонент              | Статус                     |
|------------------------|----------------------------|
| UI (pixelact, главная) | ✅ Готово                  |
| Игровая логика         | ✅ Формулы, события, вопросы |
| Supabase client/server | ✅ createBrowserClient + createAdminClient |
| Telegram validate      | ✅ HMAC initData + cookie auth |
| useTelegram            | ✅ WebApp, initData        |
| API /auth/telegram     | ✅ Валидация, create/fetch player, cookie |
| API /player            | ✅ GET по cookie/initData  |
| API /player/action     | ✅ learn, task, rest       |
| usePlayer              | ✅ fetch, doAction         |
| Главная страница       | ✅ usePlayer + действия    |

---

## Этап 1: Инфраструктура

### 1.1 Репозиторий

- [ ] Убедиться, что `.env.local` в `.gitignore` и не попадает в репозиторий
- [ ] В `.env.local.example` оставить только шаблон без реальных ключей
- [ ] Запушить проект в GitHub (если ещё не запушен)

### 1.2 Supabase

- [ ] Создать проект на [supabase.com](https://supabase.com) (или использовать существующий)
- [ ] Применить миграцию: `supabase/migrations/001_players.sql`  
  - Supabase Dashboard → SQL Editor → вставить содержимое файла → Run
- [ ] Включить доступ к таблице `players`:
  - Вариант A: временно отключить RLS для быстрого старта (Settings → API → RLS: disable)
  - Вариант B: добавить политики (см. ниже)
- [ ] Скопировать `Project URL` и ключи из Settings → API

### 1.3 RLS-политики (опционально, если RLS включён)

```sql
-- Разрешить чтение/запись по telegram_id (если auth через JWT с telegram_id в claims)
-- Или временно: разрешить service_role всё (уже есть через сервисный ключ)
create policy "Service role full access" on public.players
  for all using (auth.role() = 'service_role');
```

Для MVP без custom auth можно не настраивать RLS и использовать только `SUPABASE_SERVICE_ROLE_KEY` на бэкенде.

### 1.4 Telegram Bot

- [ ] Создать бота через [@BotFather](https://t.me/BotFather): `/newbot`
- [ ] Получить `TELEGRAM_BOT_TOKEN`
- [ ] Настроить Mini App после деплоя:
  - `/mybots` → выбрать бота → Bot Settings → Menu Button
  - URL: `https://<your-app>.vercel.app` (подставить домен после деплоя)

---

## Этап 2: Код для базовой работы

Минимальный набор, чтобы игра «заработала»:

### 2.1 Supabase Client ✅

- [x] `src/lib/supabase/client.ts` — createBrowserClient
- [x] `src/lib/supabase/server.ts` — createAdminClient (service_role)

### 2.2 Telegram initData ✅

- [x] `src/lib/telegram/validate.ts` — HMAC-валидация initData
- [x] `src/lib/telegram/cookie.ts` — подпись cookie для сессии
- [x] `src/hooks/useTelegram.ts` — window.Telegram.WebApp, initData

### 2.3 API Auth ✅

- [x] `POST /api/auth/telegram` — проверка initData, создание/получение игрока, Set-Cookie

### 2.4 API Player ✅

- [x] `GET /api/player` — по cookie или X-Telegram-Init-Data
- [x] `POST /api/player/action` — learn / task / rest

### 2.5 Хуки и страница ✅

- [x] `usePlayer()` — auth, doAction, refresh
- [x] Главная — GamePageClient с реальными данными и кнопками действий

### 2.6 Выбор профессии (отложено)

- [ ] Страница `/profession` — смена профессии, API для обновления

---

## Этап 3: Деплой на Vercel

### 3.1 Подключение

- [ ] Зайти на [vercel.com](https://vercel.com), войти через GitHub
- [ ] Import repository с проектом
- [ ] Framework: Next.js (авто)
- [ ] Root directory: оставить пустым

### 3.2 Переменные окружения

В Settings → Environment Variables добавить:

| Переменная                    | Значение                   | Среда        |
|------------------------------|----------------------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL`    | URL проекта Supabase       | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase       | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY`   | Service role key Supabase  | Production, Preview |
| `TELEGRAM_BOT_TOKEN`          | Токен бота                 | Production, Preview |

### 3.3 Деплой

- [ ] Deploy
- [ ] Проверить: открыть `https://<project>.vercel.app` в браузере
- [ ] Убедиться, что главная загружается без ошибок

### 3.4 Telegram Mini App

- [ ] В BotFather указать URL: `https://<project>.vercel.app`
- [ ] Открыть бота в Telegram → Menu → перейти в Mini App
- [ ] Проверить, что приложение открывается

---

## Этап 4: Отложенные задачи (после MVP)

| Задача                    | Описание                          |
|---------------------------|-----------------------------------|
| Собеседование             | API `/api/interview`, страница    |
| Telegram Stars            | API `/api/stars` для покупки энергии |
| Регенерация энергии       | Cron или проверка по `energy_updated_at` |
| События для task          | Подключить `pickRandomEvent` в action |
| RLS с telegram_id         | Политики вместо отключения RLS    |
| Кастомный домен           | При необходимости                 |

---

## Чек-лист перед деплоем

1. [ ] `npm run build` проходит
2. [ ] `npm run lint` без ошибок
3. [ ] `.env.local` не в репозитории
4. [ ] Миграция Supabase применена
5. [ ] В Vercel прописаны все env-переменные

---

## Порядок работ (рекомендуемый)

1. Supabase client + server
2. Telegram validate + useTelegram
3. API auth/telegram + API player
4. usePlayer + интеграция на главной
5. API player/action (learn, task, rest)
6. Страница выбора профессии
7. Деплой на Vercel
8. Настройка Mini App в BotFather
9. Тест в Telegram
