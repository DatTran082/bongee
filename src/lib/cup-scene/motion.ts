// Small, pure helpers for the frame loop.

/**
 * Moves `value` toward `target` by the share of the way an exponential decay with time constant `tau` ms covers in
 * `dt` ms; a `tau` of 0 lands at once (reduced motion).
 */
export function approach(value: number, target: number, dt: number, tau: number): number {
  if (tau <= 0 || dt <= 0) return tau <= 0 ? target : value;
  return value + (target - value) * (1 - Math.exp(-dt / tau));
}

/** `value` wrapped into [−period / 2, period / 2). */
export function wrap(value: number, period: number): number {
  const half = period / 2;
  return ((((value + half) % period) + period) % period) - half;
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface RedrawState {
  /** nothing moves on its own: draw only what changed */
  readonly reduced: boolean;
  /** an animation is under way (inertia, the strap, a colour blend) */
  readonly moving: boolean;
  /** an input or a resize asked for a frame */
  readonly dirty: boolean;
  /** the page scrolled, so the marks behind the cup moved */
  readonly scrolled: boolean;
  readonly targetChanged: boolean;
  /** ms since the last frame drawn, and the shortest gap between frames that only the idle float asks for */
  readonly sinceDraw?: number;
  readonly idleFrameMs?: number;
}

/**
 * Whether a frame must be drawn: whenever something changed (an input, the scroll, an animation under way); while
 * only the idle float moves, at most once every `idleFrameMs` (a light device draws it at 30 fps); with reduced
 * motion, never for the float.
 */
export function needsRedraw(state: RedrawState): boolean {
  if (state.moving || state.dirty || state.scrolled || state.targetChanged) return true;
  if (state.reduced) return false;
  return (state.sinceDraw ?? Infinity) >= (state.idleFrameMs ?? 0);
}
