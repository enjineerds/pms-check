import type { ExpectedQuote } from './__fixtures__/expected';

const fs = jest.requireActual<{ readdirSync(dir: string): string[]; readFileSync(file: string, enc: 'utf8'): string }>('fs');
const DIR = 'src/ocr/__fixtures__/quotes';

const fixtures = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .map((file) => ({ file, q: JSON.parse(fs.readFileSync(`${DIR}/${file}`, 'utf8')) as ExpectedQuote }));

const KEYS = ['image', 'source', 'kind', 'medium', 'make', 'model', 'service', 'lines', 'total', 'notes'].sort();
const isPesos = (n: unknown) => typeof n === 'number' && n >= 0 && Math.abs(Math.round(n * 100) - n * 100) < 1e-6;

describe('expected quote fixtures', () => {
  it('covers at least 30 quotes', () => {
    expect(fixtures.filter(({ q }) => q.kind === 'quote').length).toBeGreaterThanOrEqual(30);
  });

  it('names each image once', () => {
    const images = fixtures.map(({ q }) => q.image);
    expect(new Set(images).size).toBe(images.length);
  });

  it.each(fixtures)('$file has the expected shape', ({ q }) => {
    expect(Object.keys(q).sort()).toEqual(KEYS);
    expect(['quote', 'guide']).toContain(q.kind);
    expect(['printed', 'handwritten', 'screen', 'message']).toContain(q.medium);
    expect(q.image).toMatch(/\.(jpe?g|png)$/i);
    expect(q.notes.every((n) => typeof n === 'string' && n.length > 0)).toBe(true);
    if (q.total !== null) expect(isPesos(q.total)).toBe(true);
    if (q.kind === 'guide') return expect(q.lines).toEqual([]);
    expect(q.lines.length).toBeGreaterThan(0);
    for (const l of q.lines) {
      expect(l.text.trim()).toBe(l.text);
      expect(l.text.length).toBeGreaterThan(0);
      if (l.price !== null) expect(isPesos(l.price)).toBe(true);
    }
  });
});
