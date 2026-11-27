// Turns spike output (src/app/spike.tsx writes `<engine>--<image>.json` per photo) into committed OcrPage fixtures,
// so the parser is tested in Jest without the photos or a device. Run: node scripts/ocr/record-pages.mjs <spike-out-dir>...
// iOS simulator: "$(xcrun simctl get_app_container booted dev.pmscheck.ocr data)/Documents/ocr-out"
// Android: adb exec-out "run-as dev.pmscheck.ocr tar -c -C files/ocr-out ." | tar -x -C <dir>
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const EXPECTED = 'src/ocr/__fixtures__/quotes';
const PAGES = 'src/ocr/__fixtures__/pages';
const ENGINES = ['vision', 'mlkit'];

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error('usage: node scripts/ocr/record-pages.mjs <spike-out-dir>...');
  process.exit(2);
}

// macOS screenshot names put a narrow no-break space before AM.
const imageKey = (name) => basename(name).replace(/\s/g, ' ');

const fixtureByImage = new Map(
  readdirSync(EXPECTED)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [imageKey(JSON.parse(readFileSync(join(EXPECTED, f), 'utf8')).image), f]),
);

// Four places is a tenth of a pixel on a 1000 px photo and keeps the diffs readable.
const round = (n) => Math.round(n * 1e4) / 1e4;

// One OCR line per text line, so a rerun's diff shows which lines changed.
const toJson = ({ lines, ...head }) =>
  `${JSON.stringify(head).slice(0, -1)},"lines":[\n${lines.map((l) => JSON.stringify(l)).join(',\n')}\n]}\n`;

const problems = [];
const skipped = [];
const written = Object.fromEntries(ENGINES.map((e) => [e, 0]));

for (const dir of dirs) {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const image = file.slice(file.indexOf('--') + 2, -'.json'.length);
    const raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const fixture = fixtureByImage.get(imageKey(image));
    if (raw.error) problems.push(`${file}: engine error ${raw.error}`);
    else if (!ENGINES.includes(raw.engine)) problems.push(`${file}: unknown engine ${raw.engine}`);
    else if (!fixture) skipped.push(image);
    else {
      const page = {
        engine: raw.engine,
        width: raw.width,
        height: raw.height,
        lines: raw.lines.map(({ text, confidence, box }) => ({
          text,
          confidence: confidence == null ? null : round(confidence),
          box: { x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height) },
        })),
      };
      mkdirSync(join(PAGES, raw.engine), { recursive: true });
      writeFileSync(join(PAGES, raw.engine, fixture), toJson(page));
      written[raw.engine]++;
    }
  }
}

console.log(ENGINES.map((e) => `${e} ${written[e]}`).join(', '));
if (skipped.length) console.log(`skipped, no expected lines: ${[...new Set(skipped)].join(', ')}`);
for (const p of problems) console.error(p);
process.exit(problems.length ? 1 : 0);
