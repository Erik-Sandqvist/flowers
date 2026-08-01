import './styles/base.css';
import './styles/layout.css';
import './styles/flower.css';
import './styles/motion.css';

import { FLOWERS, HERO_SLUG } from './data/flowers.js';
import { renderHero } from './components/hero.js';
import { renderPanels } from './components/flowerPanel.js';
import { renderRail } from './components/progressRail.js';
import { renderPalette } from './components/paletteStrip.js';
import { renderCredits } from './components/credits.js';
import { prefersReducedMotion } from './utils/dom.js';

const app = document.querySelector('#app');

app.innerHTML = [
  renderHero(FLOWERS, HERO_SLUG),
  renderPanels(FLOWERS),
  renderPalette(FLOWERS),
  renderCredits(FLOWERS),
  renderRail(FLOWERS),
].join('');

const root = document.documentElement;
const reduced = prefersReducedMotion();

/* ------------------------------------------------------------ theme engine */

const paletteBySlug = new Map(FLOWERS.map((f) => [f.slug, f.palette]));
const rail = [...document.querySelectorAll('.rail button')];
const themed = [...document.querySelectorAll('[data-slug]')];
let currentSlug = null;

function applyTheme(slug) {
  const palette = paletteBySlug.get(slug);
  if (!palette || slug === currentSlug) return;
  currentSlug = slug;

  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-soft', palette.accentSoft);
  root.style.setProperty('--accent-deep', palette.accentDeep);
  root.style.setProperty('--bg', palette.bg);
  root.style.setProperty('--bg-lift', palette.bgLift);
}

/*
 * The hero borrows a flower's palette, so it shares that slug — but it is not one
 * of the ten stops. Passing null keeps the rail blank until a real panel is up.
 */
function setRailCurrent(slug) {
  for (const button of rail) {
    button.setAttribute('aria-current', String(button.dataset.jump === slug));
  }
}

/*
 * The -50% margins collapse the viewport to a single line across its middle, so
 * a section takes the theme exactly when it crosses the centre of the screen.
 */
const active = new Set();

const themeObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      const slug = entry.target.dataset.slug;
      if (entry.isIntersecting) active.add(slug);
      else active.delete(slug);
    }
    // Fall back to document order if two sections briefly overlap the line.
    const next = themed.find((el) => active.has(el.dataset.slug));
    if (!next) return;
    applyTheme(next.dataset.slug);
    setRailCurrent(next.classList.contains('panel') ? next.dataset.slug : null);
  },
  { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
);

themed.forEach((el) => themeObserver.observe(el));
applyTheme(HERO_SLUG);
setRailCurrent(null);

/* ---------------------------------------------------------------- reveals */

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    }
  },
  { rootMargin: '0px 0px -12% 0px', threshold: 0.14 }
);

document
  .querySelectorAll('.panel, .reveal, .reveal-group')
  .forEach((el) => revealObserver.observe(el));

/* --------------------------------------------------------------- parallax */

const parallaxItems = reduced
  ? []
  : [...document.querySelectorAll('.panel__media')].map((media) => ({
      media,
      layer: media.querySelector('.panel__parallax'),
    }));

const progressBar = document.querySelector('.scroll-progress span');

let ticking = false;

function onFrame() {
  ticking = false;
  const vh = window.innerHeight;

  for (const { media, layer } of parallaxItems) {
    const rect = media.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > vh + 200) continue;
    const offset = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
    layer.style.transform = `translate3d(0, ${(offset * rect.height * 0.07).toFixed(2)}px, 0)`;
  }

  const scrollable = root.scrollHeight - vh;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
}

function requestFrame() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(onFrame);
}

window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', requestFrame, { passive: true });
requestFrame();

/* ------------------------------------------------------------ cursor glow */

const glow = document.querySelector('.cursor-glow');

if (!reduced && window.matchMedia('(pointer: fine)').matches) {
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let running = false;

  const drift = () => {
    // Trail the pointer rather than pin to it; the lag is what makes it read
    // as light in the room instead of a cursor decoration.
    x += (targetX - x) * 0.08;
    y += (targetY - y) * 0.08;
    glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;

    if (Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
      requestAnimationFrame(drift);
    } else {
      running = false;
    }
  };

  window.addEventListener(
    'pointermove',
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      glow.classList.add('is-live');
      if (!running) {
        running = true;
        requestAnimationFrame(drift);
      }
    },
    { passive: true }
  );
}

/* ------------------------------------------------------------------ jumps */

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-jump]');
  if (!button) return;
  document
    .getElementById(button.dataset.jump)
    ?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
});

/* ------------------------------------------------------------- hero intro */

requestAnimationFrame(() => {
  root.classList.add('is-ready');
  document.querySelector('.rail')?.classList.add('is-live');
});
