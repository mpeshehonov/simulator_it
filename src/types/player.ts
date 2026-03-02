export interface LastEvent {
  title: string;
  description: string;
}

export interface Player {
  id: string;
  telegramId: number;
  profession: string;
  level: number;
  exp: number;
  money: number;
  reputation: number;
  energy: number;
  energyUpdatedAt: string;
  skills: Record<string, number>;
  lastInterviewAt: string | null;
  lastRestAt: string | null;
  /** Последнее событие (с сервера), показывается при входе */
  lastEvent?: LastEvent | null;
  createdAt: string;
  updatedAt: string;
}
