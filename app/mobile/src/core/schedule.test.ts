import type { Car, Km, Transmission, VariantId, YearMonth } from './types';
import { CATALOG, CVT, FALLBACK, MANUAL, MODEL_ID, VARIANT_ID } from './__fixtures__/catalog';
import { cadence, nextPoint, reachedPoint, resolveSchedule } from './schedule';

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

  it('uses the fallback schedule when the variant is not listed and no binding has the transmission', () => {
    expect(resolveSchedule(car({ variantId: null, transmission: 'at' }), CATALOG)).toEqual({
      schedule: expect.objectContaining({ id: FALLBACK.id }),
      usedFallback: true,
    });
  });

  it('keeps the transmission when no binding covers the year', () => {
    expect(resolveSchedule(car({ year: 2019, transmission: 'manual' }), CATALOG)).toEqual({
      schedule: expect.objectContaining({ id: MANUAL.id }),
      usedFallback: true,
    });
  });

  it('keeps the transmission when the variant is not listed', () => {
    expect(resolveSchedule(car({ variantId: null, transmission: 'manual' }), CATALOG)).toEqual({
      schedule: expect.objectContaining({ id: MANUAL.id }),
      usedFallback: true,
    });
  });

  it('uses the fallback schedule when no binding covers the transmission', () => {
    expect(resolveSchedule(car({ transmission: 'at' }), CATALOG).schedule.id).toBe(FALLBACK.id);
  });

  it('uses the fallback schedule for an unknown variant id', () => {
    expect(resolveSchedule(car({ variantId: 'gone' as VariantId }), CATALOG).usedFallback).toBe(true);
  });
});

describe('cadence', () => {
  it('is every 5,000 km or 6 months under severe conditions, set by the oil change', () => {
    expect(cadence(CVT, 'severe')).toEqual({ km: 5_000, months: 6 });
  });

  it('is every 10,000 km or 12 months under normal conditions', () => {
    expect(cadence(CVT, 'normal')).toEqual({ km: 10_000, months: 12 });
  });
});

const TEN_K = { km: 10_000 as Km, months: 12 };

describe('reachedPoint', () => {
  const at = (odometer: number, months: number, tolerance?: { km: number; months: number }) =>
    reachedPoint(odometer as Km, months, TEN_K, tolerance);

  it('is due now at 10,240 km, 240 km past the 10,000 km service', () => {
    expect(at(10_240, 6)).toEqual({ point: { km: 10_000, months: 12 }, status: 'due-now', overKm: 240, overMonths: 0 });
  });

  it('reaches a service 1,000 km early, at exactly the tolerance', () => {
    expect(at(9_000, 6)).toMatchObject({ point: { km: 10_000 }, status: 'due-now', overKm: 0 });
  });

  it('reaches nothing one kilometer before the tolerance', () => {
    expect(at(8_999, 6)).toEqual({ point: null });
  });

  it('stays due now at exactly 1,000 km past, and is overdue one kilometer later', () => {
    expect(at(11_000, 6)).toMatchObject({ status: 'due-now', overKm: 1_000 });
    expect(at(11_001, 6)).toMatchObject({ status: 'overdue', overKm: 1_001 });
  });

  it('reaches a service on months alone when the car is driven little', () => {
    expect(at(3_000, 12)).toMatchObject({ point: { km: 10_000, months: 12 }, status: 'due-now' });
  });

  it('is overdue when months run more than a month past the service', () => {
    expect(at(3_000, 14)).toMatchObject({ status: 'overdue', overMonths: 2 });
  });

  it('returns the latest service reached, on whichever clock is further along', () => {
    expect(at(40_100, 50)).toMatchObject({ point: { km: 40_000, months: 48 } });
    expect(at(12_000, 37)).toMatchObject({ point: { km: 30_000, months: 36 } });
  });
});

describe('nextPoint', () => {
  const next = (odometer: number, months: number) => nextPoint(odometer as Km, months, TEN_K);

  it('is the 20,000 km service, 9,760 km away, right after the 10,000 km one', () => {
    expect(next(10_240, 6)).toEqual({ point: { km: 20_000, months: 24 }, inKm: 9_760, inMonths: 18 });
  });

  it('is the first service for a new car', () => {
    expect(next(0, 0)).toEqual({ point: { km: 10_000, months: 12 }, inKm: 10_000, inMonths: 12 });
  });

  it('moves past a service the moment the odometer reaches it', () => {
    expect(next(10_000, 6)).toMatchObject({ point: { km: 20_000 } });
  });

  it('moves past a service the moment the months reach it', () => {
    expect(next(3_000, 12)).toMatchObject({ point: { km: 20_000 } });
  });
});
