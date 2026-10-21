// The flavour carousel's state for the scroll's progress through its section (src/components/flavors.tsx): which
// flavour shows, how far the change to the next one has got, how big each cup and each set of toppings is, and how
// far the cup has turned. Each flavour has a dwell where nothing changes (the scroll snaps there); between two, the
// cup turns once round its axis, the outgoing cup shrinks away in the first half, the incoming one grows in the
// second, and the toppings cross-fade over the whole change. Pure maths, tested without three.js.

import { ease } from "./track.ts";

export interface FlavorState {
  /** the flavour the change starts from, and the one it goes to (equal at a dwell) */
  readonly from: number;
  readonly to: number;
  /** 0 at `from` … 1 at `to`, eased (with reduced motion, 0 or 1) */
  readonly blend: number;
  /** the flavour nearest the scroll: the one to name to assistive tech */
  readonly current: number;
  /** each flavour's cup size, 0 … 1 (never two above 0 at once) */
  readonly cups: readonly number[];
  /** each flavour's toppings, 0 … 1 (two cross-fade during a change) */
  readonly toppings: readonly number[];
  /** the cup's turn about its axis, radians: a whole turn per flavour, so it faces front at every dwell */
  readonly turn: number;
}

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

export function flavorState(progress: number, count: number, reducedMotion: boolean): FlavorState {
  const n = Math.max(1, Math.floor(count));
  const s = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0)) * (n - 1);
  const from = Math.min(n - 1, Math.floor(s));
  const to = Math.min(n - 1, from + 1);
  const blend = to === from ? 0 : ease(s - from, reducedMotion);
  const cups = Array.from({ length: n }, (_, i) => {
    if (i === from) return 1 - smooth(blend * 2);
    if (i === to) return smooth(blend * 2 - 1);
    return 0;
  });
  const toppings = Array.from({ length: n }, (_, i) => (i === from ? 1 - blend : i === to ? blend : 0));
  if (to === from) {
    cups[from] = 1;
    toppings[from] = 1;
  }
  return {
    from,
    to,
    blend,
    current: blend < 0.5 ? from : to,
    cups,
    toppings,
    turn: 2 * Math.PI * (from + blend),
  };
}

/** The scroll progress (0 … 1) at which flavour `index` rests: where the section snaps. */
export function restProgress(index: number, count: number): number {
  return count > 1 ? Math.min(1, Math.max(0, index / (count - 1))) : 0;
}
