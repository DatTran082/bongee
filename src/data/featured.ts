// The home page's lookbook reel: the menu board's featured drinks (src/data/menu-featured.json, sync-brand), each
// joined to its till entry (name, group, prices, plain line: Odoo only, src/data/menu.ts) and its lookbook photo
// (src/data/lookbook.json). A drink that left the till, or has no photo, is left out.
import lookbook from "./lookbook.json";
import { categories, type MenuItem } from "./menu";
import board from "./menu-featured.json";

export interface DishPhoto {
  readonly src: string;
  readonly thumb: string;
  readonly width: number;
  readonly height: number;
}

export interface FeaturedDish extends MenuItem {
  /** the till group's title and its page id */
  readonly group: string;
  readonly groupId: string;
  readonly photo: DishPhoto;
}

const photos: Record<string, { full: string; thumb: string; width: number; height: number }> = lookbook.photos;

/** A dish's lookbook photo by its name on the till, or null. */
export function photoOf(name: string): DishPhoto | null {
  const photo = photos[name];
  return photo ? { src: photo.full, thumb: photo.thumb, width: photo.width, height: photo.height } : null;
}

export const featured: FeaturedDish[] = board.cups.flatMap(({ name }) => {
  const group = categories.find((c) => c.items.some((item) => item.name === name));
  const item = group?.items.find((i) => i.name === name);
  const photo = photoOf(name);
  return group && item && photo ? [{ ...item, group: group.title, groupId: group.id, photo }] : [];
});
