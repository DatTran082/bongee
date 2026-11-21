// The home page's scroll scenes (src/components/scroll-motion.tsx), one module each. A scene sets up its tweens and
// ScrollTriggers inside the page's gsap.matchMedia context (which reverts them when the visitor turns motion off) and
// returns whatever else it must undo itself: attributes, heights, listeners, live poses.

export type Gsap = typeof import("gsap").gsap;
export type ScrollTriggerClass = typeof import("gsap/ScrollTrigger").ScrollTrigger;
export type Scene = (gsap: Gsap, ScrollTrigger: ScrollTriggerClass) => (() => void) | void;

/** The page's element with the attribute, or null. */
export const find = <T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(selector);
