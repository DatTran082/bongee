// The flavour section's scroll, shared between the section (src/components/flavors.tsx, which owns the GSAP
// ScrollTrigger) and the 3D stage (index.ts, which reads it every frame). A plain module value, no React state:
// the stage must not re-render the page sixty times a second.

export interface FlavorScroll {
  /** 0 … 1 through the pinned part, scrubbed (smoothed) by GSAP */
  readonly progress: number;
  /** 0 … 1: how far the section has taken over the viewport (the background tone follows it in and out) */
  readonly presence: number;
}

let state: FlavorScroll = { progress: 0, presence: 0 };

export function setFlavorScroll(next: Partial<FlavorScroll>): void {
  state = { ...state, ...next };
}

export function flavorScroll(): FlavorScroll {
  return state;
}
