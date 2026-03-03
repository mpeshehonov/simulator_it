import type { ActionHandler } from "../types";
import type { GameEvent } from "@/types/game";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";

/** Подписка на партнёрские каналы — простое действие: EXP и бонус. */
const PARTNER_SUBSCRIBE_EXP = 8;

export const partnerSubscribeHandler: ActionHandler = (player) => {
  if (player.energy < ENERGY_PER_ACTION) {
    throw new Error("Not enough energy");
  }

  const event: GameEvent = {
    id: "partner_subscribe",
    title: "Подписка на каналы",
    description: `Подписался на партнёрские каналы. +${PARTNER_SUBSCRIBE_EXP} EXP`,
    tone: "positive",
    effects: [],
  };

  return {
    player: {
      ...player,
      energy: player.energy - ENERGY_PER_ACTION,
      exp: player.exp + PARTNER_SUBSCRIBE_EXP,
    },
    event,
    expGained: PARTNER_SUBSCRIBE_EXP,
  };
};
