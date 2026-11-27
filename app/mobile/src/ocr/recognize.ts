import QuoteOcr, { type NativeOcrPage } from '../../modules/quote-ocr';
import type { Box, OcrLine, OcrPage } from './types';

const unit = (n: number) => Math.min(1, Math.max(0, n));

// ML Kit boxes can overhang the image edge.
function clampBox(b: Box): Box {
  if (b.x >= 0 && b.y >= 0 && b.x + b.width <= 1 && b.y + b.height <= 1) return b;
  const x = unit(b.x);
  const y = unit(b.y);
  return { x, y, width: unit(b.x + b.width) - x, height: unit(b.y + b.height) - y };
}

export function toOcrPage(raw: NativeOcrPage): OcrPage {
  if (raw.engine !== 'vision' && raw.engine !== 'mlkit') throw new Error(`Unknown OCR engine ${raw.engine}`);
  const lines: OcrLine[] = raw.lines
    .map((l) => ({
      text: l.text.trim(),
      confidence: Number.isFinite(l.confidence) && l.confidence >= 0 && l.confidence <= 1 ? l.confidence : null,
      box: clampBox(l.box),
    }))
    .filter((l) => l.text.length > 0 && l.box.width > 0 && l.box.height > 0);
  return { engine: raw.engine, width: raw.width, height: raw.height, lines };
}

/** Reads the image at `uri`. The caller owns the file and deletes it. */
export async function recognize(uri: string): Promise<OcrPage> {
  if (!QuoteOcr) throw new Error('QuoteOcr is not in this build');
  return toOcrPage(await QuoteOcr.recognize(uri));
}
