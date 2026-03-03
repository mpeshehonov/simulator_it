import type { Player } from "@/types/player";
import type { ActionDefinition, ActionHandler } from "./types";
import type { ActionResult } from "@/lib/game/action";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";
import { learnHandler, taskHandler, restHandler } from "./handlers/simple";
import { fixBugsHandler } from "./handlers/minigame";
import { partnerSubscribeHandler } from "./handlers/partner";

/** Список всех действий с метаданными для UI и валидации. */
export const ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    id: "learn",
    name: "Учиться",
    description: "Получить EXP за учёбу",
    kind: "simple",
    energyCost: ENERGY_PER_ACTION,
  },
  {
    id: "task",
    name: "Задача",
    description: "Взять задачу: EXP и деньги",
    kind: "simple",
    energyCost: ENERGY_PER_ACTION,
  },
  {
    id: "rest",
    name: "Отдых",
    description: "Восстановить энергию (раз в N мин)",
    kind: "simple",
    energyCost: 0,
  },
  {
    id: "partner_subscribe",
    name: "Подписка на каналы",
    description: "Подписаться на партнёрские каналы, получить EXP",
    kind: "simple",
    energyCost: ENERGY_PER_ACTION,
  },
  {
    id: "fix_bugs",
    name: "Фикс багов",
    description: "Мини-игра: скобка против багов, награда по очкам",
    kind: "minigame",
    energyCost: ENERGY_PER_ACTION,
    minigameComponentId: "fix-bugs-invaders",
  },
];

const HANDLERS: Record<string, ActionHandler> = {
  learn: learnHandler,
  task: taskHandler,
  rest: restHandler,
  partner_subscribe: partnerSubscribeHandler,
  fix_bugs: fixBugsHandler,
};

/** Возвращает определение действия по id. */
export function getActionDefinition(id: string): ActionDefinition | undefined {
  return ACTION_DEFINITIONS.find((a) => a.id === id);
}

/** Выполняет действие по id. Бросает при неизвестном id или ошибке выполнения. */
export function executeAction(
  actionId: string,
  player: Player,
  payload?: unknown
): ActionResult {
  const handler = HANDLERS[actionId];
  if (!handler) {
    throw new Error(`Unknown action: ${actionId}`);
  }
  return handler(player, payload);
}

/** Id действий, доступных по умолчанию на главном экране (кнопки). */
export const DEFAULT_ACTION_IDS = ["learn", "task", "rest"] as const;

/** Все зарегистрированные id действий. */
export const ALL_ACTION_IDS = ACTION_DEFINITIONS.map((a) => a.id);
