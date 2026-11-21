import type { AnchorRect, CupPose } from "./track";

// The slots the page lays out for the actors (src/components/cup-anchor.tsx), read from the DOM: their actor and
// pose once, their box on every measure (a sticky slot moves with the scroll, a hidden one measures nothing and is
// skipped).

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

export function findAnchors(root: ParentNode): Anchor[] {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-cup-anchor]"), (element) => ({
    element,
    name: element.dataset.cupAnchor ?? "",
    actor: element.dataset.cupActor ?? "pp",
    turn: number(element, "cupTurn", 0),
    tilt: number(element, "cupTilt", 0),
    lid: number(element, "cupLid", 0),
    fill: number(element, "cupFill", 0.82),
  }));
}

export function measureAnchors(anchors: readonly Anchor[]): AnchorRect[] {
  return anchors.map(({ element, ...anchor }) => {
    const rect = element.getBoundingClientRect();
    return { ...anchor, left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  });
}
