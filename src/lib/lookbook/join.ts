// The /menu page's content: the till's groups and dishes (Odoo, src/data/odoo/menu.json) in the till's order, each
// dish with its lookbook photo when the brand kit has one (src/data/lookbook.json, written by sync-lookbook). Names,
// prices and the plain line come only from Odoo; a dish without a photo is still listed.

export interface LookbookPhoto {
  /** 1200 × 1500 WebP, for the enlarged view */
  full: string;
  /** 600 × 750 WebP, for the grid */
  thumb: string;
  width: number;
  height: number;
}

export interface TillItem {
  name: string;
  prices: number[];
  note?: string;
}

export interface TillGroup {
  title: string;
  items: TillItem[];
}

export interface LookbookDish extends TillItem {
  photo: LookbookPhoto | null;
}

export interface LookbookGroup {
  id: string;
  title: string;
  /** the group's painted monogram mark, from the menu board; null when it has none */
  mark: string | null;
  items: LookbookDish[];
}

/** Joins the till's groups with the photos by dish name; groups without an id or without dishes are left out. */
export function joinLookbook(
  groups: readonly TillGroup[],
  photos: Readonly<Record<string, LookbookPhoto>>,
  groupIds: Readonly<Record<string, string>>,
  marks: Readonly<Record<string, string>>,
): LookbookGroup[] {
  return groups.flatMap((group) => {
    const id = groupIds[group.title];
    if (!id || group.items.length === 0) return [];
    const items = group.items.map((item) => ({
      name: item.name,
      prices: item.prices,
      ...(item.note ? { note: item.note } : {}),
      photo: photos[item.name] ?? null,
    }));
    return [{ id, title: group.title, mark: marks[group.title] ?? null, items }];
  });
}
