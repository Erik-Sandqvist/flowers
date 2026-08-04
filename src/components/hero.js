import { esc } from '../utils/dom.js';
import { renderHeroFlora } from './flora.js';

export function renderHero(flowers, heroSlug) {
  const hero = flowers.find((f) => f.slug === heroSlug) ?? flowers[0];

  return `
    <header class="hero" id="top" data-slug="${esc(hero.slug)}">
      <div class="hero__media">
        <img
          src="${esc(hero.hero ?? hero.image)}"
          alt="${esc(hero.alt)}"
          fetchpriority="high"
          decoding="async"
          width="2200"
          height="1240"
        />
      </div>

      ${renderHeroFlora(41)}

      <div class="hero__top">
        <span class="hero__mark">Bloom</span>
        <span class="eyebrow">Ten&nbsp;/&nbsp;Ten</span>
      </div>

      <div class="hero__body">
        <p class="eyebrow fade-up" style="--i:0">A field guide, in colour</p>
        <h1>
          <span class="mask-line"><span style="--i:0">Bloom</span></span>
        </h1>
        <p class="hero__lede fade-up" style="--i:1">
          Ten flowers, each one lending its colour to everything around it.
          Keep scrolling and the page changes hands.
        </p>
        <p class="hero__cue fade-up" style="--i:2">Scroll</p>
      </div>
    </header>
  `;
}
