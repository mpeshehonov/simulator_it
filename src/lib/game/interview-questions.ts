import type { ProfessionId } from "./professions";

/** Вопрос с правильным ответом (только на сервере, клиенту не отдаём correctOptionId) */
export interface InterviewQuestionMC {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  skillId?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Вопросы с 4 вариантами, один правильный. На основе тем из описаний навыков. */
const QUESTIONS_BANK: Record<ProfessionId, InterviewQuestionMC[]> = {
  frontend: [
    {
      id: "fe-html1",
      text: "Зачем нужны семантические теги (header, main, nav)?",
      options: [
        { id: "a", text: "Чтобы страница быстрее грузилась" },
        { id: "b", text: "Для доступности и SEO: браузер и скринридер понимают структуру" },
        { id: "c", text: "Они обязательны для валидного HTML" },
        { id: "d", text: "Только для красоты кода" },
      ],
      correctOptionId: "b",
      skillId: "html_css",
    },
    {
      id: "fe-html2",
      text: "Что такое Flexbox?",
      options: [
        { id: "a", text: "Библиотека для анимаций" },
        { id: "b", text: "Способ раскладки элементов по одной оси с выравниванием и распределением" },
        { id: "c", text: "Тип шрифта" },
        { id: "d", text: "Стандарт для мобильной верстки" },
      ],
      correctOptionId: "b",
      skillId: "html_css",
    },
    {
      id: "fe-js1",
      text: "Что такое замыкание (closure) в JavaScript?",
      options: [
        { id: "a", text: "Способ закрыть переменную от изменений" },
        { id: "b", text: "Функция, которая запоминает переменные из внешней области видимости" },
        { id: "c", text: "Метод для завершения асинхронной операции" },
        { id: "d", text: "Синтаксис для приватных полей класса" },
      ],
      correctOptionId: "b",
      skillId: "javascript",
    },
    {
      id: "fe-js2",
      text: "Чем промис отличается от callback?",
      options: [
        { id: "a", text: "Промис быстрее выполняется" },
        { id: "b", text: "Промис можно цепочкой .then и обрабатывать ошибки через .catch, не уходя в «ад колбэков»" },
        { id: "c", text: "Колбэк только для событий, промис для запросов" },
        { id: "d", text: "Ничем, это синонимы" },
      ],
      correctOptionId: "b",
      skillId: "javascript",
    },
    {
      id: "fe-react1",
      text: "Зачем в списках React нужен key?",
      options: [
        { id: "a", text: "Чтобы список был отсортирован" },
        { id: "b", text: "Чтобы React мог сопоставить элемент с предыдущим рендером и корректно обновлять DOM" },
        { id: "c", text: "Без key список не отобразится" },
        { id: "d", text: "Key ускоряет рендер" },
      ],
      correctOptionId: "b",
      skillId: "react",
    },
    {
      id: "fe-react2",
      text: "Когда выполняется useEffect после рендера?",
      options: [
        { id: "a", text: "До отрисовки на экране" },
        { id: "b", text: "После того как изменения применены к DOM (по умолчанию — после каждого рендера, если изменились зависимости из массива)" },
        { id: "c", text: "Только при первом монтировании" },
        { id: "d", text: "Только при размонтировании" },
      ],
      correctOptionId: "b",
      skillId: "react",
    },
    {
      id: "fe-ts1",
      text: "Зачем нужен TypeScript в проекте?",
      options: [
        { id: "a", text: "Чтобы код работал быстрее" },
        { id: "b", text: "Типы помогают ловить ошибки до запуска и улучшают подсказки в редакторе" },
        { id: "c", text: "Без TypeScript нельзя использовать React" },
        { id: "d", text: "Только для документирования" },
      ],
      correctOptionId: "b",
      skillId: "typescript",
    },
    {
      id: "fe-a11y1",
      text: "Что такое ARIA?",
      options: [
        { id: "a", text: "Язык разметки для стилей" },
        { id: "b", text: "Атрибуты, которые дополняют разметку для скринридеров и доступности" },
        { id: "c", text: "Фреймворк для тестов" },
        { id: "d", text: "Стандарт кодировки символов" },
      ],
      correctOptionId: "b",
      skillId: "a11y_perf",
    },
  ],
  backend: [
    {
      id: "be-sql1",
      text: "Что даёт индекс в БД?",
      options: [
        { id: "a", text: "Гарантирует уникальность строк" },
        { id: "b", text: "Ускоряет поиск и сортировку по колонке, но замедляет вставку/обновление" },
        { id: "c", text: "Шифрует данные" },
        { id: "d", text: "Резервную копию таблицы" },
      ],
      correctOptionId: "b",
      skillId: "sql",
    },
    {
      id: "be-sql2",
      text: "Что такое ACID в контексте транзакций?",
      options: [
        { id: "a", text: "Название протокола для репликации" },
        { id: "b", text: "Атомарность, согласованность, изолированность, долговечность — свойства надёжной транзакции" },
        { id: "c", text: "Тип базы данных" },
        { id: "d", text: "Метод сжатия данных" },
      ],
      correctOptionId: "b",
      skillId: "sql",
    },
    {
      id: "be-api1",
      text: "Какой HTTP-метод идемпотентный и безопасный?",
      options: [
        { id: "a", text: "POST" },
        { id: "b", text: "GET: не меняет данные на сервере, повторный вызов даёт тот же результат" },
        { id: "c", text: "PUT" },
        { id: "d", text: "DELETE" },
      ],
      correctOptionId: "b",
      skillId: "api_design",
    },
    {
      id: "be-node1",
      text: "Что такое event loop в Node.js?",
      options: [
        { id: "a", text: "Цикл перерисовки интерфейса" },
        { id: "b", text: "Механизм выполнения асинхронного кода: очередь задач и микрозадач, не блокируя поток" },
        { id: "c", text: "Инструмент для отладки" },
        { id: "d", text: "Тип цикла for" },
      ],
      correctOptionId: "b",
      skillId: "node",
    },
    {
      id: "be-php1",
      text: "Зачем в PHP использовать подготовленные запросы (prepared statements)?",
      options: [
        { id: "a", text: "Чтобы запросы выполнялись быстрее" },
        { id: "b", text: "Чтобы исключить SQL-инъекции: параметры передаются отдельно от текста запроса" },
        { id: "c", text: "Это требование Laravel" },
        { id: "d", text: "Чтобы кэшировать результат" },
      ],
      correctOptionId: "b",
      skillId: "php",
    },
    {
      id: "be-auth1",
      text: "Как правильно хранить пароли пользователей?",
      options: [
        { id: "a", text: "В открытом виде в БД" },
        { id: "b", text: "Только хеш (bcrypt, Argon2) с солью; при проверке сравнивать хеш введённого пароля" },
        { id: "c", text: "Зашифровать одним ключом и положить в БД" },
        { id: "d", text: "В cookie браузера" },
      ],
      correctOptionId: "b",
      skillId: "auth_security",
    },
    {
      id: "be-algo1",
      text: "Что означает сложность O(n)?",
      options: [
        { id: "a", text: "Константное время" },
        { id: "b", text: "Время растёт линейно с размером входных данных" },
        { id: "c", text: "Квадратичное время" },
        { id: "d", text: "Логарифмическое время" },
      ],
      correctOptionId: "b",
      skillId: "algorithms",
    },
    {
      id: "be-cache1",
      text: "Зачем нужен TTL у записи в кэше?",
      options: [
        { id: "a", text: "Чтобы кэш занимал меньше памяти" },
        { id: "b", text: "Чтобы устаревшие данные автоматически удалялись и не отдавались клиенту" },
        { id: "c", text: "Это требование Redis" },
        { id: "d", text: "Чтобы ускорить запись" },
      ],
      correctOptionId: "b",
      skillId: "caching",
    },
  ],
  qa: [
    {
      id: "qa-manual1",
      text: "Что должно быть в хорошем баг-репорте?",
      options: [
        { id: "a", text: "Только заголовок" },
        { id: "b", text: "Шаги воспроизведения, ожидаемый и фактический результат, окружение, критичность" },
        { id: "c", text: "Скриншот без подписи" },
        { id: "d", text: "Догадки о причине бага" },
      ],
      correctOptionId: "b",
      skillId: "manual_testing",
    },
    {
      id: "qa-design1",
      text: "Что такое эквивалентное разбиение в тест-дизайне?",
      options: [
        { id: "a", text: "Разделение кода на модули" },
        { id: "b", text: "Разбиение входных данных на классы эквивалентности, внутри класса поведение одинаковое" },
        { id: "c", text: "Разделение тестов на юнит и интеграционные" },
        { id: "d", text: "Разбиение по приоритету багов" },
      ],
      correctOptionId: "b",
      skillId: "test_design",
    },
    {
      id: "qa-auto1",
      text: "Зачем в автотестах явные ожидания (wait until visible)?",
      options: [
        { id: "a", text: "Чтобы тест работал медленнее" },
        { id: "b", text: "Чтобы не зависеть от фиксированных sleep и стабильно ждать появления элемента" },
        { id: "c", text: "Чтобы тест падал реже" },
        { id: "d", text: "Требование Playwright" },
      ],
      correctOptionId: "b",
      skillId: "automation",
    },
    {
      id: "qa-perf1",
      text: "Что такое throughput в нагрузочном тестировании?",
      options: [
        { id: "a", text: "Время ответа сервера" },
        { id: "b", text: "Количество успешных запросов в единицу времени (например, RPS)" },
        { id: "c", text: "Число виртуальных пользователей" },
        { id: "d", text: "Размер ответа в байтах" },
      ],
      correctOptionId: "b",
      skillId: "performance",
    },
    {
      id: "qa-doc1",
      text: "Зачем трассировка «требование — тест-кейс»?",
      options: [
        { id: "a", text: "Чтобы тестов было больше" },
        { id: "b", text: "Чтобы видеть покрытие требований тестами и находить непокрытые места" },
        { id: "c", text: "Чтобы автоматически генерировать тесты" },
        { id: "d", text: "Только для отчёта руководству" },
      ],
      correctOptionId: "b",
      skillId: "documentation",
    },
    {
      id: "qa-ci1",
      text: "Зачем запускать автотесты в CI на каждый коммит?",
      options: [
        { id: "a", text: "Чтобы продлить время сборки" },
        { id: "b", text: "Чтобы рано обнаружить регрессии до мержа и деплоя" },
        { id: "c", text: "Чтобы заменить ручное тестирование полностью" },
        { id: "d", text: "Только для ночных прогонов" },
      ],
      correctOptionId: "b",
      skillId: "ci_integration",
    },
  ],
  devops: [
    {
      id: "do-docker1",
      text: "Зачем использовать тома (volumes) в Docker?",
      options: [
        { id: "a", text: "Чтобы образ был меньше" },
        { id: "b", text: "Чтобы данные сохранялись между перезапусками контейнера" },
        { id: "c", text: "Чтобы ускорить сборку" },
        { id: "d", text: "Тома не нужны в продакшене" },
      ],
      correctOptionId: "b",
      skillId: "docker",
    },
    {
      id: "do-k8s1",
      text: "Что такое Pod в Kubernetes?",
      options: [
        { id: "a", text: "Сервер в кластере" },
        { id: "b", text: "Минимальная единица деплоя: один или несколько контейнеров с общими сетевыми и хранилищем" },
        { id: "c", text: "Версия приложения" },
        { id: "d", text: "База данных" },
      ],
      correctOptionId: "b",
      skillId: "kubernetes",
    },
    {
      id: "do-cicd1",
      text: "Что такое GitOps?",
      options: [
        { id: "a", text: "Система контроля версий" },
        { id: "b", text: "Подход, когда желаемое состояние инфраструктуры и приложений хранится в репозитории, оператор синхронизирует кластер с репо" },
        { id: "c", text: "Только использование Git в пайплайне" },
        { id: "d", text: "Автоматический коммит из CI" },
      ],
      correctOptionId: "b",
      skillId: "cicd",
    },
    {
      id: "do-linux1",
      text: "Что делает команда chmod?",
      options: [
        { id: "a", text: "Меняет владельца файла" },
        { id: "b", text: "Меняет права доступа (чтение, запись, выполнение) для владельца, группы и остальных" },
        { id: "c", text: "Копирует файл" },
        { id: "d", text: "Удаляет файл" },
      ],
      correctOptionId: "b",
      skillId: "linux_shell",
    },
    {
      id: "do-mon1",
      text: "Что такое SLO?",
      options: [
        { id: "a", text: "Сервис логирования ошибок" },
        { id: "b", text: "Service Level Objective — целевой уровень надёжности или качества сервиса (например, 99.9% uptime)" },
        { id: "c", text: "Протокол синхронизации" },
        { id: "d", text: "Тип базы данных" },
      ],
      correctOptionId: "b",
      skillId: "monitoring",
    },
    {
      id: "do-iac1",
      text: "Зачем использовать Terraform вместо ручной настройки серверов?",
      options: [
        { id: "a", text: "Terraform быстрее выполняет команды" },
        { id: "b", text: "Инфраструктура как код: воспроизводимость, версионирование, повторное применение конфигурации" },
        { id: "c", text: "Только чтобы сэкономить деньги" },
        { id: "d", text: "Ручная настройка запрещена в облаках" },
      ],
      correctOptionId: "b",
      skillId: "infra_as_code",
    },
  ],
  uiux: [
    {
      id: "ux-vis1",
      text: "Что такое визуальная иерархия в интерфейсе?",
      options: [
        { id: "a", text: "Количество уровней в меню" },
        { id: "b", text: "Расположение и оформление элементов так, чтобы было ясно, что главное, а что второстепенное" },
        { id: "c", text: "Глубина вложенности компонентов" },
        { id: "d", text: "Число экранов в приложении" },
      ],
      correctOptionId: "b",
      skillId: "visual_design",
    },
    {
      id: "ux-research1",
      text: "Что такое JTBD (Jobs to be done)?",
      options: [
        { id: "a", text: "Список вакансий в компании" },
        { id: "b", text: "Подход: какую «работу» пользователь «нанимает» продукт выполнить — какая цель и контекст" },
        { id: "c", text: "Метод оценки дизайна" },
        { id: "d", text: "Тип пользовательского теста" },
      ],
      correctOptionId: "b",
      skillId: "ux_research",
    },
    {
      id: "ux-proto1",
      text: "Зачем в Figma использовать компоненты и варианты?",
      options: [
        { id: "a", text: "Чтобы файл открывался быстрее" },
        { id: "b", text: "Переиспользование и единообразие: кнопки, состояния, интерактив без дублирования" },
        { id: "c", text: "Только для экспорта в код" },
        { id: "d", text: "Чтобы скрыть слои" },
      ],
      correctOptionId: "b",
      skillId: "prototyping",
    },
    {
      id: "ux-ds1",
      text: "Что входит в дизайн-систему?",
      options: [
        { id: "a", text: "Только цвета и шрифты" },
        { id: "b", text: "Библиотека компонентов, гайдлайны по использованию, токены (цвет, типографика), документация" },
        { id: "c", text: "Только макеты в Figma" },
        { id: "d", text: "Только код компонентов" },
      ],
      correctOptionId: "b",
      skillId: "design_systems",
    },
    {
      id: "ux-usability1",
      text: "Когда A/B-тест можно считать статистически значимым?",
      options: [
        { id: "a", text: "Когда вариант B набрал больше кликов один день" },
        { id: "b", text: "Когда разница между вариантами вряд ли объясняется случайностью (p-value ниже порога, достаточный объём выборки)" },
        { id: "c", text: "Когда опросили 10 человек" },
        { id: "d", text: "Когда дизайнер так решил" },
      ],
      correctOptionId: "b",
      skillId: "usability",
    },
    {
      id: "ux-type1",
      text: "Зачем настраивать интерлиньяж (line-height) для текста в интерфейсе?",
      options: [
        { id: "a", text: "Чтобы шрифт был жирнее" },
        { id: "b", text: "Чтобы строки не слипались и текст было комфортно читать" },
        { id: "c", text: "Только для печатных макетов" },
        { id: "d", text: "Чтобы ускорить загрузку" },
      ],
      correctOptionId: "b",
      skillId: "typography",
    },
  ],
};

/**
 * Выбрать N случайных вопросов для профессии, перемешать варианты ответов у каждого.
 * Клиенту отдаём без correctOptionId.
 */
export function pickInterviewQuestionsMC(
  profession: ProfessionId,
  count: number
): { question: InterviewQuestionMC; optionsShuffled: { id: string; text: string }[]; correctIndex: number }[] {
  const pool = QUESTIONS_BANK[profession] ?? [];
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, pool.length));

  return selected.map((q) => {
    const indices = [0, 1, 2, 3].slice(0, q.options.length);
    const shuffledIndices = shuffle(indices);
    const optionsShuffled = shuffledIndices.map((i) => q.options[i]);
    const correctOptionId = q.correctOptionId;
    const correctIndex = optionsShuffled.findIndex((o) => o.id === correctOptionId);
    return { question: q, optionsShuffled, correctIndex };
  });
}

/** Для GET: отдать клиенту вопросы с перемешанными вариантами (без правильного ответа) */
export function getInterviewQuestionsForClient(
  profession: ProfessionId,
  count: number
): { id: string; text: string; options: { id: string; text: string }[] }[] {
  const picked = pickInterviewQuestionsMC(profession, count);
  return picked.map(({ question, optionsShuffled }) => ({
    id: question.id,
    text: question.text,
    options: optionsShuffled,
  }));
}

/** Проверить ответы: нужны те же вопросы с правильными индексами в том же порядке. */
export function evaluateInterviewAnswers(
  profession: ProfessionId,
  questionIds: string[],
  answers: { questionId: string; selectedOptionId: string }[]
): { correctCount: number; total: number } {
  const pool = QUESTIONS_BANK[profession] ?? [];
  const byId = new Map(pool.map((q) => [q.id, q]));
  let correctCount = 0;
  for (let i = 0; i < questionIds.length; i++) {
    const qId = questionIds[i];
    const q = byId.get(qId);
    const ans = answers.find((a) => a.questionId === qId);
    if (q && ans && ans.selectedOptionId === q.correctOptionId) correctCount++;
  }
  return { correctCount, total: questionIds.length };
}
