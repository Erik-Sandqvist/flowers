/**
 * Step 3 of the asset pipeline: turn the chosen photographs into shipping assets.
 *
 *  - downloads each winner at full resolution
 *  - writes a 3:4 portrait panel crop + a wide hero crop as webp
 *  - inlines a tiny blurred placeholder so no panel ever flashes empty
 *  - samples the dominant flower hue to derive that flower's accent colour
 *  - emits src/data/flowers.js, the single source of truth for the site
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { FLOWERS, UA } from './flowers.config.mjs';
import { PICKS, HERO } from './picks.mjs';
import { COPY } from './copy.mjs';
import { ACCENTS } from './palette.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAND = join(ROOT, 'scripts', '.candidates');
const OUT_IMG = join(ROOT, 'public', 'flowers');
const OUT_DATA = join(ROOT, 'src', 'data');

const PANEL = { w: 1200, h: 1500 }; // 4:5 portrait
const HERO_SIZE = { w: 2200, h: 1240 }; // ~16:9

/* ---------------------------------------------------------------- colour -- */

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return (
    '#' +
    rgb
      .map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Find the flower's own hue rather than the average pixel, which on a green
 * background would just return mud. Weight each pixel by how colourful it is,
 * bucket by hue, and take the strongest bucket. Greens are down-weighted since
 * foliage is almost always background here.
 */
function dominantHue(pixels) {
  const buckets = new Array(36).fill(0);
  const satSum = new Array(36).fill(0);
  const litSum = new Array(36).fill(0);

  for (let i = 0; i < pixels.length; i += 3) {
    const [h, s, l] = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
    if (s < 0.18 || l < 0.12 || l > 0.93) continue;
    const bucket = Math.floor(h / 10) % 36;
    // Foliage sits roughly 70-160 degrees; it is context, not subject.
    const foliage = h > 70 && h < 160;
    const weight = s * s * (foliage ? 0.12 : 1);
    buckets[bucket] += weight;
    satSum[bucket] += s * weight;
    litSum[bucket] += l * weight;
  }

  let best = 0;
  for (let i = 1; i < 36; i++) if (buckets[i] > buckets[best]) best = i;
  if (buckets[best] === 0) return { h: 0, s: 0.5, l: 0.5 };

  return {
    h: best * 10 + 5,
    s: satSum[best] / buckets[best],
    l: litSum[best] / buckets[best],
  };
}

/** Build the accent ramp a dark editorial page needs from one hue. */
function paletteFrom({ h, s, l }) {
  return {
    accent: hslToHex(h, s, l),
    accentSoft: hslToHex(h, Math.min(0.75, s * 0.85), Math.max(0.78, l)),
    accentDeep: hslToHex(h, Math.min(0.9, s * 0.95), 0.28),
    bg: hslToHex(h, 0.3, 0.05),
    bgLift: hslToHex(h, 0.26, 0.1),
    hue: Math.round(h),
  };
}

/* ------------------------------------------------------------------ main -- */

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function lqip(input) {
  const buf = await sharp(input)
    .resize(24, 30, { fit: 'cover', position: 'attention' })
    .blur(1.2)
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

async function main() {
  await mkdir(OUT_IMG, { recursive: true });
  await mkdir(OUT_DATA, { recursive: true });

  const manifest = JSON.parse(await readFile(join(CAND, 'manifest.json'), 'utf8'));
  const out = [];

  for (const flower of FLOWERS) {
    const idx = PICKS[flower.slug];
    const entry = manifest[flower.slug]?.[idx];
    if (!entry) throw new Error(`no candidate ${idx} for ${flower.slug}`);

    process.stdout.write(`-> ${flower.slug} `);

    // Ask Commons for a sensibly sized render rather than the raw multi-MB original.
    const src = entry.fileUrl.replace(
      '/commons/',
      '/commons/thumb/'
    ) + `/2400px-${entry.fileUrl.split('/').pop()}`;

    let original;
    try {
      original = await fetchBuffer(src);
    } catch {
      original = await fetchBuffer(entry.fileUrl); // fall back to the original file
    }
    process.stdout.write('fetched ');

    const panelFile = `${flower.slug}.webp`;
    await sharp(original)
      .resize(PANEL.w, PANEL.h, { fit: 'cover', position: 'attention' })
      .webp({ quality: 78, effort: 5 })
      .toFile(join(OUT_IMG, panelFile));

    let heroFile = null;
    if (flower.slug === HERO) {
      heroFile = `${flower.slug}-hero.webp`;
      await sharp(original)
        .resize(HERO_SIZE.w, HERO_SIZE.h, { fit: 'cover', position: 'attention' })
        .webp({ quality: 74, effort: 5 })
        .toFile(join(OUT_IMG, heroFile));
    }
    process.stdout.write('encoded ');

    // Sampled from the shipped crop, then overridden where the eye beat the maths.
    const { data } = await sharp(join(OUT_IMG, panelFile))
      .resize(80, 100, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const sampled = dominantHue(data);
    const palette = paletteFrom(ACCENTS[flower.slug] ?? sampled);
    palette.sampled = hslToHex(sampled.h, sampled.s, sampled.l);
    const placeholder = await lqip(join(OUT_IMG, panelFile));
    process.stdout.write(`${palette.accent}\n`);

    out.push({
      slug: flower.slug,
      name: flower.name,
      latin: flower.latin,
      ...COPY[flower.slug],
      image: `/flowers/${panelFile}`,
      hero: heroFile ? `/flowers/${heroFile}` : null,
      placeholder,
      palette,
      credit: {
        title: entry.title.replace(/^File:/, ''),
        artist: entry.artist,
        license: entry.license,
        licenseUrl: entry.licenseUrl,
        source: entry.pageUrl,
      },
    });
  }

  const file = `// GENERATED by scripts/build-assets.mjs — do not edit by hand.
// Photographs from Wikimedia Commons; each entry carries its own attribution.

export const FLOWERS = ${JSON.stringify(out, null, 2)};

export const HERO_SLUG = ${JSON.stringify(HERO)};
`;

  await writeFile(join(OUT_DATA, 'flowers.js'), file);
  console.log(`\nWrote src/data/flowers.js (${out.length} flowers)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
