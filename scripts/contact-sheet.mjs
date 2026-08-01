/**
 * Step 2 of the asset pipeline: lay the candidates out as one labelled contact sheet
 * per flower, so every option can be judged side by side rather than in isolation.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'scripts', '.candidates');
const SHEETS = join(DIR, 'sheets');

const CELL_W = 440;
const CELL_H = 330;
const COLS = 3;
const PAD = 8;

function label(text) {
  return Buffer.from(
    `<svg width="${CELL_W}" height="46" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CELL_W}" height="46" fill="rgba(0,0,0,0.72)"/>
      <text x="12" y="31" font-family="sans-serif" font-size="26" font-weight="bold" fill="#fff">${text}</text>
    </svg>`
  );
}

async function sheetFor(slug, entries) {
  const rows = Math.ceil(entries.length / COLS);
  const width = COLS * CELL_W + (COLS + 1) * PAD;
  const height = rows * CELL_H + (rows + 1) * PAD;

  const composites = [];
  for (const [i, entry] of entries.entries()) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const left = PAD + col * (CELL_W + PAD);
    const top = PAD + row * (CELL_H + PAD);

    const cell = await sharp(join(DIR, entry.file))
      .resize(CELL_W, CELL_H, { fit: 'cover', position: 'attention' })
      .composite([{ input: label(`${i}`), top: CELL_H - 46, left: 0 }])
      .png()
      .toBuffer();

    composites.push({ input: cell, top, left });
  }

  await sharp({
    create: { width, height, channels: 3, background: '#141414' },
  })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(join(SHEETS, `${slug}.jpg`));
}

async function main() {
  await mkdir(SHEETS, { recursive: true });
  const manifest = JSON.parse(await readFile(join(DIR, 'manifest.json'), 'utf8'));

  for (const [slug, entries] of Object.entries(manifest)) {
    if (!entries.length) continue;
    await sheetFor(slug, entries);
    console.log(`sheet: ${slug} (${entries.length})`);
  }

  // A plain-text index so the review notes can refer to real filenames.
  const lines = [];
  for (const [slug, entries] of Object.entries(manifest)) {
    lines.push(`\n## ${slug}`);
    entries.forEach((e, i) => {
      lines.push(`  [${i}] ${e.title.replace(/^File:/, '')}`);
      lines.push(`      ${e.width}x${e.height} ratio=${e.ratio} quality=${e.quality} | ${e.license} | ${e.artist}`);
    });
  }
  await writeFile(join(DIR, 'index.txt'), lines.join('\n'));
  console.log('\nWrote index.txt');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
