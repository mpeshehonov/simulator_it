import { MAX_ENERGY } from "./constants";
import {
  STARS_ENERGY_BOOST,
  STARS_ENERGY_BOOST_PRICE,
  STARS_FULL_RESTORE_PRICE,
} from "./constants";

export type StarProductType = "energy_boost" | "full_restore";

export interface StarProductConfig {
  productType: StarProductType;
  /** Цена в Telegram Stars */
  price: number;
  /** Сколько энергии даёт продукт (до применения кэпа) */
  energyGrant: number;
  /** full_restore = заполнить до MAX, energy_boost = +N */
  kind: "add" | "full";
}

export const STAR_PRODUCTS: Record<StarProductType, StarProductConfig> = {
  energy_boost: {
    productType: "energy_boost",
    price: STARS_ENERGY_BOOST_PRICE,
    energyGrant: STARS_ENERGY_BOOST,
    kind: "add",
  },
  full_restore: {
    productType: "full_restore",
    price: STARS_FULL_RESTORE_PRICE,
    energyGrant: MAX_ENERGY,
    kind: "full",
  },
};

export function getStarProductConfig(
  productType: string
): StarProductConfig | null {
  if (productType === "energy_boost" || productType === "full_restore") {
    return STAR_PRODUCTS[productType];
  }
  return null;
}

/**
 * Вычислить новое значение энергии после применения покупки Stars.
 */
export function applyStarProductEnergy(
  currentEnergy: number,
  productType: StarProductType
): number {
  const config = STAR_PRODUCTS[productType];
  if (!config) return currentEnergy;
  if (config.kind === "full") return MAX_ENERGY;
  return Math.min(MAX_ENERGY, currentEnergy + config.energyGrant);
}
