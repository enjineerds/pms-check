import { CATALOG } from '@/catalog';
import type { Car, Centavos, DraftLine, Km, ModelId, ServiceId, VariantId, Visit, YearMonth } from './types';
import { initialDraft } from './draft';
import { draftToQuote } from './saveDraft';
import { ageMonths, serviceFor } from './schedule';

const city: Car = {
  id: 'car-1',
  modelId: 'honda-city' as ModelId,
  variantId: 'honda-city-sedan' as VariantId,
  year: 2026,
  transmission: 'cvt',
  deliveredOn: '2026-01' as YearMonth,
  bodyStyle: 'sedan',
  odometer: { km: 10_240 as Km, readAt: '2026-07-15T00:00:00Z' },
  isCurrent: true,
  createdAt: '2026-01-10T00:00:00Z',
};

const line = (id: string, rawText: string, match: DraftLine['match'], price: DraftLine['price']): DraftLine => ({
  id,
  rawText,
  match,
  price,
  origin: 'scanned',
});
const peso = (n: number) => ({ kind: 'read' as const, value: (n * 100) as Centavos });
const exact = (id: string) => ({ kind: 'exact' as const, serviceId: id as ServiceId });

const draft = {
  ...initialDraft,
  shopName: 'Test Motors',
  quotedTotal: (8_200 * 100) as Centavos,
  lines: [
    line('l1', 'CHANGE OIL', exact('engine-oil'), peso(2_450)),
    line('l2', 'ENGINE FLUSH', exact('engine-flush'), peso(1_800)),
    line('l3', 'CABIN FILTER', exact('cabin-filter'), peso(750)),
    line('l4', 'UNDERWASH', { kind: 'none' }, peso(400)),
  ],
};

describe('ageMonths', () => {
  it('counts whole calendar months since delivery', () => {
    expect(ageMonths('2026-01' as YearMonth, new Date('2026-07-15T00:00:00Z'))).toBe(6);
    expect(ageMonths('2025-11' as YearMonth, new Date('2026-02-01T00:00:00Z'))).toBe(3);
  });
});

const visit = (km: number, months: number, odometerKm: number): Visit => ({
  point: { km: km as Km, months },
  odometerKm: odometerKm as Km,
});

describe('draftToQuote', () => {
  const quote = draftToQuote(draft, visit(10_000, 12, 10_240), city, CATALOG, new Date('2026-07-15T00:00:00Z'));

  it('judges every line against the car’s own schedule at its km and age', () => {
    expect(quote.lines.map((l) => [l.rawText, l.verdict.kind])).toEqual([
      ['CHANGE OIL', 'yes'],
      ['ENGINE FLUSH', 'no'],
      ['CABIN FILTER', 'ask'],
      ['UNDERWASH', 'ask'],
    ]);
  });

  it('starts each line’s decision from its verdict', () => {
    expect(quote.lines.map((l) => l.decision)).toEqual(['accept', 'decline', 'pending', 'pending']);
  });

  it('records the visit, the schedule and the catalog it was judged with', () => {
    expect(quote).toMatchObject({
      visit: { point: { km: 10_000, months: 12 }, odometerKm: 10_240 },
      scheduleId: 'honda-city-2026-cvt',
      usedFallbackSchedule: false,
      catalogVersion: CATALOG.version,
      shopName: 'Test Motors',
    });
  });

  it('judges at the confirmed visit, not the odometer saved at car setup', () => {
    const fromSetup = { ...city, odometer: { km: 1_500 as Km, readAt: '2026-01-10T00:00:00Z' } };
    const april = new Date('2026-04-15T00:00:00Z');
    const kinds = (v: Visit) => draftToQuote(draft, v, fromSetup, CATALOG, april).lines.map((l) => l.verdict.kind);
    expect(kinds(visit(5_000, 6, 5_100))).toEqual(['yes', 'no', 'ask', 'ask']);
    expect(kinds(visit(20_000, 24, 19_800))).toEqual(['yes', 'no', 'yes', 'ask']);
    expect(draftToQuote(draft, visit(5_000, 6, 5_100), fromSetup, CATALOG, april).visit).toEqual(visit(5_000, 6, 5_100));
  });
});

describe('serviceFor', () => {
  const at = (km: number, months: number) => serviceFor(city, km as Km, months, CATALOG);

  it('puts a six-month-old City at 10,240 km at its due 10,000 km visit, with 15,000 km after it under severe conditions', () => {
    expect(at(10_240, 6)).toEqual({
      every: { km: 5_000, months: 6 },
      due: { km: 10_000, months: 12 },
      reached: true,
      when: { kind: 'past', km: 240 },
      after: { km: 15_000, months: 18 },
    });
  });

  it('points a new car at its first visit, not yet reached', () => {
    expect(at(1_200, 1)).toMatchObject({ due: { km: 5_000, months: 6 }, reached: false, after: { km: 10_000 } });
  });

  it('follows the normal schedule when asked', () => {
    expect(serviceFor(city, 10_240 as Km, 6, CATALOG, 'normal')).toMatchObject({ every: { km: 10_000, months: 12 } });
  });
});
