import type { GameEvent, RestEvent } from "@/types/game";

/** События отдыха: разное кол-во энергии в зависимости от исхода */
export const REST_EVENTS: RestEvent[] = [
  { id: "r1", title: "Залипал в YouTube", description: "3 часа Shorts пролетели", energyGain: 2 },
  { id: "r2", title: "Крепкий сон", description: "Выспался как младенец", energyGain: 6 },
  { id: "r3", title: "Кофе + прогулка", description: "Свежий воздух взбодрил", energyGain: 4 },
  { id: "r4", title: "Серия на диване", description: "Ещё одна — и точно спать", energyGain: 3 },
  { id: "r5", title: "Долгий душ", description: "Водные процедуры", energyGain: 4 },
  { id: "r6", title: "Дрем в транспорте", description: "Проехал свою остановку", energyGain: 2 },
  { id: "r7", title: "Медитация 10 мин", description: "Ом", energyGain: 3 },
  { id: "r8", title: "Спортивная тренировка", description: "Эндорфины в деле", energyGain: 5 },
  { id: "r9", title: "Перекус и чай", description: "Сахар + кофеин", energyGain: 3 },
  { id: "r10", title: "Сон до обеда", description: "Выходной удался", energyGain: 7 },
  { id: "r11", title: "Залёт в TikTok", description: "Час контента", energyGain: 1 },
  { id: "r12", title: "Прогулка в парке", description: "Солнце и деревья", energyGain: 5 },
  { id: "r13", title: "Массаж плеч", description: "Самомассаж, но помогло", energyGain: 3 },
  { id: "r14", title: "Обнимашки с котом", description: "Мурчание лечит", energyGain: 4 },
  { id: "r15", title: "Игры до трёх ночи", description: "Ещё один раунд...", energyGain: 1 },
  { id: "r16", title: "Дневной сон 20 мин", description: "Power nap сработал", energyGain: 5 },
  { id: "r17", title: "Контрастный душ", description: "Бодрость на весь день", energyGain: 6 },
  {
    id: "r18",
    title: "Скролл соцсетей",
    description: "Прокрастинация, но отдохнул",
    energyGain: 2,
  },
  { id: "r19", title: "Ванна с книгой", description: "Релакс по полной", energyGain: 5 },
  { id: "r20", title: "Качание в кресле", description: "Просто сидел и качался", energyGain: 2 },
];

export function pickRandomRestEvent(): RestEvent {
  return REST_EVENTS[Math.floor(Math.random() * REST_EVENTS.length)]!;
}

/** Универсальные события (10 шт в MVP) */
export const UNIVERSAL_EVENTS: GameEvent[] = [
  {
    id: "u1",
    title: "Оптимизировал бандл",
    description: "Размер уменьшился на 30%",
    hint: "Оптимизация бандла сокращает время загрузки и экономит трафик пользователям.",
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
    hint: "CI/CD позволяет автоматически прогонять тесты и выкатывать код без ручных шагов.",
    tone: "positive",
    effects: [{ type: "reputation", value: 3 }],
  },
  {
    id: "u3",
    title: "Митинг затянулся",
    description: "3 часа обсуждения кнопки",
    hint: "Созвоны без повестки и ограничений по времени съедают ресурс и не двигают задачу.",
    tone: "neutral",
    effects: [{ type: "energy", value: -1 }],
  },
  {
    id: "u4",
    title: "Прод упал",
    description: "В три часа ночи",
    hint: "Падение прода — инцидент, который требует быстрого реагирования и разбора причин.",
    tone: "negative",
    effects: [{ type: "reputation", value: -2 }],
  },
  {
    id: "u5",
    title: "Клиент недоволен",
    description: "Переделать всё с нуля",
    hint: "Недовольный клиент — сигнал к пересмотру ожиданий, требований и процессов согласования.",
    tone: "negative",
    effects: [{ type: "money", value: -100 }],
  },
  {
    id: "u6",
    title: "Код-ревью пройдено",
    description: "С первого раза!",
    hint: "Код-ревью помогает ловить ошибки и делиться знаниями внутри команды.",
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
    hint: "Маленькие бытовые проблемы тоже влияют на продуктивность команды.",
    tone: "neutral",
    effects: [{ type: "energy", value: -1 }],
  },
  {
    id: "u8",
    title: "Нашёл баг в проде",
    description: "До того как заметил клиент",
    hint: "Мониторинг и внимательность позволяют найти проблемы раньше пользователей.",
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
    hint: "Сдвиг дедлайна часто означает, что оценка или требования были неточными.",
    tone: "neutral",
    effects: [],
  },
  {
    id: "u10",
    title: "Утечка памяти",
    description: "Приложение падает у 10% пользователей",
    hint: "Утечка памяти — ошибка, при которой приложение со временем начинает потреблять всё больше ресурсов.",
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
