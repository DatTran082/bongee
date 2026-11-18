// How much the 3D stage draws on this device. A phone or a weak computer gets a lighter stage: fewer pixels (a
// lower device-pixel-ratio cap), no shadow pass, and when nothing but the idle float moves, 30
// frames a second instead of 60. What it looks like stays the same; only what it costs changes. Pure: the stage
// reads the device (index.ts, the WebGPU stage's device.ts) and asks here.

export interface Device {
  /** a touch screen as the main pointer (matchMedia("(pointer: coarse)")) */
  readonly coarsePointer: boolean;
  /** the viewport's width, CSS px */
  readonly width: number;
  /** navigator.hardwareConcurrency */
  readonly cores: number;
  /** navigator.deviceMemory, GB (Chromium only: undefined elsewhere) */
  readonly memory: number | undefined;
}

export type Tier = "full" | "light" | "low";

export interface Quality {
  readonly tier: Tier;
  /** the highest device-pixel ratio the canvas draws at */
  readonly dprMax: number;
  /** the set's shadow pass */
  readonly shadows: boolean;
  /** frames a second while only the idle float moves (scroll, input and changes always draw at once) */
  readonly idleFps: number;
}

/** Each tier's settings (a test switch can force one: the WebGPU stage's `?tier=`). */
export const QUALITY: Readonly<Record<Tier, Quality>> = {
  full: { tier: "full", dprMax: 2, shadows: true, idleFps: 60 },
  light: { tier: "light", dprMax: 1.5, shadows: false, idleFps: 30 },
  low: { tier: "low", dprMax: 1.25, shadows: false, idleFps: 30 },
};

export function qualityFor(device: Device): Quality {
  const weak = device.cores <= 2 || (device.memory !== undefined && device.memory <= 2);
  const light =
    device.coarsePointer ||
    device.width < 768 ||
    device.cores <= 4 ||
    (device.memory !== undefined && device.memory <= 4);
  if (weak) return QUALITY.low;
  if (light) return QUALITY.light;
  return QUALITY.full;
}

/** The tier below, for a device that cannot keep up (frame-budget.ts); the lowest stays where it is. */
export function lowerTier(tier: Tier): Tier {
  return tier === "full" ? "light" : "low";
}
