# DevLife 8-bit — Базовая настройка завершена

Проект создан и готов к работе.

---

## Структура

```
devlife-8bit/
├── src/
│   ├── app/
│   │   ├── (game)/              # Игровые страницы
│   │   │   ├── page.tsx         # / — главный экран
│   │   │   ├── profession/      # /profession
│   │   │   ├── skills/          # /skills
│   │   │   └── interview/       # /interview
│   │   └── api/                 # API routes
│   │       ├── auth/telegram/
│   │       ├── player/
│   │       ├── interview/
│   │       └── stars/
│   ├── components/
│   │   ├── ui/
│   │   ├── game/
│   │   └── layout/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── telegram/
│   │   └── game/
│   ├── types/
│   └── hooks/
├── supabase/migrations/
├── .github/workflows/ci.yml
└── .env.local.example
```

---

## Что настроено

- **ESLint** — next, TypeScript, Prettier, `argsIgnorePattern: "^_"`
- **Prettier** — `.prettierrc`, `.prettierignore`
- **CI** — GitHub Actions: lint + build при push
- **Turbopack** — `root: __dirname` в next.config

---

## Команды

```bash
npm run dev      # Запуск dev-сервера
npm run build    # Сборка
npm run lint     # ESLint
npm run format   # Prettier
```

---

## Следующие шаги

1. Скопировать `.env.local.example` в `.env.local` и заполнить переменные
2. Создать проект в Supabase и применить миграцию `001_players.sql`
3. Установить shadcn/ui и Pixelact-компоненты
4. Реализовать логику игры по структуре выше

---

## Документация

- `docs/CONCEPT.md` — концепция, механики, экраны
- `docs/MANUAL_STEPS.md` — шаги для ручного выполнения
- `README.md` — краткая справка
