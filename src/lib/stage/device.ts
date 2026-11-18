import { type Device, qualityFor, type Tier } from "@/lib/cup-scene/quality";

/** This device as quality.ts reads it. Browser only. */
export function readDevice(): Device {
  const { deviceMemory } = navigator as Navigator & { deviceMemory?: number };
  return {
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    width: window.innerWidth,
    cores: navigator.hardwareConcurrency || 4,
    memory: deviceMemory,
  };
}

/** The quality tier this device gets, unless a test switch forces one. */
export function deviceTier(forced: Tier | null): Tier {
  return forced ?? qualityFor(readDevice()).tier;
}
