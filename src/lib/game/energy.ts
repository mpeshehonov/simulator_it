import { MAX_ENERGY, ENERGY_REGEN_HOURS } from "./constants";
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Пассивное возобновление энергии: 1 энергия каждые ENERGY_REGEN_HOURS (2) часа.
 * Не превышает MAX_ENERGY. Обновляет energy_updated_at на время «потраченное» на реген.
 */
export function applyPassiveEnergyRegen(
  energy: number,
  energyUpdatedAt: string
): { energy: number; energyUpdatedAt: string } {
  if (energy >= MAX_ENERGY) return { energy, energyUpdatedAt };

  const now = Date.now();
  const updatedAt = new Date(energyUpdatedAt).getTime();
  const elapsedMs = Math.max(0, now - updatedAt);
  const elapsedHours = elapsedMs / MS_PER_HOUR;
  const energyToAdd = Math.min(MAX_ENERGY - energy, Math.floor(elapsedHours / ENERGY_REGEN_HOURS));

  if (energyToAdd <= 0) return { energy, energyUpdatedAt };

  const consumedMs = energyToAdd * ENERGY_REGEN_HOURS * MS_PER_HOUR;
  const newUpdatedAt = new Date(updatedAt + consumedMs).toISOString();

  return {
    energy: energy + energyToAdd,
    energyUpdatedAt: newUpdatedAt,
  };
}
