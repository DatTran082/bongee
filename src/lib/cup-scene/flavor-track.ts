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

/** What a flavour is served in: the cup's body and what sits on it. */
export interface CupKind {
  readonly body: "paper" | "pp";
  readonly topper: "lid" | "cream" | "cheese" | "none";
}
export type CupBody = CupKind["body"];
export type CupTopper = CupKind["topper"];

export interface CupParts {
  /** each body's size, 0 … 1 */
  readonly bodies: Readonly<Record<CupBody, number>>;
  /** each topper's size (0 … 1, a little over on landing) and lift above its rest, as a share of the lid's lift */
  readonly toppers: Readonly<Record<CupTopper, { readonly size: number; readonly lift: number }>>;
}

/** Overshoots a little on the way to 1: a topper lands with a soft bounce. */
const backOut = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  const k = 1.5;
  return 1 + (k + 1) * (c - 1) ** 3 + k * (c - 1) ** 2;
};

/**
 * The carousel's cup, part by part, for a state: between two flavours served in the same body (a paper cup with a
 * lid, then with cream) the body stays whole and only the topper changes, the old one lifting away as it shrinks,
 * the new one dropping in and settling with a small bounce, overlapping a little; between different bodies (paper
 * and PP) the whole cup shrinks away by halfway and the next grows in from there, never both at once.
 */
export function cupParts(state: FlavorState, kinds: readonly CupKind[]): CupParts {
  const bodies: Record<CupBody, number> = { paper: 0, pp: 0 };
  const toppers: Record<CupTopper, { size: number; lift: number }> = {
    lid: { size: 0, lift: 0 },
    cream: { size: 0, lift: 0 },
    cheese: { size: 0, lift: 0 },
    none: { size: 0, lift: 0 },
  };
  const from = kinds[state.from];
  const to = kinds[state.to];
  if (!from || !to) return { bodies, toppers };
  const b = state.blend;
  const out = 1 - smooth((b - 0.05) / 0.5); // the outgoing part, gone a little after halfway
  const grow = smooth((b - 0.4) / 0.55); // the incoming part, starting a little before
  const set = (topper: CupTopper, size: number, lift: number) => {
    const t = toppers[topper];
    if (size > t.size) toppers[topper] = { size, lift };
  };
  if (from.body === to.body) {
    bodies[from.body] = 1;
    if (from.topper === to.topper) set(from.topper, 1, 0);
    else {
      set(from.topper, out, 1 - out);
      set(to.topper, grow > 0 ? backOut(grow) : 0, 1 - grow);
    }
  } else {
    // whole cups never overlap: the old one is gone at halfway, the new one starts there
    const leave = 1 - smooth(b / 0.5);
    const come = smooth((b - 0.5) / 0.5);
    bodies[from.body] = leave;
    bodies[to.body] = come > 0 ? backOut(come) : 0;
    set(from.topper, leave, 0);
    set(to.topper, bodies[to.body], 0);
  }
  return { bodies, toppers };
}
