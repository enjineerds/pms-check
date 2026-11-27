import { CATALOG } from '@/catalog';
import { CITY_CVT } from '@/catalog/hondaCity';
import { peso } from '@/core/money';
import { isResolved, priceOf } from '@/core/quote';
import type { Centavos, DraftLine, Km, ServiceId, ServicePoint } from '@/core/types';
import { verdict } from '@/core/verdict';
import type { ExpectedLine, ExpectedQuote } from './__fixtures__/expected';
import { matchService, parseQuote } from './parse';
import type { OcrPage, ReadResult } from './types';

const fs = jest.requireActual<{ readdirSync(dir: string): string[]; readFileSync(file: string, enc: 'utf8'): string }>('fs');
const QUOTES = 'src/ocr/__fixtures__/quotes';
const PAGES = 'src/ocr/__fixtures__/pages';
const ENGINES = ['vision', 'mlkit'] as const;
const MEDIA = ['printed', 'screen', 'handwritten'] as const;
const SERVICES = CATALOG.services;

const readJson = <T,>(path: string) => JSON.parse(fs.readFileSync(path, 'utf8')) as T;

const cases = fs
  .readdirSync(QUOTES)
  .filter((f) => f.endsWith('.json'))
  .flatMap((file) => {
    const expected = readJson<ExpectedQuote>(`${QUOTES}/${file}`);
    return ENGINES.map((engine) => {
      const page = readJson<OcrPage>(`${PAGES}/${engine}/${file}`);
      return { name: `${engine}/${file}`, engine, expected, result: parseQuote(page, SERVICES) };
    });
  });
const quotes = cases.filter((c) => c.expected.kind === 'quote');

const linesOf = (r: ReadResult): DraftLine[] => (r.kind === 'lines' ? r.lines : []);
const exactId = (text: string): ServiceId | null => {
  const m = matchService(text, SERVICES);
  return m.kind === 'exact' ? m.serviceId : null;
};
const matchedId = (text: string): ServiceId | null => {
  const m = matchService(text, SERVICES);
  return m.kind === 'none' ? null : m.serviceId;
};
const pricedExpected = (q: ExpectedQuote) =>
  q.lines.filter((l): l is ExpectedLine & { price: number } => l.price !== null).map((l) => ({ ...l, cents: peso(l.price) }));

/** Pairs each parsed line with an unused expected line of the same price, preferring a same-service one. */
function pair(lines: DraftLine[], q: ExpectedQuote, price: (l: DraftLine) => Centavos | null) {
  const pool = pricedExpected(q);
  const take = (i: number) => pool.splice(i, 1)[0];
  const ordered = [...lines].sort((a, b) => Number(b.match.kind !== 'none') - Number(a.match.kind !== 'none'));
  return ordered.map((line) => {
    const value = price(line);
    const id = line.match.kind === 'none' ? null : line.match.serviceId;
    const same = pool.findIndex((e) => e.cents === value && id !== null && matchedId(e.text) === id);
    const any = same >= 0 ? same : pool.findIndex((e) => e.cents === value);
    return { line, expected: any >= 0 ? take(any) : null };
  });
}

function wrongPrices(r: ReadResult, q: ExpectedQuote): string[] {
  const read = linesOf(r).filter((l) => l.price.kind === 'read');
  const bad = pair(read, q, (l) => priceOf(l.price))
    .filter((p) => p.expected === null)
    .map((p) => `read ${priceOf(p.line.price)} on "${p.line.rawText}"`);
  if (r.kind === 'lines' && r.quotedTotal !== null && (q.total === null || r.quotedTotal !== peso(q.total)))
    bad.push(`total ${r.quotedTotal}, expected ${q.total}`);
  return bad;
}

function wrongMatches(r: ReadResult, q: ExpectedQuote): string[] {
  const pool = pricedExpected(q);
  return linesOf(r)
    .filter((l) => l.match.kind === 'exact' && l.price.kind === 'read')
    .flatMap((l) => {
      const id = l.match.kind === 'exact' ? l.match.serviceId : null;
      const i = pool.findIndex((e) => e.cents === priceOf(l.price) && exactId(e.text) === id);
      if (i < 0) return [`"${l.rawText}" as ${id}`];
      pool.splice(i, 1);
      return [];
    });
}

