// Game-related types
/** Базовые действия на главном экране (обратная совместимость). */
export type ActionType = "learn" | "task" | "rest";

export type EventEffect =
  | { type: "exp"; value: number }
  | { type: "money"; value: number }
  | { type: "reputation"; value: number }
  | { type: "energy"; value: number };

export type EventTone = "positive" | "neutral" | "negative";

export interface GameEvent {
  id: string;
  profession?: string;
  minLevel?: number;
  title: string;
  description: string;
  /** Краткое объяснение для обучения (что это за явление в реальной работе) */
  hint?: string;
  tone: EventTone;
  effects: EventEffect[];
}

export interface SkillBranch {
  id: string;
  name: string;
  /** По одному блоку на уровень: [0] открывается при уровне 1, [1] при уровне 2 и т.д. Изначально описание скрыто. */
  descriptionsByLevel?: string[];
  maxLevel: number;
}

/** Вариант ответа на вопрос собеседования (множественный выбор) */
export interface InterviewOption {
  id: string;
  text: string;
}

/** Вопрос для клиента: текст + 4 варианта (правильный id не передаётся) */
export interface InterviewQuestionDto {
  id: string;
  text: string;
  options: InterviewOption[];
}

/** Ответ пользователя на один вопрос */
export interface InterviewAnswerDto {
  questionId: string;
  selectedOptionId: string;
}

/** Устаревший тип (подсказки), оставлен для совместимости */
export interface InterviewQuestion {
  id: string;
  text: string;
  profession: string;
  hint?: string;
}

/** Событие отдыха: даёт разное кол-во энергии */
export interface RestEvent {
  id: string;
  title: string;
  description: string;
  /** Сколько энергии восстанавливается (1–7) */
  energyGain: number;
}
