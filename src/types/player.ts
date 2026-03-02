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
  createdAt: string;
  updatedAt: string;
}
