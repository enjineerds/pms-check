import type { Km } from './types';
import { isFresh, visitChoices } from './visit';

const every = { km: 5_000 as Km, months: 6 };
const km = (n: number) => n as Km;

describe('visitChoices', () => {
  it('suggests the visit the car has reached, with one either side', () => {
    expect(visitChoices(km(10_240), 6, every)).toEqual({
      suggested: { km: 10_000, months: 12 },
      options: [
        { km: 5_000, months: 6 },
        { km: 10_000, months: 12 },
        { km: 15_000, months: 18 },
      ],
    });
  });

  it('suggests the first service for a car that has reached none', () => {
    const { suggested, options } = visitChoices(km(1_200), 1, every);
    expect(suggested).toEqual({ km: 5_000, months: 6 });
    expect(options.map((p) => p.km)).toEqual([5_000, 10_000]);
  });

  it('lets the months clock pick the visit', () => {
    expect(visitChoices(km(4_000), 13, every).suggested).toEqual({ km: 10_000, months: 12 });
  });
});

describe('isFresh', () => {
  const now = new Date('2026-11-27T00:00:00Z');

  it('trusts a reading from the last 14 days', () => {
    expect(isFresh('2026-11-13T00:00:00Z', now)).toBe(true);
  });

  it('asks again after 14 days', () => {
    expect(isFresh('2026-11-12T00:00:00Z', now)).toBe(false);
  });
});
