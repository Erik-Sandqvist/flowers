/**
 * Step 1 of the asset pipeline: gather candidate photographs from Wikimedia Commons.
 *
 * Downloads a handful of contact-sheet sized images per flower into scripts/.candidates/
 * so they can be reviewed by eye before any of them ships. Nothing here picks a winner —
 * that happens in pick-winners.mjs once the review is done.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLOWERS, BLOCKLIST, UA } from './flowers.config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'scripts', '.candidates');

const API = 'https://commons.wikimedia.org/w/api.php';
const PER_FLOWER = 6;
const REVIEW_WIDTH = 800;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Strip the HTML Commons returns in extmetadata down to plain text. */
function plain(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isBlocked(title) {
  const t = title.toLowerCase();
  return BLOCKLIST.some((bad) => t.includes(bad));
}

async function search(query, { quality }) {
  const srsearch = quality
    ? `${query} incategory:Quality_images filetype:bitmap`
    : `${query} filetype:bitmap`;
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: srsearch,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: String(REVIEW_WIDTH),
  });

  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons search failed: ${res.status}`);
  const data = await res.json();
  return data?.query?.pages ?? [];
}

function scoreCandidate(page) {
  const ii = page.imageinfo?.[0];
  if (!ii) return null;
  const { width, height } = ii;
  if (!width || !height) return null;
  if (width < 1400) return null;

  const ratio = width / height;
  // Wildly panoramic or very tall images do not crop well into the panel layout.
  if (ratio < 0.5 || ratio > 2.6) return null;
  if (isBlocked(page.title)) return null;

  const meta = ii.extmetadata ?? {};
  return {
    title: page.title,
    pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
    fileUrl: ii.url,
    reviewUrl: ii.thumburl,
    width,
    height,
    ratio: Number(ratio.toFixed(3)),
    artist: plain(meta.Artist?.value) || 'Unknown',
    license: plain(meta.LicenseShortName?.value) || 'See Commons',
    licenseUrl: plain(meta.LicenseUrl?.value) || '',
    credit: plain(meta.Credit?.value) || '',
  };
}

async function collect(flower) {
  const seen = new Set();
  const found = [];

  for (const quality of [true, false]) {
    for (const query of flower.queries) {
      if (found.length >= PER_FLOWER) break;
      let pages = [];
      try {
        pages = await search(query, { quality });
      } catch (err) {
        console.warn(`   ! ${flower.slug}: ${err.message}`);
        continue;
      }
      for (const page of pages) {
        if (found.length >= PER_FLOWER) break;
        if (seen.has(page.title)) continue;
        seen.add(page.title);
        const cand = scoreCandidate(page);
        if (!cand) continue;
        cand.quality = quality;
        found.push(cand);
      }
      await sleep(150);
    }
    if (found.length >= PER_FLOWER) break;
  }
  return found;
}

async function download(url, dest) {
  if (!url) throw new Error('no thumbnail url');
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const manifest = {};
  const errors = [];

  for (const flower of FLOWERS) {
    process.stdout.write(`-> ${flower.slug} `);
    const candidates = await collect(flower);
    manifest[flower.slug] = [];

    for (const [i, cand] of candidates.entries()) {
      const file = `${flower.slug}-${i}.jpg`;
      try {
        await download(cand.reviewUrl, join(OUT, file));
        manifest[flower.slug].push({ file, ...cand });
        process.stdout.write('.');
      } catch (err) {
        process.stdout.write('x');
        errors.push(`${file}: ${err.message}`);
      }
      await sleep(120);
    }
    console.log(` ${manifest[flower.slug].length} candidates`);
  }

  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const total = Object.values(manifest).reduce((n, list) => n + list.length, 0);
  console.log(`\nSaved ${total} candidates to scripts/.candidates/`);
  if (errors.length) {
    console.log(`\n${errors.length} failed:`);
    for (const e of errors) console.log(`  ${e}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
