// The flavour carousel (src/components/flavors.tsx): one flavour per menu category, in the menu's order, each with
// the cup it is served in (the clear PP cup for the fruit teas, a paper cup for the rest), the toppings that float
// round it and the tone the stage's background takes. Tones stay in the brand's creams and whites
// (brandkit/color/tokens.json): the flavour's own colours are in the cup and the toppings, never the ground. Words
// come from the menu (menu-data.json): the category's title and its items' names, nothing written here.

import tokens from "./brand-tokens.json";
import { categories, type MenuCategoryId } from "./menu";

export type FlavorCup = "paper-lidded" | "paper-cream" | "paper-cheese" | "pp";
export type FlavorTopping = "blossom" | "cream" | "fruit" | "cheese" | "coffee";
type BrandTone = "bg" | "bg-alt" | "grey-100";

interface FlavorSpec {
  readonly id: MenuCategoryId;
  readonly cup: FlavorCup;
  readonly topping: FlavorTopping;
  readonly tone: BrandTone;
}

const SPECS: readonly FlavorSpec[] = [
  { id: "huong-hoa", cup: "paper-lidded", topping: "blossom", tone: "bg" },
  { id: "kem-bong", cup: "paper-cream", topping: "cream", tone: "bg-alt" },
  { id: "trai-cay", cup: "pp", topping: "fruit", tone: "bg" },
  { id: "kem-cheese", cup: "paper-cheese", topping: "cheese", tone: "bg-alt" },
  { id: "ca-phe", cup: "paper-lidded", topping: "coffee", tone: "grey-100" },
];

/** How many of a category's items the carousel names. */
const ITEMS_SHOWN = 4;

export interface Flavor extends FlavorSpec {
  readonly title: string;
  readonly items: readonly string[];
  /** the tone as a hex colour */
  readonly toneHex: string;
}

export const flavors: readonly Flavor[] = SPECS.flatMap((spec) => {
  const category = categories.find((c) => c.id === spec.id);
  if (!category) return []; // the menu dropped the category: the carousel drops the flavour
  return [
    {
      ...spec,
      title: category.title,
      items: category.items.slice(0, ITEMS_SHOWN).map((item) => item.name),
      toneHex: tokens[spec.tone],
    },
  ];
});
