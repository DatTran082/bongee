// Poses that a scroll timeline (GSAP, src/components/scroll-motion.tsx) drives on the stage's slots, read by the stage
// each time it measures them (anchors.ts). GSAP tweens plain objects in place, so each slot's pose is one mutable
// record kept here, keyed by its element: the one place on the stage where state is mutated from outside. `version`
// moves on every change, so the stage measures again even while the page holds still (a scrubbed tween settling).
// No three.js here: the page's scroll code imports it without loading the stage.

export interface LivePose {
  /** turn about the vertical axis, radians (0: the printed front faces the viewer) */
  turn: number;
  /** lean, radians (positive: the top comes toward the viewer) */
  tilt: number;
  /** 0 the lid on the cup … 1 the lid lifted off (an actor with a lid lift) */
  lid: number;
  /** 0 the strap closed … 1 folded open off the drinking hole */
  strap: number;
  /** share of the slot's height and width the actor may take */
  fill: number;
  /** the actor's offset from the slot's centre, as a share of the slot's width and height */
  dx: number;
  dy: number;
}

const poses = new WeakMap<object, LivePose>();
let version = 0;

/** The slot's live pose, made from `initial` the first time it is asked for. */
export function livePose(key: object, initial: Readonly<LivePose>): LivePose {
  const existing = poses.get(key);
  if (existing) return existing;
  const made = { ...initial };
  poses.set(key, made);
  version += 1;
  return made;
}

/** The slot's live pose, if a timeline drives it. */
export function readLivePose(key: object): Readonly<LivePose> | undefined {
  return poses.get(key);
}

/** The timeline let go of the slot: it takes its own pose (data attributes) again. */
export function releaseLivePose(key: object): void {
  if (poses.delete(key)) version += 1;
}

/** A timeline changed some pose: the stage measures again on its next frame. */
export function touchLivePoses(): void {
  version += 1;
}

/** Moves on every change of any live pose. */
export function livePosesVersion(): number {
  return version;
}
