// The carousel cup's state, shared between whoever drives it and the 3D stage (index.ts, which reads it every frame):
// the flavour section's scroll (src/components/flavors.tsx, which owns the GSAP ScrollTrigger) and the menu (src/
// components/menu-picker.tsx, where picking a drink turns the same cup to its group). A plain module value, no React
// state: the stage must not re-render the page sixty times a second.

export interface FlavorScroll {
  /** 0 … 1 through the flavours (flavor-track.ts) */
  readonly progress: number;
  /** 0 … 1: how far the flavour section has taken over the viewport (the background tone follows it in and out) */
  readonly presence: number;
}

/** Who writes the progress: the flavour section's scroll, or the menu while it is on screen. */
export type FlavorDriver = "carousel" | "menu";

let state: FlavorScroll = { progress: 0, presence: 0 };
let holder: FlavorDriver | null = null;
let glide = 0;

/**
 * Updates the state. While the menu holds the cup (claimFlavor), the carousel's progress is set aside (its
 * ScrollTrigger may still fire, on a refresh or the tail of its scrub); its presence always counts.
 */
export function setFlavorScroll(next: Partial<FlavorScroll>, from: FlavorDriver = "carousel"): void {
  const progress = holder && holder !== from ? state.progress : (next.progress ?? state.progress);
  state = { progress, presence: next.presence ?? state.presence };
}

/** The menu takes the cup while it is on screen (`true`) and gives it back when it leaves. */
export function claimFlavor(driver: FlavorDriver, hold: boolean): void {
  if (hold) holder = driver;
  else if (holder === driver) holder = null;
}

export function flavorScroll(): FlavorScroll {
  return state;
}

/** The glide's progress at `t` (0 … 1 of its time) from `from` to `to`: eased in and out (cubic). */
export function glideStep(from: number, to: number, t: number): number {
  const c = Math.min(1, Math.max(0, t));
  const eased = c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
  return from + (to - from) * eased;
}

/**
 * Turns the cup to `progress` for `driver`, gliding there over `ms` (the cup turns and changes on the way, as on the
 * scroll), or at once with reduced motion. A new glide cancels the one under way.
 */
export function glideFlavorTo(progress: number, driver: FlavorDriver, ms: number, reduced: boolean): void {
  cancelAnimationFrame(glide);
  const from = state.progress;
  if (reduced || ms <= 0 || from === progress) {
    setFlavorScroll({ progress }, driver);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const t = (now - start) / ms;
    setFlavorScroll({ progress: glideStep(from, progress, t) }, driver);
    if (t < 1) glide = requestAnimationFrame(step);
  };
  glide = requestAnimationFrame(step);
}
