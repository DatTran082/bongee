// The menu, from the ShanMay brand kit's menu-data.json (the file the printed menu is built from), copied by
// `npm run sync-brand`. Edit the menu there, not here. Items have no descriptions on purpose: none were supplied, so
// none are invented. Prices are in thousand đồng.
//
// TODO(boongee): menu-data.json marks its prices as illustrative (`illustrativePrices: true`): confirm the real
// prices in ShanMay, set it to false, then sync.
import data from "./shanmay/menu-data.json";

type CategoryId = keyof typeof data.categories;

export interface MenuItem {
  name: string;
  /** [M, L] for sized categories, one price otherwise; thousand đồng. */
  prices: number[];
}

export interface MenuCategory {
  id: CategoryId;
  title: string;
  sized: boolean;
  items: MenuItem[];
}

/** Sizes in menu order, e.g. { label: "M", volume: "500ml" }. */
export const sizes = Object.entries(data.sizes).map(([label, volume]) => ({ label, volume }));

/** Categories in the printed menu's reading order (row by row). */
export const categories: MenuCategory[] = data.layout.flat().map((id) => {
  const category = data.categories[id as CategoryId];
  return {
    id: id as CategoryId,
    title: category.title,
    sized: category.sized,
    items: category.items.map((item) => ({ name: item.name, prices: item.price })),
  };
});

/** "Tuỳ chỉnh": sugar and ice levels, e.g. { label: "Đường", options: "0 · 30 · 50 · 70 · 100%" }. */
export const customisation = {
  title: data.custom.title,
  options: data.custom.lines.map((line) => {
    const [label, ...rest] = line.split(/\s{2,}/);
    return { label, options: rest.join(" ") };
  }),
};

export const pricesAreIllustrative = data.illustrativePrices;

export const formatPrice = (thousands: number) => `${thousands}K`;

const drinkPrices = categories.filter((c) => c.id !== "topping").flatMap((c) => c.items.flatMap((i) => i.prices));

/** Cheapest and dearest drink (toppings excluded), thousand đồng. */
export const priceRange = { min: Math.min(...drinkPrices), max: Math.max(...drinkPrices) };

export const itemCount = categories.filter((c) => c.id !== "topping").reduce((n, c) => n + c.items.length, 0);
