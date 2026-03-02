// Game-related types
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
  tone: EventTone;
  effects: EventEffect[];
}

export interface SkillBranch {
  id: string;
  name: string;
  maxLevel: number;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  profession: string;
}

/** Событие отдыха: даёт разное кол-во энергии */
export interface RestEvent {
  id: string;
  title: string;
  description: string;
  /** Сколько энергии восстанавливается (1–7) */
  energyGain: number;
}
