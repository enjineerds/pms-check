import { deliveryYears, monthsIn, splitYearMonth, yearMonth } from './delivery';
import { ageMonths } from './schedule';

const now = new Date('2026-11-27T00:00:00Z');

describe('deliveryYears', () => {
  it('runs from this year back to the year before the model year', () => {
    expect(deliveryYears(2023, now)).toEqual([2026, 2025, 2024, 2023, 2022]);
  });

  it('still offers this year for a model year that is ahead of it', () => {
    expect(deliveryYears(2027, now)).toEqual([2026]);
  });
});

describe('monthsIn', () => {
  it('stops at this month in the current year', () => {
    expect(monthsIn(2026, now)).toBe(11);
  });

  it('offers all twelve in a past year', () => {
    expect(monthsIn(2025, now)).toBe(12);
  });
});

describe('yearMonth', () => {
  it('pads the month and splits back to the same parts', () => {
    expect(yearMonth(2024, 3)).toBe('2024-03');
    expect(splitYearMonth(yearMonth(2024, 3))).toEqual({ year: 2024, month: 3 });
  });

  it('starts the months clock at the delivery month', () => {
    expect(ageMonths(yearMonth(2025, 10), now)).toBe(13);
  });
});
