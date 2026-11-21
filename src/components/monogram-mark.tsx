import monogram from "@/data/monogram.json";

export type MarkSlug = keyof typeof monogram.marks;

export const isMarkSlug = (value: string): value is MarkSlug => value in monogram.marks;

/**
 * One of the four monogram marks as a crisp vector (owner, 21/11/2026: "làm nét 4 hoạ tiết hoa monogram"): the cup
 * print's own flat shape (src/data/monogram.json, from `npm run sync-design-system`), filled with the current text
 * colour, so a `text-silver-*` class gives it its silver. Decorative. Sized by `className` (it fills its box).
 */
export function MonogramMark({ slug, className = "size-7 text-silver-600" }: { slug: MarkSlug; className?: string }) {
  return (
    <svg aria-hidden focusable="false" viewBox={monogram.viewBox} className={`shrink-0 ${className}`}>
      <path d={monogram.marks[slug]} fill="currentColor" />
    </svg>
  );
}
