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
npm run sync-brand   # brand assets from ../brandkit, accents + toon rules from ../brandkit-ghibli, menu/offers from ShanMay
                     # (BOONGEE_BRANDKIT, BOONGEE_LANGMAY, BOONGEE_SHANMAY)
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
  inside `main` (mounted by `page.tsx`, after the hero), cleared to the page's cream (opaque; the body is the same
  cream, so nothing shows), so its actors show on the cream and pass behind the white cards. Three actors (`ACTORS`, one `Actor` each, `actor.ts`): `set`, the cover photo rebuilt in 3D
  (`set/`: the brand kit's paper cup twice, one under a soft-serve swirl with rose petals, one lidded, on a smooth
  boulder and two sawn logs, two clouds behind (hung with `decorate`, so they do not count in the set's size); no
  plants or flowers; floating as one piece with shadows from a key light that follows it); `pp`, the 700 ml PP cup,
  clear plastic by alpha, holding grape tea poured in three greens with waving borders, round grapes, ice and bubbles
  standing in it and drifting round it (`splash.ts`), sparkles about it; `paper`, the lidded paper cup alone; `flavor`,
  the carousel's cup (below). Both GLBs (`brandkit/3d/boongee-{pp-700ml,paper-16oz}.glb`) are compressed by sync-brand with
  meshopt + WebP to `public/models/<name>.<hash>.glb`, URLs in `src/data/cup-model.json`, cached immutable by
  `next.config.ts`. Sections lay out empty slots with `<CupAnchor name actor turn tilt lid fill>`; `track.ts`
  rests each actor in its own slot nearest above the viewport's middle and flies it to its next (dwell 12 % at
  each end, smooth step between; with reduced motion it jumps halfway and nothing bobs, sways or drifts); an actor
  with one slot stays in it. Hidden slots are skipped, so a section can have one for phones and one for `lg`; a slot
  may be `sticky`; two slots side by side (`cup-row`, offers) put two actors together. A hit element per actor
  takes the pointer while it rests on screen (drag turns, a tap on the lid flips the strap; arrows / Enter / Home on
  the keyboard). The logo flower drifts behind at
  depth (`petals.ts`, parallax); section headings and cards use the CSS scroll-driven `parallax-near` /
  `parallax-rise` (globals.css, only where supported). No WebGL 2, data saver or no model: `<html class="cup-failed">`,
  the other slots and the `cup-grid` / `cup-row` wrappers collapse and the hero's slot shows the cover photo (a
  `<noscript>` copy is there without script). The pure maths (`track`, `fit`, `motion`) has `node --test`
  tests (`npm test`, part of `npm run check`).
- **The flavour carousel** (`src/components/flavors.tsx`, section `#huong-vi` after the story): one flavour per
  menu category (`src/data/flavors.ts`: its cup, its toppings, its background tone; titles and item names from the
  menu, never written by hand). With script the section is one viewport tall per flavour and its inside sticks;
  GSAP ScrollTrigger (loaded on demand, `gsap` dependency) scrubs a timeline that cross-fades the words, snaps to
  each flavour (`inertia: false`, so a dot jumps to its own flavour, not past it) and writes the progress to `src/lib/cup-scene/flavor-scroll.ts`. The stage's `flavor` actor
  (`flavor-rig.ts`) reads it every frame through `flavor-track.ts` (pure, tested): the cup turns once per flavour
  and swaps (lidded paper cup, paper cup under milk foam or cheese foam, the clear PP cup for the fruit teas), the
  toppings (`toppings.ts`) fade from one flavour's set to the next, and the canvas's clear colour moves through the
  flavours' tones. **Tones stay in the brand's creams and whites** (`bg`, `bg-alt`, `grey-100`); flavour colours live
  only in the drink and the toppings. While the section has the viewport the `pp` and `paper` actors shrink away.
  Without script it is a plain list; dots jump to a flavour; reduced motion keeps the pin but drops the turn,
  the snap and the smoothing.
- **The 3D look is a smooth stylized drink game asset** (owner's choice of 21/10/2026, over the earlier realistic
  scans, which are in `git stash` "snapshot: 3D tả thực…", and then over a faceted low-poly pass the owner found too
  coarse), after the Làng Mây edition's toon rules
  (`../brandkit-ghibli`, `color/tokens.json → toon`, copied to `src/data/brand-toon.json`; its accents sky, cloud,
  moss, cream, honey, wood, stone join the brand tokens, for the 3D and decoration only, never text). All in
  `src/lib/cup-scene/toon/`: `cups.ts` keeps the kit's GLB cups round and swaps each material by its GLB name;
  `material.ts` is the one material (MeshToonMaterial, smooth, light in three soft-edged bands from a 256 px gradient
  (`toon.softness`), a white highlight where the surface mirrors the key light (an upright stripe on a cup), a rim,
  and for drinks `layers`: three colours with waving borders (`toon.drink.wave`); no tone mapping, no environment
  map, no transmission); `outline.ts` is a sticker outline, two inverted hulls at fixed screen widths: a warm white
  one (`toon.outline.widthPx`) and a thin darker line of the surface's tone beyond it (`edgePx`, polygon-offset
  behind the white; `outlineColour`: near-white surfaces get a rose-lilac line; instanced copies darken their own
  colour; a material's `userData.outlineColour` / `noOutline` overrides; a geometry's `userData.hull` gives a welded
  skin); `shapes.ts` draws every prop (grapes, mango, ice,
  beans, cheese, berries, the five-petalled flower, foam puffs, petal flakes, boulder, logs, clouds) smooth and
  rounded (icospheres of detail 3–4, rounded boxes, bevelled extrusions, lathes; smooth normals); `foam.ts` the
  soft-serve swirl (a tapering tube wound up a helix over a low dome); `sparkles.ts` the twinkling stars;
  `palette.ts` the drinks' and props' own colours. No downloaded models: shapes drawn here keep one style and cost
  no requests. The toppings and the PP cup's splash are made after the stage shows (`loadExtras` in index.ts).
- **Colours** are Tailwind theme variables `--color-brand-<token>` (`bg-brand-pink-500`, `text-brand-ink`,
  `border-brand-line`, …) generated from the tokens; no hex in components. Text is ink on cream or white; white text
  only on ink; never pink text; pink-700 is for details, not text. Light only. The whole page stands on cream white
  (`bg`, the owner's choice of 21/10/2026 over the earlier pink: `body` in `globals.css`, the header, the canvas);
  panels on it are white cards (`bg-brand-bg-alt`) with a `border-brand-line` hairline, since white on cream needs an
  edge. Rules are `border-brand-ink/15`.
- **Type**: Fraunces is the only typeface (`next/font/google` in `src/app/layout.tsx`, `vietnamese` subset).
- `cacheComponents` is on (scaffold default): keep prerendering static, avoid `new Date()` / request APIs in server
  components unless wrapped as the docs require.
