import type { Centavos, DraftLine, LineMatch, LinePrice, ServiceItem } from '@/core/types';
import type { OcrLine, OcrPage, ReadResult } from './types';

interface Cell {
  text: string;
  confidence: number | null;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

interface Amount {
  value: Centavos;
  odd: boolean;
  cents: boolean;
  confidence: number | null;
  x1: number;
  peso: boolean;
  /** The value if a leading 9 is the engine's reading of the peso sign. */
  pesoAs9: Centavos | null;
}

type Kind = 'line' | 'summary' | 'total';

interface Priced {
  text: string;
  amount: Amount;
  kind: Kind;
  /** Marked a subtotal because rows above add up to it, not by its label. */
  adds?: boolean;
  /** The row prints the price twice, or as quantity times unit price. */
  corroborated: boolean;
}

const CURRENCY = /^(?:PHP|Php|P|₱)\s?/;
const GROUPED = /^\d{1,3}(?:,\d{3})+(?:\.\d{2})?$/;
const PLAIN = /^\d{1,6}(?:\.\d{2})?$/;
const LOOKALIKE: Record<string, string> = { O: '0', o: '0', l: '1', I: '1', S: '5' };

type Parsed = Omit<Amount, 'confidence' | 'x1'>;

function parseAmount(raw: string): Parsed | null {
  const token = raw.replace(CURRENCY, '');
  const peso = token !== raw;
  if (!/^[\dOolIS][\dOolIS,. ]*$/.test(token) || (token.match(/\d/g) ?? []).length < 2) return null;
  const digits = token.replace(/[OolIS]/g, (c) => LOOKALIKE[c]);
  const cents = /[., ](\d{2})$/.exec(digits);
  const whole = cents ? digits.slice(0, -3) : digits;
  const groups = whole.split(/[.,]/);
  if (groups.some((g) => !/^\d+$/.test(g.replace(/ /g, '')))) return null;
  const wholeDigits = groups.join('').replace(/ /g, '');
  if (wholeDigits.length > 6) return null;
  const value = (Number(wholeDigits) * 100 + (cents ? Number(cents[1]) : 0)) as Centavos;
  if (value === 0 && !(cents && token === '0.00')) return null;
  const pesoAs9 = !peso && /^9/.test(token) && GROUPED.test(token.slice(1)) ? (parseAmount(token.slice(1))?.value ?? null) : null;
  return { value, cents: !!cents, odd: token !== digits || !(GROUPED.test(token) || PLAIN.test(token)), peso, pesoAs9 };
}

function trailingAmount(text: string): { amount: Parsed; rest: string } | null {
  const words = text.trim().split(/\s+/);
  if (words.length >= 2 && /^\d{1,3},$/.test(words.at(-2)!) && /^\d{3}\.\d{2}$/.test(words.at(-1)!)) words.splice(-2, 2, words.at(-2)! + words.at(-1)!);
  const tryTake = (n: number) => {
    const raw = words.slice(-n).join(' ');
    const before = words.at(-n - 1);
    const amount = parseAmount(raw);
    if (!amount || (n === 2 && !/^\d{2}$/.test(words.at(-1) ?? ''))) return null;
    if (before !== undefined && /^[@x×]$/i.test(before)) return null;
    return { amount, rest: words.slice(0, -n).join(' ') };
  };
  if (/^[@x×]/i.test(words.at(-1) ?? '')) return null;
  return tryTake(2) ?? tryTake(1);
}

const cellOf = (l: OcrLine): Cell => ({
  text: l.text,
  confidence: l.confidence,
  x0: l.box.x,
  x1: l.box.x + l.box.width,
  y0: l.box.y,
  y1: l.box.y + l.box.height,
});

const height = (c: Cell) => c.y1 - c.y0;
const midY = (c: Cell) => (c.y0 + c.y1) / 2;
const midX = (c: Cell) => (c.x0 + c.x1) / 2;
const isAmountCell = (c: Cell) => trailingAmount(c.text)?.rest === '';

const SLOPES = Array.from({ length: 41 }, (_, i) => (i - 20) * 0.005);
const PEAK_SHARE = 0.7;
const PAIR_GAP = 0.35;
const SAME_ROW = 0.5;
const TALL = 2;

function pairsAt(amounts: Cell[], texts: Cell[], s: number): number {
  const y = (c: Cell) => midY(c) - s * midX(c);
  const candidates = amounts
    .flatMap((a) =>
      texts
        .filter((t) => t.x1 < a.x0)
        .map((t) => ({ a, t, d: Math.abs(y(t) - y(a)) / Math.min(height(a), height(t)) }))
        .filter((p) => p.d < PAIR_GAP),
    )
    .sort((p, q) => p.d - q.d);
  const used = new Set<Cell>();
  for (const { a, t } of candidates) {
    if (used.has(a) || used.has(t)) continue;
    used.add(a).add(t);
  }
  return used.size / 2;
}

/** A tilt that shifts every row by one pairs as well as the true one, so every peak is a candidate. */
function tilts(cells: Cell[]): number[] {
  const amounts = cells.filter(isAmountCell);
  const texts = cells.filter((c) => !isAmountCell(c) && /[A-Za-z]{3}/.test(c.text));
  const curve = SLOPES.map((s) => pairsAt(amounts, texts, s));
  const top = Math.max(...curve);
  if (top === 0) return [0];
  return SLOPES.filter(
    (_, i) => curve[i] >= PEAK_SHARE * top && curve[i] >= (curve[i - 1] ?? 0) && curve[i] >= (curve[i + 1] ?? 0),
  ).sort((a, b) => Math.abs(a) - Math.abs(b));
}

const deskew = (c: Cell, s: number): Cell => ({ ...c, y0: c.y0 - s * midX(c), y1: c.y1 - s * midX(c) });

const overlap = (a: Cell, b: Cell) =>
  Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)) / Math.min(height(a), height(b));

