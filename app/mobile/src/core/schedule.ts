import type { Car, CatalogBundle, Km, Schedule, ScheduleId, YearRange } from './types';

const within = (r: YearRange, year: number) => year >= r.from && year <= r.to;

function scheduleById(catalog: CatalogBundle, id: ScheduleId): Schedule {
  const s = catalog.schedules.find((x) => x.id === id);
  if (!s) throw new Error(`Catalog has no schedule ${id}`);
  return s;
}

export function resolveSchedule(car: Car, catalog: CatalogBundle): { schedule: Schedule; usedFallback: boolean } {
  const model = catalog.models.find((m) => m.id === car.modelId);
  if (!model) throw new Error(`Catalog has no model ${car.modelId}`);
  const binding = model.variants
    .find((v) => v.id === car.variantId)
    ?.schedules.find((b) => b.transmission === car.transmission && within(b.years, car.year));
  return binding
    ? { schedule: scheduleById(catalog, binding.scheduleId), usedFallback: false }
    : { schedule: scheduleById(catalog, model.fallbackScheduleId), usedFallback: true };
}

export interface Tolerance {
  km: number;
  months: number;
}

/** Assumed until confirmed against how casas book PMS (SYSTEM_DESIGN §11.3). */
export const DEFAULT_TOLERANCE: Tolerance = { km: 1_000, months: 1 };

export type Reached =
  | { index: number; status: 'due-now' | 'overdue'; overKm: number; overMonths: number }
  | { index: null };

export function reachedPoint(odometerKm: Km, ageMonths: number, schedule: Schedule, tolerance = DEFAULT_TOLERANCE): Reached {
  const index = schedule.points.findLastIndex(
    (p) => odometerKm >= p.km - tolerance.km || ageMonths >= p.months - tolerance.months,
  );
  if (index === -1) return { index: null };
  const point = schedule.points[index];
  const overKm = Math.max(0, odometerKm - point.km);
  const overMonths = Math.max(0, ageMonths - point.months);
  const status = overKm <= tolerance.km && overMonths <= tolerance.months ? 'due-now' : 'overdue';
  return { index, status, overKm, overMonths };
}

export type Next = { index: number; inKm: number; inMonths: number } | { index: null };

export function nextPoint(odometerKm: Km, ageMonths: number, schedule: Schedule): Next {
  const index = schedule.points.findIndex((p) => odometerKm < p.km && ageMonths < p.months);
  if (index === -1) return { index: null };
  const point = schedule.points[index];
  return { index, inKm: point.km - odometerKm, inMonths: point.months - ageMonths };
}
