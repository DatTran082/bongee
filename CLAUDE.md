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
  `src/app/{icon.svg,favicon.ico,apple-icon.png,opengraph-image.*,twitter-image.*}`, `public/models/`): change the
  brand kit, rebuild it, then run `npm run sync-brand`.
- **Colours** are Tailwind theme variables `--color-brand-<token>` (`bg-brand-pink-500`, `text-brand-ink`,
  `border-brand-line`, …) generated from the tokens; no hex in components. Text is ink on pink or white; white text
  only on ink; never white or pink text on a pink or white ground; pink-700 is for details, not text. Light only.
- **Type**: Fraunces is the only typeface (`next/font/google` in `src/app/layout.tsx`, `vietnamese` subset).
- **Hero 3D scene** (`src/components/hero-scene.tsx` → `src/lib/hero-scene/`, three.js) stands in for the cover photo
  (`brandkit/lookbook/anh-bia/facebook.png`, layout in `brandkit/lookbook/prompts-anh-bia.md`): the brand kit's paper
  cup GLB twice (one open with a cream dome, one lidded), a granite block, two logs and a lily built in code, without
  the photo's plant stems. Placements in metres are in `layout.ts`, prop colours (sampled from the photo) in
  `palette.ts`. three.js is imported after mount; frames are drawn only on input (nothing moves by itself, WCAG
  2.2.2); without WebGL the scene drops out. `sync-brand` compresses the GLB (meshopt, WebP) and first moves each
  mesh into a child node, so named nodes keep their origins (`lid-strap` turns on its hinge).
- `cacheComponents` is on (scaffold default): keep prerendering static, avoid `new Date()` / request APIs in server
  components unless wrapped as the docs require.
