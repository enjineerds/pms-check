import { DEFAULT_TOLERANCE, ruleFor, type Tolerance } from './schedule';
import type {
  CatalogBundle,
  Conditions,
  ItemRule,
  Km,
  Milestone,
  SavedLine,
  Schedule,
  ScheduledItem,
  ServiceItem,
  ServicePoint,
  Verdict,
} from './types';

type Clock = 'km' | 'months';

/** The rule's milestones on one clock, far enough past `upTo` to name the next one. */
function occurrences(rule: ItemRule, clock: Clock, upTo: number): number[] {
  const fixed = rule.at.map((p) => p[clock]);
  const step = rule.every?.[clock] ?? null;
  if (step === null) return fixed;
  const out = [...fixed];
  for (let x = (fixed.at(-1) ?? 0) + step; x <= upTo + step; x += step) out.push(x);
  return out;
}

const milestone = (clock: Clock, value: number): Milestone =>
  clock === 'km' ? { km: value as Km } : { months: value };

interface Facts {
  service: ServiceItem;
  item: ScheduledItem | undefined;
  schedule: Schedule;
  visit: ServicePoint;
  conditions: Conditions;
  tolerance: Tolerance;
  usedFallback: boolean;
}

function dueNow(item: ScheduledItem, { visit, conditions, tolerance }: Facts): boolean {
  const rule = ruleFor(item, conditions);
  return (['km', 'months'] as const).some((clock) =>
    occurrences(rule, clock, visit[clock]).some((o) => Math.abs(visit[clock] - o) <= tolerance[clock]),
  );
}

function nearest(item: ScheduledItem, { visit, conditions }: Facts) {
  const rule = ruleFor(item, conditions);
  const clock: Clock = rule.every?.km != null || rule.at.length > 0 ? 'km' : 'months';
  const all = occurrences(rule, clock, visit[clock]);
  const next = all.find((o) => o > visit[clock]);
  const last = all.findLast((o) => o < visit[clock]);
  return {
    next: next === undefined ? null : milestone(clock, next),
    last: last === undefined ? null : milestone(clock, last),
  };
}

// SYSTEM_DESIGN §5.3, in order. The first row that answers wins; row 7 is the only path to 'no'.
const ROWS: ((f: Facts) => Verdict | null)[] = [
  (f) => (f.item && dueNow(f.item, f) ? { kind: 'yes', reason: { kind: 'due-now' }, source: f.schedule.source } : null),
  (f) => (f.item ? { kind: 'ask', reason: { kind: 'other-visit', ...nearest(f.item, f) }, source: f.schedule.source } : null),
  ({ service }) => (service.kind === 'wear' ? { kind: 'ask', reason: { kind: 'wear-item' }, source: null } : null),
  ({ service, schedule }) =>
    service.kind === 'scheduled' ? { kind: 'ask', reason: { kind: 'not-in-your-schedule' }, source: schedule.source } : null,
  ({ usedFallback, schedule }) =>
    usedFallback ? { kind: 'ask', reason: { kind: 'approximate-schedule' }, source: schedule.source } : null,
  ({ service, schedule }) =>
    service.kind === 'upsell' ? { kind: 'no', reason: { kind: 'not-in-schedule' }, source: schedule.source } : null,
];

const UNKNOWN: Verdict = { kind: 'ask', reason: { kind: 'unknown-item' }, source: null };

export function verdict(
  line: Pick<SavedLine, 'match'>,
  schedule: Schedule,
  visit: ServicePoint,
  conditions: Conditions,
  usedFallback: boolean,
  catalog: CatalogBundle,
  tolerance: Tolerance = DEFAULT_TOLERANCE,
): Verdict {
  if (line.match.kind === 'none') return UNKNOWN;
  const serviceId = line.match.serviceId;
  const service = catalog.services.find((s) => s.id === serviceId);
  if (!service) return UNKNOWN;
  const facts: Facts = {
    service,
    item: schedule.items.find((i) => i.serviceId === serviceId),
    schedule,
    visit,
    conditions,
    tolerance,
    usedFallback,
  };
  for (const rule of ROWS) {
    const v = rule(facts);
    if (v) return v;
  }
  return UNKNOWN;
}
