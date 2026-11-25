import { sampleScan } from '@/sample/quotes';
import type { CapturedImage, ReadResult } from './types';

// The OCR engine lands after the step 0 spike (SYSTEM_DESIGN section 6). Until then this returns sample lines.
export async function readQuote(_img: CapturedImage): Promise<ReadResult> {
  await new Promise((r) => setTimeout(r, 1800));
  const { lines, quotedTotal } = sampleScan();
  return { kind: 'lines', lines, quotedTotal, shopName: 'Bayan Motors' };
}
