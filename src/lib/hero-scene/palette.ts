// Material colours of the hero scene's props (sRGB), sampled from the approved cover photo
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

export const CREAM = "#f8f2ea";

/** Dried rose petals (pink, lotus red) and dried osmanthus (orange gold) sprinkled on the cream. */
export const SPRINKLES = {
  petals: ["#d7707a", "#b8455e", "#e89aa5", "#c95a6f"],
  osmanthus: ["#e0a240", "#edc064"],
} as const;

export const LILY = {
  tepal: "#fbf7f2",
  throat: "#e8dc8a",
  filament: "#dfe2b0",
  anther: "#c98a2c",
  stigma: "#b5c27a",
} as const;
