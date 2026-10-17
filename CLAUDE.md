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
npm run sync-brand   # copy brand assets from ../brandkit (BOONGEE_BRANDKIT overrides the path)
```

## Boongee specifics

- **All page copy and facts live in `src/data/boongee.ts`.** Unknown facts are `null` with a `TODO(boongee)` comment;
  components render them as "Đang cập nhật" and drop unset links. Never invent addresses, prices, phone numbers,
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
- **3D cups** (`src/components/cup-viewers.tsx`): `@google/model-viewer` is imported only when the section nears the
  viewport; each viewer has a slotted poster `<img>` (shown before or without WebGL); no auto-rotate (nothing on the
  page moves by itself, WCAG 2.2.2). JSX typing for the custom element is in `src/types/model-viewer.d.ts`.
- `cacheComponents` is on (scaffold default): keep prerendering static, avoid `new Date()` / request APIs in server
  components unless wrapped as the docs require.
