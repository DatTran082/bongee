import { type LivePose, readLivePose } from "./live-pose";
import type { AnchorRect, CupPose } from "./track";

// The slots the page lays out for the actors (src/components/cup-anchor.tsx), read from the DOM: their actor and
// pose once, their box on every measure (a sticky slot moves with the scroll, a hidden one measures nothing and is
// skipped). A slot whose pose a scroll timeline drives (live-pose.ts) takes that pose instead of its own, and may be
// moved off its centre and resized by it.

export interface Anchor extends CupPose {
  readonly element: HTMLElement;
  readonly name: string;
  readonly actor: string;
  readonly fill: number;
}

const number = (element: HTMLElement, key: string, fallback: number) => {
  const value = Number.parseFloat(element.dataset[key] ?? "");
  return Number.isFinite(value) ? value : fallback;
};

/** A slot's own pose, from its data attributes: where a scroll timeline starts from. */
export function basePose(element: HTMLElement): LivePose {
  return {
    turn: number(element, "cupTurn", 0),
    tilt: number(element, "cupTilt", 0),
    lid: number(element, "cupLid", 0),
    strap: 0,
    fill: number(element, "cupFill", 0.82),
    dx: 0,
    dy: 0,
  };
}

export function findAnchors(root: ParentNode): Anchor[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-cup-anchor]"), (element) => {
    const { turn, tilt, lid, fill } = basePose(element);
    return {
      element,
      name: element.dataset.cupAnchor ?? "",
      actor: element.dataset.cupActor ?? "pp",
      turn,
      tilt,
      lid,
      fill,
    };
  });
}

export function measureAnchors(anchors: readonly Anchor[]): AnchorRect[] {
  return anchors.map(({ element, ...anchor }) => {
    const rect = element.getBoundingClientRect();
    const live = readLivePose(element);
    const box = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    if (!live || rect.width === 0 || rect.height === 0) return { ...anchor, ...box };
    return {
      ...anchor,
      ...box,
      left: rect.left + live.dx * rect.width,
      top: rect.top + live.dy * rect.height,
      turn: live.turn,
      tilt: live.tilt,
      lid: live.lid,
      strap: live.strap,
      fill: live.fill,
    };
  });
}
