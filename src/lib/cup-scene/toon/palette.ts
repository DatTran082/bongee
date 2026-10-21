import tokens from "@/data/brand-tokens.json";

// Colours of what the stage draws that are not brand colours: the drinks, the fruit, the beans (sRGB). They are the
// flavours' own colours and live only in the 3D (flavors.ts keeps the page's grounds in the brand's creams). Every
// one is a soft, slightly chalky tone, as a stylized game asset paints them; the brand's own colours come from the
// tokens (the Làng Mây accents: cloud, sky, moss, honey, wood, stone).

/** A drink fades from `bottom` at its foot to `top` at its surface (toon/material.ts, `fade`). */
export const DRINKS = {
  grapeTea: { bottom: "#8DBF4A", top: "#DCEFA2" },
  milkTea: { bottom: "#B7855C", top: "#E9C9A3" },
} as const;
export type DrinkName = keyof typeof DRINKS;

export const PROPS = {
  grape: ["#9ACD52", "#8BC34A", "#A8D65E"],
  grapeStem: tokens["moss-500"],
  mango: ["#F6B94A", "#F4A93B", "#F8C661"],
  ice: "#E4F4FA", // a little paler than sky-200: ice reads clear, not blue
  bean: ["#7A4E32", "#6B4429", "#86573A"],
  cheese: ["#F7D877", "#F5CF62"],
  berry: ["#5B2A55", "#4A2148", "#6A3263"],
  flower: tokens.cloud,
  flowerHeart: tokens["honey-400"],
  foam: tokens["cream-300"],
  cheeseFoam: "#F7E3A6",
  petal: [tokens["pink-500"], tokens["pink-700"], "#F09DB5"],
  fleck: ["#6A3263", "#5B2A55"],
  stone: tokens["stone-300"],
  bark: tokens["wood-500"],
  cut: "#E9CFA9",
  cutRing: "#D9B88D",
  cloud: tokens.cloud,
} as const;
