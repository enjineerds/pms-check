import type { Copy } from '@/i18n/en';
import type { Centavos, ItemRule, Milestone, SavedLine, ServiceKind, Verdict, VerdictKind } from './types';
import { formatKm, formatPeso } from './money';

type VerdictCopy = Copy['verdict'];

const when = (m: Milestone, t: VerdictCopy) => ('km' in m ? formatKm(m.km) : t.reason.ageMonths(m.months));

export function reasonShort(v: Verdict, t: VerdictCopy, make: string): string {
  switch (v.reason.kind) {
    case 'due-now':
      return t.reason.dueNow(make);
    case 'other-visit':
      if (v.reason.last) return t.reason.wasDueAt(when(v.reason.last, t));
      return v.reason.next ? t.reason.dueAt(when(v.reason.next, t)) : t.reason.wasDue;
    case 'wear-item':
      return t.reason.wear;
    case 'not-in-your-schedule':
      return t.reason.notInYours;
    case 'approximate-schedule':
      return t.reason.approximate;
    case 'not-in-schedule':
      return t.reason.notInSchedule;
    case 'unknown-item':
      return t.reason.unknown;
  }
}

export const lineNote = (l: SavedLine, t: VerdictCopy): string | undefined =>
  l.match.kind === 'none' ? t.unlisted : undefined;

export function itemHeadline(v: Verdict, model: string, t: VerdictCopy): string {
  if (v.kind === 'yes') return t.headline.yes(model);
  if (v.kind === 'no') return t.headline.no(model);
  if (v.reason.kind === 'other-visit') return t.headline.notDue;
  if (v.reason.kind === 'wear-item') return t.headline.wear;
  return t.headline.unsure;
}

export function sayThis(v: Verdict, name: string, km: number, t: VerdictCopy): string {
  const n = name.toLowerCase();
  if (v.kind === 'yes') return t.say.yes(n);
  if (v.kind === 'no') return t.say.no(n, formatKm(km));
  return t.say.ask(n);
}

const interval = (p: { km: number | null; months: number | null }, t: Copy['item'], v: VerdictCopy): string => {
  const parts = [p.km === null ? null : formatKm(p.km), p.months === null ? null : v.reason.ageMonths(p.months)].filter(
    (x) => x !== null,
  );
  return parts.length === 2 ? t.either(parts[0], parts[1]) : parts[0];
};

/** "What the manual says", read off the transcribed rule so it can never disagree with the verdict. */
export function manualSays(
  kind: ServiceKind,
  rule: ItemRule | undefined,
  make: string,
  t: Copy['item'],
  v: VerdictCopy,
): string | undefined {
  if (kind === 'upsell') return t.notListed(make);
  if (kind === 'wear') return t.wearPart;
  if (!rule) return undefined;
  const every = rule.every ? interval(rule.every, t, v) : null;
  const first = rule.at[0];
  if (first && every) return t.listsAtThen(make, interval(first, t, v), every);
  return t.listsEvery(make, every ?? interval(first, t, v));
}

export const resultHeadline = (totals: Record<VerdictKind, Centavos>, t: Copy['result']): string =>
  totals.no > 0 ? t.sayNo(formatPeso(totals.no)) : totals.ask > 0 ? t.askFirst(formatPeso(totals.ask)) : t.allIn;
