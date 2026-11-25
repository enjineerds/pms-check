import type { PaperHead, PaperRow } from '@/ui';
import { sampleScan } from './quotes';
import { groupDigits } from '@/core/money';
import { priceOf } from '@/core/quote';

const fixed = (c: number) => `${groupDigits(Math.trunc(c / 100))}.${String(c % 100).padStart(2, '0')}`;

export const PAPER_HEAD: PaperHead = {
  shop: 'BAYAN MOTORS CORP.',
  meta: 'SERVICE QUOTATION · VIOS 1.3 XLE · 10,240 KM',
  totalLabel: 'TOTAL',
};

export const PAPER_ROWS: PaperRow[] = sampleScan().lines.map((l) => ({
  label: l.rawText.toUpperCase(),
  amount: fixed(priceOf(l.price) ?? 0),
}));

export const PAPER_TOTAL = fixed(sampleScan().quotedTotal);
