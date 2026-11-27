import type { Centavos, Decision, Km, Quote, SavedLine, ScheduleId, Verdict, VerdictKind } from './types';
import { advisorCard, quoteSummary, savedAmount, totalCheck, totalsByVerdict } from './quote';

const peso = (n: number) => (n * 100) as Centavos;
const VERDICT: Record<VerdictKind, Verdict> = {
  yes: { kind: 'yes', reason: { kind: 'due-now' }, source: null },
  ask: { kind: 'ask', reason: { kind: 'wear-item' }, source: null },
  no: { kind: 'no', reason: { kind: 'not-in-schedule' }, source: null },
};
const line = (id: string, price: number, kind: VerdictKind, decision: Decision): SavedLine => ({
  id,
  rawText: id,
  match: { kind: 'none' },
  price: peso(price),
  verdict: VERDICT[kind],
  decision,
});
const quote = (lines: SavedLine[], id = 'q', carId = 'c'): Quote => ({
  id,
  carId,
  shopName: null,
  visit: { point: { km: 10_000 as Km, months: 12 }, odometerKm: 10_240 as Km },
  scheduleId: 's' as ScheduleId,
  usedFallbackSchedule: false,
  catalogVersion: 'test-1',
  quotedTotal: null,
  lines,
  createdAt: '2026-11-26T00:00:00Z',
});

const oil = line('oil', 2_450, 'yes', 'accept');
const filter = line('filter', 750, 'ask', 'pending');
const flush = line('flush', 1_800, 'no', 'decline');
const injector = line('injector', 2_200, 'no', 'decline');

describe('totalsByVerdict', () => {
  it('sums line prices per verdict, for the result tiles', () => {
    expect(totalsByVerdict([oil, filter, flush, injector])).toEqual({ yes: peso(2_450), ask: peso(750), no: peso(4_000) });
  });
});

describe('totalCheck', () => {
  it('matches when the lines add up to the quoted total', () => {
    expect(totalCheck([peso(2_450), peso(750)], peso(3_200))).toEqual({ kind: 'match' });
  });

  it('reports how much is missing when the lines fall short, like a ₱150 line', () => {
    expect(totalCheck([peso(2_450), peso(750)], peso(3_350))).toEqual({ kind: 'mismatch', missing: peso(150) });
  });

  it('reports a negative amount when the lines add up to more than the quote', () => {
    expect(totalCheck([peso(2_450), peso(750)], peso(3_000))).toEqual({ kind: 'mismatch', missing: peso(-200) });
  });

  it('cannot check without a quoted total', () => {
    expect(totalCheck([peso(2_450)], null)).toEqual({ kind: 'unknown' });
  });
});

describe('advisorCard, SYSTEM_DESIGN §5.5', () => {
  it('lists what to do, what to show first and what to decline, and pays only for what is done', () => {
    expect(advisorCard(quote([oil, filter, flush, injector]))).toEqual({
      doThese: [oil],
      showFirst: [filter],
      notToday: [flush, injector],
      willPay: peso(2_450),
    });
  });

  it('never drops an undecided line from the card', () => {
    expect(advisorCard(quote([filter])).showFirst).toEqual([filter]);
  });
});

describe('savedAmount', () => {
  it('is what the owner declined', () => {
    expect(savedAmount(quote([oil, filter, flush, injector]))).toBe(peso(4_000));
  });
});

describe('quoteSummary', () => {
  const done = quote([oil, flush], 'done');
  const open = quote([oil, filter], 'open');
  const otherCar = quote([flush], 'other', 'c2');

  it('keeps only the given car’s quotes, so a second car starts with no history', () => {
    expect(quoteSummary([done, open, otherCar], 'c2')).toEqual({ open: [], done: [otherCar] });
  });

  it('splits a car’s quotes into ones still being checked and ones decided', () => {
    expect(quoteSummary([done, open, otherCar], 'c')).toEqual({ open: [open], done: [done] });
  });
});
