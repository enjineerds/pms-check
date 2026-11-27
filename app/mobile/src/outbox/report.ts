import type { Car, Locale, Quote, SavedLine } from '@/core/types';

export const REPORT_REASONS = ['in-schedule', 'price-range', 'wrong-car', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const NOTE_MAX = 500;

/** The body of `POST /v1/reports`, matched by the Worker's schema in app/worker. */
export interface Report {
  id: string;
  reason: ReportReason;
  note: string | null;
  serviceId: string | null;
  scheduleId: string;
  variantId: string | null;
  visitPointKm: number;
  catalogVersion: string;
  appVersion: string;
  locale: Locale;
  createdAt: string;
}

interface ReportInput {
  id: string;
  reason: ReportReason;
  note: string;
  quote: Quote;
  car: Car | undefined;
  line: SavedLine | undefined;
  locale: Locale;
  appVersion: string;
  now: Date;
}

export function buildReport({ id, reason, note, quote, car, line, locale, appVersion, now }: ReportInput): Report {
  const trimmed = note.trim().slice(0, NOTE_MAX);
  return {
    id,
    reason,
    note: trimmed === '' ? null : trimmed,
    serviceId: line && line.match.kind !== 'none' ? line.match.serviceId : null,
    scheduleId: quote.scheduleId,
    variantId: car?.variantId ?? null,
    visitPointKm: quote.visit.point.km,
    catalogVersion: quote.catalogVersion,
    appVersion,
    locale,
    createdAt: now.toISOString(),
  };
}
