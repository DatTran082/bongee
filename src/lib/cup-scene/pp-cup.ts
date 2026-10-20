/**
 * The 700 ml PP cup's inside, in metres, from the brand kit's catalogue (brandkit/packaging/catalog.json: Ø90 / Ø55
 * × 180 mm) less the wall blender_cups.py gives it (0.6 mm) and the drink's clearance (0.2 mm): what the drink and
 * the ice fill. The drink stands 20 mm below the rim (spec.json drink_below_rim).
 */
export const PP_INSIDE = { radiusBottom: 0.0267, radiusTop: 0.0442, height: 0.18 } as const;
export const PP_DRINK_LEVEL = 0.16;
