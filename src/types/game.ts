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
  /** Краткое описание для новичков, без жаргона */
  description?: string;
  maxLevel: number;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  profession: string;
  /** Краткий ответ/подсказка для обучения */
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
