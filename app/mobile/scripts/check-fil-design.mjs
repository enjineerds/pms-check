// Fails when fil.ts drifts from the Filipino drawn in the design. Run: bun scripts/check-fil-design.mjs (bun, because it imports the .ts dictionaries)
import { readFileSync } from 'node:fs';
import { en } from '../src/i18n/en.ts';
import { fil } from '../src/i18n/fil.ts';

const ARG = '\u0000';
const norm = (s) =>
  s
    .replace(/[“”"]/g, '"')
    .replace(/[’']/g, "'")
    .replace(/(\u0000|₱?\d(?:[\d,.]*\d)?)( km)?/g, '#')
    .replace(/\b(Vios 1\.3|Toyota Vios|Vios|Toyota)\b('s)?/g, '#')
    .replace(/#( ?[·,]? ?#)+/g, '#')
    .replace(/\s+/g, ' ')
    .trim();

function flatten(a, b, path, out) {
  if (typeof a === 'string') out.push({ key: path, en: a, fil: b });
  else if (typeof a === 'function') {
    const args = Array.from({ length: Math.max(a.length, 3) }, () => ARG);
    out.push({ key: path, en: String(a(...args)), fil: String(b(...args)) });
  } else if (a && typeof a === 'object')
    for (const k of Object.keys(a)) flatten(a[k], b[k], path ? `${path}.${k}` : k, out);
}
const leaves = [];
flatten(en, fil, '', leaves);

const pairs = readFileSync(new URL('../src/i18n/DESIGN_FIL.md', import.meta.url), 'utf8')
  .split('\n')
  .filter((l) => l.startsWith('- ') && l.includes(' → ') && !l.includes('(catalog text'))
  .map((l) => l.slice(2).split(' → ').map((s) => s.replace(/\{[^}]*\}/g, '#')));

let bad = 0;
let matched = 0;
for (const [enDesign, filDesign] of pairs) {
  const hits = leaves.filter((l) => norm(l.en) === norm(enDesign));
  if (!hits.length) continue;
  matched++;
  for (const h of hits)
    if (norm(h.fil) !== norm(filDesign)) {
      bad++;
      console.log(`✗ ${h.key}\n    design: ${filDesign}\n    fil.ts: ${h.fil.replace(/\u0000/g, '#')}`);
    }
}
const unmatched = pairs.filter(([e]) => !leaves.some((l) => norm(l.en) === norm(e)));
console.log(`\n${matched}/${pairs.length} design lines map to a dictionary key, ${bad} mismatched.`);
if (process.argv.includes('--unmatched')) unmatched.forEach(([e]) => console.log(`  ? ${e}`));
process.exit(bad ? 1 : 0);
