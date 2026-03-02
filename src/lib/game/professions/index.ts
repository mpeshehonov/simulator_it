import type { SkillBranch } from "@/types/game";

export const PROFESSIONS = ["frontend", "backend", "qa", "devops", "uiux"] as const;

export type ProfessionId = (typeof PROFESSIONS)[number];

export const PROFESSION_NAMES: Record<ProfessionId, string> = {
  frontend: "Фронтенд-разработчик",
  backend: "Бэкенд-разработчик",
  qa: "QA-инженер",
  devops: "DevOps-инженер",
  uiux: "UI/UX-дизайнер",
};

export const PROFESSION_DESCRIPTIONS: Record<ProfessionId, string> = {
  frontend: "React, Vue, HTML, CSS — видимая часть приложений",
  backend: "API, базы данных, серверная логика",
  qa: "Тестирование, автоматизация, поиск багов",
  devops: "CI/CD, облака, деплой, мониторинг",
  uiux: "Интерфейсы, прототипы, UX-исследования",
};

export const PROFESSION_ICONS: Record<ProfessionId, string> = {
  frontend: "💻",
  backend: "⚙️",
  qa: "🔍",
  devops: "🐳",
  uiux: "🎨",
};

/** Ветки навыков по профессиям (3 ветки × 5 уровней) */
export const PROFESSION_SKILL_BRANCHES: Record<ProfessionId, SkillBranch[]> = {
  frontend: [
    { id: "base", name: "База (HTML, CSS, JS)", maxLevel: 5 },
    { id: "frameworks", name: "Фреймворки (React, Vue)", maxLevel: 5 },
    { id: "architecture", name: "Архитектура и оптимизация", maxLevel: 5 },
  ],
  backend: [
    { id: "base", name: "База (алгоритмы, SQL)", maxLevel: 5 },
    { id: "frameworks", name: "Фреймворки и API", maxLevel: 5 },
    { id: "architecture", name: "Микросервисы и масштабирование", maxLevel: 5 },
  ],
  qa: [
    { id: "manual", name: "Ручное тестирование", maxLevel: 5 },
    { id: "automation", name: "Автоматизация", maxLevel: 5 },
    { id: "process", name: "Процессы и методологии", maxLevel: 5 },
  ],
  devops: [
    { id: "ci_cd", name: "CI/CD и пайплайны", maxLevel: 5 },
    { id: "infra", name: "Инфраструктура и облака", maxLevel: 5 },
    { id: "monitoring", name: "Мониторинг и надежность", maxLevel: 5 },
  ],
  uiux: [
    { id: "design", name: "Дизайн и типографика", maxLevel: 5 },
    { id: "research", name: "UX-исследования", maxLevel: 5 },
    { id: "tools", name: "Инструменты и прототипирование", maxLevel: 5 },
  ],
};
