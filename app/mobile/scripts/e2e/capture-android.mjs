// Checks the quote image lifecycle on a real Android device (SYSTEM_DESIGN §12 step 5):
// the capture folder is empty after a read, after a failed read, and after a kill mid-read and relaunch.
// Usage: node scripts/e2e/capture-android.mjs [outDir]   (needs a dev build with a saved car, adb, and `npx expo start --dev-client`)
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const outDir = process.argv[2] ?? 'capture-e2e';
mkdirSync(outDir, { recursive: true });

const PKG = process.env.PKG ?? 'com.kowdstudio.pmscheck';
const DEV_URL = `pms-check://expo-development-client/?url=${encodeURIComponent('http://localhost:8081')}`;
const GALLERY = '/sdcard/Pictures/pms-e2e';
const QUOTE = '../../fixtures/quotes/reddit/reddit-01-chery-pms-estimate.jpeg';
const BIG_QUOTE = '../../fixtures/quotes/reddit/reddit-01-toyota-1k-repair-order-photo.jpeg';
const NOT_A_QUOTE = 'assets/images/icon.png';

const adb = (...args) => execFileSync('adb', args, { encoding: 'utf8' });
const shell = (cmd) => adb('shell', cmd);

function nodes() {
  // uiautomator waits for idle and never returns while the reading screen animates.
  const dump = spawnSync('adb', ['shell', 'uiautomator dump /sdcard/ui.xml'], { timeout: 8000 });
  if (dump.status !== 0) return [];
  return [...shell('cat /sdcard/ui.xml').matchAll(/<node [^>]*>/g)].map(([n]) => {
    const attr = (k) => n.match(new RegExp(` ${k}="([^"]*)"`))?.[1] ?? '';
    const [x0, y0, x1, y1] = attr('bounds').match(/\d+/g).map(Number);
    return { text: attr('text'), desc: attr('content-desc'), x: (x0 + x1) >> 1, y: (y0 + y1) >> 1, y0 };
  });
}

const find = (all, re) => all.find((n) => re.test(n.text) || re.test(n.desc));
const tapNode = (n) => shell(`input tap ${n.x} ${n.y}`);

async function waitFor(re, ms = 20000) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(700)) {
    const n = find(nodes(), re);
    if (n) return n;
  }
  throw new Error(`timed out waiting for ${re}`);
}

const tap = async (re) => tapNode(await waitFor(re));

const captures = () => {
  const out = spawnSync('adb', ['shell', `run-as ${PKG} ls cache/quote-capture`], { encoding: 'utf8' });
  return out.status === 0 ? out.stdout.split('\n').filter(Boolean) : [];
};

function launch() {
  shell(`am start -a android.intent.action.VIEW -d '${DEV_URL}' ${PKG}`);
}

async function toScan() {
  for (let i = 0; i < 8; i++) {
    const all = nodes();
    if (find(all, /^Scan the quote$/) && find(all, /^Photos$/)) return;
    const next = find(all, /^Check a casa quote$/) ?? (find(all, /^Which service is this\?$/) && find(all, /^Continue$/));
    if (next) tapNode(next);
    else shell('input keyevent KEYCODE_BACK');
    await sleep(1500);
  }
  throw new Error('could not reach the scan screen');
}

/** The newest gallery item is the one just pushed, so it sits first in the picker grid. */
async function pick(file) {
  const name = `${Date.now()}-${file.split('/').pop()}`;
  adb('push', file, `${GALLERY}/${name}`);
  // adb push keeps the source mtime, and the picker sorts by it.
  shell(`touch ${GALLERY}/${name}`);
  shell(`am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://${GALLERY}/${name}`);
  await sleep(1500);
  await tap(/^Photos$/);
  await waitFor(/^Photo taken on /);
  await sleep(1000);
  const first = nodes()
    .filter((n) => /^Photo taken on /.test(n.desc))
    .sort((a, b) => a.y0 - b.y0 || a.x - b.x)[0];
  tapNode(first);
  await sleep(800);
  const done = find(nodes(), /^Done$/);
  if (done) tapNode(done);
}

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push(`PASS ${name}`);
  } catch (e) {
    const shot = join(outDir, `fail-${results.length + 1}.png`);
    writeFileSync(shot, execFileSync('adb', ['exec-out', 'screencap', '-p']));
    results.push(`FAIL ${name}: ${e.message} (${shot})`);
  }
}

shell(`mkdir -p ${GALLERY}`);
launch();
await sleep(8000);

await check('a read leaves no capture behind', async () => {
  await toScan();
  await pick(QUOTE);
  await waitFor(/^We found \d+ lines?\.$/);
  assert.deepEqual(captures(), []);
});

await check('a failed read leaves no capture behind', async () => {
  await toScan();
  await pick(NOT_A_QUOTE);
  await waitFor(/^We couldn’t read that clearly\.$/);
  assert.deepEqual(captures(), []);
});

await check('a kill mid-read is swept on relaunch', async () => {
  let left = [];
  for (const delay of [400, 200, 0, 700]) {
    await toScan();
    await pick(BIG_QUOTE);
    await sleep(delay);
    shell(`am force-stop ${PKG}`);
    left = captures();
    if (left.length > 0) break;
    launch();
    await sleep(8000);
  }
  assert.ok(left.length > 0, 'never caught a capture mid-read, so the sweep went untested');
  launch();
  // A dev build fetches its bundle from Metro first, so the launch sweep can take a while.
  for (const end = Date.now() + 30000; captures().length > 0 && Date.now() < end; ) await sleep(1000);
  assert.deepEqual(captures(), []);
});

shell(`rm -rf ${GALLERY}`);
console.log(results.join('\n'));
process.exitCode = results.every((r) => r.startsWith('PASS')) ? 0 : 1;
