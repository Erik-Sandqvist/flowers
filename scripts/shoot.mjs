/**
 * Visual check. Drives the running dev server and captures the hero plus a few
 * panels at desktop and mobile, and once with reduced motion, so the design can
 * actually be looked at rather than assumed.
 *
 *   node scripts/shoot.mjs http://localhost:5178
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'scripts', '.shots');
const URL = process.argv[2] ?? 'http://localhost:5178';

const STOPS = ['top', 'corn-poppy', 'sunflower', 'cherry-blossom', 'bearded-iris', 'water-lily', 'palette', 'colophon'];

async function shoot(browser, { name, width, height, reducedMotion = 'no-preference', stops }) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion,
  });

  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => errors.push(`failed: ${r.url()} ${r.failure()?.errorText}`));

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);

  for (const id of stops) {
    await page.evaluate((target) => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, id);
    // Long enough for the colour cross-fade and the reveal to finish.
    await page.waitForTimeout(1700);
    await page.screenshot({ path: join(OUT, `${name}-${id}.png`) });
  }

  const weight = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .reduce((sum, r) => sum + (r.transferSize || r.encodedBodySize || 0), 0)
  );

  const external = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((r) => r.name)
      .filter((u) => !u.startsWith(location.origin))
  );

  await page.close();
  return { errors, weight, external };
}

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

const desktop = await shoot(browser, { name: 'desktop', width: 1440, height: 900, stops: STOPS });
const mobile = await shoot(browser, { name: 'mobile', width: 390, height: 844, stops: ['top', 'corn-poppy', 'bearded-iris', 'palette'] });
const still = await shoot(browser, { name: 'reduced', width: 1440, height: 900, reducedMotion: 'reduce', stops: ['top', 'sunflower'] });

await browser.close();

for (const [label, r] of [['desktop', desktop], ['mobile', mobile], ['reduced', still]]) {
  console.log(`\n== ${label}`);
  console.log(`   transferred: ${(r.weight / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   external requests: ${r.external.length ? r.external.join(', ') : 'none'}`);
  console.log(`   errors: ${r.errors.length ? r.errors.join(' | ') : 'none'}`);
}
