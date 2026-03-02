# DevLife 8-bit — Решение проблем

## 401 при открытии в Telegram

### Причина

Ошибка «Invalid initData» при `POST /api/auth/telegram` обычно связана с одним из:

### 1. TELEGRAM_BOT_TOKEN не задан в Vercel

В Vercel переменные окружения нужно указывать отдельно.

**Что сделать:**

1. Vercel Dashboard → проект → **Settings** → **Environment Variables**
2. Добавить `TELEGRAM_BOT_TOKEN` с токеном от [@BotFather](https://t.me/BotFather)
3. Включить переменную для **Production** (и при необходимости **Preview**)
4. Запустить **Redeploy**

### 2. Токен и бот не совпадают

Mini App должен открываться из того же бота, которому принадлежит токен.

**Проверить:**

- Токен взят у бота, для которого настроен Mini App
- В BotFather: `/mybots` → нужный бот → **Bot Settings** → **Menu Button** → указан правильный URL

### 3. Ответ API и отладка

Ответ 401 может содержать `hint` с подсказкой. Также можно посмотреть логи в Vercel:

- **Deployments** → нужный деплой → **Functions** → логи `[auth]` по ошибкам
