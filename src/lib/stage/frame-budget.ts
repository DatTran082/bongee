// Whether this device keeps up with the stage (docs/interactive-landing-script.md §7). For a while after it starts,
// the stage draws every frame and times the intervals; when too many run long, it steps down a tier
// (quality.ts: lowerTier), and below the lowest it leaves the page's photograph. Pure: the stage feeds it.

export interface Budget {
  /** how long to measure before judging (ms) */
  readonly windowMs: number;
  /** with fewer frames than this there is nothing to judge yet */
  readonly minFrames: number;
  /** a frame interval longer than this (ms) is slow: under 45 frames a second */
  readonly slowMs: number;
  /** the share of slow frames a device may have */
  readonly slowShare: number;
}

export const BUDGET: Budget = { windowMs: 2000, minFrames: 30, slowMs: 22, slowShare: 0.1 };

export type Verdict = "measuring" | "keep" | "step-down";

/** The p-quantile (0–1) of the samples by nearest rank; NaN when there are none. Leaves the samples as they are. */
export function quantile(samples: readonly number[], p: number): number {
  if (!samples.length) return Number.NaN;
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[rank];
}

/** Judges the frame intervals (ms) measured over `elapsedMs`. */
export function judge(samples: readonly number[], elapsedMs: number, budget: Budget = BUDGET): Verdict {
  if (elapsedMs < budget.windowMs || samples.length < budget.minFrames) return "measuring";
  return quantile(samples, 1 - budget.slowShare) > budget.slowMs ? "step-down" : "keep";
}
