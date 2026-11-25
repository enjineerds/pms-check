import { sampleScan } from '@/sample/quotes';
import type { CapturedImage, ReadResult } from './types';

// Sample lines until the OCR engine lands (SYSTEM_DESIGN §6).
export async function readQuote(_img: CapturedImage): Promise<ReadResult> {
  await new Promise((r) => setTimeout(r, 1800));
  const { lines, quotedTotal } = sampleScan();
  return { kind: 'lines', lines, quotedTotal, shopName: 'Bayan Motors' };
}
