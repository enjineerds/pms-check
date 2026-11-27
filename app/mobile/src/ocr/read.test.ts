import { readQuote } from './read';
import { recognize } from './recognize';
import type { CapturedImage, OcrPage } from './types';

jest.mock('./recognize', () => ({ recognize: jest.fn() }));

const photo: CapturedImage = { uri: 'file:///cache/quote.jpg', width: 1000, height: 1500, source: 'camera' };
const cell = (text: string, x: number, y: number) => ({ text, confidence: 1, box: { x, y, width: 0.2, height: 0.02 } });
const page: OcrPage = {
  engine: 'vision',
  width: 1000,
  height: 1500,
  lines: [
    cell('OIL FILTER', 0.05, 0.1),
    cell('450.00', 0.75, 0.1),
    cell('ENGINE OIL', 0.05, 0.2),
    cell('2,825.00', 0.75, 0.2),
    cell('TOTAL AMOUNT', 0.4, 0.3),
    cell('3,275.00', 0.75, 0.3),
  ],
};

describe('readQuote', () => {
  it('parses what the engine read off the photo', async () => {
    jest.mocked(recognize).mockResolvedValue(page);
    const result = await readQuote(photo);
    expect(recognize).toHaveBeenCalledWith(photo.uri);
    expect(result).toMatchObject({
      kind: 'lines',
      quotedTotal: 327500,
      shopName: null,
      lines: [
        { rawText: 'OIL FILTER', match: { kind: 'exact', serviceId: 'oil-filter' }, price: { kind: 'read', value: 45000 } },
        { rawText: 'ENGINE OIL', match: { kind: 'exact', serviceId: 'engine-oil' }, price: { kind: 'read', value: 282500 } },
      ],
    });
  });

  it('says it could not read a page with no priced rows', async () => {
    jest.mocked(recognize).mockResolvedValue({ ...page, lines: [cell('PREVENTIVE MAINTENANCE', 0.1, 0.1)] });
    expect(await readQuote(photo)).toEqual({ kind: 'unreadable', reason: 'no-priced-rows' });
  });
});
