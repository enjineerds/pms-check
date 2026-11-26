import type { Centavos, Decision, DraftLine, LinePrice, Locale, Quote, SavedLine, VerdictKind } from './types';
import { groupDigits } from './money';
import { findService } from '@/catalog';
import type { Copy } from '@/i18n/en';

export const priceOf = (p: LinePrice): Centavos | null => {
  switch (p.kind) {
    case 'read':
    case 'confirmed':
      return p.value;
    case 'unsure':
      return p.guess;
    case 'missing':
      return null;
  }
};

export const sum = (xs: readonly Centavos[]): Centavos => xs.reduce((a, b) => a + b, 0) as Centavos;

export const draftTotal = (lines: readonly DraftLine[]): Centavos =>
  sum(lines.map((l) => priceOf(l.price) ?? (0 as Centavos)));

export const isResolved = (l: DraftLine) =>
  (l.price.kind === 'read' || l.price.kind === 'confirmed') && l.match.kind !== 'fuzzy';

export const totalsByVerdict = (lines: readonly SavedLine[]): Record<VerdictKind, Centavos> => {
  const of = (k: VerdictKind) => sum(lines.filter((l) => l.verdict.kind === k).map((l) => l.price));
  return { yes: of('yes'), ask: of('ask'), no: of('no') };
};

export const byDecision = (lines: readonly SavedLine[], d: Decision) => lines.filter((l) => l.decision === d);

export type TotalCheck = { kind: 'unknown' } | { kind: 'match' } | { kind: 'mismatch'; missing: Centavos };

export function totalCheck(prices: readonly Centavos[], quotedTotal: Centavos | null): TotalCheck {
  if (quotedTotal === null) return { kind: 'unknown' };
  const missing = (quotedTotal - sum(prices)) as Centavos;
  return missing === 0 ? { kind: 'match' } : { kind: 'mismatch', missing };
}

export function advisorCard(q: Quote) {
  const doThese = byDecision(q.lines, 'accept');
  return {
    doThese,
    showFirst: byDecision(q.lines, 'pending'),
    notToday: byDecision(q.lines, 'decline'),
    willPay: sum(doThese.map((l) => l.price)),
  };
}

export const quotedSum = (q: Quote): Centavos => sum(q.lines.map((l) => l.price));

export const isChecking = (q: Quote) => q.lines.some((l) => l.decision === 'pending');

export const savedAmount = (q: Quote): Centavos => sum(byDecision(q.lines, 'decline').map((l) => l.price));

export const decisionFor = (k: VerdictKind): Decision => (k === 'yes' ? 'accept' : k === 'no' ? 'decline' : 'pending');

export const lineName = (l: SavedLine, locale: Locale): string =>
  l.match.kind === 'none' ? l.rawText : (findService(l.match.serviceId)?.name[locale] ?? l.rawText);


/** `months: 0` marks a one-off job, not a PMS point. */
export const quoteTitle = (q: Quote, t: Copy['quote']): string =>
  q.visit.point.months === 0 ? t.oilChange : t.service(groupDigits(q.visit.point.km));

export function formatDay(iso: string, t: Copy['quote'], now = new Date()): string {
  const d = new Date(iso);
  return d.toDateString() === now.toDateString() ? t.today : `${d.getDate()} ${t.months[d.getMonth()]}`;
}
