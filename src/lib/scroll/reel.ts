import { find, type Scene } from "./types";

/** How long the scrubbed row and its line lag behind the scroll (s): a glide, not a jolt per wheel step. */
const GLIDE = 0.6;
/** Each picture's zoom as it comes in from the right. */
const ZOOM = 1.18;

/**
 * The lookbook reel (src/components/lookbook-reel.tsx): the page's scroll walks its row of plates sideways. The
 * section grows as tall as the row is long beyond the screen (set again on every refresh: a resize, a font), its frame
 * sticks (`data-driven`, look.css), the row moves by transform, a silver line fills as it goes, and each picture
 * settles from a zoom as it comes in. Pictures right of the screen are clipped, so the browser would wait to fetch
 * them until they show: they are asked for eagerly as the reel nears. Returns the undoing of the height and attribute.
 */
export const reel: Scene = (gsap, ScrollTrigger) => {
  const section = find("[data-reel]");
  const frame = section && find("[data-reel-frame]", section);
  const viewport = section && find("[data-reel-viewport]", section);
  const track = section && find("[data-reel-track]", section);
  const line = section && find("[data-reel-progress]", section);
  if (!section || !frame || !viewport || !track) return;
  section.dataset.driven = "true";
  viewport.scrollLeft = 0; // a reader may have swiped the native row before the script came
  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
  const size = () => {
    section.style.height = `${distance() + frame.offsetHeight}px`;
  };
  size();
  ScrollTrigger.addEventListener("refreshInit", size);
  const range = { trigger: section, start: "top top", end: () => `+=${distance()}`, invalidateOnRefresh: true };
  const move = gsap.to(track, { x: () => -distance(), ease: "none", scrollTrigger: { ...range, scrub: GLIDE } });
  if (line) gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { ...range, scrub: GLIDE } });
  const images = gsap.utils.toArray<HTMLImageElement>("[data-reel-image]", section);
  for (const image of images) {
    gsap.fromTo(
      image,
      { scale: ZOOM },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          containerAnimation: move,
          start: "left right",
          end: "center 60%",
          scrub: true,
        },
      },
    );
  }
  ScrollTrigger.create({
    trigger: section,
    start: "top bottom+=100%",
    once: true,
    onEnter: () => {
      for (const image of images) image.loading = "eager";
    },
  });
  return () => {
    ScrollTrigger.removeEventListener("refreshInit", size);
    section.style.height = "";
    delete section.dataset.driven;
  };
};
