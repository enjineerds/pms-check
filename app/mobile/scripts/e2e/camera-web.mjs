// Drives the real capture path on web with Chromium's fake camera: permission, live preview, shutter, reading, lines.
// Usage: node scripts/e2e/camera-web.mjs [outDir]   (needs `npx expo start --web --port 8081`)
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8081';
const BROWSER = process.env.BROWSER ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const outDir = process.argv[2] ?? 'camera-e2e';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: BROWSER,
  headless: true,
  args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await context.grantPermissions(['camera'], { origin: BASE_URL });
const page = await context.newPage();
const shot = (name) => page.screenshot({ path: join(outDir, `${name}.png`) });
const tap = (label) =>
  page.locator('[role=button], [tabindex]').filter({ has: page.getByText(label, { exact: true }) }).last().click();

await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' });
await tap('English');
await tap('Check a casa quote');

await page.waitForURL(/\/check\/scan/, { timeout: 10000 });
const video = page.locator('video');
await video.waitFor({ timeout: 10000 });
await page.waitForFunction(() => {
  const v = document.querySelector('video');
  return !!v && v.readyState >= 2 && v.videoWidth > 0;
}, null, { timeout: 10000 });
const size = await video.evaluate((v) => `${v.videoWidth}x${v.videoHeight}`);
console.log('granted camera skips V3-18 and shows a live preview', size);
await shot('1-scan-live');

const shutter = page.getByLabel('Take photo');
await page.waitForFunction(() => document.querySelector('[aria-label="Take photo"]')?.getAttribute('aria-disabled') !== 'true', null, { timeout: 10000 });
await page.evaluate(() => {
  window.__readingPushes = 0;
  const push = history.pushState.bind(history);
  history.pushState = (state, title, url) => {
    if (String(url).includes('/check/reading')) window.__readingPushes++;
    return push(state, title, url);
  };
});
await shutter.dblclick();

await page.waitForURL(/\/check\/reading/, { timeout: 10000 });
const preview = page.locator('img[src^="data:image"], img[src^="blob:"]').first();

await preview.waitFor({ state: 'attached', timeout: 5000 });
const src = await preview.getAttribute('src');
assert.ok(src && (src.startsWith('data:image') || src.startsWith('blob:')), `reading shows the captured photo, got ${src?.slice(0, 30)}`);
console.log('reading shows the captured photo', src.slice(0, 22));
await shot('2-reading');

await page.waitForURL(/\/check\/lines/, { timeout: 15000 });
await page.getByText('Looks right, check it', { exact: true }).waitFor();
console.log('reading hands lines to check-the-lines');
await shot('3-lines');

const pushes = await page.evaluate(() => window.__readingPushes);
assert.equal(pushes, 1, `a double-tapped shutter opens reading once, got ${pushes}`);
console.log('a double-tapped shutter opens reading once');

await browser.close();
