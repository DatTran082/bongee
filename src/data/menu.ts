// The menu, from the shop's Odoo: the till's dishes, their groups and their counter prices, copied to
// src/data/odoo/menu.json by `npm run sync-menu` (through the Boongee MCP server). Change a dish in Odoo, never here.
// What Odoo does not hold, the cup sizes' volumes and the sugar / ice options, still comes from the ShanMay brand
// kit's menu-data.json (`npm run sync-brand`). Items have no descriptions on purpose: none were supplied, so none are
// invented. Prices are in thousand đồng.
import odoo from "./odoo/menu.json";
import data from "./shanmay/menu-data.json";

/** Each till group's id on the page (the flavour carousel and the anchors use these). */
const GROUP_IDS = {
  "Trà sữa hương hoa": "huong-hoa",
  "Trà sữa kem bông": "kem-bong",
  "Trà trái cây": "trai-cay",
  "Kem cheese": "kem-cheese",
  "Cà phê phin · Coldbrew": "ca-phe",
  Topping: "topping",
} as const;

export type MenuCategoryId = (typeof GROUP_IDS)[keyof typeof GROUP_IDS];

export interface MenuItem {
  name: string;
  /** [M, L] for sized items, one price otherwise; thousand đồng. */
  prices: number[];
}

export interface MenuCategory {
  id: MenuCategoryId;
  title: string;
  /** every item comes in M and L */
  sized: boolean;
  items: MenuItem[];
}

/** Sizes in menu order, e.g. { label: "M", volume: "500ml" }. */
export const sizes = Object.entries(data.sizes).map(([label, volume]) => ({ label, volume }));

/** The till's groups in its order; a group the page has no id for is left out (a new one needs an id above). */
export const categories: MenuCategory[] = odoo.groups.flatMap((group) => {
  const id = GROUP_IDS[group.title as keyof typeof GROUP_IDS];
  if (!id) return [];
  const items = group.items.map((item) => ({ name: item.name, prices: item.prices }));
  return [{ id, title: group.title, sized: items.every((item) => item.prices.length > 1), items }];
});

/** The day the menu was last copied from Odoo (YYYY-MM-DD). */
export const menuSyncedOn = odoo.syncedOn;

/** "Tuỳ chỉnh": sugar and ice levels, e.g. { label: "Đường", options: "0 · 30 · 50 · 70 · 100%" }. */
export const customisation = {
  title: data.custom.title,
  options: data.custom.lines.map((line) => {
    const [label, ...rest] = line.split(/\s{2,}/);
    return { label, options: rest.join(" ") };
  }),
};

/** The prices are the till's own (Odoo), not the illustrative ones of the printed-menu draft. */
export const pricesAreIllustrative = false;

export const formatPrice = (thousands: number) => `${thousands}K`;

const drinkPrices = categories.filter((c) => c.id !== "topping").flatMap((c) => c.items.flatMap((i) => i.prices));

/** Cheapest and dearest drink (toppings excluded), thousand đồng. */
export const priceRange = { min: Math.min(...drinkPrices), max: Math.max(...drinkPrices) };

export const itemCount = categories.filter((c) => c.id !== "topping").reduce((n, c) => n + c.items.length, 0);
