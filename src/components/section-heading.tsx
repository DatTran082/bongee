import type { ReactNode } from "react";

/**
 * A section's heading: a small tracked eyebrow over a very large light <h2> (21/11/2026: the redesign's display
 * size), set left; `aside` (a link) sits on the right of the same row on wide screens. On the home page the title
 * rises out of its own mask and the rest fades up as it first comes into view (`data-reveal-line`, `data-reveal`,
 * src/components/scroll-motion.tsx); the mask leaves room for Vietnamese marks above and below the letters.
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
    <div className="mb-12 flex flex-wrap items-end justify-between gap-8 md:mb-20">
      <div className="min-w-0">
        <p data-reveal className="eyebrow">
          {tagline}
        </p>
        <h2
          id={id}
          className="mt-5 text-[clamp(2.6rem,7.5vw,7rem)] leading-[0.98] font-light tracking-[-0.025em] text-balance"
        >
          <span className="-my-[0.14em] block overflow-hidden py-[0.14em]">
            <span data-reveal-line className="block">
              {title}
            </span>
          </span>
        </h2>
      </div>
      {aside && <div data-reveal>{aside}</div>}
    </div>
  );
}
