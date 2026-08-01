import { esc } from '../utils/dom.js';

export function renderPalette(flowers) {
  const swatches = flowers
    .map(
      (f) => `
      <button
        type="button"
        class="palette__swatch"
        data-jump="${esc(f.slug)}"
        style="--swatch:${esc(f.palette.accent)}"
      >
        <span>${esc(f.name)}</span>
      </button>`
    )
    .join('');

  return `
    <section class="palette" id="palette">
      <div class="palette__head reveal">
        <h2>The whole walk, at once</h2>
        <p class="palette__note">
          Every colour on this page was taken from the photograph it sits beside.
          Read left to right, the ten of them run warm to cool.
        </p>
      </div>
      <div class="palette__bar reveal">${swatches}</div>
    </section>
  `;
}
