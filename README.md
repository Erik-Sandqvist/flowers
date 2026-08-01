# Bloom

A single-page scroll through ten flowers, where the whole page takes its colour
from whichever one is on screen. Warm to cool, scarlet through to jade.

```bash
npm install
npm run dev
```

## How it works

The colour shift is one `IntersectionObserver` with `-50%` margins top and
bottom, which collapses the viewport to a line across its middle. A section
claims the theme exactly when it crosses that line, and everything on the page
is drawn from four custom properties registered with `@property` so gradients
interpolate instead of snapping.

`src/data/flowers.js` is generated — the name, copy, image paths, palette and
photo attribution for all ten flowers come from there and nowhere else.

## Rebuilding the images

The photographs come from Wikimedia Commons, downloaded once and served
locally, so the site makes no external requests at runtime.

```bash
npm run assets:fetch    # pull ~6 candidates per flower into scripts/.candidates
npm run assets:sheets   # lay them out as one contact sheet per flower
npm run assets:build    # crop, encode, sample, and write src/data/flowers.js
```

Between the second and third step someone has to *look* at the contact sheets
and record the winners in `scripts/picks.mjs`. That step is not automatable and
is not decoration: filename-and-metadata filtering alone let through a
*Tithonia* labelled as a sunflower, a rose returned for "Ranunculus asiaticus",
a beardless *Iris versicolor* under "bearded iris", brown knapweed twice for
cornflower, and — for lavender — a butterfly and a bird that merely happened to
be photographed nearby.

Accent colours are hand-set in `scripts/palette.mjs`. Automatic sampling is
still run and kept alongside for reference, but it got six of ten wrong: the
cornflower stands in ripe wheat so the field won on area, the magnolia and water
lily both returned the yellow of their stamens, and the poppy and buttercup
landed on nearly the same red.

## Checking it

```bash
npm run shoot -- http://localhost:5173
```

Captures the hero and several panels at desktop and mobile, plus one pass with
reduced motion, and reports transferred weight, external requests and console
errors. Output lands in `scripts/.shots`.

## Credits

Every photograph is CC BY-SA or public domain and is attributed in the colophon
at the foot of the page, including the co-attribution some Commons uploads
require. Set in Fraunces and Inter, both self-hosted.
