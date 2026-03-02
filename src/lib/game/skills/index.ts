import { BASE_INCOME_PER_LEVEL, INTERVIEW_BASE_SUCCESS_CHANCE } from "../constants";

/** Множитель дохода за 1 уровень навыка ветки (сумма по всем веткам) */
const INCOME_SKILL_MULTIPLIER = 0.05;

/** Бонус к шансу собеседования за 1 уровень навыка (сумма по всем веткам) */
const INTERVIEW_SKILL_BONUS = 0.02;

/** Снижение штрафа от негативных событий за 1 уровень навыка (в процентах) */
const NEGATIVE_EVENT_MITIGATION = 0.05;

/**
 * Доход за задачу: базовый × множитель уровня × множитель навыков
 */
export function calcTaskIncome(level: number, skills: Record<string, number>): number {
  const base = BASE_INCOME_PER_LEVEL[level] ?? 0;
  const totalSkillLevels = Object.values(skills).reduce((a, b) => a + b, 0);
  const skillMultiplier = 1 + totalSkillLevels * INCOME_SKILL_MULTIPLIER;
  return Math.round(base * skillMultiplier);
}

/**
 * Случайный EXP за задачу (5–15)
 */
export function getRandomTaskExp(): number {
  const min = 5;
  const max = 15;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Шанс успешного собеседования:
 * Базовый 40% + бонус навыков + бонус репутации + random
 */
export function calcInterviewSuccessChance(
  skills: Record<string, number>,
  reputation: number
): number {
  const totalSkillLevels = Object.values(skills).reduce((a, b) => a + b, 0);
  const skillBonus = totalSkillLevels * INTERVIEW_SKILL_BONUS;
  const reputationBonus = Math.min(reputation / 100, 0.2);
  const base = INTERVIEW_BASE_SUCCESS_CHANCE + skillBonus + reputationBonus;
  return Math.min(Math.max(base, 0.1), 0.95);
}

/**
 * Снижение штрафа от негативного события по навыкам
 */
export function mitigateNegativeEffect(
  effectValue: number,
  skills: Record<string, number>
): number {
  if (effectValue >= 0) return effectValue;
  const totalSkillLevels = Object.values(skills).reduce((a, b) => a + b, 0);
  const mitigation = Math.min(totalSkillLevels * NEGATIVE_EVENT_MITIGATION, 0.5);
  return Math.round(effectValue * (1 - mitigation));
}
