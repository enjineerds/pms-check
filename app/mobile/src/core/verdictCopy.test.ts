import { en } from '@/i18n/en';
import type { Centavos, Km, Milestone, Verdict } from './types';
import { manualSays, reasonShort, resultHeadline } from './verdictCopy';

const otherVisit = (next: Milestone | null, last: Milestone | null): Verdict => ({
  kind: 'ask',
  reason: { kind: 'other-visit', next, last },
  source: null,
});

describe('reasonShort for an item due at another visit', () => {
  it('names the next distance', () => {
    expect(reasonShort(otherVisit({ km: 20_000 as Km }, null), en.verdict, 'Honda')).toBe('Due at 20,000 km');
  });

  it('names the next age for a time-only item', () => {
    expect(reasonShort(otherVisit({ months: 36 }, null), en.verdict, 'Honda')).toBe('Due at 36 months');
  });

  it('names the missed milestone first, so the owner asks whether it was done', () => {
    expect(reasonShort(otherVisit({ km: 10_000 as Km }, { km: 5_000 as Km }), en.verdict, 'Honda')).toBe('Was due at 5,000 km');
  });

  it('names when a missed item was due when nothing comes next', () => {
    expect(reasonShort(otherVisit(null, { km: 200_000 as Km }), en.verdict, 'Honda')).toBe('Was due at 200,000 km');
  });
});

describe('manualSays', () => {
  const t = en.item;
  const km = (n: number) => n as Km;
  const rule = (every: { km: number | null; months: number | null }, at: { km: number; months: number }[] = []) => ({
    at: at.map((p) => ({ km: km(p.km), months: p.months })),
    every: { km: every.km === null ? null : km(every.km), months: every.months },
  });

  it('states a distance-or-time interval', () => {
    expect(manualSays('scheduled', rule({ km: 10_000, months: 12 }), 'Honda', t, en.verdict)).toBe(
      'Honda lists this every 10,000 km or 12 months.',
    );
  });

  it('states a distance-only interval', () => {
    expect(manualSays('scheduled', rule({ km: 30_000, months: null }), 'Honda', t, en.verdict)).toBe(
      'Honda lists this every 30,000 km.',
    );
  });

  it('states a first milestone and the repeat after it', () => {
    expect(manualSays('scheduled', rule({ km: 100_000, months: 60 }, [{ km: 200_000, months: 120 }]), 'Honda', t, en.verdict)).toBe(
      'Honda lists this at 200,000 km or 120 months, then every 100,000 km or 60 months.',
    );
  });

  it('says an upsell is not in the schedule and a wear part is replaced when worn', () => {
    expect(manualSays('upsell', undefined, 'Honda', t, en.verdict)).toBe('Honda’s schedule does not list this.');
    expect(manualSays('wear', undefined, 'Honda', t, en.verdict)).toBe('This part is replaced when an inspection finds it worn.');
  });

  it('has nothing to say about a scheduled item missing from this car’s schedule', () => {
    expect(manualSays('scheduled', undefined, 'Honda', t, en.verdict)).toBeUndefined();
  });
});

describe('resultHeadline', () => {
  const totals = (yes: number, ask: number, no: number) => ({ yes: yes as Centavos, ask: ask as Centavos, no: no as Centavos });

  it('leads with what to say no to', () => {
    expect(resultHeadline(totals(340_000, 75_000, 400_000), en.result)).toBe('Say no to ₱4,000 of this quote.');
  });

  it('asks about the open amount when nothing is a clear no', () => {
    expect(resultHeadline(totals(1_000_000, 22_310_000, 0), en.result)).toBe('Ask about ₱223,100 of this quote first.');
  });

  it('says everything is in the schedule only when every line is a yes', () => {
    expect(resultHeadline(totals(340_000, 0, 0), en.result)).toBe('Everything here is in the schedule.');
  });
});
