import { approach, clamp } from "./motion.ts"; // with the extension: the tests run this through Node

// The small pieces of state the frame loop advances, each on its own: the strap over the drinking hole, the lean
// against the scroll. Each `step` returns whether it is still moving, so the loop knows when a
// frame must be drawn.

const easeInOut = (t: number) => t * t * (3 - 2 * t);

/** The press-button strap: 0 closed … 1 open, swinging in `ms`; `open` is the angle past its rest. */
export class Strap {
  private goal = 0;
  private t = 0;
  private readonly open: number;
  private readonly ms: number;

  constructor(open: number, ms: number) {
    this.open = open;
    this.ms = ms;
  }

  /** Flips the strap, at once when `instant`; returns whether it is now open. */
  toggle(instant: boolean): boolean {
    this.goal = 1 - this.goal;
    if (instant) this.t = this.goal;
    return this.goal === 1;
  }

  step(dt: number): boolean {
    if (this.t === this.goal) return false;
    const delta = dt / this.ms;
    this.t = this.goal > this.t ? Math.min(this.goal, this.t + delta) : Math.max(this.goal, this.t - delta);
    return true;
  }

  get angle(): number {
    return this.open * easeInOut(this.t);
  }
}

/** The cup leans against the scroll: radians from the smoothed scroll speed (px/ms), at most `max` either way. */
export class Lean {
  private speed = 0;
  private last: number | null = null;
  private readonly perSpeed: number;
  private readonly max: number;
  private readonly tau: number;

  constructor(perSpeed: number, max: number, tau: number) {
    this.perSpeed = perSpeed;
    this.max = max;
    this.tau = tau;
  }

  /** Feeds the scroll position; returns the lean (0 with reduced motion). */
  update(scroll: number, dt: number, reduced: boolean): number {
    const instant = this.last === null ? 0 : (scroll - this.last) / Math.max(1, dt);
    this.last = scroll;
    this.speed = reduced ? 0 : approach(this.speed, instant, dt, this.tau);
    return clamp(this.speed * this.perSpeed, -this.max, this.max);
  }

  get moving(): boolean {
    return Math.abs(this.speed) > 1e-4;
  }
}
