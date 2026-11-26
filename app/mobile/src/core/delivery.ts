import type { YearMonth } from './types';

export const yearMonth = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}` as YearMonth;

export function splitYearMonth(ym: YearMonth) {
  const [year, month] = ym.split('-').map(Number);
  return { year, month };
}

/** Newest first. Casas sell next year's model from late in the year before. */
export function deliveryYears(modelYear: number, now: Date): number[] {
  const thisYear = now.getUTCFullYear();
  const from = Math.min(modelYear - 1, thisYear);
  return Array.from({ length: thisYear - from + 1 }, (_, i) => thisYear - i);
}

export const monthsIn = (year: number, now: Date) => (year === now.getUTCFullYear() ? now.getUTCMonth() + 1 : 12);
