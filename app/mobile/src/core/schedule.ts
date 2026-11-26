import type { Car, CatalogBundle, Conditions, ItemRule, Km, Schedule, ScheduleId, ScheduledItem, ServicePoint, YearMonth, YearRange } from './types';

const within = (r: YearRange, year: number) => year >= r.from && year <= r.to;

function scheduleById(catalog: CatalogBundle, id: ScheduleId): Schedule {
  const s = catalog.schedules.find((x) => x.id === id);
  if (!s) throw new Error(`Catalog has no schedule ${id}`);
  return s;
}

export function resolveSchedule(car: Pick<Car, 'modelId' | 'variantId' | 'year' | 'transmission'>, catalog: CatalogBundle): { schedule: Schedule; usedFallback: boolean } {
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

/** How often the car visits: the shortest interval any item asks for, on each clock. */
export function cadence(schedule: Schedule, conditions: Conditions): ServicePoint {
  const intervals = schedule.items.map((i) => ruleFor(i, conditions).every).filter((e) => e !== null);
  const min = (xs: (number | null)[]) => Math.min(...xs.filter((x) => x !== null));
  return { km: min(intervals.map((e) => e.km)) as Km, months: min(intervals.map((e) => e.months)) };
}

export const ruleFor = (item: ScheduledItem, conditions: Conditions): ItemRule =>
  (conditions === 'severe' && item.severe) || item.normal;

const nth = (c: ServicePoint, n: number): ServicePoint => ({ km: (c.km * n) as Km, months: c.months * n });

export type Reached =
  | { point: ServicePoint; status: 'due-now' | 'overdue'; overKm: number; overMonths: number }
  | { point: null };

export function reachedPoint(odometerKm: Km, ageMonths: number, every: ServicePoint, tolerance = DEFAULT_TOLERANCE): Reached {
  const n = Math.max(
    Math.floor((odometerKm + tolerance.km) / every.km),
    Math.floor((ageMonths + tolerance.months) / every.months),
  );
  if (n === 0) return { point: null };
  const point = nth(every, n);
  const overKm = Math.max(0, odometerKm - point.km);
  const overMonths = Math.max(0, ageMonths - point.months);
  const status = overKm <= tolerance.km && overMonths <= tolerance.months ? 'due-now' : 'overdue';
  return { point, status, overKm, overMonths };
}

export function nextPoint(odometerKm: Km, ageMonths: number, every: ServicePoint) {
  const point = nth(every, Math.max(Math.floor(odometerKm / every.km), Math.floor(ageMonths / every.months)) + 1);
  return { point, inKm: point.km - odometerKm, inMonths: point.months - ageMonths };
}

export function ageMonths(deliveredOn: YearMonth, now: Date): number {
  const [y, m] = deliveredOn.split('-').map(Number);
  return Math.max(0, (now.getUTCFullYear() - y) * 12 + (now.getUTCMonth() + 1 - m));
}

type CarSchedule = Pick<Car, 'modelId' | 'variantId' | 'year' | 'transmission'>;

/** The visit the car is due for (reached, or the next one), and the visit after it. */
export function serviceFor(car: CarSchedule, odometerKm: Km, months: number, catalog: CatalogBundle, conditions: Conditions = 'severe') {
  const every = cadence(resolveSchedule(car, catalog).schedule, conditions);
  const reached = reachedPoint(odometerKm, months, every);
  const due = reached.point ?? nextPoint(odometerKm, months, every).point;
  return {
    every,
    due,
    reached: reached.point !== null,
    after: { km: (due.km + every.km) as Km, months: due.months + every.months },
  };
}
