import { Box3, Group, type Object3D, type PerspectiveCamera, Raycaster, Vector2 } from "three";
import { fitScale, isOnScreen, pxPerMetre, toWorld } from "./fit";
import { approach } from "./motion";
import { Strap } from "./steppers";
import type { CupPose, CupTarget } from "./track";
import { Turntable } from "./turntable";

// One thing on the stage (the cover-photo set, the PP cup, the paper cup): where it is and how it moves. It follows
// the target its anchors give it (track.ts) with a lag that is the float, bobs and sways while it rests, lifts its
// lid when a slot asks, takes a drag on its hit element to turn and a tap on its lid to flip the strap.

/**
 * The strap's tongue folds up and back on its fold line (a negative turn about x), lifting the plug off the drinking
 * hole, as the real lid opens; its round cap end (`lid-strap-cap`) stays on the pins.
 */
const STRAP = { open: -2.0, ms: 420 };
/** Time constants (ms) an actor takes to follow its target: the lag is the float. */
const TAU = { place: 110, pose: 170, lid: 260 };
/** In flight: an extra lift (share of the viewport's height) at mid-flight. */
const FLIGHT_LIFT = 0.05;
/** The lid off the cup: metres aside and radians of tip, per metre of lift. */
const LID = { shift: 0.33, tip: 5.5 };

export interface ActorSpec {
  /** the thing itself; it is re-centred on its box's middle, which it turns and leans about */
  readonly subject: Object3D;
  /** the lid a tap flips the strap of (and that lifts, if `lidLift` > 0), and the strap */
  readonly lid: Object3D | null;
  readonly strap: Object3D | null;
  /** metres the lid rises when a slot asks for it (0: the lid stays) */
  readonly lidLift: number;
  /** idle motion while resting: bob (share of height), sway and roll (radians); hertz; a phase so actors differ */
  readonly bob: number;
  readonly sway: number;
  readonly roll: number;
  readonly hz: number;
  readonly phase: number;
  /** extra turn (radians) at mid-flight */
  readonly spin: number;
  /** a drag (or the arrow keys) turns it; false: it holds still and only its lid takes a tap */
  readonly turnable: boolean;
  /**
   * How it answers the pointer (Frame.pointer): radians it turns and leans toward it, px it shifts with it (a still
   * picture with depth, as the hero's set); null: not at all.
   */
  readonly parallax: { readonly yaw: number; readonly pitch: number; readonly shift: number } | null;
}

export interface ActorHooks {
  readonly reducedMotion: () => boolean;
  /** an input changed something: draw a frame */
  readonly onInput: () => void;
  /** a tap landed on the lid */
  readonly onLidTap: () => void;
  readonly camera: PerspectiveCamera;
  readonly canvas: HTMLCanvasElement;
}

/** One frame's shared numbers. */
export interface Frame {
  readonly dt: number;
  readonly time: number;
  readonly reduced: boolean;
  /** the lean against the scroll, radians */
  readonly lean: number;
  readonly width: number;
  readonly height: number;
  /** the pointer over the viewport, smoothed: −1 … 1 left to right, top to bottom (0, 0 with reduced motion) */
  readonly pointer: { readonly x: number; readonly y: number };
}

export interface CupPlacement {
  /** centre and size on screen, viewport px */
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** resting in a slot: safe to touch */
  readonly resting: boolean;
}

interface Smooth extends CupPose {
  readonly x: number;
  readonly y: number;
  readonly size: number;
  readonly room: number;
}

function follow(current: Smooth | null, target: CupTarget, dt: number, snap: boolean): Smooth {
  if (!current || snap) {
    const { x, y, size, room, turn, tilt, lid } = target;
    return { x, y, size, room, turn, tilt, lid };
  }
  return {
    x: approach(current.x, target.x, dt, TAU.place),
    y: approach(current.y, target.y, dt, TAU.place),
    size: approach(current.size, target.size, dt, TAU.place),
    room: approach(current.room, target.room, dt, TAU.place),
    turn: approach(current.turn, target.turn, dt, TAU.pose),
    tilt: approach(current.tilt, target.tilt, dt, TAU.pose),
    lid: approach(current.lid, target.lid, dt, TAU.lid),
  };
}

export class Actor {
  /** where it is and how big */
  readonly root = new Group();
  /** how it leans and turns */
  private readonly pivot = new Group();
  private readonly spec: ActorSpec;
  private readonly hooks: ActorHooks;
  private readonly hit: HTMLElement;
  private readonly table: Turntable;
  private readonly strap = new Strap(STRAP.open, STRAP.ms);
  private readonly raycaster = new Raycaster();
  private readonly pointer = new Vector2();
  /** the subject's box, metres */
  readonly width: number;
  readonly height: number;
  private readonly lidRest: number;
  private readonly strapRest: number;
  private current: Smooth | null = null;

