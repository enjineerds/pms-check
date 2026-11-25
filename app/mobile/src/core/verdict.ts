import type { CatalogBundle, Km, SavedLine, Schedule, ScheduledItem, ServiceItem, Verdict } from './types';

interface Facts {
  service: ServiceItem;
  row: ScheduledItem | undefined;
  schedule: Schedule;
  visitIndex: number;
  usedFallback: boolean;
}

const kmAt = (schedule: Schedule, index: number | undefined): Km | null =>
  index === undefined ? null : schedule.points[index].km;

// SYSTEM_DESIGN §5.3, in order. The first row that answers wins; row 7 is the only path to 'no'.
const ROWS: ((f: Facts) => Verdict | null)[] = [
  ({ row, visitIndex, schedule }) =>
    row?.dueAt.includes(visitIndex) ? { kind: 'yes', reason: { kind: 'due-now' }, source: schedule.source } : null,
  ({ row, visitIndex, schedule }) =>
    row
      ? {
          kind: 'ask',
          reason: {
            kind: 'other-visit',
            nextKm: kmAt(schedule, row.dueAt.find((i) => i > visitIndex)),
            lastKm: kmAt(schedule, row.dueAt.findLast((i) => i < visitIndex)),
          },
          source: schedule.source,
        }
      : null,
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
  visitIndex: number,
  usedFallback: boolean,
  catalog: CatalogBundle,
): Verdict {
  if (line.match.kind === 'none') return UNKNOWN;
  const serviceId = line.match.serviceId;
  const service = catalog.services.find((s) => s.id === serviceId);
  if (!service) return UNKNOWN;
  const facts: Facts = {
    service,
    row: schedule.items.find((i) => i.serviceId === serviceId),
    schedule,
    visitIndex,
    usedFallback,
  };
  for (const rule of ROWS) {
    const v = rule(facts);
    if (v) return v;
  }
  return UNKNOWN;
}
