// Энергия
export const MAX_ENERGY = 15;
export const ENERGY_PER_ACTION = 1;
export const ENERGY_REGEN_HOURS = 2;

// Собеседование
export const INTERVIEW_COOLDOWN_DAYS = 1;
/** Количество вопросов в зависимости от карьерного уровня (0–4) */
export const INTERVIEW_QUESTIONS_BY_LEVEL: Record<number, number> = {
  0: 2,
  1: 3,
  2: 4,
  3: 5,
  4: 5,
  5: 0,
};
/** Доля правильных ответов для прохождения (0.6 = 60%) */
export const INTERVIEW_PASSING_RATIO = 0.6;
export const INTERVIEW_BASE_SUCCESS_CHANCE = 0.4;
/** Минимальная сумма уровней навыков (по всем веткам) для допуска к собеседованию на следующий уровень. EXP тратится только на прокачку навыков. */
export const SKILL_LEVELS_FOR_INTERVIEW: Record<number, number> = {
  0: 1,   // Безработный → Стажёр: хотя бы 1 уровень
  1: 3,   // Стажёр → Джуниор: 3 уровня
  2: 6,   // Джуниор → Мидл: 6 уровней
  3: 12,  // Мидл → Синьор: 12 уровней
  4: 20,  // Синьор → Лид: 20 уровней
  5: 0,   // Lead — не повышаемся
};

// Навыки: EXP за один уровень навыка (0→1 = 20, 1→2 = 20, ...)
export const SKILL_UPGRADE_EXP_COST = 20;

// Отдых: кулдаун в минутах (нельзя спамить кнопку)
export const REST_COOLDOWN_MINUTES = 20;

// Экономика
export const EXP_PER_TASK_MIN = 6;
export const EXP_PER_TASK_MAX = 14;
export const EXP_LEARN_MIN = 4;
export const EXP_LEARN_MAX = 9;
export const ENERGY_RESTORE = 5; // дефолт/среднее, реально — из события
export const BASE_INCOME_PER_LEVEL: Record<number, number> = {
  0: 0,
  1: 50,
  2: 150,
  3: 400,
  4: 900,
  5: 1800,
};

// Telegram Stars (монетизация): буст 5 энергии за 9 звёзд, полное восстановление за 29
export const STARS_ENERGY_BOOST = 5;
export const STARS_ENERGY_BOOST_PRICE = 9;
export const STARS_FULL_RESTORE_PRICE = 29;

// Карьерные уровни
export const CAREER_LEVELS = [
  { id: 0, name: "Безработный" },
  { id: 1, name: "Стажёр" },
  { id: 2, name: "Джуниор" },
  { id: 3, name: "Мидл" },
  { id: 4, name: "Синьор" },
  { id: 5, name: "Лид" },
] as const;
