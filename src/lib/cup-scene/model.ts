import cupModels from "@/data/cup-model.json";

/**
 * The cups from the brand kit (brandkit/3d), compressed by `npm run sync-brand`, which names each file after its
 * content (so it can be cached for good: next.config.ts) and writes the names to cup-model.json.
 */
export const MODELS = {
  /** the frosted 700 ml PP cup: the grape tea shows through its wall */
  pp: { url: cupModels.pp as string, root: "boongee-pp-700ml" },
  /** the double-wall 16 oz paper cup with the silver print: the cover photo's cup */
  paper: { url: cupModels.paper as string, root: "boongee-paper-16oz" },
} as const;

/** Nodes the stage looks up by name (brandkit/3d/README.md, "Cấu trúc node"); sync-brand checks they exist. */
export const NODES = {
  drink: "drink",
  /** the lid, its origin on the rim: lift it along +y to take it off */
  lid: "lid",
  /** the strap's tongue, its origin on the fold line: turn it about x by a negative angle to fold it up and back */
  strap: "lid-strap",
} as const;
