// Usage: node scripts/visual/snap.mjs <outDir> [scenarioNameFilter]
// Needs the web dev server on BASE_URL (default http://localhost:8081) and a Chromium browser at BROWSER.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { scenarios } from './scenarios.mjs';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8081';
const BROWSER = process.env.BROWSER ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const [outDir, filter] = process.argv.slice(2);
if (!outDir) throw new Error('usage: snap.mjs <outDir> [filter]');
mkdirSync(outDir, { recursive: true });

// Software rasterization: GPU gradient dithering differs run to run and would make every diff noisy.
const browser = await chromium.launch({
  executablePath: BROWSER,
  headless: true,
  args: ['--disable-gpu', '--disable-gpu-rasterization', '--use-angle=swiftshader', '--force-color-profile=srgb', '--font-render-hinting=none'],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
  timezoneId: 'Asia/Manila',
  locale: 'en-PH',
});

// Expo's dev error toast sits over the footer buttons and would land in every screenshot.
const hideDevToast = (page) => page.evaluate(() => document.getElementById('error-toast')?.remove());

const tap = async (page, label) => {
  await hideDevToast(page);
  if (label === 'back') {
    await page.goBack();
  } else if (typeof label === 'object') {
    await page.locator('input:visible').last().fill(label.type);
  } else {
    // Screens under the top of a stack stay in the DOM, so only a visible control counts.
    const text = page.getByText(label, { exact: true }).filter({ visible: true });
    const control = page.locator('[role=button], [role=link], [role=radio], [tabindex]').filter({ has: text, visible: true });
    // An inline link is a pressable Text with no role of its own.
    await ((await control.count()) ? control : text).last().click({ timeout: 5000 });
  }
  await page.waitForTimeout(700);
};

let failed = 0;
for (const s of scenarios.filter((s) => !filter || s.name.includes(filter))) {
  const page = await context.newPage();
  try {
    await page.goto(BASE_URL + s.url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    if (s.waitText) await page.getByText(s.waitText, { exact: true }).last().waitFor({ timeout: 15000 });
    await page.waitForTimeout(1200);
    for (const label of s.taps ?? []) await tap(page, label);
    if (s.shows) await page.getByText(s.shows, { exact: true }).last().waitFor({ timeout: 5000 });
    await page.waitForTimeout(800);
    await hideDevToast(page);
    await page.screenshot({ path: join(outDir, `${s.name}.png`), caret: 'hide', animations: 'disabled' });
    console.log('ok', s.name);
  } catch (e) {
    failed++;
    console.log('FAIL', s.name, String(e.message).split('\n')[0]);
  } finally {
    await page.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
