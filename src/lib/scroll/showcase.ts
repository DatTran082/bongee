import { basePose } from "@/lib/cup-scene/anchors";
import { type LivePose, livePose, releaseLivePose, touchLivePoses } from "@/lib/cup-scene/live-pose";
import type { Scene } from "./types";

/** One full turn, radians. */
const TURN = 2 * Math.PI;
/** The cup in focus and the other one, as shares of their slots. */
const SIZE = { big: 1, small: 0.68 };
/** The cups' rise into the band: from this far below and to either side of their slots (shares of a slot), leaning back. */
const RISE = { dx: 0.2, dy: 0.45, tilt: 0.3 };

/**
 * The two 3D cups (src/components/cup-showcase.tsx), scrubbed by the scroll: while the band comes up, the cups rise
 * into their slots from below and from either side, leaning back as they come; while its frame sticks, the paper cup
 * comes forward and turns once round, then the PP cup turns with its lid lifted off and set back, then both stand
 * side by side and fold their straps open. Visual only, no words. The cups' poses are live poses (live-pose.ts) the
 * 3D stage reads as it measures. Returns the poses' release.
 */
export const showcase: Scene = (gsap) => {
  const section = document.querySelector<HTMLElement>("[data-showcase]");
  const slot = (actor: string) => section?.querySelector<HTMLElement>(`[data-cup-actor="${actor}"]`) ?? null;
  const paperSlot = slot("paper");
  const ppSlot = slot("pp");
  if (!section || !paperSlot || !ppSlot) return;
  const paperBase = basePose(paperSlot);
  const ppBase = basePose(ppSlot);
  // the two timelines below never tween the same property: each refresh renders one, and they must not fight
  const paper: LivePose = livePose(paperSlot, {
    ...paperBase,
    tilt: paperBase.tilt + RISE.tilt,
    dx: -RISE.dx,
    dy: RISE.dy,
  });
  const pp: LivePose = livePose(ppSlot, { ...ppBase, tilt: ppBase.tilt + RISE.tilt, dx: RISE.dx, dy: RISE.dy });
  const onUpdate = touchLivePoses;

  // the band coming up the viewport: the cups rise in from below and from either side (place and lean only)
  gsap
    .timeline({
      defaults: { ease: "power2.out" },
      scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true },
      onUpdate,
    })
    .fromTo(paper, { tilt: paper.tilt, dx: -RISE.dx, dy: RISE.dy }, { tilt: paperBase.tilt, dx: 0, dy: 0 }, 0)
    .fromTo(pp, { tilt: pp.tilt, dx: RISE.dx, dy: RISE.dy }, { tilt: ppBase.tilt, dx: 0, dy: 0 }, 0.08);

  // the frame held: one beat per cup, then both. Explicit from-values, so scrubbing back lands where it came from.
  const from = { immediateRender: false };
  gsap
    .timeline({
      defaults: { ease: "power1.inOut" },
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true },
      onUpdate,
    })
    // the paper cup forward, once round
    .fromTo(
      paper,
      { fill: paperBase.fill, turn: paperBase.turn },
      { ...from, fill: SIZE.big, turn: paperBase.turn + TURN, duration: 3 },
      0,
    )
    .fromTo(pp, { fill: ppBase.fill }, { ...from, fill: SIZE.small, duration: 3 }, 0)
    // the PP cup forward, once round the other way, its lid off and back on
    .fromTo(paper, { fill: SIZE.big }, { ...from, fill: SIZE.small, duration: 2.5 }, 3.5)
    .fromTo(
      pp,
      { fill: SIZE.small, turn: ppBase.turn },
      { ...from, fill: SIZE.big, turn: ppBase.turn - TURN, duration: 3 },
      3.5,
    )
    .fromTo(pp, { lid: 0 }, { ...from, lid: 1, duration: 1.3 }, 3.7)
    .fromTo(pp, { lid: 1 }, { ...from, lid: 0, duration: 1 }, 5.5)
    // both side by side, straps folding open
    .fromTo(paper, { fill: SIZE.small }, { ...from, fill: paperBase.fill, duration: 1.8 }, 6.8)
    .fromTo(pp, { fill: SIZE.big }, { ...from, fill: ppBase.fill, duration: 1.8 }, 6.8)
    .fromTo([paper, pp], { strap: 0 }, { ...from, strap: 1, duration: 1.4, stagger: 0.25 }, 7.4)
    .to({}, { duration: 1 }, 9); // a moment to rest before the frame lets go

  return () => {
    releaseLivePose(paperSlot);
    releaseLivePose(ppSlot);
  };
};
