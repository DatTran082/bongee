// Turns the set about its vertical axis: drag sideways (mouse, touch, pen), with a little inertia after a flick, or
// step it with turnBy() (the arrow keys). Nothing moves unless the visitor moves it. With reduced motion there is no
// inertia and steps land at once. Vertical drags are left to the page (touch-action: pan-y on the element), so a
// thumb can still scroll past the hero.

export interface TurntableOptions {
  /** read on each use, so a change of the OS setting applies at once */
  readonly reducedMotion: () => boolean;
  /** the angle changed or is about to animate: draw a frame */
  readonly onChange: () => void;
  /** a press and release without a drag, in client coordinates */
  readonly onTap: (clientX: number, clientY: number) => void;
  /** the pointer moves over the element without dragging */
  readonly onHover: (clientX: number, clientY: number) => void;
  readonly onDragChange: (dragging: boolean) => void;
}

/** Radians per pixel dragged: a drag across a phone-wide stage turns the set about half round. */
const SPEED = 0.008;
/** Movement (px) under which a press counts as a tap. */
const TAP_SLOP = 6;
/** Inertia's decay time and the release window (ms): a flick keeps turning, a slow drag stops where it ends. */
const INERTIA_MS = 320;
const FLICK_MS = 90;
/** Eased step (turnBy): time constant (ms). */
const EASE_MS = 110;

interface Drag {
  readonly id: number;
  readonly startX: number;
  readonly startY: number;
  x: number;
  time: number;
  moved: boolean;
}

export class Turntable {
  angle = 0;
  private velocity = 0; // radians per ms
  private goal: number | null = null;
  private drag: Drag | null = null;
  private readonly abort = new AbortController();

  constructor(
    private readonly element: HTMLElement,
    private readonly options: TurntableOptions,
  ) {
    const signal = this.abort.signal;
    element.addEventListener("pointerdown", (e) => this.down(e), { signal });
    element.addEventListener("pointermove", (e) => this.move(e), { signal });
    element.addEventListener("pointerup", (e) => this.up(e), { signal });
    element.addEventListener("pointercancel", () => this.cancel(), { signal });
    // a drag that ends without a pointerup (ctrl+click's context menu on macOS, a window switch) must not stick
    element.addEventListener(
      "lostpointercapture",
      (e) => {
        if (e.pointerId === this.drag?.id) this.cancel();
      },
      { signal },
    );
    element.addEventListener("contextmenu", () => this.cancel(), { signal });
  }

  /** Turns by `radians`, eased (at once with reduced motion). */
  turnBy(radians: number): void {
    this.velocity = 0;
    this.goal = (this.goal ?? this.angle) + radians;
    if (this.options.reducedMotion()) {
      this.angle = this.goal;
      this.goal = null;
    }
    this.options.onChange();
  }

  /** Back to the front view, the short way round (from where a pending step is heading, if one is). */
  reset(): void {
    const turn = Math.PI * 2;
    const heading = (this.goal ?? this.angle) + Math.PI;
    const offset = (((heading % turn) + turn) % turn) - Math.PI; // in [-π, π)
    this.turnBy(-offset);
  }

  /** Advances inertia and eased steps by `dt` ms; true while still moving. */
  step(dt: number): boolean {
    if (this.drag) return false;
    if (this.goal !== null) {
      const left = this.goal - this.angle;
      if (Math.abs(left) < 1e-4) {
        this.angle = this.goal;
        this.goal = null;
        return false;
      }
      this.angle += left * (1 - Math.exp(-dt / EASE_MS));
      return true;
    }
    if (Math.abs(this.velocity) < 1e-5) {
      this.velocity = 0;
      return false;
    }
    this.angle += this.velocity * dt;
    this.velocity *= Math.exp(-dt / INERTIA_MS);
    return true;
  }

  dispose(): void {
    this.abort.abort();
  }

  private down(e: PointerEvent): void {
    if (this.drag || (e.pointerType === "mouse" && e.button !== 0)) return;
    this.drag = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      time: e.timeStamp,
      moved: false,
    };
    this.velocity = 0;
    this.goal = null;
    try {
      this.element.setPointerCapture(e.pointerId);
    } catch {
      // the pointer is already gone (a very fast tap): the drag still works while it stays over the element
    }
  }

  private move(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag) {
      this.options.onHover(e.clientX, e.clientY);
      return;
    }
    if (e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > TAP_SLOP) {
      drag.moved = true;
      this.options.onDragChange(true);
    }
    if (!drag.moved) return;
    const delta = (e.clientX - drag.x) * SPEED;
    const dt = Math.max(1, e.timeStamp - drag.time);
    this.angle += delta;
    this.velocity = 0.6 * (delta / dt) + 0.4 * this.velocity;
    drag.x = e.clientX;
    drag.time = e.timeStamp;
    this.options.onChange();
  }

  private up(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag || e.pointerId !== drag.id) return;
    this.drag = null;
    if (!drag.moved) {
      this.velocity = 0;
      this.options.onTap(e.clientX, e.clientY);
      return;
    }
    this.options.onDragChange(false);
    if (this.options.reducedMotion() || e.timeStamp - drag.time > FLICK_MS) this.velocity = 0;
    this.options.onChange();
  }

  private cancel(): void {
    if (this.drag?.moved) this.options.onDragChange(false);
    this.drag = null;
    this.velocity = 0;
  }
}
