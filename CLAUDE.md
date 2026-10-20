@AGENTS.md

# CLAUDE.md

Boongee's one-page landing site: Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 4), scaffolded with
create-next-app, every route prerendered static. User-facing text is Vietnamese; code comments are English. This
Next.js is newer than most training data: check `node_modules/next/dist/docs/` before using an API (AGENTS.md).

## Commands

```bash
npm run dev          # localhost:3000
npm run build
npm run check        # eslint + tsc --noEmit + prettier --check (must pass)
npm run format       # prettier --write (with prettier-plugin-tailwindcss)
npm run sync-brand   # copy brand assets from ../brandkit and menu/offers from ShanMay (BOONGEE_BRANDKIT, BOONGEE_SHANMAY)
node scripts/fetch-textures.mjs   # (once) CC0 PBR textures for the 3D set from Poly Haven → public/textures/ (committed)
```

## Boongee specifics

- **Content sources.** Story, tone and promises come from the ShanMay brand kit's `docs/01-brand-foundation.md`;
  the menu and the offers from its `menu-data.json` and `collateral.json`, copied to `src/data/shanmay/` by
  `sync-brand` and typed in `src/data/menu.ts` / `offers.ts` (edit them in ShanMay, never here). Everything else is
  in `src/data/boongee.ts`; FAQ answers (`src/data/faq.ts`) are composed from that data. Facts ShanMay marks as
  assumptions or illustrative (prices, address, tea origin, 50% sweetness) carry `TODO(boongee)`. Unknown facts are
  `null`; components render them as "Đang cập nhật" and drop unset links. Items have no descriptions: none exist. Never invent addresses, prices, phone numbers,
  social URLs or testimonials. The domain is not in it: `src/lib/site-url.ts` (server-only, may throw) reads
  `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain, then localhost in dev; a production build with none fails.
- **Brand assets come from the sibling brand kit** (`../brandkit`) through `scripts/sync-brand.mjs` and are committed.
  Do not hand-edit what it writes (`src/styles/brand-tokens.css`, `src/data/brand-tokens.json`, `src/assets/`,
  `public/models/`, `src/app/{icon.svg,favicon.ico,apple-icon.png,opengraph-image.*,twitter-image.*}`): change the
  brand kit, rebuild it, then run `npm run sync-brand`.
- **The 3D stage** (`src/components/cup-stage.tsx`, `src/lib/cup-scene/`): a fixed three.js canvas at z-index −10
  inside `main`, cleared to the page's pink (opaque; the body is the same pink, so nothing shows) (mounted by `page.tsx`, after the hero), so its actors show on the pink and pass behind
  the white cards. Three actors (`ACTORS`, one `Actor` each, `actor.ts`): `set`, the cover photo rebuilt in 3D
  (`set/`: the brand kit's paper cup twice, one with a cream dome and dried petals, one lidded, on a granite block
  and two logs with a white lily, a curly bud stem and a jasmine vine, all drawn in code with procedural textures,
  floating as one piece with real shadows from a key light that follows it; the block and the logs wear Poly Haven
  CC0 PBR textures from `public/textures/`, fetched once by `scripts/fetch-textures.mjs`, `set/pbr.ts`); `pp`, the 700 ml PP cup drawn clear (thin alpha glass; the kit's
  frosted finish and KHR_materials_transmission are not used: a transmission pass was too heavy) holding a still,
  translucent grape tea (the GLB's own drink, recoloured in `materials.ts`) with textured grapes and ice standing in
  it and drifting round it (`splash.ts`, `grape-textures.ts`); `paper`, the lidded
  paper cup alone. Both GLBs (`brandkit/3d/boongee-{pp-700ml,paper-16oz}.glb`) are compressed by sync-brand with
  meshopt + WebP to `public/models/<name>.<hash>.glb`, URLs in `src/data/cup-model.json`, cached immutable by
  `next.config.ts`. Sections lay out empty slots with `<CupAnchor name actor turn tilt lid fill>`; `track.ts`
  rests each actor in its own slot nearest above the viewport's middle and flies it to its next (dwell 12 % at
  each end, smooth step between; with reduced motion it jumps halfway and nothing bobs, sways or drifts); an actor
  with one slot stays in it. Hidden slots are skipped, so a section can have one for phones and one for `lg`; a slot
  may be `sticky`; two slots side by side (`cup-row`, offers) put two actors together. A hit element per actor
  takes the pointer while it rests on screen (drag turns, a tap on the lid flips the strap; arrows / Enter / Home on
  the keyboard). The drink is recoloured
  to grape tea at load (`drinks.ts`). The logo flower drifts behind at
  depth (`petals.ts`, parallax); section headings and cards use the CSS scroll-driven `parallax-near` /
  `parallax-rise` (globals.css, only where supported). No WebGL 2, data saver or no model: `<html class="cup-failed">`,
  the other slots and the `cup-grid` / `cup-row` wrappers collapse and the hero's slot shows the cover photo (a
  `<noscript>` copy is there without script). The pure maths (`track`, `fit`, `motion`) has `node --test`
  tests (`npm test`, part of `npm run check`).
- **Colours** are Tailwind theme variables `--color-brand-<token>` (`bg-brand-pink-500`, `text-brand-ink`,
  `border-brand-line`, …) generated from the tokens; no hex in components. Text is ink on pink or white; white text
  only on ink; never white or pink text on a pink or white ground; pink-700 is for details, not text. Light only.
  The whole page stands on the hero's pink-500 (`body` in `globals.css`); panels on it are white cards (`bg-brand-bg-alt`).
  On the pink, text is `text-brand-ink` (ink-muted is ≈ 3.8 : 1 there, kept for white cards) and rules are
  `border-brand-ink/15`. The hero photo's edges fade into that pink (its backdrop is a cooler pink).
- **Type**: Fraunces is the only typeface (`next/font/google` in `src/app/layout.tsx`, `vietnamese` subset).
- `cacheComponents` is on (scaffold default): keep prerendering static, avoid `new Date()` / request APIs in server
  components unless wrapped as the docs require.
