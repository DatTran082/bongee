// The /menu page: every dish on the till (src/data/odoo/menu.json, by sync-menu), group by group in the till's order,
// each with its lookbook studio photo (src/data/lookbook.json, by sync-lookbook from ../brandkit/lookbook). Unlike the
// home page's menu (src/data/menu.ts), it also shows the combos. Names, prices and plain lines come only from Odoo.
import { type LookbookGroup, type LookbookPhoto, joinLookbook } from "@/lib/lookbook/join";
import lookbook from "./lookbook.json";
import board from "./menu-featured.json";
import odoo from "./odoo/menu.json";

/** Each till group's anchor on the page; a new till group needs one here to show. */
const GROUP_IDS: Record<string, string> = {
  "Trà sữa hương hoa": "huong-hoa",
  "Trà sữa kem bông": "kem-bong",
  "Trà trái cây": "trai-cay",
  "Kem cheese": "kem-cheese",
  "Cà phê phin · Coldbrew": "ca-phe",
  Combo: "combo",
  Topping: "topping",
};

const photos: Record<string, LookbookPhoto> = Object.fromEntries(
  Object.entries(lookbook.photos).map(([name, { full, thumb, width, height }]) => [
    name,
    { full, thumb, width, height },
  ]),
);

export const lookbookGroups: LookbookGroup[] = joinLookbook(odoo.groups, photos, GROUP_IDS, board.marks);

/** The page's hand-drawn Lottie (public/menu/lookbook/menu-hero.<hash>.json), or null when the brand kit has none. */
export const lookbookAnimation: string | null = lookbook.animation;

/** The day the menu was last copied from Odoo (YYYY-MM-DD). */
export const lookbookSyncedOn: string = odoo.syncedOn;

/** A cover's picture (public/menu/lookbook/cover-*.webp): its URL, size and a blurred 16 px stand-in (data URL). */
export interface CoverPicture {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly blur: string;
}

/** A v5 cover in its wide cut (from lg) and its 4:5 cut round the cups (phones). */
export interface Cover {
  readonly wide: CoverPicture;
  readonly tall: CoverPicture;
}

/** The home page's covers (sync-lookbook, from brandkit/lookbook/v5/bia/): `hero` and `interlude`; a missing one is not shown. */
export const covers: Partial<Record<"hero" | "interlude", Cover>> = lookbook.covers;
