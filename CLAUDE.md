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
  `src/app/{icon.svg,favicon.ico,apple-icon.png,opengraph-image.*,twitter-image.*}`): change the brand kit, rebuild
  it, then run `npm run sync-brand`.
- **Colours** are Tailwind theme variables `--color-brand-<token>` (`bg-brand-pink-500`, `text-brand-ink`,
  `border-brand-line`, …) generated from the tokens; no hex in components. Text is ink on pink or white; white text
  only on ink; never white or pink text on a pink or white ground; pink-700 is for details, not text. Light only.
- **Type**: Fraunces is the only typeface (`next/font/google` in `src/app/layout.tsx`, `vietnamese` subset).
- `cacheComponents` is on (scaffold default): keep prerendering static, avoid `new Date()` / request APIs in server
  components unless wrapped as the docs require.
