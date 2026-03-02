import type { GameEvent } from "@/types/game";

/** Универсальные события (10 шт в MVP) */
export const UNIVERSAL_EVENTS: GameEvent[] = [
  {
    id: "u1",
    title: "Оптимизировал бандл",
    description: "Размер уменьшился на 30%",
    tone: "positive",
    effects: [
      { type: "exp", value: 2 },
      { type: "money", value: 150 },
    ],
  },
  {
    id: "u2",
    title: "Настроил CI/CD",
    description: "Деплой стал автоматическим",
    tone: "positive",
    effects: [{ type: "reputation", value: 3 }],
  },
  {
    id: "u3",
    title: "Митинг затянулся",
    description: "3 часа обсуждения кнопки",
    tone: "neutral",
    effects: [{ type: "energy", value: -1 }],
  },
  {
    id: "u4",
    title: "Прод упал",
    description: "В три часа ночи",
    tone: "negative",
    effects: [{ type: "reputation", value: -2 }],
  },
  {
    id: "u5",
    title: "Клиент недоволен",
    description: "Переделать всё с нуля",
    tone: "negative",
    effects: [{ type: "money", value: -100 }],
  },
  {
    id: "u6",
    title: "Код-ревью пройдено",
    description: "С первого раза!",
    tone: "positive",
    effects: [
      { type: "exp", value: 1 },
      { type: "reputation", value: 1 },
    ],
  },
  {
    id: "u7",
    title: "Кофе-машина сломалась",
    description: "День без кофе",
    tone: "neutral",
    effects: [{ type: "energy", value: -1 }],
  },
  {
    id: "u8",
    title: "Нашёл баг в проде",
    description: "До того как заметил клиент",
    tone: "positive",
    effects: [
      { type: "exp", value: 2 },
      { type: "reputation", value: 2 },
      { type: "money", value: 50 },
    ],
  },
  {
    id: "u9",
    title: "Дедлайн сдвинули",
    description: "Снова",
    tone: "neutral",
    effects: [],
  },
  {
    id: "u10",
    title: "Утечка памяти",
    description: "Приложение падает у 10% пользователей",
    tone: "negative",
    effects: [
      { type: "reputation", value: -1 },
      { type: "energy", value: -2 },
    ],
  },
];

/** События для фронтенда (10 шт) */
export const FRONTEND_EVENTS: GameEvent[] = [
  {
    id: "fe1",
    profession: "frontend",
    title: "Переиспользовал компонент",
    description: "DRY — это про тебя",
    tone: "positive",
    effects: [{ type: "exp", value: 1 }],
  },
  {
    id: "fe2",
    profession: "frontend",
    title: "Хук зациклился",
    description: "useEffect без deps",
    tone: "negative",
    effects: [{ type: "energy", value: -2 }],
  },
  {
    id: "fe3",
    profession: "frontend",
    title: "Подключил новую библиотеку",
    description: "bundle +50kb",
    tone: "neutral",
    effects: [],
  },
  {
    id: "fe4",
    profession: "frontend",
    title: "Адаптив за один день",
    description: "Работает на всех экранах",
    tone: "positive",
    effects: [
      { type: "exp", value: 2 },
      { type: "money", value: 100 },
    ],
  },
  {
    id: "fe5",
    profession: "frontend",
    title: "Деплой в пятницу",
    description: "Удача на твоей стороне",
    tone: "positive",
    effects: [{ type: "reputation", value: 1 }],
  },
  {
    id: "fe6",
    profession: "frontend",
    title: "Breaking change в API",
    description: "Бэкенд обновился без предупреждения",
    tone: "negative",
    effects: [
      { type: "energy", value: -1 },
      { type: "money", value: -50 },
    ],
  },
  {
    id: "fe7",
    profession: "frontend",
    title: "Lighthouse 100",
    description: "Performance, Accessibility, Best Practices, SEO",
    tone: "positive",
    effects: [
      { type: "exp", value: 3 },
      { type: "reputation", value: 2 },
    ],
  },
  {
    id: "fe8",
    profession: "frontend",
    title: "Пixel perfect",
    description: "Дизайнер одобрил",
    tone: "positive",
    effects: [{ type: "money", value: 75 }],
  },
  {
    id: "fe9",
    profession: "frontend",
    title: "Старый браузер",
    description: "IE11 support снова нужен",
    tone: "negative",
    effects: [{ type: "energy", value: -3 }],
  },
  {
    id: "fe10",
    profession: "frontend",
    title: "Дизайн-система готова",
    description: "Storybook опубликован",
    tone: "positive",
    effects: [
      { type: "exp", value: 2 },
      { type: "reputation", value: 2 },
    ],
  },
];

/** Все события по профессиям (заглушки — в MVP используем universal + frontend) */
export const PROFESSION_EVENTS: Record<string, GameEvent[]> = {
  frontend: FRONTEND_EVENTS,
  backend: UNIVERSAL_EVENTS, // TODO: заменить на backend-specific
  qa: UNIVERSAL_EVENTS,
  devops: UNIVERSAL_EVENTS,
  uiux: UNIVERSAL_EVENTS,
};

/** События для уровней выше Джуниора (minLevel >= 3) */
export const SENIOR_EVENTS: GameEvent[] = [
  {
    id: "s1",
    minLevel: 3,
    title: "Провёл техинтервью",
    description: "Кандидат прошёл",
    tone: "positive",
    effects: [{ type: "reputation", value: 2 }],
  },
  {
    id: "s2",
    minLevel: 3,
    title: "Архитектурное решение",
    description: "Команда одобрила",
    tone: "positive",
    effects: [
      { type: "exp", value: 2 },
      { type: "reputation", value: 1 },
    ],
  },
];

/**
 * Выбрать случайное событие по профессии и уровню
 */
export function pickRandomEvent(profession: string, level: number): GameEvent | null {
  const professionPool = PROFESSION_EVENTS[profession] ?? UNIVERSAL_EVENTS;
  const seniorPool = SENIOR_EVENTS.filter((e) => !e.minLevel || e.minLevel <= level);
  const pool: GameEvent[] = [...UNIVERSAL_EVENTS, ...professionPool, ...seniorPool];
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
