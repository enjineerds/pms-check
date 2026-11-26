import type { Conditions, Km, SavedLine, Schedule, ServiceKind, ServicePoint } from './types';
import { CATALOG, CVT, FALLBACK, MANUAL, SERVICES, sid } from './__fixtures__/catalog';
import { verdict } from './verdict';

type Match = SavedLine['match'];
const exact = (id: string): Match => ({ kind: 'exact', serviceId: sid(id) });
const visit = (odometer: number, months: number): ServicePoint => ({ km: odometer as Km, months });
const judge = (
  match: Match,
  at: ServicePoint,
  { schedule = CVT, usedFallback = false, conditions = 'severe' as Conditions }: { schedule?: Schedule; usedFallback?: boolean; conditions?: Conditions } = {},
) => verdict({ match }, schedule, at, conditions, usedFallback, CATALOG);
const TEN_K = visit(10_240, 12);

describe('verdict, SYSTEM_DESIGN §5.3', () => {
  it('row 1: an unmatched line is Ask first, as an unknown item', () => {
    expect(judge({ kind: 'none' }, TEN_K)).toEqual({ kind: 'ask', reason: { kind: 'unknown-item' }, source: null });
  });

  it('row 2: an item due at this visit is Say yes, citing the schedule', () => {
    expect(judge(exact('oil-filter'), TEN_K)).toEqual({ kind: 'yes', reason: { kind: 'due-now' }, source: CVT.source });
  });

  it('row 2: a scheduled inspection is Say yes too', () => {
    expect(judge(exact('brake-inspection'), TEN_K).kind).toBe('yes');
  });

  it('row 2: a severe-only oil change at 5,000 km is Say yes under severe conditions', () => {
    expect(judge(exact('oil-filter'), visit(5_000, 6)).kind).toBe('yes');
  });

  it('row 3: the same 5,000 km oil change under normal conditions is Ask first, due at 10,000 km', () => {
    expect(judge(exact('oil-filter'), visit(5_000, 6), { conditions: 'normal' }).reason).toEqual({
      kind: 'other-visit',
      next: { km: 10_000 },
      last: null,
    });
  });

  it('row 2: a time-only item is Say yes when the car reaches its age', () => {
    expect(judge(exact('brake-fluid'), visit(30_000, 36)).kind).toBe('yes');
  });

  it('row 3: a time-only item is Ask first before then, naming the age it is due', () => {
    expect(judge(exact('brake-fluid'), TEN_K).reason).toEqual({ kind: 'other-visit', next: { months: 36 }, last: null });
  });

  it('row 2: an item is due up to 1,000 km either side of its milestone, and not beyond', () => {
    expect(judge(exact('brake-inspection'), visit(9_000, 7)).kind).toBe('yes');
    expect(judge(exact('brake-inspection'), visit(11_000, 7)).kind).toBe('yes');
    expect(judge(exact('brake-inspection'), visit(11_001, 7)).kind).toBe('ask');
  });

  it('row 2: an item reaches its milestone on months before kilometers', () => {
    expect(judge(exact('brake-inspection'), visit(3_000, 12)).kind).toBe('yes');
  });

  it('row 3: an item due at a later visit is Ask first, naming that visit', () => {
    expect(judge(exact('cabin-filter'), TEN_K)).toEqual({
      kind: 'ask',
      reason: { kind: 'other-visit', next: { km: 20_000 }, last: null },
      source: CVT.source,
    });
  });

  it('row 3: names the nearest earlier and later milestones between visits', () => {
    expect(judge(exact('cabin-filter'), visit(30_000, 30)).reason).toEqual({
      kind: 'other-visit',
      next: { km: 40_000 },
      last: { km: 20_000 },
    });
  });

  it('row 3: a missed fixed-point item is Ask first, naming when it was due, never Say no', () => {
    expect(judge(exact('coolant'), visit(210_000, 110)).reason).toEqual({
      kind: 'other-visit',
      next: { km: 300_000 },
      last: { km: 200_000 },
    });
  });

  it('row 2: a fixed-point item is Say yes at its milestone, and again at each repeat after', () => {
    expect(judge(exact('coolant'), visit(200_000, 100)).kind).toBe('yes');
    expect(judge(exact('coolant'), visit(300_000, 150)).kind).toBe('yes');
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
    expect(judge(exact('gear-oil'), visit(60_000, 36)).reason).toEqual({ kind: 'not-in-your-schedule' });
  });

  it('a manual car’s gear oil follows the severe column by default', () => {
    expect(judge(exact('gear-oil'), visit(60_000, 36), { schedule: MANUAL }).kind).toBe('yes');
    expect(judge(exact('gear-oil'), visit(60_000, 36), { schedule: MANUAL, conditions: 'normal' }).kind).toBe('ask');
  });

  it('row 6: an upsell under a fallback schedule is Ask first, not Say no', () => {
    expect(judge(exact('engine-flush'), TEN_K, { schedule: FALLBACK, usedFallback: true })).toEqual({
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
    expect(judge(exact('oil-filter'), TEN_K, { schedule: FALLBACK, usedFallback: true }).kind).toBe('yes');
  });

  it('a service the catalog no longer has is Ask first, as an unknown item', () => {
    expect(judge(exact('retired-service'), TEN_K)).toEqual({ kind: 'ask', reason: { kind: 'unknown-item' }, source: null });
  });
});

describe('the safety rule: Say no has exactly one path', () => {
  const VISITS = [visit(1_000, 1), visit(5_000, 6), TEN_K, visit(30_000, 30), visit(60_000, 36), visit(210_000, 110)];
  const matches = (id: string): Match[] => [exact(id), { kind: 'confirmed', serviceId: sid(id) }, { kind: 'none' }];
  const cases = SERVICES.flatMap((s) =>
    matches(s.id).flatMap((match) =>
      VISITS.flatMap((at) =>
        (['normal', 'severe'] as const).flatMap((conditions) =>
          [false, true].map((usedFallback) => ({ kind: s.kind, match, at, conditions, usedFallback })),
        ),
      ),
    ),
  );

  const mayBeNo = (kind: ServiceKind, match: Match, usedFallback: boolean) =>
    kind === 'upsell' && match.kind !== 'none' && !usedFallback;

  it.each(cases)('$kind, $match.kind match, $at.km km, $conditions, fallback $usedFallback', ({ kind, match, at, conditions, usedFallback }) => {
    const v = judge(match, at, { schedule: usedFallback ? FALLBACK : CVT, usedFallback, conditions });
    expect(v.kind === 'no').toBe(mayBeNo(kind, match, usedFallback));
  });
});