function groupRows(cells: Cell[]): Cell[][] {
  const heights = cells.map(height).sort((a, b) => a - b);
  const tall = TALL * heights[heights.length >> 1];
  const rows: Cell[][] = [];
  for (const cell of [...cells].sort((a, b) => midY(a) - midY(b))) {
    if (height(cell) > tall) {
      rows.push([cell]);
      continue;
    }
    let best: Cell[] | null = null;
    let bestScore = SAME_ROW;
    for (const row of rows) {
      if (row.length === 1 && height(row[0]) > tall) continue;
      const score = Math.max(...row.map((c) => overlap(c, cell)));
      if (score > bestScore) {
        best = row;
        bestScore = score;
      }
    }
    if (best) best.push(cell);
    else rows.push([cell]);
  }
  return rows.map((r) => r.sort((a, b) => a.x0 - b.x0)).sort((a, b) => midY(a[0]) - midY(b[0]));
}

const TOTAL = /TOTAL\b|AMOUNT\s*DUE|\bNET\b|EST(IMATED)?\.?\s*COST/i;
const SUMMARY =
  /SUB\s*-?\s*TOTAL|\bTOTAL\s*(AMOUNT\s*)?(OF\s*)?(LABOU?R|PARTS?|MAT\w*|MISC\w*|OIL\w*|SUBLET)\b(?!\s*(&|AND\b))|\bVAT|DISCOUNT|\bLESS\b|BALANCE|DEPOSIT|\bCASH\b|COST\s+OF\b|(LABOU?R|PARTS?)\s*AMOUNT/i;
const BARE_INTEGER = 100_00 as Centavos;
const SUBTOTAL = /SUB\s*-?\s*TOTAL/i;
const TAX = /\bVAT|DISCOUNT|\bLESS\b/i;

/** An odometer, phone or document number sits right after its label. */
const NOT_PRICE = /\b(KILOMETERS?|KMS?|MILEAGE|ODO\w*|YEAR|MODEL|TEL|PHONE|MOBILE|TIN|INVOICE|DATE|PLATE|VIN|NO)\W*$|\bCALL\b/i;

const HEADER_WORD = /(?<![\w/])(?:DESCRIPTIONS?|DESC\.?|PARTICULARS|ITEMS?|QTY\.?|QUANTITY|UNIT\s+(?:PRICE|COST)|U\/P|PRICE|AMOUNT|AMT\.?|NO\.)(?![\w/])/gi;
const WORD = /\b[A-Za-z]{3,}\b/;

/** Strips column headings from a row that reads as a header: two headings, or headings and nothing else. */
function withoutHeader(text: string): string {
  const headings = text.match(HEADER_WORD)?.length ?? 0;
  if (headings === 0) return text;
  const rest = text.replace(HEADER_WORD, ' ').replace(/\s+/g, ' ').trim();
  if (headings < 2 && WORD.test(rest)) return text;
  return WORD.test(rest) ? rest : '';
}

