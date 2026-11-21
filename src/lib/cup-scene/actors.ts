/**
 * The stage's actors, in the order their hit elements come in the page: the lidded paper cup alone in the cups band
 * (src/components/cup-showcase.tsx), then the frosted PP cup of grape tea, open (no lid), in the visit section
 * (owner, 21/11/2026: "mô hình ly nhựa không đóng nắp", the two cups no longer side by side, no scroll timeline).
 * Kept apart from the scene so the page can name them without loading three.js.
 */
export const ACTORS = ["paper", "pp"] as const;
export type ActorName = (typeof ACTORS)[number];
