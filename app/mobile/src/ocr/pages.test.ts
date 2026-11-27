import type { OcrPage } from './types';

const fs = jest.requireActual<{ readdirSync(dir: string): string[]; readFileSync(file: string, enc: 'utf8'): string }>('fs');
const QUOTES = 'src/ocr/__fixtures__/quotes';
const PAGES = 'src/ocr/__fixtures__/pages';
const ENGINES = ['vision', 'mlkit'] as const;

const quotes = fs.readdirSync(QUOTES).filter((f) => f.endsWith('.json'));
const pages = ENGINES.flatMap((engine) =>
  fs.readdirSync(`${PAGES}/${engine}`).map((file) => ({
    engine,
    file,
    page: JSON.parse(fs.readFileSync(`${PAGES}/${engine}/${file}`, 'utf8')) as OcrPage,
  })),
);
const unit = (n: number) => n >= 0 && n <= 1;

describe('recorded OCR pages', () => {
  it.each(ENGINES)('%s has a page for every expected quote and nothing else', (engine) => {
    expect(fs.readdirSync(`${PAGES}/${engine}`).sort()).toEqual([...quotes].sort());
  });

  it.each(pages)('$engine/$file is an OcrPage', ({ engine, page }) => {
    expect(page.engine).toBe(engine);
    expect(page.width).toBeGreaterThan(0);
    expect(page.height).toBeGreaterThan(0);
    expect(page.lines.length).toBeGreaterThan(0);
    for (const { text, confidence, box } of page.lines) {
      expect(text.trim()).not.toBe('');
      expect(confidence === null || unit(confidence)).toBe(true);
      expect([box.x, box.y, box.width, box.height, box.x + box.width, box.y + box.height].every(unit)).toBe(true);
    }
  });
});
