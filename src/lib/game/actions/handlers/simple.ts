import type { ActionHandler } from "../types";
import { executeLearn, executeTask, executeRest } from "@/lib/game/action";

export const learnHandler: ActionHandler = (player) => executeLearn(player);
export const taskHandler: ActionHandler = (player) => executeTask(player);
export const restHandler: ActionHandler = (player) => executeRest(player);
