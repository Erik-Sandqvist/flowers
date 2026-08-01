/**
 * The winners, chosen by reviewing every candidate contact sheet by eye.
 * Index refers to the position in scripts/.candidates/manifest.json.
 *
 * Rejected along the way — worth recording, because a filename-only filter would
 * have shipped all of these:
 *   sunflower[1]         Tithonia rotundifolia, a different genus entirely
 *   persian-buttercup[2] Rosa 'Lions Rose' — a rose
 *   bearded-iris[2]      Iris versicolor — beardless, so wrong for "Bearded Iris"
 *   cornflower[2] / [4]  Centaurea jacea (brown knapweed), not C. cyanus
 *   lavender[0] / [5]    a butterfly and a waxbill, both merely photographed near lavender
 */
export const PICKS = {
  'corn-poppy': 0, // saturated scarlet, black centre, bokeh green
  'persian-buttercup': 5, // coral petals filling the frame
  sunflower: 2, // the iconic gold head against dark foliage
  magnolia: 2, // single restrained bloom, cream flushed with mauve
  'cherry-blossom': 1, // luminous double blossom on a dark ground
  'king-protea': 0, // best-lit protea, clean separation
  lavender: 4, // backlit spikes, true violet
  'bearded-iris': 4, // deep violet falls with the golden beard visible
  cornflower: 3, // cobalt against ripe wheat
  'water-lily': 0, // crisp white bloom, jade pads
};

/**
 * Which flower carries the hero and gets an extra wide crop.
 * Keep the preload href in index.html pointing at this slug's hero file.
 */
export const HERO = 'cornflower';
