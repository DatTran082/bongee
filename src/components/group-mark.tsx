import { isMarkSlug, MonogramMark } from "@/components/monogram-mark";
import board from "@/data/menu-featured.json";

/** Each drink group's mark, by the till group's title: the menu board's choice (its file is named `<slug>_<colour>`). */
const SLUGS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(board.marks).map(([title, url]) => [title, url.split("/").pop()?.split("_")[0] ?? ""]),
);

/**
 * A drink group's monogram mark, a crisp vector in flat silver (`text-silver-600` by default; 21/11/2026: before, the
 * board's painted mark as a CSS mask, whose soft painted edge blurred); nothing for a group without a mark. Decorative.
 */
export function GroupMark({ title, className = "size-7 text-silver-600" }: { title: string; className?: string }) {
  const slug = SLUGS[title];
  return slug && isMarkSlug(slug) ? <MonogramMark slug={slug} className={className} /> : null;
}
