import { esc, ordinal } from '../utils/dom.js';

export function renderRail(flowers) {
  const buttons = flowers
    .map(
      (f, i) => `
      <button
        type="button"
        data-jump="${esc(f.slug)}"
        style="--dot:${esc(f.palette.accent)}"
        aria-current="false"
      >
        <span class="rail__label">${ordinal(i)} ${esc(f.name)}</span>
        <span class="visually-hidden">Go to ${esc(f.name)}</span>
      </button>`
    )
    .join('');

  return `<nav class="rail" aria-label="Flower index">${buttons}</nav>`;
}
