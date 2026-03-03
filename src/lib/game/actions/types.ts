import type { Player } from "@/types/player";
import type { ActionResult } from "@/lib/game/action";

/** Тип действия: простое (один запрос → награда) или мини-игра (игра → результат в payload → награда). */
export type ActionKind = "simple" | "minigame";

/** Метаданные действия для UI и валидации. */
export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  kind: ActionKind;
  /** Стоимость энергии (0 для отдыха/особых действий). */
  energyCost: number;
  /** Для minigame: компонент/экран открывается на клиенте, результат передаётся в payload. */
  minigameComponentId?: string;
}

/** Обработчик действия: (player, payload?) => ActionResult. Для simple payload не используется. */
export type ActionHandler = (
  player: Player,
  payload?: unknown
) => ActionResult;

export type { ActionResult };
