// Where each actor (the cover-photo set, the PP cup, the paper cup) is on screen for the page's scroll position. The
// page holds "anchors" (src/components/cup-anchor.tsx): empty slots in the sections' layouts, each naming the actor
// it is for and the pose it takes there. An actor rests in its anchor nearest above the middle of the viewport and,
// as its next one comes up, flies to it: a dwell at each end, an eased flight between. An actor with one anchor
// simply stays in it. The maths is pure (viewport px in, viewport px out) so it can be tested without three.js.

export interface CupPose {
  /** turn about the vertical axis, radians (0: the printed front faces the viewer) */
  readonly turn: number;
  /** lean about the horizontal axis, radians (positive: the top comes toward the viewer) */
  readonly tilt: number;
  /** 0 the lid on the cup … 1 the lid lifted off */
  readonly lid: number;
}

export interface AnchorRect extends CupPose {
  readonly name: string;
  readonly actor: string;
  /** the slot's box in viewport px (a hidden slot has no width or height and is skipped) */
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  /** how much of the slot's height and width the actor may take */
  readonly fill: number;
}

export interface CupTarget extends CupPose {
  /** centre of the actor, viewport px */
  readonly x: number;
  readonly y: number;
  /** the height and the width it may take, px */
  readonly size: number;
  readonly room: number;
  /** 0 at rest in an anchor … 1 halfway through a flight */
  readonly flight: number;
  readonly from: string;
  readonly to: string;
  /** resting in an anchor: it can be touched there (the slot is empty, so nothing else is under the finger) */
  readonly resting: boolean;
}

/** Share of the way between two anchors that the actor stays put at each end. */
export const DWELL = 0.12;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Flight progress (0 … 1) for the viewport's progress `p` from one anchor's centre to the next: the dwell at each
 * end, a smooth step between. With reduced motion nothing flies: the actor changes anchor halfway, at once.
 */
export function ease(p: number, reducedMotion: boolean): number {
  const c = clamp01(p);
  if (reducedMotion) return c < 0.5 ? 0 : 1;
  const t = clamp01((c - DWELL) / (1 - 2 * DWELL));
  return t * t * (3 - 2 * t);
}

const visible = (anchor: AnchorRect) => anchor.width > 0 && anchor.height > 0;
const centreY = (anchor: AnchorRect) => anchor.top + anchor.height / 2;

function at(anchor: AnchorRect): CupTarget {
  return {
    x: anchor.left + anchor.width / 2,
    y: centreY(anchor),
    size: anchor.height * anchor.fill,
    room: anchor.width * anchor.fill,
    turn: anchor.turn,
    tilt: anchor.tilt,
    lid: anchor.lid,
    flight: 0,
    from: anchor.name,
    to: anchor.name,
    resting: true,
  };
}

/** One actor's place for its anchors as they stand in the viewport now; null while none is laid out. */
export function cupTarget(
  anchors: readonly AnchorRect[],
  viewportHeight: number,
  reducedMotion: boolean,
): CupTarget | null {
  const laid = anchors.filter(visible).sort((a, b) => centreY(a) - centreY(b));
  if (laid.length === 0) return null;
  const middle = viewportHeight / 2;
  const index = laid.findLastIndex((anchor) => centreY(anchor) <= middle);
  if (index < 0) return at(laid[0]);
  if (index === laid.length - 1) return at(laid[index]);
  const from = laid[index];
  const to = laid[index + 1];
  const span = centreY(to) - centreY(from);
  const e = span > 0 ? ease((middle - centreY(from)) / span, reducedMotion) : 0;
  return {
    x: lerp(from.left + from.width / 2, to.left + to.width / 2, e),
    y: lerp(centreY(from), centreY(to), e),
    size: lerp(from.height * from.fill, to.height * to.fill, e),
    room: lerp(from.width * from.fill, to.width * to.fill, e),
    turn: lerp(from.turn, to.turn, e),
    tilt: lerp(from.tilt, to.tilt, e),
    lid: lerp(from.lid, to.lid, e),
    flight: reducedMotion ? 0 : Math.sin(Math.PI * e),
    from: from.name,
    to: to.name,
    resting: e === 0 || e === 1,
  };
}

/** Every actor's place, each from its own anchors; an actor without a laid-out anchor maps to null. */
export function targetsByActor(
  anchors: readonly AnchorRect[],
  viewportHeight: number,
  reducedMotion: boolean,
): Record<string, CupTarget | null> {
  const byActor = new Map<string, AnchorRect[]>();
  for (const anchor of anchors) byActor.set(anchor.actor, [...(byActor.get(anchor.actor) ?? []), anchor]);
  return Object.fromEntries(
    Array.from(byActor, ([actor, own]) => [actor, cupTarget(own, viewportHeight, reducedMotion)]),
  );
}