const VISITS: ServicePoint[] = [
  { km: 10_000 as Km, months: 12 },
  { km: 40_000 as Km, months: 48 },
  { km: 100_000 as Km, months: 120 },
];
const sayNo = (ids: (ServiceId | null)[], visit: ServicePoint) =>
  new Set(
    ids.filter(
      (id): id is ServiceId =>
        id !== null && verdict({ match: { kind: 'exact', serviceId: id } }, CITY_CVT, visit, 'severe', false, CATALOG).kind === 'no',
    ),
  );

function extraSayNo(r: ReadResult, q: ExpectedQuote): string[] {
  const parsed = linesOf(r)
    .filter(isResolved)
    .map((l) => (l.match.kind === 'none' ? null : l.match.serviceId));
  const expected = q.lines.map((l) => matchedId(l.text));
  return VISITS.flatMap((v) => {
    const allowed = sayNo(expected, v);
    return [...sayNo(parsed, v)].filter((id) => !allowed.has(id)).map((id) => `${id} at ${v.km} km`);
  });
}

describe('parseQuote invariants on quotes, guides excluded', () => {
  it.each(quotes)('$name: every read price and the total are on the quote', ({ result, expected }) => {
    expect(wrongPrices(result, expected)).toEqual([]);
  });

  it.each(quotes)('$name: every exact match with a read price is the expected line’s service', ({ result, expected }) => {
    expect(wrongMatches(result, expected)).toEqual([]);
  });

  it.each(quotes)('$name: no Say no that the expected lines don’t give', ({ result, expected }) => {
    expect(extraSayNo(result, expected)).toEqual([]);
  });

  it.each(quotes.filter((c) => c.expected.medium === 'handwritten'))('$name: handwriting keeps no read price', ({ result }) => {
    expect(linesOf(result).filter((l) => l.price.kind === 'read').map((l) => l.rawText)).toEqual([]);
  });
});

type Case = (typeof quotes)[number];

function score(group: Case[]) {
  let priced = 0, found = 0, returned = 0, amber = 0, totals = 0, totalsFound = 0, proposed = 0, correct = 0, unreadable = 0;
  for (const { result, expected } of group) {
    priced += pricedExpected(expected).length;
    if (expected.total !== null) totals += 1;
    if (result.kind === 'unreadable') {
      unreadable += 1;
      continue;
    }
    const lines = result.lines;
    returned += lines.length;
    amber += lines.filter((l) => l.price.kind === 'unsure' || l.match.kind === 'fuzzy').length;
    if (expected.total !== null && result.quotedTotal === peso(expected.total)) totalsFound += 1;
    for (const { line, expected: e } of pair(lines, expected, (l) => priceOf(l.price))) {
      if (e) found += 1;
      if (line.match.kind === 'none') continue;
      proposed += 1;
      if (e && matchedId(e.text) === line.match.serviceId) correct += 1;
    }
  }
  const pct = (a: number, b: number) => (b === 0 ? '-' : `${Math.round((100 * a) / b)}%`);
  return [
    `${group.length} quotes`,
    `prices ${found}/${priced} ${pct(found, priced)}`,
    `amber ${amber}/${returned} ${pct(amber, returned)}`,
    `totals ${totalsFound}/${totals}`,
    `matches ${correct}/${proposed}`,
    `unreadable ${unreadable}`,
  ].join(' · ');
}

function describeGuide(c: (typeof cases)[number]) {
  const r = c.result;
  return r.kind === 'unreadable' ? `${c.name}: unreadable` : `${c.name}: ${r.lines.length} lines, total ${r.quotedTotal}`;
}

it('measured accuracy per engine and medium', () => {
  const rows = ENGINES.flatMap((engine) => [
    `${engine} all: ${score(quotes.filter((c) => c.engine === engine))}`,
    ...MEDIA.map((m) => `${engine} ${m}: ${score(quotes.filter((c) => c.engine === engine && c.expected.medium === m))}`),
    `${engine} guide (report only) ${describeGuide(cases.find((c) => c.engine === engine && c.expected.kind === 'guide')!)}`,
  ]);
  expect(rows.join('\n')).toMatchSnapshot();
});
