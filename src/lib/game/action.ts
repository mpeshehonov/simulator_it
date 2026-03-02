import type { Player } from "@/types/player";
import type { GameEvent, EventEffect } from "@/types/game";
import {
  MAX_ENERGY,
  ENERGY_PER_ACTION,
  EXP_LEARN_MIN,
  EXP_LEARN_MAX,
  ENERGY_RESTORE,
} from "./constants";
import { calcTaskIncome, getRandomTaskExp, mitigateNegativeEffect } from "./skills";
import { pickRandomEvent } from "./events";

export interface ActionResult {
  player: Player;
  event?: GameEvent;
  expGained?: number;
  moneyGained?: number;
}

function applyEffects(player: Player, effects: EventEffect[]): Partial<Player> {
  const delta = { exp: 0, money: 0, reputation: 0, energy: 0 };

  for (const e of effects) {
    let value = e.value;
    if (e.type === "reputation" && value < 0) {
      value = mitigateNegativeEffect(value, player.skills);
    }
    if (e.type === "money" && value < 0) {
      value = mitigateNegativeEffect(value, player.skills);
    }
    delta[e.type as keyof typeof delta] += value;
  }

  return {
    exp: Math.max(0, player.exp + delta.exp),
    money: Math.max(0, player.money + delta.money),
    reputation: Math.max(0, player.reputation + delta.reputation),
    energy: Math.max(0, Math.min(MAX_ENERGY, player.energy + delta.energy)),
  };
}

export function executeLearn(player: Player): ActionResult {
  if (player.energy < ENERGY_PER_ACTION) {
    throw new Error("Not enough energy");
  }

  const expGained = Math.floor(Math.random() * (EXP_LEARN_MAX - EXP_LEARN_MIN + 1)) + EXP_LEARN_MIN;

  const updated: Player = {
    ...player,
    energy: player.energy - ENERGY_PER_ACTION,
    exp: player.exp + expGained,
  };

  const event: GameEvent = {
    id: "learn",
    title: "Учёба",
    description: `Получено ${expGained} EXP`,
    tone: "positive",
    effects: [],
  };

  return { player: updated, event, expGained };
}

export function executeTask(player: Player): ActionResult {
  if (player.energy < ENERGY_PER_ACTION) {
    throw new Error("Not enough energy");
  }

  const expGained = getRandomTaskExp();
  const moneyGained = player.level > 0 ? calcTaskIncome(player.level, player.skills) : 0;

  const event = pickRandomEvent(player.profession, player.level);

  const updated: Player = {
    ...player,
    energy: player.energy - ENERGY_PER_ACTION,
    exp: player.exp + expGained,
    money: player.money + moneyGained,
  };

  let finalPlayer = updated;
  if (event && event.effects.length > 0) {
    const applied = applyEffects(updated, event.effects);
    finalPlayer = { ...updated, ...applied };
  }

  return {
    player: finalPlayer,
    event: event ?? undefined,
    expGained,
    moneyGained,
  };
}

export function executeRest(player: Player): ActionResult {
  const newEnergy = Math.min(MAX_ENERGY, player.energy + ENERGY_RESTORE);
  const updated: Player = {
    ...player,
    energy: newEnergy,
  };
  return { player: updated };
}
