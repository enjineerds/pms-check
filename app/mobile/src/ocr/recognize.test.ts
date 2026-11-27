import { toOcrPage } from './recognize';

jest.mock('../../modules/quote-ocr', () => null);

const line = (text: string, box = { x: 0.1, y: 0.1, width: 0.5, height: 0.05 }, confidence = 0.9) => ({ text, confidence, box });

describe('toOcrPage', () => {
  it('keeps the engine, size and lines', () => {
    const page = toOcrPage({
      engine: 'vision',
      width: 1000,
      height: 1500,
      lines: [line('ENGINE OIL 1,850.00')],
    });
    expect(page).toEqual({
      engine: 'vision',
      width: 1000,
      height: 1500,
      lines: [line('ENGINE OIL 1,850.00')],
    });
  });

  it('clamps boxes that overhang the image', () => {
    const [l] = toOcrPage({
      engine: 'mlkit',
      width: 10,
      height: 10,
      lines: [line('TOTAL', { x: -0.1, y: 0.9, width: 0.5, height: 0.2 })],
    }).lines;
    expect(l.box.x).toBe(0);
    expect(l.box.y).toBe(0.9);
    expect(l.box.width).toBeCloseTo(0.4);
    expect(l.box.height).toBeCloseTo(0.1);
  });

  it('drops blank lines and boxes outside the image', () => {
    const page = toOcrPage({
      engine: 'mlkit',
      width: 10,
      height: 10,
      lines: [line('  '), line('X', { x: 1.2, y: 0, width: 0.1, height: 0.1 }), line(' OK ')],
    });
    expect(page.lines.map((l) => l.text)).toEqual(['OK']);
  });

  it('treats an out-of-range confidence as unknown', () => {
    const page = toOcrPage({
      engine: 'mlkit',
      width: 10,
      height: 10,
      lines: [line('A', undefined, -1), line('B', undefined, Number.NaN), line('C', undefined, 0.4)],
    });
    expect(page.lines.map((l) => l.confidence)).toEqual([null, null, 0.4]);
  });

  it('refuses an engine it does not know', () => {
    expect(() => toOcrPage({ engine: 'tesseract', width: 1, height: 1, lines: [] })).toThrow('tesseract');
  });
});
