/**
 * The stage's actors, in the order their hit elements come in the page: the frosted PP cup of grape tea and the
 * lidded paper cup side by side in the cups section ("Hai chiếc ly", src/components/cup-showcase.tsx), then a second
 * paper cup in the visit section (one actor per slot: a cup flying from the showcase to the visit section would
 * drift for screens behind the menu and the offers). Kept apart from the scene so the page can name them without
 * loading three.js.
 */
export const ACTORS = ["pp", "paper", "visit"] as const;
export type ActorName = (typeof ACTORS)[number];
