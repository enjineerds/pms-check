// Usage: node scripts/score-ocr.mjs <ocr-out dir>
// Scores raw OCR output against src/ocr/__fixtures__/quotes before any parser runs.
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const EXPECTED = 'src/ocr/__fixtures__/quotes';
const outDir = process.argv[2];
const ENGINES = ['vision', 'vision-corrected', 'mlkit'];
// macOS screenshot names put U+202F before AM/PM; the fixtures spell it as a plain space.
const plain = (s) => s.replace(/\s/gu, ' ');
const outFiles = new Map(readdirSync(outDir).map((f) => [plain(f), f]));

const cents = (n) => Math.round(n * 100);
const words = (s) => s.toUpperCase().match(/[A-Z0-9]+/g) ?? [];

function pricesIn(text) {
  const found = [];
  for (const m of text.matchAll(/\d[\d,. ]*\d|\d/g)) {
    let s = m[0].replace(/(?<=[,.]) (?=\d{3})/g, '');
    if (s.includes(' ')) {
      found.push(...pricesIn(s.replaceAll(' ', '\n')));
      continue;
    }
    // OCR and handwriting use '.' for thousands too: 9.500, 3.107.28. Two-decimal cents are the only dot that stays.
    const cents2 = /[.,]\d{2}$/.test(s) ? s.slice(-3).replace(',', '.') : '';
    s = (cents2 ? s.slice(0, -3) : s).replace(/[.,]/g, '') + cents2;
    const n = Number(s);
    if (Number.isFinite(n)) found.push(cents(n));
  }
  return found;
}

function score(expected, lines) {
  const text = lines.map((l) => l.text).join('\n');
  const pool = pricesIn(text);
  const want = expected.lines.map((l) => l.price).filter((p) => p !== null && p > 0).map(cents);
  let hits = 0;
  for (const p of want) {
    const i = pool.indexOf(p);
    if (i >= 0) {
      hits++;
      pool.splice(i, 1);
    }
  }
  const bag = words(text);
  const read = expected.lines.filter((l) => {
    const w = words(l.text);
    return w.length > 0 && w.filter((x) => bag.includes(x)).length / w.length >= 0.8;
  }).length;
  const total = expected.total === null ? null : pricesIn(text).includes(cents(expected.total));
  return { prices: want.length ? hits / want.length : null, lines: read / expected.lines.length, total };
}

function confidenceSplit(expected, lines) {
  const want = new Set(expected.lines.map((l) => l.price).filter((p) => p !== null && p > 0).map(cents));
  return lines
    .filter((l) => typeof l.confidence === 'number' && /^[₱P]?\s*[\d,. ]+$/.test(l.text.trim()))
    .map((l) => ({ high: l.confidence >= 0.9, right: pricesIn(l.text).some((p) => want.has(p)) }));
}

const results = [];
const conf = { vision: [], 'vision-corrected': [], mlkit: [] };
for (const file of readdirSync(EXPECTED).filter((f) => f.endsWith('.json'))) {
  const expected = JSON.parse(readFileSync(join(EXPECTED, file), 'utf8'));
  if (expected.kind !== 'quote') continue;
  const image = basename(expected.image);
  for (const engine of ENGINES) {
    let out;
    try {
      out = JSON.parse(readFileSync(join(outDir, outFiles.get(plain(`${engine}--${image}.json`))), 'utf8'));
    } catch {
      continue;
    }
    results.push({ file, medium: expected.medium, engine, ms: out.ms, error: out.error, ...score(expected, out.lines) });
    conf[engine].push(...confidenceSplit(expected, out.lines));
  }
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const pct = (x) => (Number.isNaN(x) ? '-' : `${Math.round(x * 100)}%`);
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

function row(label, rs) {
  const ok = rs.filter((r) => !r.error);
  const withTotal = ok.filter((r) => r.total !== null);
  return `| ${label} | ${rs.length} | ${rs.length - ok.length} | ${pct(mean(ok.map((r) => r.prices).filter((p) => p !== null)))} | ${pct(mean(ok.map((r) => r.lines)))} | ${pct(mean(withTotal.map((r) => (r.total ? 1 : 0))))} | ${ok.length ? median(ok.map((r) => r.ms)) : '-'} ms |`;
}

console.log('| Engine | Photos | Errors | Prices found | Lines read | Total found | Median time |');
console.log('|---|---|---|---|---|---|---|');
for (const e of ENGINES) console.log(row(e, results.filter((r) => r.engine === e)));
for (const medium of ['printed', 'screen', 'handwritten']) {
  console.log(`\n**${medium}**\n`);
  console.log('| Engine | Photos | Errors | Prices found | Lines read | Total found | Median time |');
  console.log('|---|---|---|---|---|---|---|');
  for (const e of ENGINES) console.log(row(e, results.filter((r) => r.engine === e && r.medium === medium)));
}
console.log('\n**Does confidence separate right prices from wrong ones?** (price-only OCR lines)\n');
console.log('| Engine | High-confidence lines that are a real price | Low-confidence lines that are a real price |');
console.log('|---|---|---|');
for (const e of ENGINES) {
  const hi = conf[e].filter((c) => c.high);
  const lo = conf[e].filter((c) => !c.high);
  const rate = (xs) => (xs.length ? `${pct(mean(xs.map((c) => (c.right ? 1 : 0))))} of ${xs.length}` : '-');
  console.log(`| ${e} | ${rate(hi)} | ${rate(lo)} |`);
}
console.log('\n<details><summary>Per photo</summary>\n');
console.log('| Photo | ' + ENGINES.map((e) => `${e} prices / lines`).join(' | ') + ' |');
console.log('|---|' + ENGINES.map(() => '---').join('|') + '|');
for (const file of [...new Set(results.map((r) => r.file))].sort()) {
  const cells = ENGINES.map((e) => {
    const r = results.find((x) => x.file === file && x.engine === e);
    return !r ? '-' : r.error ? 'error' : `${pct(r.prices ?? NaN)} / ${pct(r.lines)}`;
  });
  console.log(`| ${file.replace('.json', '')} | ${cells.join(' | ')} |`);
}
console.log('\n</details>');
