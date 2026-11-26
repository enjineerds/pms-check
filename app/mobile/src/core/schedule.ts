import type { Car, CatalogBundle, Conditions, ItemRule, Km, Schedule, ScheduleBinding, ScheduleId, ScheduledItem, ServicePoint, YearMonth, YearRange } from './types';

const within = (r: YearRange, year: number) => year >= r.from && year <= r.to;

function scheduleById(catalog: CatalogBundle, id: ScheduleId): Schedule {
  const s = catalog.schedules.find((x) => x.id === id);
  if (!s) throw new Error(`Catalog has no schedule ${id}`);
  return s;
}

export function resolveSchedule(car: Pick<Car, 'modelId' | 'variantId' | 'year' | 'transmission'>, catalog: CatalogBundle): { schedule: Schedule; usedFallback: boolean } {
  const model = catalog.models.find((m) => m.id === car.modelId);
  if (!model) throw new Error(`Catalog has no model ${car.modelId}`);
  const own = model.variants.find((v) => v.id === car.variantId)?.schedules ?? [];
  const exact = own.find((b) => b.transmission === car.transmission && within(b.years, car.year));
  if (exact) return { schedule: scheduleById(catalog, exact.scheduleId), usedFallback: false };
  const closestIn = (bs: ScheduleBinding[]) => nearestYear(bs.filter((b) => b.transmission === car.transmission), car.year);
  const closest = closestIn(own) ?? closestIn(model.variants.flatMap((v) => v.schedules));
  return { schedule: scheduleById(catalog, closest?.scheduleId ?? model.fallbackScheduleId), usedFallback: true };
}

const yearsAway = (r: YearRange, year: number) => Math.max(r.from - year, year - r.to, 0);

const nearestYear = (bs: ScheduleBinding[], year: number): ScheduleBinding | undefined =>
  bs.reduce<ScheduleBinding | undefined>((best, b) => (!best || yearsAway(b.years, year) < yearsAway(best.years, year) ? b : best), undefined);

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