  constructor(spec: ActorSpec, hit: HTMLElement, hooks: ActorHooks) {
    this.spec = spec;
    this.hooks = hooks;
    this.hit = hit;
    const box = new Box3().setFromObject(spec.subject);
    this.width = box.max.x - box.min.x;
    this.height = box.max.y - box.min.y;
    // the subject's box centre on the pivot: that is what turns, leans and sits on the slot's centre
    spec.subject.position.sub(box.getCenter(spec.subject.position.clone()));
    this.lidRest = spec.lid?.position.y ?? 0;
    this.strapRest = spec.strap?.rotation.x ?? 0;
    this.pivot.add(spec.subject);
    this.root.add(this.pivot);
    this.root.visible = false;
    this.table = new Turntable(hit, {
      reducedMotion: hooks.reducedMotion,
      onChange: hooks.onInput,
      onTap: (x, y) => {
        if (this.hitsLid(x, y)) hooks.onLidTap();
      },
      onHover: (x, y) => {
        hit.style.cursor = this.hitsLid(x, y) ? "pointer" : this.idleCursor;
      },
      onDragChange: (dragging) => {
        hit.style.cursor = dragging && spec.turnable ? "grabbing" : this.idleCursor;
      },
    });
    hit.style.cursor = this.idleCursor;
  }

  private get idleCursor(): string {
    return this.spec.turnable ? "grab" : "default";
  }

  /** Adds something that floats with the actor (turns and leans with it), in metres about its box's middle. */
  decorate(object: Object3D): void {
    this.pivot.add(object);
  }

  /** Advances the drag's inertia and the strap; true while either still moves. */
  step(dt: number): boolean {
    return [this.table.step(dt), this.strap.step(dt)].some(Boolean);
  }

  turnBy(radians: number): void {
    if (this.spec.turnable) this.table.turnBy(radians);
  }

  reset(): void {
    this.table.reset();
  }

  /** Flips the strap; returns whether it is now open (false, unchanged, for an actor without one). */
  toggleStrap(instant: boolean): boolean {
    if (!this.spec.strap) return false;
    return this.strap.toggle(instant);
  }

  /**
   * Lays the actor out for the frame; where it landed on screen, or null when it has no slot. `fade` (0 … 1)
   * shrinks it away (another actor has the stage); above half it cannot be touched.
   */
  place(target: CupTarget | null, frame: Frame, fade = 0): CupPlacement | null {
    if (!target) {
      this.root.visible = false;
      return null;
    }
    const { spec } = this;
    const current = (this.current = follow(this.current, target, frame.dt, frame.reduced));
    const ppm = pxPerMetre(frame.height);
    const scale = fitScale(this, current, frame.height) * Math.max(0.001, 1 - fade); // by height or width, whichever binds
    const heightPx = this.height * scale * ppm;
    const widthPx = this.width * scale * ppm;
    const lift = target.flight * FLIGHT_LIFT * frame.height; // px, up
    const idle = frame.reduced ? 0 : 2 * Math.PI * spec.hz * frame.time + spec.phase;
    const bob = frame.reduced ? 0 : spec.bob * heightPx * Math.sin(idle);
    const sway = frame.reduced ? 0 : spec.sway * Math.sin(idle * 0.41);
    const roll = frame.reduced ? 0 : spec.roll * Math.sin(idle * 0.29);
    const liftM = current.lid * spec.lidLift; // the lid off the cup, metres
    const look = spec.parallax ?? { yaw: 0, pitch: 0, shift: 0 }; // toward the pointer
    const shiftX = frame.pointer.x * look.shift;
    const shiftY = frame.pointer.y * look.shift * 0.6;
    const world = toWorld(current.x + shiftX, current.y - lift - bob + shiftY, frame.width, frame.height);
    // keep the whole composition on the slot's centre: the lifted lid adds height
    this.root.position.set(world.x, world.y - (liftM * scale) / 2, 0);
    this.root.scale.setScalar(scale);
    const turned = spec.turnable ? this.table.angle : 0;
    this.pivot.rotation.set(
      current.tilt - frame.lean + frame.pointer.y * look.pitch,
      current.turn + turned + target.flight * spec.spin + sway + frame.pointer.x * look.yaw,
      roll,
    );
    if (spec.lid) {
      spec.lid.position.set(liftM * LID.shift, this.lidRest + liftM, 0);
      spec.lid.rotation.z = liftM * LID.tip;
    }
    if (spec.strap) spec.strap.rotation.x = this.strapRest + this.strap.angle;
    const placement = {
      x: current.x,
      y: current.y - lift - bob,
      width: widthPx,
      height: heightPx + liftM * scale * ppm,
      resting: target.resting && fade < 0.5,
    };
    // nothing to draw while the whole thing is off screen (an actor waiting in a slot far down the page) or gone
    this.root.visible = fade < 0.999 && isOnScreen(placement.y, placement.height, frame.height);
    return placement;
  }

  hitsLid(clientX: number, clientY: number): boolean {
    if (!this.spec.lid) return false;
    const rect = this.hooks.canvas.getBoundingClientRect();
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.hooks.camera);
    return this.raycaster.intersectObject(this.spec.lid, true).length > 0;
  }

  dispose(): void {
    this.table.dispose();
    this.hit.style.cursor = "";
  }
}
