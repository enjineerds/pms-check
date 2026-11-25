import type { Car, Km, DraftLine, Quote, SavedLine, ScheduleId, Verdict, Centavos } from './types';
import type { DraftState } from './draft';
import { decisionFor, priceOf } from './quote';
import { duePointKm } from './service';
import { findService } from '@/sample/catalog';

const unknown: Verdict = { kind: 'ask', reason: { kind: 'unknown-item' }, source: null };

// Stub for the verdict engine.
function toSaved(l: DraftLine): SavedLine | null {
  const price = priceOf(l.price);
  if (price === null || l.match.kind === 'fuzzy') return null;
  const verdict = l.match.kind === 'none' ? unknown : (findService(l.match.serviceId)?.verdict ?? unknown);
  return { id: l.id, rawText: l.rawText, match: l.match, price, verdict, decision: decisionFor(verdict.kind) };
}

export function draftToQuote(d: DraftState, car: Car): Quote {
  const km = car.odometer.km;
  return {
    id: `q-${Date.now()}`,
    carId: car.id,
    shopName: d.shopName,
    visit: { point: { km: duePointKm(km) as Km, months: 12 }, odometerKm: km },
    scheduleId: 'toyota-vios-1.3-cvt-2025' as ScheduleId,
    usedFallbackSchedule: car.variantId === null,
    catalogVersion: 'sample-1',
    quotedTotal: d.quotedTotal as Centavos | null,
    lines: d.lines.map(toSaved).filter((x): x is SavedLine => x !== null),
    createdAt: new Date().toISOString(),
  };
}
