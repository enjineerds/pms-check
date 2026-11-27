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
}

type Kind = 'line' | 'summary' | 'total';

interface Priced {
  text: string;
  amount: Amount;
  kind: Kind;
  /** The row prints the price twice, or as quantity times unit price. */
  corroborated: boolean;
}

const CURRENCY = /^(?:PHP|Php|P|₱)\s?/;
const GROUPED = /^\d{1,3}(?:,\d{3})+(?:\.\d{2})?$/;
const PLAIN = /^\d{1,6}(?:\.\d{2})?$/;
const LOOKALIKE: Record<string, string> = { O: '0', o: '0', l: '1', I: '1', S: '5' };

function parseAmount(raw: string): Omit<Amount, 'confidence' | 'x1'> | null {
  const token = raw.replace(CURRENCY, '');
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
  return { value, cents: !!cents, odd: token !== digits || !(GROUPED.test(token) || PLAIN.test(token)) };
}

/** The right-most amount at the end of a cell's text, and the text before it. */
function trailingAmount(text: string): { amount: Omit<Amount, 'confidence' | 'x1'>; rest: string } | null {
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

/** Photos taken at an angle tilt every row; pick the slope that lines amounts up with text to their left. */
function skew(cells: Cell[]): number {
  const amounts = cells.filter(isAmountCell);
  const texts = cells.filter((c) => !isAmountCell(c));
  let best = 0;
  let bestScore = -1;
  for (const s of SLOPES) {
    let score = 0;
    for (const a of amounts) {
      const ya = midY(a) - s * midX(a);
      const aligned = texts.some(
        (t) => t.x1 < a.x0 && Math.abs(midY(t) - s * midX(t) - ya) < 0.25 * Math.min(height(a), height(t)),
      );
      if (aligned) score += 1;
    }
    if (score > bestScore || (score === bestScore && Math.abs(s) < Math.abs(best))) {
      best = s;
      bestScore = score;
    }
  }
  return best;
}

const deskew = (c: Cell, s: number): Cell => ({ ...c, y0: c.y0 - s * midX(c), y1: c.y1 - s * midX(c) });

const overlap = (a: Cell, b: Cell) =>
  Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)) / Math.min(height(a), height(b));

