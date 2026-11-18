// The WebGPU stage's test switches, read from the page's query string (docs/interactive-landing-script.md §6), as in
// /lab?webgl&tier=light&inspect:
//   webgl    the WebGL 2 backend even where WebGPU works (what most in-app browsers get)
//   tier     a forced quality tier (full | light | low) instead of this device's own
//   inspect  three.js's inspector (frame timings, memory)
// Pure: the caller passes the search string.

import type { Tier } from "../cup-scene/quality.ts";

export interface StageFlags {
  readonly forceWebGL: boolean;
  /** null: the device's own tier */
  readonly tier: Tier | null;
  readonly inspect: boolean;
}

const TIERS: readonly string[] = ["full", "light", "low"] satisfies Tier[];

const isTier = (value: string | null): value is Tier => value !== null && TIERS.includes(value);

export function readFlags(search: string): StageFlags {
  const params = new URLSearchParams(search);
  const tier = params.get("tier");
  return {
    forceWebGL: params.has("webgl"),
    tier: isTier(tier) ? tier : null,
    inspect: params.has("inspect"),
  };
}
