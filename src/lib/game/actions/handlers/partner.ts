import type { ActionHandler } from "../types";
import type { GameEvent } from "@/types/game";
import { ENERGY_PER_ACTION } from "@/lib/game/constants";
import { getPartnerChannelById } from "@/lib/game/channels";

const DEFAULT_CHANNEL_EXP = 8;

/** Подписка на партнёрский канал. payload.channelId обязателен (проверка подписки в API до вызова). */
export const partnerSubscribeHandler: ActionHandler = (player, payload) => {
  if (player.energy < ENERGY_PER_ACTION) {
    throw new Error("Not enough energy");
  }

  const channelId =
    typeof (payload as { channelId?: string })?.channelId === "string"
      ? (payload as { channelId: string }).channelId
      : "";
  const channel = channelId ? getPartnerChannelById(channelId) : undefined;
  const expGained = channel?.expReward ?? DEFAULT_CHANNEL_EXP;

  const event: GameEvent = {
    id: "partner_subscribe",
    title: "Подписка на канал",
    description: channel
      ? `Подписался на «${channel.name}». +${expGained} EXP`
      : `Подписка. +${expGained} EXP`,
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
