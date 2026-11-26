import { en } from '@/i18n/en';
import type { Km, Milestone, Verdict } from './types';
import { reasonShort } from './verdictCopy';

const otherVisit = (next: Milestone | null, last: Milestone | null): Verdict => ({
  kind: 'ask',
  reason: { kind: 'other-visit', next, last },
  source: null,
});

describe('reasonShort for an item due at another visit', () => {
  it('names the next distance', () => {
    expect(reasonShort(otherVisit({ km: 20_000 as Km }, null), en.verdict)).toBe('Due at 20,000 km');
  });

  it('names the next age for a time-only item', () => {
    expect(reasonShort(otherVisit({ months: 36 }, null), en.verdict)).toBe('Due at 36 months');
  });

  it('names when a missed item was due when nothing comes next', () => {
    expect(reasonShort(otherVisit(null, { km: 200_000 as Km }), en.verdict)).toBe('Was due at 200,000 km');
  });
});
