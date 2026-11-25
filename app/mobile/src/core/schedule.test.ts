import type { Car, Km, Transmission, VariantId, YearMonth } from './types';
import { CATALOG, CVT, FALLBACK, MANUAL, MODEL_ID, VARIANT_ID } from './__fixtures__/catalog';
import { nextPoint, reachedPoint, resolveSchedule } from './schedule';

const car = (over: Partial<Car> = {}): Car => ({
  id: 'car-1',
  modelId: MODEL_ID,
  variantId: VARIANT_ID,
  year: 2023,
  transmission: 'cvt',
  deliveredOn: '2023-01' as YearMonth,
  bodyStyle: 'sedan',
  odometer: { km: 0 as Km, readAt: '2023-01-01T00:00:00Z' },
  isCurrent: true,
  createdAt: '2023-01-01T00:00:00Z',
  ...over,
});

describe('resolveSchedule', () => {
  it.each<[Transmission, string]>([
    ['cvt', CVT.id],
    ['manual', MANUAL.id],
  ])('binds a %s car to its own schedule', (transmission, scheduleId) => {
    expect(resolveSchedule(car({ transmission }), CATALOG)).toEqual({
      schedule: expect.objectContaining({ id: scheduleId }),
      usedFallback: false,
    });
  });

  it('uses the fallback schedule when the variant is not listed', () => {
    expect(resolveSchedule(car({ variantId: null }), CATALOG)).toEqual({
      schedule: expect.objectContaining({ id: FALLBACK.id }),
      usedFallback: true,
    });
  });

  it('uses the fallback schedule when no binding covers the year', () => {
    expect(resolveSchedule(car({ year: 2019 }), CATALOG).usedFallback).toBe(true);
  });

  it('uses the fallback schedule when no binding covers the transmission', () => {
    expect(resolveSchedule(car({ transmission: 'at' }), CATALOG).schedule.id).toBe(FALLBACK.id);
  });

  it('uses the fallback schedule for an unknown variant id', () => {
    expect(resolveSchedule(car({ variantId: 'gone' as VariantId }), CATALOG).usedFallback).toBe(true);
  });
});

describe('reachedPoint', () => {
  const at = (odometer: number, months: number, tolerance?: { km: number; months: number }) =>
    reachedPoint(odometer as Km, months, CVT, tolerance);

  it('is due now at 10,240 km, 240 km past the 10,000 km service', () => {
    expect(at(10_240, 6)).toEqual({ index: 1, status: 'due-now', overKm: 240, overMonths: 0 });
  });

  it('reaches a point 1,000 km early, at exactly the tolerance', () => {
    expect(at(9_000, 6)).toMatchObject({ index: 1, status: 'due-now', overKm: 0 });
  });

  it('does not reach a point one kilometer before the tolerance', () => {
    expect(at(8_999, 6)).toMatchObject({ index: 0 });
  });

  it('stays due now at exactly 1,000 km past, and is overdue one kilometer later', () => {
    expect(at(11_000, 6)).toMatchObject({ index: 1, status: 'due-now', overKm: 1_000 });
    expect(at(11_001, 6)).toMatchObject({ index: 1, status: 'overdue', overKm: 1_001 });
  });

  it('reaches a point on months alone when the car is driven little', () => {
    expect(at(3_000, 12)).toMatchObject({ index: 1, status: 'due-now', overKm: 0, overMonths: 0 });
  });

  it('is overdue when months run more than a month past the point', () => {
    expect(at(3_000, 14)).toMatchObject({ index: 1, status: 'overdue', overMonths: 2 });
  });

  it('reaches the first service at 1,000 km', () => {
    expect(at(1_000, 0)).toMatchObject({ index: 0, status: 'due-now' });
  });

  it('reaches no point when nothing is due and tolerance is zero', () => {
    expect(at(500, 0, { km: 0, months: 0 })).toEqual({ index: null });
  });

  it('returns the latest point reached, not the first', () => {
    expect(at(40_100, 50)).toMatchObject({ index: 4 });
  });
});

describe('nextPoint', () => {
  const next = (odometer: number, months: number) => nextPoint(odometer as Km, months, CVT);

  it('is the 20,000 km service, 9,760 km away, right after the 10,000 km one', () => {
    expect(next(10_240, 6)).toEqual({ index: 2, inKm: 9_760, inMonths: 18 });
  });

  it('is the first service for a new car', () => {
    expect(next(0, 0)).toEqual({ index: 0, inKm: 1_000, inMonths: 1 });
  });

  it('moves past a point the moment the odometer reaches it', () => {
    expect(next(10_000, 6)).toMatchObject({ index: 2 });
  });

  it('moves past a point the moment the months reach it', () => {
    expect(next(3_000, 12)).toMatchObject({ index: 2 });
  });

  it('has no next point past the last one in the schedule', () => {
    expect(next(50_500, 61)).toEqual({ index: null });
  });
});
