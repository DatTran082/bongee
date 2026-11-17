/**
 * The stage's actors, in the order their hit elements come in the page: the clear PP cup of grape tea, the lidded
 * paper cup (the hero's 3D set gave way to a photograph, 17/11/2026). Kept apart from the scene so the page can name them without loading three.js.
 */
export const ACTORS = ["pp", "paper"] as const;
export type ActorName = (typeof ACTORS)[number];
