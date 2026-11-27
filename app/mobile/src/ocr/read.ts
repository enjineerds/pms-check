import { CATALOG } from '@/catalog';
import { sampleScan } from '@/sample/quotes';
import { parseQuote } from './parse';
import { recognize } from './recognize';
import type { CapturedImage, ReadResult } from './types';

// The dev demo has no image, so web can still reach the screens after reading.
async function readSample(): Promise<ReadResult> {
  await new Promise((r) => setTimeout(r, 1800));
  const { lines, quotedTotal } = sampleScan();
  return { kind: 'lines', lines, quotedTotal, shopName: 'Bayan Motors' };
}

export async function readQuote(img: CapturedImage): Promise<ReadResult> {
  if (img.uri === '') return readSample();
  return parseQuote(await recognize(img.uri), CATALOG.services);
}
