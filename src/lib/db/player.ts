import type { Player } from "@/types/player";

export interface PlayerRow {
  id: string;
  telegram_id: number;
  profession: string;
  level: number;
  exp: number;
  money: number;
  reputation: number;
  energy: number;
  energy_updated_at: string;
  skills: Record<string, number>;
  last_interview_at: string | null;
  created_at: string;
  updated_at: string;
}

export function rowToPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    telegramId: row.telegram_id,
    profession: row.profession,
    level: row.level,
    exp: row.exp,
    money: row.money,
    reputation: row.reputation,
    energy: row.energy,
    energyUpdatedAt: row.energy_updated_at,
    skills: (row.skills as Record<string, number>) ?? {},
    lastInterviewAt: row.last_interview_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
