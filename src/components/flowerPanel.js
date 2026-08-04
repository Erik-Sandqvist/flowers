import { esc, ordinal } from '../utils/dom.js';
import { renderFlora } from './flora.js';

function panel(flower, i) {
  const n = ordinal(i);

  return `
    <section class="panel" id="${esc(flower.slug)}" data-slug="${esc(flower.slug)}">
      ${renderFlora(i + 1, i % 2 === 0 ? 'left' : 'right')}
      <figure class="panel__media" style="background-image:url('${flower.placeholder}')">
        <div class="panel__parallax">
          <img
            src="${esc(flower.image)}"
            alt="${esc(flower.alt)}"
            loading="lazy"
            decoding="async"
            width="1200"
            height="1500"
          />
        </div>
        <figcaption class="panel__index" aria-hidden="true">${n}</figcaption>
      </figure>

      <div class="panel__body reveal-group">
        <p class="eyebrow" style="--i:0">N<sup>o</sup> ${n} &nbsp;·&nbsp; ${esc(flower.season)}</p>
        <h2 class="panel__name" style="--i:1">${esc(flower.name)}</h2>
        <p class="latin" style="--i:2">${esc(flower.latin)}</p>
        <p class="panel__line" style="--i:3">${esc(flower.line)}</p>
        <p class="panel__note" style="--i:4">${esc(flower.note)}</p>
        <dl class="panel__meta" style="--i:5">
          <div><dt>Season</dt><dd>${esc(flower.season)}</dd></div>
          <div><dt>Native to</dt><dd>${esc(flower.origin)}</dd></div>
          <div><dt>Carries</dt><dd>${esc(flower.meaning)}</dd></div>
        </dl>
      </div>
    </section>
  `;
}

export function renderPanels(flowers) {
  return `<main class="panels">${flowers.map(panel).join('')}</main>`;
}
