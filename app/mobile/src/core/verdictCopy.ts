import type { SavedLine, Verdict, VerdictKind } from './types';
import { formatKm } from './money';
import { findService } from '@/sample/catalog';

export const VERDICT_WORD: Record<VerdictKind, string> = { yes: 'Say yes', ask: 'Ask first', no: 'Say no' };

export const GROUP_TITLE: Record<VerdictKind, string> = { yes: 'Say yes', ask: 'Ask first', no: 'Say no' };

export function reasonShort(v: Verdict): string {
  switch (v.reason.kind) {
    case 'due-now':
      return "All in Toyota's schedule";
    case 'other-visit':
      return v.reason.nextKm ? `Due at ${formatKm(v.reason.nextKm)}` : 'Was due earlier';
    case 'wear-item':
      return 'Check the wear';
    case 'not-in-your-schedule':
      return 'Not in your schedule';
    case 'approximate-schedule':
      return 'Schedule is approximate';
    case 'not-in-schedule':
      return 'Not in the schedule';
    case 'unknown-item':
      return "We don't know this one";
  }
}

export function lineNote(l: SavedLine): string | undefined {
  if (l.match.kind === 'none') return 'Not in our list. Ask what it is.';
  return l.verdict.kind === 'yes' ? undefined : findService(l.match.serviceId)?.note;
}

export function itemHeadline(v: Verdict, model: string): string {
  if (v.kind === 'yes') return `In your ${model}'s schedule. Say yes.`;
  if (v.kind === 'no') return `Not in your ${model}'s schedule. You can say no.`;
  if (v.reason.kind === 'other-visit') return `Not due yet. Ask first.`;
  if (v.reason.kind === 'wear-item') return 'Only if it is worn. Ask first.';
  return 'Not sure about this one. Ask first.';
}

export function sayThis(v: Verdict, name: string, km: number): string {
  const n = name.toLowerCase();
  if (v.kind === 'yes') return `Go ahead with the ${n}.`;
  if (v.kind === 'no') return `Just the items in the manufacturer's ${formatKm(km)} PMS, please. No ${n}.`;
  return `Can you show me why the ${n} is needed now?`;
}
