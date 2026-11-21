import board from "@/data/menu-featured.json";

/** Each drink group's mark (the menu board's painted monogram marks), by the till group's title. */
const MARKS: Readonly<Record<string, string>> = board.marks;

/**
 * A drink group's monogram mark drawn as a flat silhouette (a CSS mask of the painted SVG) in the current colour
 * class (`bg-silver-600` by default); nothing for a group without a mark. Decorative.
 */
export function GroupMark({ title, className = "size-7 bg-silver-600" }: { title: string; className?: string }) {
  const src = MARKS[title];
  if (!src) return null;
  return (
    <span
      aria-hidden
      className={`shrink-0 ${className}`}
      style={{ mask: `url(${src}) center / contain no-repeat`, WebkitMask: `url(${src}) center / contain no-repeat` }}
    />
  );
}
