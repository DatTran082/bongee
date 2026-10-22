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
npm run sync-menu    # the menu (dishes, groups, counter prices) from the shop's Odoo through its MCP server → src/data/odoo/
                     # (BOONGEE_MCP: the server command; default ../odoo/mcp-boongee/run.sh prod; the office blocks sslip.io)
npm run sync-brand   # brand assets from ../brandkit, accents + toon rules from ../brandkit-ghibli, sizes/offers from ShanMay
                     # (BOONGEE_BRANDKIT, BOONGEE_LANGMAY, BOONGEE_SHANMAY)
```

## Boongee specifics

- **Content sources.** The menu (dishes, their till groups, counter prices) comes from the shop's **Odoo**
  (`../odoo`, production), copied to `src/data/odoo/menu.json` by `npm run sync-menu` through the Boongee MCP server
  (`list_menu`, `get_dish`; only dishes on the till; edit dishes in Odoo, never here), typed in `src/data/menu.ts`
  (till group title → page id in `GROUP_IDS`). Cup volumes and sugar / ice options still come from ShanMay's
  `menu-data.json`, the offers from its `collateral.json` (`sync-brand`, `src/data/shanmay/`, `offers.ts`). Story,
  tone and promises follow ShanMay's `docs/01-brand-foundation.md`, in plain words (owner, 22/10/2026: no flowery
  copy; a short poem with small, quiet pictures is welcome; the story section opens with one). The page shows no
  instructions ("scroll to…", "drag to…"): the 3D controls are described to assistive tech only (`cup.hint`). Everything else is
  in `src/data/boongee.ts`; FAQ answers (`src/data/faq.ts`) are composed from that data. Facts ShanMay marks as
  assumptions or illustrative (prices, address, tea origin, 50% sweetness) carry `TODO(boongee)`. Unknown facts are
  `null`; components render them as "Đang cập nhật" and drop unset links. Items have no descriptions: none exist. Never invent addresses, prices, phone numbers,
  social URLs or testimonials. The domain is not in it: `src/lib/site-url.ts` (server-only, may throw) reads
  `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain, then localhost in dev; a production build with none fails.
- **Brand assets come from the sibling brand kits** (`../brandkit`, and `../brandkit-ghibli` for the Làng Mây look:
  its logo, flower marks, clouds, cloud bank and tea hills into `src/assets/lang-may/`, its accents and toon rules)
  through `scripts/sync-brand.mjs` and are committed.
  Do not hand-edit what it writes (`src/styles/brand-tokens.css`, `src/data/brand-tokens.json`, `src/assets/`,
  `public/models/`, `src/app/{icon.svg,favicon.ico,apple-icon.png,opengraph-image.*,twitter-image.*}`): change the
  brand kit, rebuild it, then run `npm run sync-brand`.
- **The 3D stage** (`src/components/cup-stage.tsx`, `src/lib/cup-scene/`): a fixed three.js canvas at z-index −10
  inside `main` (mounted by `page.tsx`, after the hero), transparent (the flavour section's tone is its clear colour,
  at that section's presence), so the hero's painted sky (z-index −20) shows behind the actors, a cloud bank (z auto)
  in front of them, and they pass behind the white cards. Three actors (`ACTORS`, one `Actor` each, `actor.ts`): `set`, the cover photo rebuilt in 3D
  (`set/`: the brand kit's paper cup twice, one under a smooth, plump cream cap with rose petals, one lidded, on a smooth
  boulder and two sawn logs, two clouds behind (hung with `decorate`, so they do not count in the set's size); no
  plants or flowers; with shadows from a key light that follows it; it does not float or turn: it holds still and
  leans toward the mouse (`SET_MOTION.parallax`, `turnable: false`), while the page's cloud bank slips
  against it through `--pointer-x / -y` on the root (lang-may.css), a still picture with depth); `pp`, the 700 ml PP cup,
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
  the keyboard). Six logo flowers drift behind at
  depth (`petals.ts`, parallax); section headings and cards use the CSS scroll-driven `parallax-near` /
  `parallax-rise` (globals.css, only where supported). No WebGL 2, data saver or no model: `<html class="cup-failed">`,
  the other slots and the `cup-grid` / `cup-row` wrappers collapse and the hero's slot shows the cover photo (a
  `<noscript>` copy is there without script). The pure maths (`track`, `fit`, `motion`) has `node --test`
  tests (`npm test`, part of `npm run check`).
