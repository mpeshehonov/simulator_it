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

/** Ветки навыков по профессиям. Добавь ветку — она появится на странице навыков и в API. */
export const PROFESSION_SKILL_BRANCHES: Record<ProfessionId, SkillBranch[]> = {
  frontend: [
    { id: "html_css", name: "HTML & CSS", maxLevel: 5 },
    { id: "javascript", name: "JavaScript / TypeScript", maxLevel: 5 },
    { id: "frameworks", name: "React, Vue, Svelte", maxLevel: 5 },
    { id: "build_tools", name: "Vite, Webpack, сборка", maxLevel: 5 },
    { id: "a11y_perf", name: "Доступность и производительность", maxLevel: 5 },
    { id: "state_routing", name: "State management и роутинг", maxLevel: 5 },
  ],
  backend: [
    { id: "algorithms", name: "Алгоритмы и структуры данных", maxLevel: 5 },
    { id: "sql", name: "SQL и базы данных", maxLevel: 5 },
    { id: "api_design", name: "Проектирование API", maxLevel: 5 },
    { id: "frameworks", name: "Node, Django, FastAPI, Spring", maxLevel: 5 },
    { id: "auth_security", name: "Авторизация и безопасность", maxLevel: 5 },
    { id: "caching", name: "Кэширование и очереди", maxLevel: 5 },
  ],
  qa: [
    { id: "manual_testing", name: "Ручное тестирование", maxLevel: 5 },
    { id: "test_design", name: "Тест-дизайн и сценарности", maxLevel: 5 },
    { id: "automation", name: "Автотесты (Selenium, Playwright)", maxLevel: 5 },
    { id: "ci_integration", name: "Интеграция в CI/CD", maxLevel: 5 },
    { id: "performance", name: "Нагрузочное тестирование", maxLevel: 5 },
    { id: "documentation", name: "Документация и баг-трекинг", maxLevel: 5 },
  ],
  devops: [
    { id: "linux_shell", name: "Linux и shell", maxLevel: 5 },
    { id: "docker_k8s", name: "Docker и Kubernetes", maxLevel: 5 },
    { id: "cicd", name: "CI/CD пайплайны", maxLevel: 5 },
    { id: "cloud", name: "AWS, GCP, Yandex Cloud", maxLevel: 5 },
    { id: "monitoring", name: "Мониторинг и алерты", maxLevel: 5 },
    { id: "infra_as_code", name: "Terraform, Ansible", maxLevel: 5 },
  ],
  uiux: [
    { id: "visual_design", name: "Визуальный дизайн", maxLevel: 5 },
    { id: "typography", name: "Типографика и сетки", maxLevel: 5 },
    { id: "ux_research", name: "UX-исследования", maxLevel: 5 },
    { id: "prototyping", name: "Прототипирование (Figma)", maxLevel: 5 },
    { id: "design_systems", name: "Дизайн-системы", maxLevel: 5 },
    { id: "usability", name: "Юзабилити и A/B-тесты", maxLevel: 5 },
  ],
};
