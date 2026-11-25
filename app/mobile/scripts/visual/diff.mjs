// Usage: node scripts/visual/diff.mjs <baselineDir> <candidateDir> <diffDir>
// Exits nonzero when any screen differs by even one pixel, or is missing.
import { mkdirSync, readdirSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const [baseDir, candDir, diffDir] = process.argv.slice(2);
if (!diffDir) throw new Error('usage: diff.mjs <baselineDir> <candidateDir> <diffDir>');
mkdirSync(diffDir, { recursive: true });

let bad = 0;
for (const file of readdirSync(baseDir).filter((f) => f.endsWith('.png')).sort()) {
  const candPath = join(candDir, file);
  if (!existsSync(candPath)) {
    bad++;
    console.log('MISSING', file);
    continue;
  }
  const a = PNG.sync.read(readFileSync(join(baseDir, file)));
  const b = PNG.sync.read(readFileSync(candPath));
  if (a.width !== b.width || a.height !== b.height) {
    bad++;
    console.log('SIZE', file, `${a.width}x${a.height}`, `${b.width}x${b.height}`);
    continue;
  }
  const out = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b.data, out.data, a.width, a.height, { threshold: 0 });
  if (n) {
    bad++;
    writeFileSync(join(diffDir, file), PNG.sync.write(out));
  }
  console.log(n ? 'DIFF' : 'same', file, n);
}
process.exit(bad ? 1 : 0);