function pricedRow(row: Cell[]): Priced | null {
  for (let i = row.length - 1; i >= 0; i--) {
    const found = trailingAmount(row.slice(0, i + 1).map((c) => c.text).join(' '));
    if (!found) continue;
    const words = found.rest.split(/\s+/).filter(Boolean);
    const printed = words.filter((w) => !parseAmount(w) && !/^\d{1,2}$/.test(w)).join(' ');
    const others = words.map((w) => parseAmount(w)?.value).filter((v) => v !== undefined);
    const quantities = words.filter((w) => /^\d{1,2}(?:\.0+)?$/.test(w)).map(Number);
    const value = found.amount.value;
    const corroborated = value > 0 && others.some((u) => u === value || quantities.some((q) => q > 1 && q * u === value));
    if (NOT_PRICE.test(printed) && !TOTAL.test(printed)) return null;
    // A ₱0 header row stays as a line: dropping it measured worse (mlkit prices 368 to 367, amber 209 to 214).
    const text = withoutHeader(printed);
    if (text === '' && !found.amount.cents && found.amount.value < BARE_INTEGER) return null;
    const kind: Kind = SUMMARY.test(text) ? 'summary' : TOTAL.test(text) ? 'total' : /:\s*$/.test(text) ? 'summary' : 'line';
    return { text, amount: { ...found.amount, confidence: row[i].confidence, x1: row[i].x1 }, kind, corroborated };
  }
  return null;
}

const total = (xs: readonly Priced[]) => xs.reduce((a, p) => a + p.amount.value, 0);

/** A row that adds up two or more rows above it, or an unlabelled amount in the summary block, is a subtotal. */
function markSubtotals(rows: Priced[]) {
  rows.forEach((row, i) => {
    if (row.kind !== 'line') return;
    if (row.text === '' && rows.slice(0, i).some((r) => r.kind !== 'line')) {
      row.kind = 'summary';
      return;
    }
    const above = rows.slice(0, i).filter((r) => r.kind === 'line');
    for (let a = 0; a < above.length - 1; a++) {
      let sum = 0;
      for (let b = a; b < above.length; b++) {
        sum += above[b].amount.value;
        if (b > a && sum === row.amount.value) {
          row.kind = 'summary';
          row.adds = true;
          return;
        }
      }
    }
  });
}

function addsUp(target: number, parts: number[]): boolean {
  const xs = parts.slice(-12);
  for (let mask = 1; mask < 1 << xs.length; mask++) {
    if ((mask & (mask - 1)) === 0) continue;
    let sum = 0;
    for (let i = 0; i < xs.length; i++) if (mask & (1 << i)) sum += xs[i];
    if (sum === target) return true;
  }
  return false;
}

/** The grand total only when the lines, or summary rows above it, add up to it. */
function checkedTotal(rows: Priced[]): Centavos | null {
  const labelled = rows.filter((r) => r.kind === 'total');
  const taxed = rows.some((r) => TAX.test(r.text));
  const pool = labelled.length
    ? labelled
    : rows.filter((r) => ((r.adds || r.text === '') && !SUMMARY.test(r.text)) || (!taxed && SUBTOTAL.test(r.text)));
  if (pool.length === 0) return null;
  const top = pool.reduce((a, b) => (b.amount.value > a.amount.value ? b : a));
  const block = rows
    .slice(0, rows.indexOf(top))
    .filter((r) => r.kind !== 'line')
    .map((r) => r.amount.value);
  const lineSum = total(rows.filter((r) => r.kind === 'line'));
  return top.amount.value === lineSum || addsUp(top.amount.value, [...new Set(block)]) ? top.amount.value : null;
}

const compact = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const stem = (t: string) => (t.length > 5 ? t.replace(/(ING|ER|S)$/, '') : t);
const tokens = (s: string) =>
  s
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((t) => t.length > 1)
    .map(stem);

/** Words that name a product sold alongside a service, so "ENGINE OIL TREATMENT" is not engine oil. */
const PRODUCT = new Set(['TREATMENT', 'ADDITIVE', 'STICKER', 'GREASE', 'PASTE', 'SPRAY', 'DIFF', 'PROTECTOR', 'SAND', 'PAPER']);

function editDistance(a: string, b: string): number {
  const d = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length];
}

const sameToken = (a: string, b: string) => a === b || (a.length >= 4 && b.length >= 4 && editDistance(a, b) <= 1);

const EXTRA_WORD = 0.05;
const FUZZY_MIN = 0.6;
const FUZZY_MARGIN = 0.15;

