// Material colours of the cover-photo set's props (sRGB), sampled from the approved cover photo
// (brandkit/lookbook/anh-bia/facebook.png), which this scene stands in for. They are props, not brand colours: the
// page's own colours stay in the brand tokens, and the cups carry their real print from the brand kit's GLB.

export const STONE = {
  ground: "#d2c3b6",
  mottle: "#bfae9f",
  grains: ["#5f5149", "#857266", "#a39283", "#f2ede6", "#e6dcd2", "#c3a597"],
} as const;

export const WOOD = {
  side: "#c9a88e",
  grain: ["#9c7457", "#b08a6d", "#e0c6b2", "#d4b59c"],
  fissure: "#6e4a33",
  top: "#dcc6ad",
  ring: "#bd9f84",
  edge: "#a98267",
} as const;

/** The foam: warm ivory, its bubble pits a shade darker with a lighter far rim. */
export const CREAM = {
  ground: "#f0e5d0",
  mottle: ["#e6d8bf", "#f6ecd9"],
  pit: "#d8c6a6",
  pitDeep: "#c6b08c",
  pitRim: "#f9f1e2",
} as const;

/** Dried rose petals (rose to crimson), their crumbs, and dried osmanthus (orange gold) sprinkled on the cream. */
export const SPRINKLES = {
  petals: ["#e2557f", "#c93763", "#f07ea1", "#b22a52", "#d94a78", "#ee6b94"],
  crumbs: ["#9c1f45", "#b9305a", "#7f1a3a"],
  osmanthus: ["#f2a43c", "#e48b1e", "#f7c35c", "#eb9a2a"],
} as const;

export const LILY = {
  tepal: "#fbf7f2",
  throat: "#e8dc8a",
  filament: "#dfe2b0",
  anther: "#c98a2c",
  stigma: "#b5c27a",
} as const;

/** The plants: the curly bud stem on the left, the vine with its leaves and white double jasmine on the right. */
export const PLANT = {
  stem: "#6c8c3c",
  stemLight: "#8aa84f",
  bud: "#7a9a45",
  budSpike: "#9db85e",
  leaf: "#5e8738",
  leafBack: "#7da257",
  jasmine: "#f8f5ee",
  jasmineHeart: "#e9e4c9",
} as const;
