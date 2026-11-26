import type { Car, CatalogBundle, Centavos, Conditions, DraftLine, Quote, SavedLine, Visit } from './types';
import type { DraftState } from './draft';
import { decisionFor, priceOf } from './quote';
import { ageMonths, resolveSchedule } from './schedule';
import { verdict } from './verdict';

export function draftToQuote(
  d: DraftState,
  visit: Visit,
  car: Car,
  catalog: CatalogBundle,
  now: Date,
  conditions: Conditions = 'severe',
): Quote {
  const { schedule, usedFallback } = resolveSchedule(car, catalog);
  const at = { km: visit.point.km, months: ageMonths(car.deliveredOn, now) };

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
    visit,
    scheduleId: schedule.id,
    usedFallbackSchedule: usedFallback,
    catalogVersion: catalog.version,
    quotedTotal: d.quotedTotal as Centavos | null,
    lines: d.lines.map(toSaved).filter((x): x is SavedLine => x !== null),
    createdAt: now.toISOString(),
  };
}
