"use client";

import { useEffect } from "react";
import { basePose } from "@/lib/cup-scene/anchors";
import { type LivePose, livePose, releaseLivePose, touchLivePoses } from "@/lib/cup-scene/live-pose";

type Gsap = typeof import("gsap").gsap;
type ScrollTriggerClass = typeof import("gsap/ScrollTrigger").ScrollTrigger;

/** One full turn, radians. */
const TURN = 2 * Math.PI;
/** The cup in focus and the other one, as shares of their slots. */
const SIZE = { big: 1, small: 0.68 };
/** The cups' rise into the band: from this far below and to either side of their slots (shares of a slot), leaning back. */
const RISE = { dx: 0.2, dy: 0.45, tilt: 0.3 };
/** Reveals: how far a block rises (px), how long it takes (s), the gap between blocks entering together (s). */
const REVEAL = { y: 28, duration: 0.9, stagger: 0.08 };

/**
 * Blocks rise and fade in once as they first come into view (`data-reveal`, or each child of a `data-reveal-group`).
 * Only those still below the viewport: what is already on screen never blinks out. Transform and opacity only, and
 * cleared after, so nothing is left on the page's style.
 */
function reveal(gsap: Gsap, ScrollTrigger: ScrollTriggerClass): void {
  const blocks = gsap.utils
    .toArray<HTMLElement>("[data-reveal], [data-reveal-group] > *")
    .filter((block) => block.getBoundingClientRect().top > window.innerHeight);
  if (blocks.length === 0) return;
  gsap.set(blocks, { opacity: 0, y: REVEAL.y });
  ScrollTrigger.batch(blocks, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: REVEAL.duration,
        ease: "power3.out",
        stagger: REVEAL.stagger,
        overwrite: true,
        clearProps: "opacity,transform",
      }),
  });
}

/**
 * The two 3D cups (src/components/cup-showcase.tsx), scrubbed by the scroll: while the band comes up, the cups rise
 * into their slots from below and from either side, leaning back as they come; while its frame sticks, the paper cup
 * comes forward and turns once round, then the PP cup turns with its lid lifted off and set back, then both stand
 * side by side and fold their straps open. Visual only, no words. The cups' poses are live poses (live-pose.ts) the
 * 3D stage reads as it measures. Returns the poses' release.
 */
function showcase(gsap: Gsap): () => void {
  const section = document.querySelector<HTMLElement>("[data-showcase]");
  const slot = (actor: string) => section?.querySelector<HTMLElement>(`[data-cup-actor="${actor}"]`) ?? null;
  const paperSlot = slot("paper");
  const ppSlot = slot("pp");
  if (!section || !paperSlot || !ppSlot) return () => {};
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
}

/**
 * The home page's scroll motion, with GSAP's ScrollTrigger: blocks reveal as they come in, and the two 3D cups
 * play their scrubbed timeline. GSAP is loaded after hydration (a dynamic import: nothing on first paint waits for it), and
 * only plays while the visitor allows motion (a change of the setting reverts everything to the still page). No
 * smooth-scroll hijack and no pinning: the browser keeps its own scroll, and every tween is transform, opacity or a
 * number the 3D stage reads, so nothing makes the page lay out again while it scrolls.
 */
export function ScrollMotion() {
  useEffect(() => {
    let revert: (() => void) | null = null;
    let cancelled = false;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({ ignoreMobileResize: true }); // a phone's address bar showing or hiding is not a resize
        const media = gsap.matchMedia();
        media.add("(prefers-reduced-motion: no-preference)", () => {
          reveal(gsap, ScrollTrigger);
          const release = showcase(gsap);
          return () => {
            release();
            touchLivePoses();
          };
        });
        revert = () => media.revert();
      })
      .catch((error: unknown) => console.warn("Không tải được hiệu ứng cuộn.", error)); // the page stands still
    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);
  return null;
}
