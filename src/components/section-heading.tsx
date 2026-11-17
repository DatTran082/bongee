import type { ReactNode } from "react";

/**
 * A section's heading: a small tracked eyebrow over the <h2>, set left, in light type; `aside` (a link, a cup's slot)
 * sits on the right of the same row on wide screens.
 */
export function SectionHeading({
  tagline,
  title,
  id,
  aside,
}: {
  tagline: string;
  title: string;
  /** id of the <h2>, for a section that names itself with aria-labelledby */
  id?: string;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
      <div>
        <p className="eyebrow">{tagline}</p>
        <h2 id={id} className="mt-4 text-3xl font-light tracking-tight text-balance md:text-5xl">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
