import type { Km, SavedLine, Schedule, ServiceKind } from './types';
import { CATALOG, CVT, FALLBACK, POINTS, SERVICES, sid } from './__fixtures__/catalog';
import { verdict } from './verdict';

type Match = SavedLine['match'];
const exact = (id: string): Match => ({ kind: 'exact', serviceId: sid(id) });
const judge = (match: Match, visitIndex: number, schedule: Schedule = CVT, usedFallback = false) =>
  verdict({ match }, schedule, visitIndex, usedFallback, CATALOG);
const TEN_K = 1;

describe('verdict, SYSTEM_DESIGN §5.3', () => {
  it('row 1: an unmatched line is Ask first, as an unknown item', () => {
    expect(judge({ kind: 'none' }, TEN_K)).toEqual({ kind: 'ask', reason: { kind: 'unknown-item' }, source: null });
  });

  it('row 2: an item scheduled at this visit is Say yes, citing the schedule', () => {
    expect(judge(exact('oil-filter'), TEN_K)).toEqual({ kind: 'yes', reason: { kind: 'due-now' }, source: CVT.source });
  });

  it('row 2: a scheduled inspection is Say yes too', () => {
    expect(judge(exact('brake-inspection'), TEN_K).kind).toBe('yes');
  });

  it('row 3: an item due at a later visit is Ask first, naming that visit', () => {
    expect(judge(exact('cabin-filter'), TEN_K)).toEqual({
      kind: 'ask',
      reason: { kind: 'other-visit', nextKm: 20_000 as Km, lastKm: null },
      source: CVT.source,
    });
  });

  it('row 3: a missed fixed-point item is Ask first, naming when it was due, never Say no', () => {
    expect(judge(exact('coolant'), 5).reason).toEqual({ kind: 'other-visit', nextKm: null, lastKm: 40_000 as Km });
  });

  it('row 3: names the nearest earlier and later visits', () => {
    expect(judge(exact('cabin-filter'), 3).reason).toEqual({
      kind: 'other-visit',
      nextKm: 40_000 as Km,
      lastKm: 20_000 as Km,
    });
  });

  it('row 4: a wear item is Ask first, to see the worn part', () => {
    expect(judge(exact('brake-pads'), TEN_K)).toEqual({ kind: 'ask', reason: { kind: 'wear-item' }, source: null });
  });

  it('row 5: a scheduled item missing from this car’s schedule is Ask first', () => {
    expect(judge(exact('spark-plugs'), TEN_K)).toEqual({
      kind: 'ask',
      reason: { kind: 'not-in-your-schedule' },
      source: CVT.source,
    });
  });

  it('row 5: another transmission’s fluid is not in this car’s schedule', () => {
    expect(judge(exact('gear-oil'), 4).reason).toEqual({ kind: 'not-in-your-schedule' });
  });

  it('row 6: an upsell under a fallback schedule is Ask first, not Say no', () => {
    expect(judge(exact('engine-flush'), TEN_K, FALLBACK, true)).toEqual({
      kind: 'ask',
      reason: { kind: 'approximate-schedule' },
      source: FALLBACK.source,
    });
  });

  it('row 7: an upsell matched with certainty against the car’s own schedule is Say no', () => {
    expect(judge(exact('engine-flush'), TEN_K)).toEqual({
      kind: 'no',
      reason: { kind: 'not-in-schedule' },
      source: CVT.source,
    });
  });

  it('row 7: a user-confirmed match counts as certain', () => {
    expect(judge({ kind: 'confirmed', serviceId: sid('engine-flush') }, TEN_K).kind).toBe('no');
  });

  it('row 2 wins over the fallback rule: a due item stays Say yes on a fallback schedule', () => {
    expect(judge(exact('oil-filter'), TEN_K, FALLBACK, true).kind).toBe('yes');
  });

  it('the first service says yes to the oil change and asks about the inspection due at 10,000 km', () => {
    expect(judge(exact('oil-filter'), 0).kind).toBe('yes');
    expect(judge(exact('brake-inspection'), 0).reason).toEqual({
      kind: 'other-visit',
      nextKm: 10_000 as Km,
      lastKm: null,
    });
  });

  it('a service the catalog no longer has is Ask first, as an unknown item', () => {
    expect(judge(exact('retired-service'), TEN_K)).toEqual({ kind: 'ask', reason: { kind: 'unknown-item' }, source: null });
  });
});

describe('the safety rule: Say no has exactly one path', () => {
  const matches = (id: string): Match[] => [exact(id), { kind: 'confirmed', serviceId: sid(id) }, { kind: 'none' }];
  const cases = SERVICES.flatMap((s) =>
    matches(s.id).flatMap((match) =>
      POINTS.flatMap((_, visitIndex) =>
        [false, true].map((usedFallback) => ({ kind: s.kind, match, visitIndex, usedFallback })),
      ),
    ),
  );

  const mayBeNo = (kind: ServiceKind, match: Match, usedFallback: boolean) =>
    kind === 'upsell' && match.kind !== 'none' && !usedFallback;

  it.each(cases)('$kind, $match.kind match, visit $visitIndex, fallback $usedFallback', ({ kind, match, visitIndex, usedFallback }) => {
    const v = judge(match, visitIndex, usedFallback ? FALLBACK : CVT, usedFallback);
    expect(v.kind === 'no').toBe(mayBeNo(kind, match, usedFallback));
  });
});
