import { find, type Scene } from "./types";

/** How small the picture is drawn back to (share of its full size): from lg it fills the screen, on phones not. */
const FRAMED = { wide: 0.72, narrow: 0.86 };
/** The picture's own slow zoom out as the page scrolls. */
const ZOOM = 1.08;

/**
 * The hero (src/components/hero.tsx), scrubbed while its frame sticks: the words (and on phones their canvas-coloured
 * ground) fade and rise away, and the picture is drawn back into a framed canvas on the white page, moving to the
 * middle of the screen, while the still life inside zooms gently out. Transform and opacity only.
 */
export const hero: Scene = (gsap) => {
  const section = find("[data-hero]");
  const frame = section && find("[data-hero-frame]", section);
  const ground = section && find("[data-hero-ground]", section);
  const picture = section && find("[data-hero-picture]", section);
  const image = section && find("[data-hero-image]", section);
  if (!section || !frame || !ground || !picture || !image) return;
  const wide = () => window.matchMedia("(min-width: 64rem)").matches;
  // from the picture's centre to the frame's (layout boxes, so its own transform does not count)
  const toMiddle = () => frame.clientHeight / 2 - (picture.offsetTop + picture.offsetHeight / 2);
  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(ground, { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -14, duration: 0.45, ease: "power1.in" }, 0)
    .fromTo(
      picture,
      { scale: 1, y: 0 },
      { scale: () => (wide() ? FRAMED.wide : FRAMED.narrow), y: toMiddle, duration: 1, ease: "power2.inOut" },
      0,
    )
    .fromTo(image, { scale: ZOOM }, { scale: 1, duration: 1 }, 0);
};
