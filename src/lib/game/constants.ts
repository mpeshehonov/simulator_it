// Энергия
export const MAX_ENERGY = 10;
export const ENERGY_PER_ACTION = 1;
export const ENERGY_REGEN_HOURS = 2;

// Собеседование
export const INTERVIEW_COOLDOWN_DAYS = 1;
export const INTERVIEW_QUESTIONS_COUNT = 3;
export const INTERVIEW_BASE_SUCCESS_CHANCE = 0.4;
/** Минимальный EXP для попытки собеседования на следующий уровень */
export const EXP_FOR_INTERVIEW: Record<number, number> = {
  0: 50,
  1: 100,
  2: 200,
  3: 400,
  4: 800,
  5: 0, // Lead — не повышаемся
};

// Экономика
export const EXP_PER_TASK_MIN = 5;
export const EXP_PER_TASK_MAX = 15;
export const EXP_LEARN_MIN = 3;
export const EXP_LEARN_MAX = 8;
export const ENERGY_RESTORE = 5;
export const BASE_INCOME_PER_LEVEL: Record<number, number> = {
  0: 0,
  1: 50,
  2: 150,
  3: 400,
  4: 900,
  5: 1800,
};

// Telegram Stars (монетизация)
export const STARS_ENERGY_BOOST = 20;
export const STARS_ENERGY_BOOST_PRICE = 29;
export const STARS_FULL_RESTORE_PRICE = 9;

// Карьерные уровни
export const CAREER_LEVELS = [
  { id: 0, name: "Безработный" },
  { id: 1, name: "Стажёр" },
  { id: 2, name: "Джуниор" },
  { id: 3, name: "Мидл" },
  { id: 4, name: "Синьор" },
  { id: 5, name: "Лид" },
] as const;
