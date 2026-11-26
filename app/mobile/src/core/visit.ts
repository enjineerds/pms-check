import { nextPoint, reachedPoint } from './schedule';
import type { Km, ServicePoint } from './types';

const FRESH_MS = 14 * 24 * 60 * 60 * 1000;

export const isFresh = (readAt: string, now: Date) => now.getTime() - Date.parse(readAt) <= FRESH_MS;

export function visitChoices(odometerKm: Km, ageMonths: number, every: ServicePoint) {
  const suggested = reachedPoint(odometerKm, ageMonths, every).point ?? nextPoint(odometerKm, ageMonths, every).point;
  const n = suggested.km / every.km;
  const options = [n - 1, n, n + 1].filter((i) => i >= 1).map((i) => ({ km: (every.km * i) as Km, months: every.months * i }));
  return { suggested, options };
}
