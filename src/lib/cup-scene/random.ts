/** A random number in [0, 1). */
export type Random = () => number;

/** Seeded PRNG (mulberry32): the props come out the same on every visit. */
export function seeded(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (random: Random, min: number, max: number): number => min + (max - min) * random();

export const pick = <T>(random: Random, items: readonly T[]): T => items[Math.floor(random() * items.length)];

/**
 * A smooth periodic wobble round a circle: low sine harmonics (from the 2nd) with random phases and falling
 * amplitudes, so a log or a dome is lumpy rather than turned on a lathe. Returns at most about ±amount.
 */
export function wobble(random: Random, harmonics: number, amount: number): (angle: number) => number {
  const terms = Array.from({ length: harmonics }, (_, i) => ({
    k: i + 2,
    amp: (amount * between(random, 0.4, 1)) / (i + 1),
    phase: random() * Math.PI * 2,
  }));
  const norm = terms.reduce((sum, t) => sum + t.amp, 0) / amount || 1;
  return (angle) => terms.reduce((sum, t) => sum + t.amp * Math.sin(t.k * angle + t.phase), 0) / norm;
}