function similarity(text: string, alias: string): number {
  const t = tokens(text);
  const a = tokens(alias);
  if (a.length === 0 || t.length === 0) return 0;
  if (t.some((y) => PRODUCT.has(y) && !a.includes(y))) return 0;
  const covered = a.filter((x) => t.some((y) => sameToken(x, y))).length / a.length;
  const extra = t.filter((y) => !a.some((x) => sameToken(x, y))).length;
  const [ct, ca] = [compact(text), compact(alias)];
  const close = 1 - editDistance(ct, ca) / Math.max(ct.length, ca.length);
  return covered * (0.75 + 0.25 * close) - EXTRA_WORD * Math.min(extra, 3);
}

export function matchService(rawText: string, services: readonly ServiceItem[]): LineMatch {
  const key = compact(rawText);
  const hit = key && services.find((s) => s.aliases.some((a) => compact(a) === key));
  if (hit) return { kind: 'exact', serviceId: hit.id };
  const [best, next] = services
    .map((s) => ({ s, score: Math.max(...s.aliases.map((a) => similarity(rawText, a))) }))
    .sort((a, b) => b.score - a.score);
  if (best && best.score >= FUZZY_MIN && best.score - (next?.score ?? 0) >= FUZZY_MARGIN) return { kind: 'fuzzy', serviceId: best.s.id };
  return { kind: 'none' };
}

const CONFIDENT = { vision: 0.9, mlkit: 0.6 } as const;
const HANDWRITTEN_CENTS = 0.35;
const PESO_SHARE = 0.6;
const CENTS_EXPECTED = 0.5;

/** When the other amounts print the peso sign, a leading 9 on one of them is that sign misread. */
function fixPesoSign(rows: Priced[]) {
  if (rows.filter((r) => r.amount.peso).length < PESO_SHARE * rows.length) return;
  for (const r of rows)
    if (r.amount.pesoAs9 !== null) r.amount = { ...r.amount, value: r.amount.pesoAs9, odd: true, pesoAs9: null };
}

function readRows(cells: Cell[], s: number) {
  const rows = groupRows(cells.map((c) => deskew(c, s)))
    .map(pricedRow)
    .filter((p): p is Priced => p !== null);
  fixPesoSign(rows);
  markSubtotals(rows);
  const lines = rows.filter((r) => r.kind === 'line');
  const quotedTotal = checkedTotal(rows);
  const balanced = lines.length > 1 && rows.some((r) => r.kind !== 'line' && r.amount.value === total(lines));
  return { s, rows, lines, quotedTotal, balanced, score: balanced ? 1 : 0 };
}

export function parseQuote(page: OcrPage, services: readonly ServiceItem[]): ReadResult {
  const cells = page.lines.map(cellOf);
  const tried = tilts(cells).map((t) => readRows(cells, t));
  const best = tried.reduce((b, r) => (r.score > b.score ? r : b));
  const { lines, quotedTotal, balanced } = best;
  if (lines.length === 0) return { kind: 'unreadable', reason: 'no-priced-rows' };

  const centsShare = lines.filter((l) => l.amount.cents).length / lines.length;
  // Printed and on-screen quotes print centavos; handwritten job orders almost never do.
  const handwritten = centsShare < HANDWRITTEN_CENTS;

  const priceOf = (l: Priced): LinePrice => {
    const a = l.amount;
    const low = a.confidence !== null && a.confidence < CONFIDENT[page.engine];
    const shape = a.odd || (centsShare > CENTS_EXPECTED && !a.cents);
    const doubtful = low || shape || l.text === '';
    const checked = balanced || (l.corroborated && !doubtful);
    if (handwritten || a.value === 0 || !checked) return { kind: 'unsure', guess: a.value };
    return { kind: 'read', value: a.value };
  };

  // A price left without a description means some rows paired with their neighbour's text.
  const shifted = lines.some((l) => l.text === '');
  const matchOf = (text: string): LineMatch => {
    const m = matchService(text, services);
    return shifted && m.kind === 'exact' ? { kind: 'fuzzy', serviceId: m.serviceId } : m;
  };

  return {
    kind: 'lines',
    lines: lines.map(
      (l, i): DraftLine => ({
        id: `s${i + 1}`,
        rawText: l.text,
        match: matchOf(l.text),
        price: priceOf(l),
        origin: 'scanned',
      }),
    ),
    quotedTotal,
    shopName: null,
  };
}
