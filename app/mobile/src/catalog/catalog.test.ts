import { resolveSchedule } from '@/core/schedule';
import { verdict } from '@/core/verdict';
import type { Conditions, Km, Schedule, ServiceId, Verdict } from '@/core/types';
import { CITY_CVT, CITY_MT, HONDA_CITY } from './hondaCity';
import { CATALOG, searchServices, serviceByName } from './index';

describe('catalog integrity, SYSTEM_DESIGN §9', () => {
  const service = (id: ServiceId) => CATALOG.services.find((s) => s.id === id);
  const items = CATALOG.schedules.flatMap((s) => s.items.map((i) => ({ schedule: s.id, ...i })));

  it('has unique service ids', () => {
    const ids = CATALOG.services.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('never gives two services the same alias, so a quote line can only match one', () => {
    const aliases = CATALOG.services.flatMap((s) => s.aliases);
    expect(aliases.filter((a, i) => aliases.indexOf(a) !== i)).toEqual([]);
  });

  it.each(items)('$schedule $serviceId names a scheduled service', ({ serviceId }) => {
    expect(service(serviceId)?.kind).toBe('scheduled');
  });

  it.each(items)('$schedule $serviceId cites its manual page', ({ page }) => {
    expect(page).toMatch(/^\d+$/);
  });

  it.each(items.flatMap((i) => [i.normal, i.severe].filter((r) => r !== undefined).map((rule) => ({ ...i, rule }))))(
    '$schedule $serviceId rule sets a clock and keeps milestones in order',
    ({ rule }) => {
      const hasClock = rule.at.length > 0 || rule.every?.km != null || rule.every?.months != null;
      expect(hasClock).toBe(true);
      const kms = rule.at.map((p) => p.km);
      expect(kms).toEqual([...kms].sort((a, b) => a - b));
    },
  );

  it.each([
    ['cvt', CITY_CVT.id],
    ['manual', CITY_MT.id],
  ] as const)('gives a %s City from an unbound year its own transmission schedule', (transmission, scheduleId) => {
    const car = { modelId: HONDA_CITY.id, variantId: HONDA_CITY.variants[0].id, year: 2021, transmission };
    expect(resolveSchedule(car, CATALOG)).toEqual({ schedule: expect.objectContaining({ id: scheduleId }), usedFallback: true });
  });

  it.each([2022, 2023, 2024, 2025, 2026].flatMap((year) => [
    [year, 'cvt', CITY_CVT.id],
    [year, 'manual', CITY_MT.id],
  ] as const))('binds a %i %s City to the manual’s schedule', (year, transmission, scheduleId) => {
    const car = { modelId: HONDA_CITY.id, variantId: HONDA_CITY.variants[0].id, year, transmission };
    expect(resolveSchedule(car, CATALOG)).toEqual({ schedule: expect.objectContaining({ id: scheduleId }), usedFallback: false });
  });

  it('resolves every schedule a model binds to, and its fallback', () => {
    const ids = new Set(CATALOG.schedules.map((s) => s.id));
    for (const m of CATALOG.models) {
      expect(ids.has(m.fallbackScheduleId)).toBe(true);
      for (const b of m.variants.flatMap((v) => v.schedules)) expect(ids.has(b.scheduleId)).toBe(true);
    }
  });
});

describe('Honda City golden verdicts, from the manual table on pp. 404–406', () => {
  const judge = (schedule: Schedule, id: string, km: number, months: number, conditions: Conditions = 'severe'): Verdict =>
    verdict({ match: { kind: 'exact', serviceId: id as ServiceId } }, schedule, { km: km as Km, months }, conditions, false, CATALOG);
  const kind = (...args: Parameters<typeof judge>) => judge(...args).kind;

  it('at the 10,000 km / 6 month visit, says yes to the severe oil change and filter, the brake check and the tire rotation', () => {
    for (const id of ['engine-oil', 'oil-filter', 'brake-inspection', 'tire-rotation', 'chassis-inspection'])
      expect([id, kind(CITY_CVT, id, 10_000, 6)]).toEqual([id, 'yes']);
  });

  it('at the 10,000 km / 6 month visit, asks about items due later and names when', () => {
    expect(judge(CITY_CVT, 'cabin-filter', 10_000, 6).reason).toEqual({ kind: 'other-visit', next: { km: 20_000 }, last: null });
    expect(judge(CITY_CVT, 'air-cleaner', 10_000, 6).reason).toEqual({ kind: 'other-visit', next: { km: 30_000 }, last: null });
    expect(judge(CITY_CVT, 'cvt-fluid', 10_000, 6).reason).toEqual({ kind: 'other-visit', next: { km: 40_000 }, last: null });
    expect(judge(CITY_CVT, 'brake-fluid', 10_000, 6).reason).toEqual({ kind: 'other-visit', next: { months: 36 }, last: null });
  });

  it('under normal conditions the oil filter waits until 20,000 km', () => {
    expect(kind(CITY_CVT, 'oil-filter', 10_000, 6, 'normal')).toBe('ask');
  });

  it('at 20,000 km / 12 months, the first parking brake check, cabin filter and line inspection are due', () => {
    for (const id of ['parking-brake', 'cabin-filter', 'lines-inspection']) expect([id, kind(CITY_CVT, id, 20_000, 12)]).toEqual([id, 'yes']);
  });

  it('at 40,000 km / 24 months, the CVT fluid, drive belt and second parking brake check are due', () => {
    for (const id of ['cvt-fluid', 'drive-belt', 'parking-brake']) expect([id, kind(CITY_CVT, id, 40_000, 24)]).toEqual([id, 'yes']);
  });

  it('at 30,000 km / 36 months, the air filter and the 3-year brake fluid are due', () => {
    for (const id of ['air-cleaner', 'brake-fluid']) expect([id, kind(CITY_CVT, id, 30_000, 36)]).toEqual([id, 'yes']);
  });

  it('a manual car gets transmission fluid at 60,000 km under severe conditions, 120,000 km under normal', () => {
    expect(kind(CITY_MT, 'mt-fluid', 60_000, 36)).toBe('yes');
    expect(judge(CITY_MT, 'mt-fluid', 60_000, 36, 'normal').reason).toEqual({ kind: 'other-visit', next: { km: 120_000 }, last: null });
  });

  it('a CVT car is not scheduled for manual transmission fluid', () => {
    expect(judge(CITY_CVT, 'mt-fluid', 60_000, 36).reason).toEqual({ kind: 'not-in-your-schedule' });
  });

  it('says no to an engine flush and injector cleaning, and asks to see worn brake pads', () => {
    expect(kind(CITY_CVT, 'engine-flush', 10_000, 6)).toBe('no');
    expect(kind(CITY_CVT, 'injector-cleaning', 10_000, 6)).toBe('no');
    expect(judge(CITY_CVT, 'brake-pads', 10_000, 6).reason).toEqual({ kind: 'wear-item' });
  });
});

describe('finding services by what the owner types', () => {
  it('finds a service by its name in either language, or by a quote alias, ignoring case', () => {
    expect(serviceByName('Engine oil')?.id).toBe('engine-oil');
    expect(serviceByName('langis ng makina')?.id).toBe('engine-oil');
    expect(serviceByName('change oil')?.id).toBe('engine-oil');
    expect(serviceByName('underwash')).toBeUndefined();
  });

  it('searches names and aliases, showing names in the owner’s language', () => {
    expect(searchServices('flush', 'en').map((s) => s.id)).toEqual(['engine-flush']);
    expect(searchServices('preno', 'fil').map((s) => s.id)).toContain('brake-inspection');
    expect(searchServices('dust and pollen', 'en').map((s) => s.id)).toEqual(['cabin-filter']);
  });
});
