import { esc } from '../utils/dom.js';

/**
 * Every photograph here is someone else's work under CC BY-SA or similar, so the
 * attribution is part of the page rather than a footnote bolted on. A few Commons
 * uploads additionally require co-attribution, which is why the artist string is
 * printed verbatim instead of being tidied down to a name.
 */
export function renderCredits(flowers) {
  const items = flowers
    .map(
      (f) => `
      <li>
        <b>${esc(f.name)}</b>
        ${esc(f.credit.artist)} ·
        ${
          f.credit.licenseUrl
            ? `<a href="${esc(f.credit.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(f.credit.license)}</a>`
            : esc(f.credit.license)
        } ·
        <a href="${esc(f.credit.source)}" target="_blank" rel="noopener noreferrer">Commons</a>
      </li>`
    )
    .join('');

  return `
    <footer class="colophon" id="colophon">
      <div class="colophon__grid">
        <div>
          <h2>Colophon</h2>
          <p>
            Ten photographs from Wikimedia Commons, each chosen by eye from a
            shortlist, then cropped and re-encoded. The accent colour for every
            section was matched to the flower it belongs to, which is why the
            page never quite settles.
          </p>
          <p style="margin-top:1rem">
            Set in Fraunces and Inter. Built with Vite.
          </p>
        </div>
        <div>
          <h2>Photographs</h2>
          <ul class="credits">${items}</ul>
        </div>
      </div>

      <div class="colophon__foot">
        <span>Bloom — ten flowers, ten colours</span>
        <a href="#top">Back to the top</a>
      </div>
    </footer>
  `;
}
