import type { ActionHandler } from "../types";
import type { GameEvent } from "@/types/game";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";

/** Payload для действия fix_bugs: результат мини-игры (очки). */
export interface FixBugsPayload {
  score: number;
}

/**
 * Фикс багов — мини-игра (например, скобка vs баги).
 * Клиент запускает игру, по завершении отправляет score; награда зависит от счёта.
 */
export const fixBugsHandler: ActionHandler = (player, payload) => {
  if (player.energy < ENERGY_PER_ACTION) {
    throw new Error("Not enough energy");
  }

  const score = typeof (payload as FixBugsPayload)?.score === "number"
    ? Math.max(0, (payload as FixBugsPayload).score)
    : 0;

  // Награда: базовый EXP + бонус за очки (можно настроить формулу)
  const baseExp = 5;
  const bonusExp = Math.min(30, Math.floor(score / 5));
  const expGained = baseExp + bonusExp;

  const event: GameEvent = {
    id: "fix_bugs",
    title: "Фикс багов",
    description: `Очки: ${score}. Получено ${expGained} EXP`,
    tone: "positive",
    effects: [],
  };

  return {
    player: {
      ...player,
      energy: player.energy - ENERGY_PER_ACTION,
      exp: player.exp + expGained,
    },
    event,
    expGained,
  };
};
