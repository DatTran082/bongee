import type { Scene } from "./types";

/** The footer's name (src/components/site-footer.tsx): its letters rise one by one as the footer comes up. */
export const wordmark: Scene = (gsap) => {
  const letters = gsap.utils.toArray<HTMLElement>("[data-wordmark-letter]");
  const line = letters[0]?.parentElement;
  if (!line) return;
  gsap.fromTo(
    letters,
    { yPercent: 70 },
    {
      yPercent: 0,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: { trigger: line, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
    },
  );
};
