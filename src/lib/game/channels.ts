/** Партнёрский канал для задания «Подписка на каналы». */
export interface PartnerChannel {
  id: string;
  name: string;
  url: string;
  expReward: number;
  sortOrder: number;
}

/** Список партнёрских каналов (можно вынести в БД и админку позже). */
export const PARTNER_CHANNELS: PartnerChannel[] = [
  { id: "devlife", name: "DevLife", url: "https://t.me/devlife_ch", expReward: 8, sortOrder: 0 },
  {
    id: "frontend_ru",
    name: "Frontend на русском",
    url: "https://t.me/frontend_ru",
    expReward: 8,
    sortOrder: 1,
  },
  {
    id: "js_ru",
    name: "JavaScript",
    url: "https://t.me/javascript_ru",
    expReward: 8,
    sortOrder: 2,
  },
];

export function getPartnerChannelById(id: string): PartnerChannel | undefined {
  return PARTNER_CHANNELS.find((c) => c.id === id);
}
