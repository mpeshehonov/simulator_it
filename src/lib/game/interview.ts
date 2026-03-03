import type { InterviewQuestion } from "@/types/game";
import type { ProfessionId } from "./professions";
import { INTERVIEW_QUESTIONS_COUNT } from "./constants";
import { calcInterviewSuccessChance } from "./skills";

/** Вопросы по профессиям (заглушка — в MVP можно расширить) */
const QUESTIONS_BY_PROFESSION: Record<ProfessionId, InterviewQuestion[]> = {
  frontend: [
    {
      id: "fe-q1",
      text: "Что такое Virtual DOM?",
      profession: "frontend",
      hint: "Virtual DOM — это лёгкое представление дерева UI в памяти, которое позволяет эффективно обновлять реальный DOM.",
    },
    {
      id: "fe-q2",
      text: "Разница между let, const и var?",
      profession: "frontend",
      hint: "var — функциональная область видимости и hoisting; let/const — блочная область, const запрещает переназначение ссылки.",
    },
    {
      id: "fe-q3",
      text: "Как работает event loop в JS?",
      profession: "frontend",
      hint: "Event loop управляет очередями задач и позволяет однопоточному JS обрабатывать асинхронные операции.",
    },
    {
      id: "fe-q4",
      text: "Что такое CSS-in-JS и зачем?",
      profession: "frontend",
      hint: "CSS-in-JS — подход, когда стили описываются в JS/TS, что упрощает изоляцию и динамические стили.",
    },
    {
      id: "fe-q5",
      text: "Расскажи про SSR и CSR",
      profession: "frontend",
      hint: "SSR рендерит HTML на сервере, CSR — в браузере; SSR улучшает первый рендер и SEO.",
    },
  ],
  backend: [
    {
      id: "be-q1",
      text: "Разница между REST и GraphQL?",
      profession: "backend",
      hint: "REST — набор эндпоинтов по ресурсам, GraphQL — единая схема и гибкие запросы клиента.",
    },
    {
      id: "be-q2",
      text: "Как работает транзакция в БД?",
      profession: "backend",
      hint: "Транзакция объединяет несколько операций так, чтобы они либо выполнились все, либо ни одна (атомарность).",
    },
    {
      id: "be-q3",
      text: "Что такое индексы и зачем они?",
      profession: "backend",
      hint: "Индексы ускоряют поиск по колонкам, но замедляют запись и занимают место.",
    },
    {
      id: "be-q4",
      text: "Как масштабировать приложение?",
      profession: "backend",
      hint: "Горизонтальное масштабирование (больше инстансов), кеши, очереди, разделение сервисов.",
    },
    {
      id: "be-q5",
      text: "Что такое ACID?",
      profession: "backend",
      hint: "ACID — свойства транзакций: атомарность, согласованность, изолированность, долговечность.",
    },
  ],
  qa: [
    {
      id: "qa-q1",
      text: "Виды тестирования?",
      profession: "qa",
      hint: "Функциональное, нефункциональное, регрессионное, приёмочное, exploratory и др.",
    },
    {
      id: "qa-q2",
      text: "Что такое regression testing?",
      profession: "qa",
      hint: "Регрессионное тестирование проверяет, что новые изменения не сломали старый функционал.",
    },
    {
      id: "qa-q3",
      text: "Как пишешь тест-кейсы?",
      profession: "qa",
      hint: "Тест-кейс описывает шаги, входные данные, ожидания и критерии прохождения.",
    },
    {
      id: "qa-q4",
      text: "Разница между unit и integration?",
      profession: "qa",
      hint: "Unit-тесты проверяют отдельные функции/модули, интеграционные — их работу вместе.",
    },
    {
      id: "qa-q5",
      text: "Что такое BDD?",
      profession: "qa",
      hint: "BDD — подход, когда поведение системы описывается в понятных сценариях (Given-When-Then).",
    },
  ],
  devops: [
    {
      id: "do-q1",
      text: "Что такое контейнеризация?",
      profession: "devops",
      hint: "Контейнеризация изолирует приложение и его зависимости в образ, одинаковый для всех сред.",
    },
    {
      id: "do-q2",
      text: "Как настроить CI/CD?",
      profession: "devops",
      hint: "CI/CD — пайплайн, который собирает, тестирует и выкатывает изменения автоматически при каждом push.",
    },
    {
      id: "do-q3",
      text: "Что такое Infrastructure as Code?",
      profession: "devops",
      hint: "IaC — управление инфраструктурой через код (Terraform, Ansible) вместо ручной настройки.",
    },
    {
      id: "do-q4",
      text: "Мониторинг и алерты?",
      profession: "devops",
      hint: "Мониторинг собирает метрики, алерты оповещают о проблемах по заданным порогам.",
    },
    {
      id: "do-q5",
      text: "Blue-green vs canary?",
      profession: "devops",
      hint: "Blue-green — переключение трафика между двумя версиями, canary — выкатывание на часть пользователей.",
    },
  ],
  uiux: [
    {
      id: "ux-q1",
      text: "Что такое user journey?",
      profession: "uiux",
      hint: "User journey — путь пользователя через продукт: шаги, состояния и точки боли.",
    },
    {
      id: "ux-q2",
      text: "Как проводишь UX-исследование?",
      profession: "uiux",
      hint: "UX-исследование включает интервью, опросы, наблюдения и анализ поведения в продукте.",
    },
    {
      id: "ux-q3",
      text: "Разница между UI и UX?",
      profession: "uiux",
      hint: "UI — визуальный слой и элементы интерфейса, UX — общий опыт и удобство использования.",
    },
    {
      id: "ux-q4",
      text: "Что такое design system?",
      profession: "uiux",
      hint: "Дизайн-система — набор согласованных компонентов, стилей и гайдлайнов для продукта.",
    },
    {
      id: "ux-q5",
      text: "Как тестируешь прототипы?",
      profession: "uiux",
      hint: "Прототипы тестируют на пользователях: дают сценарии, смотрят, где люди путаются.",
    },
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
