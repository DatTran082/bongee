import { find, type Scene } from "./types";

/** The slit the picture opens from (shares of the frame's width and height), and the picture's zoom inside it. */
const SLIT = { x: 0.64, y: 0.14, zoom: 1.12 };

/**
 * The interlude (src/components/interlude.tsx): as it comes up the screen, its window opens from a narrow slit along
 * its top edge (the part already on screen: a slit in the frame's middle would leave a blank screen first) down to the
 * whole frame, the top of the still life showing first. The window scales, and the picture inside is scaled back by the inverse, so it keeps its own size and
 * shape (the window grows, the picture is not stretched) while it settles from a slight zoom. Transforms only.
 */
export const interlude: Scene = (gsap) => {
  const section = find("[data-interlude]");
  const window_ = section && find("[data-interlude-window]", section);
  const image = section && find("[data-interlude-image]", section);
  if (!section || !window_ || !image) return;
  const state = { open: 0 };
  const draw = () => {
    const sx = SLIT.x + (1 - SLIT.x) * state.open;
    const sy = SLIT.y + (1 - SLIT.y) * state.open;
    const zoom = SLIT.zoom + (1 - SLIT.zoom) * state.open;
    gsap.set(window_, { scaleX: sx, scaleY: sy, transformOrigin: "50% 0%" });
    gsap.set(image, { scaleX: zoom / sx, scaleY: zoom / sy, transformOrigin: "50% 0%" });
  };
  gsap.fromTo(
    state,
    { open: 0 },
    {
      open: 1,
      ease: "power2.inOut",
      onUpdate: draw,
      onStart: draw,
      scrollTrigger: { trigger: section, start: "top 80%", end: "top top", scrub: 0.4 },
    },
  );
  draw(); // the slit from the start, before the first scroll
};
