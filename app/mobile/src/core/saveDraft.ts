import type { Car, CatalogBundle, Centavos, Conditions, DraftLine, Km, Quote, SavedLine } from './types';
import type { DraftState } from './draft';
import { decisionFor, priceOf } from './quote';
import { ageMonths, cadence, nextPoint, reachedPoint, resolveSchedule } from './schedule';
import { verdict } from './verdict';

export function draftToQuote(d: DraftState, car: Car, catalog: CatalogBundle, now: Date, conditions: Conditions = 'severe'): Quote {
  const { schedule, usedFallback } = resolveSchedule(car, catalog);
  const km = car.odometer.km;
  const months = ageMonths(car.deliveredOn, now);
  const every = cadence(schedule, conditions);
  const reached = reachedPoint(km, months, every);
  const at = { km, months };

  const toSaved = (l: DraftLine): SavedLine | null => {
    const price = priceOf(l.price);
    if (price === null || l.match.kind === 'fuzzy') return null;
    const v = verdict({ match: l.match }, schedule, at, conditions, usedFallback, catalog);
    return { id: l.id, rawText: l.rawText, match: l.match, price, verdict: v, decision: decisionFor(v.kind) };
  };

  return {
    id: `q-${now.getTime()}`,
    carId: car.id,
    shopName: d.shopName,
    visit: { point: reached.point ?? nextPoint(km, months, every).point, odometerKm: km as Km },
    scheduleId: schedule.id,
    usedFallbackSchedule: usedFallback,
    catalogVersion: catalog.version,
    quotedTotal: d.quotedTotal as Centavos | null,
    lines: d.lines.map(toSaved).filter((x): x is SavedLine => x !== null),
    createdAt: now.toISOString(),
  };
}
