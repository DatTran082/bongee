import type { Scene } from "./types";

/** Blocks: how far they rise (px), how long (s), the gap between blocks entering together (s). */
const BLOCK = { y: 28, duration: 0.9, stagger: 0.08 };
/** Lines (headings): how long they take to rise out of their masks (s), and the gap between them. */
const LINE = { duration: 1.2, stagger: 0.1 };

/**
 * As they first come into view, blocks rise and fade in (`data-reveal`, or each child of a `data-reveal-group`) and
 * headings rise out of their masks (`data-reveal-line`). Only those still below the viewport: what is already on
 * screen never blinks out. Transform and opacity only, cleared after, so nothing is left on the page's style.
 */
export const reveal: Scene = (gsap, ScrollTrigger) => {
  const below = (element: HTMLElement) => element.getBoundingClientRect().top > window.innerHeight;
  const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal], [data-reveal-group] > *").filter(below);
  const lines = gsap.utils.toArray<HTMLElement>("[data-reveal-line]").filter(below);
  if (blocks.length > 0) {
    gsap.set(blocks, { opacity: 0, y: BLOCK.y });
    ScrollTrigger.batch(blocks, {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: BLOCK.duration,
          ease: "power3.out",
          stagger: BLOCK.stagger,
          overwrite: true,
          clearProps: "opacity,transform",
        }),
    });
  }
  if (lines.length > 0) {
    gsap.set(lines, { yPercent: 110 });
    ScrollTrigger.batch(lines, {
      start: "top 95%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          yPercent: 0,
          duration: LINE.duration,
          ease: "expo.out",
          stagger: LINE.stagger,
          overwrite: true,
          clearProps: "transform",
        }),
    });
  }
};
