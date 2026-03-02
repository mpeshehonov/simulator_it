import type { InterviewQuestion } from "@/types/game";
import type { ProfessionId } from "./professions";
import { INTERVIEW_QUESTIONS_COUNT } from "./constants";
import { calcInterviewSuccessChance } from "./skills";

/** Вопросы по профессиям (заглушка — в MVP можно расширить) */
const QUESTIONS_BY_PROFESSION: Record<ProfessionId, InterviewQuestion[]> = {
  frontend: [
    { id: "fe-q1", text: "Что такое Virtual DOM?", profession: "frontend" },
    { id: "fe-q2", text: "Разница между let, const и var?", profession: "frontend" },
    { id: "fe-q3", text: "Как работает event loop в JS?", profession: "frontend" },
    { id: "fe-q4", text: "Что такое CSS-in-JS и зачем?", profession: "frontend" },
    { id: "fe-q5", text: "Расскажи про SSR и CSR", profession: "frontend" },
  ],
  backend: [
    { id: "be-q1", text: "Разница между REST и GraphQL?", profession: "backend" },
    { id: "be-q2", text: "Как работает транзакция в БД?", profession: "backend" },
    { id: "be-q3", text: "Что такое индексы и зачем они?", profession: "backend" },
    { id: "be-q4", text: "Как масштабировать приложение?", profession: "backend" },
    { id: "be-q5", text: "Что такое ACID?", profession: "backend" },
  ],
  qa: [
    { id: "qa-q1", text: "Виды тестирования?", profession: "qa" },
    { id: "qa-q2", text: "Что такое regression testing?", profession: "qa" },
    { id: "qa-q3", text: "Как пишешь тест-кейсы?", profession: "qa" },
    { id: "qa-q4", text: "Разница между unit и integration?", profession: "qa" },
    { id: "qa-q5", text: "Что такое BDD?", profession: "qa" },
  ],
  devops: [
    { id: "do-q1", text: "Что такое контейнеризация?", profession: "devops" },
    { id: "do-q2", text: "Как настроить CI/CD?", profession: "devops" },
    { id: "do-q3", text: "Что такое Infrastructure as Code?", profession: "devops" },
    { id: "do-q4", text: "Мониторинг и алерты?", profession: "devops" },
    { id: "do-q5", text: "Blue-green vs canary?", profession: "devops" },
  ],
  uiux: [
    { id: "ux-q1", text: "Что такое user journey?", profession: "uiux" },
    { id: "ux-q2", text: "Как проводишь UX-исследование?", profession: "uiux" },
    { id: "ux-q3", text: "Разница между UI и UX?", profession: "uiux" },
    { id: "ux-q4", text: "Что такое design system?", profession: "uiux" },
    { id: "ux-q5", text: "Как тестируешь прототипы?", profession: "uiux" },
  ],
};

/**
 * Выбрать N случайных вопросов для собеседования
 */
export function pickInterviewQuestions(
  profession: ProfessionId,
  count: number = INTERVIEW_QUESTIONS_COUNT
): InterviewQuestion[] {
  const pool = QUESTIONS_BY_PROFESSION[profession] ?? [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}

/**
 * Вычислить шанс успеха собеседования
 */
export function getInterviewSuccessChance(
  skills: Record<string, number>,
  reputation: number
): number {
  return calcInterviewSuccessChance(skills, reputation);
}

/**
 * Определить успех/провал по шансу и random
 */
export function rollInterviewSuccess(chance: number): boolean {
  return Math.random() < chance;
}