- **The menu is a picker** (`src/components/menu-picker.tsx`, client; `menu.tsx` keeps the heading): groups as
  sticker cards with a round tinted mark, M / L prices in small size discs, a sticky row of group chips, topping /
  sugar / ice strips at the foot (sugar and ice levels from ShanMay's options, default sugar the promise's 50 %), and
  "Ly của bạn" (size switch, choices, a running total of counter prices). Picking a drink turns the carousel's cup
  (the `flavor` actor, whose second slot is the menu's left column, sticky from lg) to its group: the menu holds the
  cup while it is on screen (`claimFlavor`, `glideFlavorTo` in flavor-scroll.ts; the carousel's writes wait
  meanwhile). Phones: the column dissolves (`contents`): cup first, card last, and the pick rides in a fixed bar at
  the screen's foot while the menu is in view. Nothing is ordered on the site. The PP cup no longer has a menu slot.
- **The flavour carousel** (`src/components/flavors.tsx`, section `#huong-vi` after the story): one flavour per
  menu category (`src/data/flavors.ts`: its cup, its toppings, its background tone; titles and item names from the
  menu, never written by hand). With script the section gives each change 1.7 viewports of scroll and its inside sticks;
  GSAP ScrollTrigger (loaded on demand, `gsap` dependency) scrubs a timeline that cross-fades the words, snaps to
  each flavour (`inertia: false`, so a dot jumps to its own flavour, not past it; it waits 0.35 s for the scroll to
  stop and glides 0.5–1.2 s, so it never snatches the page; scrub 1 s) and writes the progress to `src/lib/cup-scene/flavor-scroll.ts`. The stage's `flavor` actor
  (`flavor-rig.ts`) reads it every frame through `flavor-track.ts` (pure, tested): the cup turns once per flavour;
  `cupParts` keeps one paper cup between two paper-cup flavours and swaps only its topper (the lid lifts off and
  shrinks, the milk-foam or cheese cream drops in and settles), and swaps the whole cup only between paper and the
  clear PP cup of the fruit teas (about its middle, never below half size, never both at once); the toppings' shaders compile when they are made, not mid-scroll; the
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
  `src/lib/cup-scene/toon/`: `cups.ts` keeps the kit's GLB cups round and swaps each material by its GLB name
  (paper and the white lid matte: a faint highlight); `material.ts` is the one material (MeshToonMaterial, smooth,
  light in three soft-edged bands from a 256 px gradient (`toon.softness`), a white highlight where the surface
  mirrors the key light (an upright stripe on a cup), and for drinks `layers`: three colours with waving borders
  (`toon.drink.wave`); no rim light, no tone mapping, no environment map, no transmission); `outline.ts` is one fine
  line (an inverted hull, `toon.outline.widthPx` screen px) in a darker tone of the surface (`outlineColour`:
  near-white surfaces get a rose-lilac line; instanced copies darken their own colour; a material's
  `userData.outlineColour` / `noOutline` overrides; a geometry's `userData.hull` gives a welded skin). See-through
  surfaces (the PP wall and lid, its white print, ice) have no hull, which would show through them as a solid band:
  their edge line is drawn in the shader where they turn edge-on (`toonMaterial({ edge })`). No white
  sticker band and no rim light in the 3D: the owner found they made everything look like glass (22/10/2026).
  `shapes.ts` draws every prop (grapes, mango, ice, beans, cheese, berries, the five-petalled flower, foam puffs,
  petal flakes, boulder, logs) smooth and rounded (icospheres of detail 3–4, rounded boxes, bevelled extrusions,
  lathes; smooth normals); `foam.ts` the cream caps, never past the rim (`FOAM_RIM`): the milk foam the first
  design's round dome (its profile 7 % narrower) with rose petals and osmanthus, the cheese foam a low swell;
  `sparkles.ts` the twinkling stars;
  `palette.ts` the drinks' and props' own colours. No downloaded models: shapes drawn here keep one style and cost
  no requests. The toppings and the PP cup's splash are made after the stage shows (`loadExtras` in index.ts).
- **Colours** are Tailwind theme variables `--color-brand-<token>` (`bg-brand-pink-500`, `text-brand-ink`,
  `border-brand-line`, …) generated from the tokens; no hex in components. Text is ink on cream or white; white text
  only on ink; never pink text; pink-700 is for details, not text. Light only. The whole page stands on cream white
  (`bg`, the owner's choice of 21/10/2026 over the earlier pink: `body` in `globals.css`, the header, the canvas);
  panels on it are white cards (`bg-brand-bg-alt`) with a `border-brand-line` hairline, since white on cream needs an
  edge. Rules are `border-brand-ink/15`.
- **The Làng Mây UI** (owner's request of 22/10/2026, "sử dụng linh hoạt brandkit ghibli style"): the page's own
  look follows `../brandkit-ghibli` as the 3D does. `src/styles/lang-may.css` (imported by globals.css): `.card-sticker`
  (white card, sticker edge: a cloud-white band and a thin lilac-rose line, a soft lilac shadow) for every panel;
  `.badge-sticker` (round icon badge on an accent tint, icon in ink); `.button-game` with `data-variant="primary" |
"outline"` (pill on a lip it presses onto) for every button and button-like link; `.sky` (sky-200 into cream);
  `.sparkle-twinkle` animation (off with reduced motion). `src/components/lang-may/`: `<Sky>` (the
  hero's sky, a plain gradient: no clouds in it, the owner's choice), `<CloudBank>` (the hero's foot), `<TeaHills>` (the
  footer's top, melting into the cream), `<FlowerMark>` (the low-poly logo flower: tagline marks, story bullets),
  `<Sparkle>`. The header and footer use the Làng Mây logo (`<Logo>`). Accents (sky, moss, honey, cloud) only
  decorate: never text, never a ground under text.
- **Performance (phones first, 22/10/2026).** The 3D stage starts only after `load` and an idle moment
  (`whenSettled` in cup-stage.tsx, ≤ 1.5 s), so three.js and the models never compete with first paint; WebGL 2 is
  checked by API, not by a throwaway context. Each device gets a quality (`quality.ts`, tested): phones and weak
  machines draw at ≤ 1.5× pixel ratio, without the shadow pass, with fewer petals, and at 30 fps while only the idle
  float moves (`needsRedraw` with `idleFrameMs`; scroll, input and changes still draw at once). Toppings and creams
  are built in idle steps after the stage shows, then their shaders compiled. Per frame the stage never writes to
  the root's style (a custom property there restyles the whole page): `--pointer-x / -y` go on `.bank-parallax`
  only, when changed, and the scroll comes from the scroll event (reading `window.scrollY` after a style write
  forces a layout). sync-brand keeps only the cups' print textures, ≤ 2048 px (the toon look uses nothing else; a
  4096 px print is ~32 MB of GPU memory). Fraunces loads `opsz` only, latin + vietnamese. The header blurs its
  backdrop from md up only. Measured on an emulated phone (4× CPU, real GPU): the whole page scrolls at 60 fps;
  Lighthouse mobile ≈ 0.8, CLS 0, 824 KiB.
- **Type**: Fraunces is the only typeface (`next/font/google` in `src/app/layout.tsx`, `vietnamese` subset).
- `cacheComponents` is on (scaffold default): keep prerendering static, avoid `new Date()` / request APIs in server
  components unless wrapped as the docs require.
