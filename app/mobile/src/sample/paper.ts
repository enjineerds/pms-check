import type { PaperRow } from '@/ui';
import { scannedDraft } from './quotes';
import { groupDigits } from '@/core/money';
import { priceOf } from '@/core/quote';

const fixed = (c: number) => `${groupDigits(Math.trunc(c / 100))}.${String(c % 100).padStart(2, '0')}`;

export const PAPER_ROWS: PaperRow[] = scannedDraft('ok').lines.map((l) => ({
  label: l.rawText.toUpperCase(),
  amount: fixed(priceOf(l.price) ?? 0),
}));

export const PAPER_TOTAL = fixed(scannedDraft('ok').quotedTotal);
