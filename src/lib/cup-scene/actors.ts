/**
 * The stage's actors, in the order their hit elements come in the page: the cover photo's set (hero), the flavour
 * carousel's cups (src/components/flavors.tsx), the clear PP cup of grape tea, the lidded paper cup. Kept apart from the scene so the page can name them without loading
 * three.js.
 */
export const ACTORS = ["set", "flavor", "pp", "paper"] as const;
export type ActorName = (typeof ACTORS)[number];
