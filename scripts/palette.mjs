/**
 * Hand-tuned accent per flower, judged against the shipped crop.
 *
 * Automatic sampling got six of ten wrong, and for understandable reasons: the
 * cornflower sits in ripe wheat so the field won on area, the magnolia and water
 * lily both handed back the yellow of their stamens, and the poppy and buttercup
 * landed on nearly the same red. Colour is the whole concept here, so these are
 * set by eye. Values are HSL; the ramp around them is still derived.
 *
 * Read top to bottom the hues make one warm-to-cool arc:
 * scarlet, vermilion, gold, champagne, blush, rose, lilac, violet, cobalt, jade.
 */
export const ACCENTS = {
  'corn-poppy': { h: 358, s: 0.86, l: 0.55 },
  'persian-buttercup': { h: 16, s: 0.95, l: 0.58 },
  sunflower: { h: 43, s: 0.95, l: 0.56 },
  magnolia: { h: 28, s: 0.42, l: 0.8 },
  'cherry-blossom': { h: 338, s: 0.72, l: 0.78 },
  'king-protea': { h: 346, s: 0.62, l: 0.63 },
  lavender: { h: 274, s: 0.6, l: 0.68 },
  'bearded-iris': { h: 258, s: 0.78, l: 0.66 },
  cornflower: { h: 219, s: 0.82, l: 0.64 },
  'water-lily': { h: 162, s: 0.55, l: 0.6 },
};
