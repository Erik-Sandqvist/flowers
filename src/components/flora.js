/**
 * Vines that grow in from the left and right edges as a panel arrives: the stem
 * draws itself inward from off-screen, then leaves and blossoms open along it.
 *
 * Drawn as SVG rather than images so the whole thing inherits the live theme
 * colour — the flora recolours along with everything else on the way down.
 */

const PETAL = {
  slim: 'M0 0 C -20 -34 -18 -80 0 -118 C 18 -80 20 -34 0 0 Z',
  almond: 'M0 0 C -38 -28 -46 -74 0 -110 C 46 -74 38 -28 0 0 Z',
  round: 'M0 0 C -48 -22 -54 -68 0 -98 C 54 -68 48 -22 0 0 Z',
  leaf: 'M0 0 C -26 -40 -14 -92 0 -126 C 14 -92 26 -40 0 0 Z',
};

const VIEW = { w: 460, h: 940 };

/**
 * Three stems per side, all rooted just past the edge so their start is never
 * visible — the growth appears to come from outside the screen.
 */
const VINES = [
  { p: [[-40, 470], [70, 430], [180, 350], [250, 205]], leaves: 3, tip: 'blossom', w: 2.6 },
  { p: [[-40, 486], [90, 520], [210, 580], [268, 726]], leaves: 3, tip: 'blossom', w: 2.2 },
  { p: [[-40, 478], [80, 468], [180, 452], [286, 470]], leaves: 2, tip: 'bud', w: 1.7 },
];

const rad = (deg) => (deg * Math.PI) / 180;
const round = (n) => Math.round(n * 10) / 10;

/** Deterministic PRNG so every panel differs but never reshuffles on rerender. */
function rng(seed) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function cubicAt([p0, p1, p2, p3], t) {
  const mt = 1 - t;
  return [
    mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0],
    mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1],
  ];
}

/** Direction of travel at t, in degrees — leaves are set against this. */
function cubicAngle([p0, p1, p2, p3], t) {
  const mt = 1 - t;
  const x =
    3 * mt ** 2 * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t ** 2 * (p3[0] - p2[0]);
  const y =
    3 * mt ** 2 * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t ** 2 * (p3[1] - p2[1]);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function cubicLength(points, steps = 48) {
  let len = 0;
  let prev = cubicAt(points, 0);
  for (let i = 1; i <= steps; i++) {
    const cur = cubicAt(points, i / steps);
    len += Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    prev = cur;
  }
  return len;
}

const pathData = ([p0, p1, p2, p3]) =>
  `M${p0[0]} ${p0[1]} C${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`;

/*
 * Placement always goes on a wrapping <g> as an SVG attribute, never on the
 * <path> itself: CSS transform wins over the presentation attribute, so a petal
 * that carries its own placement loses it the moment the open state animates.
 */
const place = (transform, cls, d, delay) =>
  `<g transform="${transform}"><path class="${cls}" d="${d}" style="--d:${delay}"/></g>`;

/** A five-petal blossom that opens as one unit. */
function blossom(x, y, scale, spin, delay, tone) {
  const petals = Array.from({ length: 5 }, (_, i) =>
    place(
      `rotate(${round(spin + i * 72)}) scale(0.34)`,
      `flora__petal flora__petal--${tone}`,
      PETAL.round,
      delay + i * 60
    )
  ).join('');

  return `<g transform="translate(${round(x)} ${round(y)}) scale(${round(scale)})">
      ${petals}
      <circle class="flora__eye" cx="0" cy="0" r="8" style="--d:${delay + 340}"/>
    </g>`;
}

function vine(spec, rand, order) {
  const { p, leaves, tip, w } = spec;
  const len = cubicLength(p);
  const stemDelay = order * 150;

  const parts = [
    `<path class="flora__stem" d="${pathData(p)}" stroke-width="${w}"
       style="--len:${round(len)}; --d:${stemDelay}"/>`,
  ];

  // Leaves ride the stem, alternating sides, opening behind the growing tip.
  for (let i = 0; i < leaves; i++) {
    const t = 0.34 + (i / Math.max(1, leaves)) * 0.5;
    const [x, y] = cubicAt(p, t);
    const along = cubicAngle(p, t);
    const side = i % 2 === 0 ? 1 : -1;
    const scale = 0.42 + rand() * 0.3;
    parts.push(
      place(
        `translate(${round(x)} ${round(y)}) rotate(${round(along + 90 + side * 52)}) scale(${round(scale)})`,
        'flora__petal flora__petal--leaf',
        PETAL.leaf,
        stemDelay + 700 + i * 130
      )
    );
  }

  const [tx, ty] = cubicAt(p, 1);
  if (tip === 'blossom') {
    parts.push(
      blossom(tx, ty, 0.95 + rand() * 0.45, rand() * 40, stemDelay + 980, rand() > 0.5 ? 'soft' : 'base')
    );
  } else {
    parts.push(
      place(
        `translate(${round(tx)} ${round(ty)}) rotate(${round(cubicAngle(p, 1) + 90)}) scale(0.42)`,
        'flora__petal flora__petal--bud',
        PETAL.almond,
        stemDelay + 980
      )
    );
  }

  return parts.join('');
}

function sprig(seed) {
  const rand = rng(seed);
  const parts = VINES.map((spec, i) => vine(spec, rand, i));

  // A few loose petals drifting free of the vines.
  for (let i = 0; i < 3; i++) {
    parts.push(
      place(
        `translate(${round(180 + rand() * 250)} ${round(120 + rand() * 700)}) rotate(${round(
          rand() * 360
        )}) scale(${round(0.26 + rand() * 0.22)})`,
        'flora__petal flora__petal--drift',
        PETAL.slim,
        1500 + i * 190
      )
    );
  }

  return parts.join('');
}

const svgFor = (side, seed) => `
  <svg class="flora flora--${side}" viewBox="0 0 ${VIEW.w} ${VIEW.h}"
    fill="none" aria-hidden="true" focusable="false">${sprig(seed)}</svg>`;

/**
 * One sprig, on the side the photograph occupies. Putting it there rather than
 * on both edges keeps it clear of the copy entirely — on the text side a
 * blossom inevitably lands on the heading — and lets it drape over the print.
 *
 * @param {number} seed  keeps each panel's arrangement distinct and stable
 * @param {'left'|'right'} side  the side the photograph sits on
 */
export function renderFlora(seed, side) {
  return `<div class="panel__flora" aria-hidden="true">${svgFor(side, seed)}</div>`;
}

/** The hero is one full-bleed photograph, so it takes flora from both edges. */
export function renderHeroFlora(seed) {
  return `<div class="hero__flora" aria-hidden="true">${svgFor('left', seed)}${svgFor(
    'right',
    seed + 17
  )}</div>`;
}
