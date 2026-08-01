// The ten flowers, ordered as one continuous warm -> cool hue rotation down the page.
// `queries` are tried in order against Wikimedia Commons until enough candidates are found.

export const UA = 'bloom-flower-site/1.0 (https://github.com/; contact: esandqvist04@gmail.com)';

export const FLOWERS = [
  {
    slug: 'corn-poppy',
    name: 'Corn Poppy',
    latin: 'Papaver rhoeas',
    queries: ['Papaver rhoeas flower', 'Papaver rhoeas', 'corn poppy flower red'],
  },
  {
    slug: 'persian-buttercup',
    name: 'Persian Buttercup',
    latin: 'Ranunculus asiaticus',
    queries: ['Ranunculus asiaticus flower', 'Ranunculus asiaticus', 'Persian buttercup'],
  },
  {
    slug: 'sunflower',
    name: 'Sunflower',
    latin: 'Helianthus annuus',
    queries: ['Helianthus annuus flower', 'Helianthus annuus', 'sunflower blossom'],
  },
  {
    slug: 'magnolia',
    name: 'Magnolia',
    latin: 'Magnolia × soulangeana',
    queries: ['Magnolia soulangeana flower', 'Magnolia soulangeana', 'Magnolia blossom'],
  },
  {
    slug: 'cherry-blossom',
    name: 'Cherry Blossom',
    latin: 'Prunus serrulata',
    queries: ['Prunus serrulata flower', 'Prunus serrulata', 'cherry blossom sakura flower'],
  },
  {
    slug: 'king-protea',
    name: 'King Protea',
    latin: 'Protea cynaroides',
    queries: ['Protea cynaroides flower', 'Protea cynaroides', 'king protea'],
  },
  {
    slug: 'lavender',
    name: 'Lavender',
    latin: 'Lavandula angustifolia',
    queries: ['Lavandula angustifolia flower', 'Lavandula angustifolia', 'lavender field bloom'],
  },
  {
    slug: 'bearded-iris',
    name: 'Bearded Iris',
    latin: 'Iris germanica',
    queries: ['Iris germanica flower', 'Iris germanica', 'bearded iris flower'],
  },
  {
    slug: 'cornflower',
    name: 'Cornflower',
    latin: 'Centaurea cyanus',
    queries: ['Centaurea cyanus flower', 'Centaurea cyanus', 'cornflower blue flower'],
  },
  {
    slug: 'water-lily',
    name: 'Water Lily',
    latin: 'Nymphaea alba',
    queries: ['Nymphaea alba flower', 'Nymphaea flower', 'water lily flower'],
  },
];

// Filenames containing any of these are almost never the hero photo we want.
export const BLOCKLIST = [
  'köhler', 'kohler', 'medizinal', 'illustration', 'drawing', 'engraving', 'plate',
  'herbarium', 'botanical', 'diagram', 'map', 'distribution', 'seed', 'seeds', 'fruit',
  'capsule', 'leaf', 'leaves', 'stem', 'root', 'bud only', 'sculpture', 'painting',
  'stamp', 'coin', 'logo', 'coat of arms', 'flag', 'banknote', 'memorial', 'grave',
  'apiary', 'bee', 'bees', 'wasp', 'beetle', 'fly ', 'spider', 'butterfly', 'moth',
  'aphid', 'meligethes', 'vanessa', 'apis mellifera', 'bombus', 'insect', 'larva',
  'dried', 'pressed', 'micrograph', 'cross section', 'anatomy', 'winter', 'snow',
];
