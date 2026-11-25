import type { Copy } from '@/i18n/en';
import type { SavedLine, Verdict } from './types';
import { formatKm } from './money';
import { findService } from '@/sample/catalog';

type VerdictCopy = Copy['verdict'];

export function reasonShort(v: Verdict, t: VerdictCopy): string {
  switch (v.reason.kind) {
    case 'due-now':
      return t.reason.dueNow;
    case 'other-visit':
      return v.reason.nextKm ? t.reason.dueAt(formatKm(v.reason.nextKm)) : t.reason.wasDue;
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

export function lineNote(l: SavedLine, t: VerdictCopy): string | undefined {
  if (l.match.kind === 'none') return t.unlisted;
  return l.verdict.kind === 'yes' ? undefined : findService(l.match.serviceId)?.note;
}

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