function groupRows(cells: Cell[]): Cell[][] {
  const heights = cells.map(height).sort((a, b) => a - b);
  const tall = 2 * heights[heights.length >> 1];
  const rows: Cell[][] = [];
  for (const cell of [...cells].sort((a, b) => midY(a) - midY(b))) {
    if (height(cell) > tall) {
      rows.push([cell]);
      continue;
    }
    let best: Cell[] | null = null;
    let bestScore = 0.5;
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

const TOTAL = /\bTOTAL\b|AMOUNT\s*DUE|\bNET\b|EST(IMATED)?\.?\s*COST/i;
const SUMMARY =
  /SUB\s*-?\s*TOTAL|\bTOTAL\s*(LABOU?R|PARTS?|MAT|MISC|OIL|SUBLET)|\bVAT|DISCOUNT|\bLESS\b|BALANCE|DEPOSIT|\bCASH\b|COST\s+OF\b|\bAMOUNT\s*:?$/i;
const NOT_PRICE = /\b(KMS?|ODO\w*|MILEAGE|TEL|PHONE|MOBILE|TIN|INVOICE|DATE|PLATE|VIN|CALL)\b/i;

function pricedRow(row: Cell[]): Priced | null {
  for (let i = row.length - 1; i >= 0; i--) {
    const found = trailingAmount(row.slice(0, i + 1).map((c) => c.text).join(' '));
    if (!found) continue;
    const words = found.rest.split(/\s+/).filter(Boolean);
    const text = words.filter((w) => !parseAmount(w) && !/^\d{1,2}$/.test(w)).join(' ');
    const others = words.map((w) => parseAmount(w)?.value).filter((v) => v !== undefined);
    const quantities = words.filter((w) => /^\d{1,2}(?:\.0+)?$/.test(w)).map(Number);
    const value = found.amount.value;
    const corroborated = value > 0 && others.some((u) => u === value || quantities.some((q) => q > 1 && q * u === value));
    if (NOT_PRICE.test(text) && !TOTAL.test(text)) return null;
    const kind: Kind = SUMMARY.test(text) || /:\s*$/.test(text) ? 'summary' : TOTAL.test(text) ? 'total' : 'line';
    return { text, amount: { ...found.amount, confidence: row[i].confidence, x1: row[i].x1 }, kind, corroborated };
  }
  return null;
}

const total = (xs: readonly Priced[]) => xs.reduce((a, p) => a + p.amount.value, 0);

/** A row that adds up two or more rows above it is a subtotal, whatever its label says. */
function markSubtotals(rows: Priced[]) {
  rows.forEach((row, i) => {
    if (row.kind !== 'line') return;
    const above = rows.slice(0, i).filter((r) => r.kind === 'line');
    for (let a = 0; a < above.length - 1; a++) {
      let sum = 0;
      for (let b = a; b < above.length; b++) {
        sum += above[b].amount.value;
        if (b > a && sum === row.amount.value) {
          row.kind = 'summary';
          return;
        }
      }
    }
  });
}

function addsUp(target: number, parts: number[]): boolean {
  const xs = parts.slice(0, 12);
  for (let mask = 1; mask < 1 << xs.length; mask++) {
    if ((mask & (mask - 1)) === 0) continue;
    let sum = 0;
    for (let i = 0; i < xs.length; i++) if (mask & (1 << i)) sum += xs[i];
    if (sum === target) return true;
  }
  return false;
}

/** The grand total only when the lines, or the summary rows just above it, add up to it. */
function checkedTotal(rows: Priced[]): Centavos | null {
  const labelled = rows.filter((r) => r.kind === 'total');
  const pool = labelled.length ? labelled : rows.filter((r) => r.kind === 'summary');
  if (pool.length === 0) return null;
  const top = pool.reduce((a, b) => (b.amount.value > a.amount.value ? b : a));
  const block: number[] = [];
  for (let j = rows.indexOf(top) - 1; j >= 0 && rows[j].kind !== 'line'; j--) block.push(rows[j].amount.value);
  const lineSum = total(rows.filter((r) => r.kind === 'line'));
  return top.amount.value === lineSum || addsUp(top.amount.value, [...new Set(block)]) ? top.amount.value : null;
}

const compact = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const tokens = (s: string) =>
  s
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter((t) => t.length > 1);

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

function similarity(text: string, alias: string): number {
  const t = tokens(text);
  const a = tokens(alias);
  if (a.length === 0 || t.length === 0) return 0;
  const covered = a.filter((x) => t.some((y) => sameToken(x, y))).length / a.length;
  const extra = t.filter((y) => !a.some((x) => sameToken(x, y))).length;
  const [ct, ca] = [compact(text), compact(alias)];
  const close = 1 - editDistance(ct, ca) / Math.max(ct.length, ca.length);
  return covered * (0.75 + 0.25 * close) - 0.05 * extra;
}

const FUZZY_MIN = 0.6;
const FUZZY_MARGIN = 0.15;

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

export function parseQuote(page: OcrPage, services: readonly ServiceItem[]): ReadResult {
  const cells = page.lines.map(cellOf);
  const s = skew(cells);
  const rows = groupRows(cells.map((c) => deskew(c, s)))
    .map(pricedRow)
    .filter((p): p is Priced => p !== null);
  markSubtotals(rows);
  const lines = rows.filter((r) => r.kind === 'line');
  if (lines.length === 0) return { kind: 'unreadable', reason: 'no-priced-rows' };

  const quotedTotal = checkedTotal(rows);
  const centsShare = lines.filter((l) => l.amount.cents).length / lines.length;
  const handwritten = centsShare < HANDWRITTEN_CENTS;
  const balanced = quotedTotal !== null && total(lines) === quotedTotal;

  const priceOf = (l: Priced): LinePrice => {
    const a = l.amount;
    const low = a.confidence !== null && a.confidence < CONFIDENT[page.engine];
    const shape = a.odd || (centsShare > 0.5 && !a.cents);
    const doubtful = low || shape || l.text === '';
    const checked = balanced || (l.corroborated && !doubtful);
    if (handwritten || a.value === 0 || !checked) return { kind: 'unsure', guess: a.value };
    return { kind: 'read', value: a.value };
  };

  return {
    kind: 'lines',
    lines: lines.map(
      (l, i): DraftLine => ({
        id: `s${i + 1}`,
        rawText: l.text,
        match: matchService(l.text, services),
        price: priceOf(l),
        origin: 'scanned',
      }),
    ),
    quotedTotal,
    shopName: null,
  };
}
