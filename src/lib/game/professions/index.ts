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
    { id: "html_css", name: "HTML & CSS", description: "Разметка и стили страниц", maxLevel: 5 },
    { id: "javascript", name: "JS / TypeScript", description: "Логика в браузере", maxLevel: 5 },
    {
      id: "frameworks",
      name: "React, Vue, Svelte",
      description: "Современные фреймворки",
      maxLevel: 5,
    },
    {
      id: "build_tools",
      name: "Сборка (Vite, Webpack)",
      description: "Сборка и оптимизация",
      maxLevel: 5,
    },
    {
      id: "a11y_perf",
      name: "Доступность и скорость",
      description: "A11y, Core Web Vitals",
      maxLevel: 5,
    },
    {
      id: "state_routing",
      name: "State и роутинг",
      description: "Состояние приложения, навигация",
      maxLevel: 5,
    },
  ],
  backend: [
    {
      id: "algorithms",
      name: "Алгоритмы и структуры",
      description: "Базовые алгоритмы, сложность",
      maxLevel: 5,
    },
    { id: "sql", name: "SQL и БД", description: "Запросы, индексы, транзакции", maxLevel: 5 },
    {
      id: "api_design",
      name: "Проектирование API",
      description: "REST, контракты, версионирование",
      maxLevel: 5,
    },
    {
      id: "frameworks",
      name: "Node, Django, Spring",
      description: "Серверные фреймворки",
      maxLevel: 5,
    },
    {
      id: "auth_security",
      name: "Auth и безопасность",
      description: "JWT, OAuth, защита от атак",
      maxLevel: 5,
    },
    {
      id: "caching",
      name: "Кэш и очереди",
      description: "Redis, RabbitMQ, фоновые задачи",
      maxLevel: 5,
    },
  ],
  qa: [
    {
      id: "manual_testing",
      name: "Ручное тестирование",
      description: "Чек-листы, сценарии, баг-репорты",
      maxLevel: 5,
    },
    {
      id: "test_design",
      name: "Тест-дизайн",
      description: "Тест-кейсы, граничные значения",
      maxLevel: 5,
    },
    {
      id: "automation",
      name: "Автотесты",
      description: "Selenium, Playwright, API-тесты",
      maxLevel: 5,
    },
    {
      id: "ci_integration",
      name: "CI/CD для тестов",
      description: "Запуск тестов в пайплайне",
      maxLevel: 5,
    },
    { id: "performance", name: "Нагрузочное", description: "JMeter, k6, метрики", maxLevel: 5 },
    { id: "documentation", name: "Документация", description: "Баг-трекинг, отчёты", maxLevel: 5 },
  ],
  devops: [
    {
      id: "linux_shell",
      name: "Linux и shell",
      description: "Командная строка, скрипты",
      maxLevel: 5,
    },
    {
      id: "docker_k8s",
      name: "Docker и K8s",
      description: "Контейнеры и оркестрация",
      maxLevel: 5,
    },
    { id: "cicd", name: "CI/CD", description: "Пайплайны, деплой", maxLevel: 5 },
    { id: "cloud", name: "Облака", description: "AWS, GCP, Yandex Cloud", maxLevel: 5 },
    { id: "monitoring", name: "Мониторинг", description: "Метрики, алерты, логи", maxLevel: 5 },
    {
      id: "infra_as_code",
      name: "Terraform, Ansible",
      description: "Инфраструктура как код",
      maxLevel: 5,
    },
  ],
  uiux: [
    {
      id: "visual_design",
      name: "Визуальный дизайн",
      description: "Композиция, цвет, контраст",
      maxLevel: 5,
    },
    {
      id: "typography",
      name: "Типографика и сетки",
      description: "Шрифты, выравнивание",
      maxLevel: 5,
    },
    {
      id: "ux_research",
      name: "UX-исследования",
      description: "Интервью, сценарии, JTBD",
      maxLevel: 5,
    },
    {
      id: "prototyping",
      name: "Прототипы (Figma)",
      description: "Макеты и интерактив",
      maxLevel: 5,
    },
    {
      id: "design_systems",
      name: "Дизайн-системы",
      description: "Компоненты, гайдлайны",
      maxLevel: 5,
    },
    {
      id: "usability",
      name: "Юзабилити и A/B",
      description: "Тесты с пользователями",
      maxLevel: 5,
    },
  ],
};
