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
npm run sync-brand   # brand assets from ../brandkit (Làng Mây, official) and its print kit ../brandkit/print, sizes/offers
                     # from ShanMay (BOONGEE_BRANDKIT, BOONGEE_SHANMAY)
```

## Boongee specifics

- **Content sources.** The menu (dishes, their till groups, counter prices) comes from the shop's **Odoo**
  (`../odoo`, production), copied to `src/data/odoo/menu.json` by `npm run sync-menu` through the Boongee MCP server
  (`list_menu`, `get_dish`; only dishes on the till; edit dishes in Odoo, never here), typed in `src/data/menu.ts`
  (till group title → page id in `GROUP_IDS`). Cup volumes and sugar / ice options still come from ShanMay's
  `menu-data.json`, the offers from its `collateral.json` (`sync-brand`, `src/data/shanmay/`, `offers.ts`). Story,
  tone and promises follow ShanMay's `docs/01-brand-foundation.md`, in plain words (owner, 22/10/2026: no flowery
  copy). The page shows no
  instructions ("scroll to…", "drag to…"): the 3D controls are described to assistive tech only (`cup.hint`). Everything else is
  in `src/data/boongee.ts`. Facts ShanMay marks as
  assumptions or illustrative (prices, address, tea origin, 50% sweetness) carry `TODO(boongee)`. Unknown facts are
  `null`; components render them as "Đang cập nhật" and drop unset links. A drink's only description is its plain line ("Trà sữa dành dành"), written by sync-menu from its Odoo recipe (`src/lib/menu/describe.ts`, tested); no recipe, no line. Never invent addresses, prices, phone numbers,
  social URLs or testimonials. The domain is not in it: `src/lib/site-url.ts` (server-only, may throw) reads
  `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain, then localhost in dev; a production build with none fails.
- **Brand assets come from the sibling brand kit** (`../brandkit`, Boongee · Làng Mây, the only official kit since
  22/10/2026; tokens, the logo sources, favicon, cover photos and the 3D cups from its print kit `../brandkit/print`; the Làng Mây look:
  the delivery badges into `src/assets/lang-may/`, its accents and toon rules; the header's ink logo is the print kit's
  `logo-ngang-khong-slogan_den.svg`, copied by hand to `src/assets/brand/`)
  through `scripts/sync-brand.mjs` and are committed.
  Do not hand-edit what it writes (`src/styles/brand-tokens.css`, `src/data/brand-tokens.json`, `src/assets/`,
  `public/models/`, `src/app/{icon.svg,favicon.ico,apple-icon.png,opengraph-image.*,twitter-image.*}`): change the
  brand kit, rebuild it, then run `npm run sync-brand`.
- **The 3D stage** (`src/components/cup-stage.tsx`, `src/lib/cup-scene/`): a fixed three.js canvas at z-index −10
  inside `main` (mounted by `page.tsx`, after the hero), transparent, so the hero's plain sky (`.sky`, z-index −20) shows behind the actors, and they pass behind the
  white cards. Three actors (`ACTORS`, one `Actor` each, `actor.ts`): `set`, the cover photo rebuilt in 3D
  (`set/`: the brand kit's paper cup twice, one under a smooth, plump cream cap with rose petals, one lidded, on a smooth
  boulder and two sawn logs, two clouds behind (hung with `decorate`, so they do not count in the set's size); no
  plants or flowers; with shadows from a key light that follows it; it does not float, turn or follow the mouse: a
  still picture (`SET_MOTION`, `turnable: false`; no parallax anywhere on the page since 22/10/2026, the owner: it
  made phones lag)); `pp`, the 700 ml PP cup,
  clear plastic by alpha, holding grape tea poured in three greens with waving borders, round grapes, ice and bubbles
  standing in it and drifting round it (`splash.ts`); `paper`, the lidded paper cup alone (the flavour carousel's
  `flavor` actor, its toppings and the PET cup were removed with the carousel, 17/11/2026). Both GLBs (`brandkit/print/3d/boongee-{pp-700ml,paper-16oz}.glb`) are compressed by sync-brand with
  meshopt + WebP to `public/models/<name>.<hash>.glb`, URLs in `src/data/cup-model.json`, cached immutable by
  `next.config.ts`. Sections lay out empty slots with `<CupAnchor name actor turn tilt lid fill>`; `track.ts`
  rests each actor in its own slot nearest above the viewport's middle and flies it to its next (dwell 12 % at
  each end, smooth step between; with reduced motion it jumps halfway and nothing bobs, sways or drifts); an actor
  with one slot stays in it. Hidden slots are skipped, so a section can have one for phones and one for `lg`; a slot
  may be `sticky`; two slots side by side (`cup-row`) put two actors together (none does now: the offers show their
  printed pieces instead). A hit element per actor
  takes the pointer while it rests on screen (drag turns, a tap on the lid flips the strap; arrows / Enter / Home on
  the keyboard). No flowers drift behind (removed 22/10/2026) and no sparkles twinkle anywhere on the page, 2D or
  3D (removed, owner, 27/10/2026: no sparkle stars in any design); headings and cards hold still (the scroll-driven
  parallax was removed, 22/10/2026). No WebGL 2, data saver or no model: `<html class="cup-failed">`,
  the other slots and the `cup-grid` / `cup-row` wrappers collapse and the hero's slot shows the cover photo (a
  `<noscript>` copy is there without script). The pure maths (`track`, `fit`, `motion`) has `node --test`
  tests (`npm test`, part of `npm run check`).
- **The home page is short and quiet (owner, 17/11/2026: "tinh tế, tối giản", white, silver and pastel blue):**
  hero (slogan + two buttons, no intro line; the 3D set on its floating island over a plain pastel sky: the toon
  mountains and clouds were removed the same day, owner: "bỏ mây núi, chỉ giữ lại đảo bay"), Thực đơn · "Thức uống đặc trưng"
  (3D PP cup beside the photos from `lg`), Ưu đãi · "Ưu đãi thành viên", Cửa hàng · "Ghé thăm Boongee" (3D paper
  cup). The story and FAQ sections are gone (FAQ and its structured data removed 17/11/2026), and the page shows no
  counts (no "23 món, 32K – 65K", no per-group counts or starting prices). Section ids: `thuc-don`, `uu-dai`,
  `cua-hang`. The 7-viewport flavour
  carousel and the printed-menu-board picker (`menu-picker.tsx`) were removed; the full menu with a photo and prices
  per dish lives on `/menu`.
- **The menu section** (`src/components/menu.tsx`, server): one card per drink group of the till (`lookbookGroups`
  from `src/data/lookbook.ts`, combos and toppings left to /menu): the first dish's lookbook photo (3:4) and the
  group's name, linking to `/menu#<group>`; a sideways snap strip on phones, five columns from `lg`, the PP cup's
  slot beside them; "Xem toàn bộ thực đơn" beside the heading and "Ảnh minh hoạ" under. `hasMenu` points to `/menu`.
- **The /menu page** (`src/app/menu/page.tsx`, `src/components/lookbook-gallery.tsx`; 16/11/2026, it replaced the
  old `/preview` and `/thuc-don`, which held invented copy and hard-coded prices): every dish on the till, combos
  included, group by group in the till's order, each with its lookbook studio photo (4:5) and its name, price and
  plain line from Odoo only (`src/data/lookbook.ts` joins them, `src/lib/lookbook/join.ts`, tested). A photo opens in a
  modal `<dialog>` (arrows go through the dishes; Esc or the backdrop closes). A dish with no photo shows "Ảnh đang
  cập nhật"; a photo whose dish is not on the till is not shown. The photos are AI-made, so the page says "Ảnh minh
  hoạ". `npm run sync-lookbook` (`scripts/sync-lookbook.mjs`; sync-brand runs it too, right after it wipes
  `public/menu`) writes `public/menu/lookbook/*.<hash>.webp` and `src/data/lookbook.json` from
  `../brandkit/lookbook`: Odoo dish name → photo stem in `PHOTOS`, a v3 photo (`assets-v3/<stem>.png`) for the stems
  in `V3`, else the v2 one (`assets/<stem>.jpg`). The home page's menu links to it; it is in the sitemap.
  `next.config.ts` caches `/menu/:path+` immutable, not the page itself.
  Its header (17/11/2026): the group index as numbered hairline rows beside the Lottie, which plays straight on the
  page's pale blue wash (no frame, no card); the page's name "Thực đơn" is an `sr-only` <h1> (owner: no visible title);
  no dish count, only "Ảnh minh hoạ · Giá tại quầy, cập nhật <date>". Groups are numbered light headings on a hairline.
  The Lottie (`src/components/menu-hero-lottie.tsx`, lottie-web's light SVG player,
  loaded in the browser only; 6 s since 17/11/2026): a pastel-blue paper cup is set down, the four monogram marks
  (the print kit's cluster, `brandkit/lottie/monogram-marks.mjs`, drawn with still edges) fly onto it one by one,
  the lid goes on; then the loop: the marks breathe in turn, a curl of scent rises. Intro frames 0–48 once, then the
  loop 48–72; paused off screen; frame 48 still with reduced motion. Its source is
  `../brandkit/lottie/menu-hero.scene.mjs` (skill `hand-drawn-lottie`: 12 fps, ink Đen Than + one colour, pastel blue `#A8D3E3` since 17/11/2026,
  no sparkles, not the logo), built to `menu-hero.json` there and copied by sync-lookbook as
  `public/menu/lookbook/menu-hero.<hash>.json` (`animation` in lookbook.json).
- **The /system-design page** (`src/app/system-design/page.tsx`, 17/11/2026, owner: "tham chiếu cho những thiết kế
  sau này"): Boongee's design system as a living page for the team, `noindex`, not in the sitemap or the nav. Values
  come from the brand kit's merged tokens (`../brandkit/design-system/tokens.json`, built by
  `brandkit/scripts/build_design_tokens.py`), copied with the monogram cluster SVG by `npm run sync-design-system`
  to `src/data/design-system.json` and `src/assets/brand/cum-4-hoa-den.svg`; the words (DNA, principles, surfaces,
  voice, 3D and photo rules, checklist, **changelog**) are in `src/data/system-design.ts`; components shown are the
  site's own (`.btn`, `.card-line`, `<SectionHeading>`, the Lottie). Contrast of the colour pairs is computed
  (`src/lib/design/contrast.ts`, tested). **Updating it:** change the brand kit's source and
  `design-system.md`, rebuild and sync the tokens, edit `src/data/system-design.ts`, and add a changelog line.
- **Delivery apps** (`src/components/delivery-apps.tsx`, in the visit section): Boongee is on GrabFood and ShopeeFood
  (owner, 22/10/2026; `delivery` in `src/data/boongee.ts`), each shown with its painted badge from the Làng Mây edition
  (`giao_hang.py` → `identity/delivery/` → sync-brand → `src/assets/lang-may/{grabfood,shopeefood}.svg`: each app's
  real mark redrawn by hand, owner's request: GrabFood's green disc with the take-away box and crossed spoon and fork,
  ShopeeFood's orange bag-box with a fork and a spoon; no words in them, their names are text). The shop's page in each app is `href` (`TODO(boongee)`); while it is `null` the card asks to search
  "Boongee" in the app instead of linking.
- **The offers are their printed pieces** (`src/components/offers.tsx`, `flip-card.tsx`): the Làng Mây collateral
  built by `../brandkit/scripts/build_an_pham.py` from the same `collateral.json` (vouchers front and back, the
  loyalty card front and back, the weekly-offer post, an A4 poster, a story, a cup sticker), copied by sync-brand to
  `public/uu-dai/*.<hash>.png` (resized; URLs in `src/data/uu-dai.json`). Like the models, every picture sync-brand
  writes to `public/menu` and `public/uu-dai` is named after its content and cached immutable (next.config.ts), so a
  re-render is a new URL and no cache shows the old one. The section shows the weekly post, the loyalty card and both vouchers in one row from `lg`; each card
  turns over (`.flip` in look.css; instant with reduced motion), each voucher can be downloaded to show at the
  counter. The pictures carry the words, so every `alt` says them in full and the terms are also set as text.
- **The 3D look is a smooth stylized drink game asset** (owner's choice of 21/10/2026, over the earlier realistic
  scans, which are in `git stash` "snapshot: 3D tả thực…", and then over a faceted low-poly pass the owner found too
  coarse), after the Làng Mây edition's toon rules
  (`../brandkit`, `color/tokens.json → toon`, copied to `src/data/brand-toon.json`; its accents sky, cloud,
  moss, cream, honey, wood, stone join the brand tokens, for the 3D and decoration only, never text). All in
  `src/lib/cup-scene/toon/`: `cups.ts` keeps the kit's GLB cups round and swaps each material by its GLB name
  (paper and the white lid matte: a faint highlight); `material.ts` is the one material (MeshToonMaterial, smooth,
  light in three soft-edged bands from a 256 px gradient (`toon.softness`), a white highlight where the surface
  mirrors the key light (an upright stripe on a cup), and for drinks `layers`: three colours with waving borders
  (`toon.drink.wave`); no rim light, no tone mapping, no environment map, no transmission); `outline.ts` is one fine
  line (an inverted hull, `toon.outline.widthPx` screen px) in a darker tone of the surface (`outlineColour`:
  near-white surfaces get a silver-blue line (17/11/2026); instanced copies darken their own colour; a material's
  `userData.outlineColour` / `noOutline` overrides; a geometry's `userData.hull` gives a welded skin). See-through
  surfaces (the PP wall and lid, its white print, ice) have no hull, which would show through them as a solid band:
  their edge line is drawn in the shader where they turn edge-on (`toonMaterial({ edge })`). No white
  sticker band and no rim light in the 3D: the owner found they made everything look like glass (22/10/2026).
  `shapes.ts` draws every prop (grapes, mango, ice, beans, cheese, berries, the five-petalled flower, foam puffs,
  petal flakes, boulder, logs) smooth and rounded (icospheres of detail 3–4, rounded boxes, bevelled extrusions,
  lathes; smooth normals); `foam.ts` the cream cap, one design for both creams (owner, 22/10/2026): a thin swell inside the rim (`FOAM_RIM`), cream colour, rose petals and osmanthus;
  `palette.ts` the drinks' and props' own colours. No downloaded models: shapes drawn here keep one style and cost
  no requests. The toppings and the PP cup's splash are made after the stage shows (`loadExtras` in index.ts).
- **Colours and the UI (owner, 17/11/2026: white, silver, pastel blue; "tinh tế, tối giản"; it replaced the
  Làng Mây sticker UI of 22/10/2026).** Brand tokens are `--color-brand-<token>` (generated); `src/styles/look.css`
  adds `silver-50 … 700` (from the brand's silver 877 C) and `blue-50 … 400` (the sky), and, in `@layer components`
  so utilities win, `.card-line` (white panel on a silver hairline), `.eyebrow` (tracked small caps after a short
  rule), `.btn` with `data-variant="primary" | "outline"` (flat pill: white on ink, or ink on a silver hairline),
  `.flip`, and `.sky` (the hero's sky). The page stands on white; text is ink, secondary lines
  `text-silver-700`; headings light (`font-light`), set left (`<SectionHeading tagline title aside>`). No pink in
  the page's own UI; the colour comes from the photos, the 3D garden and the offers' printed pieces (still the Làng Mây
  collateral). Light only.
- **The hero garden** (`src/lib/cup-scene/set/garden.ts`; owner, 17/11/2026: assets instead of self-built, cel
  shading, colourway B): the cover set stands on a small floating island (drawn here) with an old twisted tree
  behind it and rocks, grass, a fern, a bush and flowers at its feet: CC0 models from Quaternius's Stylized Nature
  MegaKit (free edition; source and licence in `../brandkit/3d-nature/quaternius-stylized-nature/`), merged and
  compressed by `npm run sync-nature` (`scripts/sync-nature.mjs`: normal maps dropped, WebP ≤ 1024 px, meshopt →
  `public/models/nature.<hash>.glb`, ~0.8 MB; URL in `src/data/nature-model.json`). Drawn with the stage's toon
  material, their painted textures repainted by `toonMaterial({ tint })` (lightness kept, hue replaced: crown white,
  bark and rocks silver, plants pastel blue-silver); leaf cards alpha-cut, two-sided, without outline. Loaded with
  the extras after the stage shows, and added to the set after its actor measured it, so the cups keep their size.
  The boulder and logs are silver too (`SILVER` in `set/index.ts`), and the stage's shade light is silver-blue.
- **Performance (phones first, 22/10/2026).** The 3D stage starts only after `load` and an idle moment
  (`whenSettled` in cup-stage.tsx, ≤ 1.5 s), so three.js and the models never compete with first paint; WebGL 2 is
  checked by API, not by a throwaway context. Each device gets a quality (`quality.ts`, tested): phones and weak
  machines draw at ≤ 1.5× pixel ratio, without the shadow pass, and at 30 fps while only the idle
  float moves (`needsRedraw` with `idleFrameMs`; scroll, input and changes still draw at once). Toppings and creams
  are built in idle steps after the stage shows, then their shaders compiled. Per frame the stage never writes to
  the page's style, and the scroll comes from the scroll event (reading `window.scrollY` after a style write forces
  a layout). sync-brand keeps only the cups' print textures, ≤ 2048 px (the toon look uses nothing else; a
  4096 px print is ~32 MB of GPU memory). Fraunces loads `opsz` only, latin + vietnamese. The header blurs its
  backdrop from md up only. Measured on an emulated phone (4× CPU, real GPU; after the flavour section's rewrite, 22/10/2026): the whole page
  scrolls at 60 fps, p99 16.8 ms, no frame over 50 ms in the flavour section;
  Lighthouse mobile ≈ 0.8, CLS 0, 824 KiB.
- **Type**: Fraunces is the only typeface (`next/font/google` in `src/app/layout.tsx`, `vietnamese` subset).
- `cacheComponents` is on (scaffold default): keep prerendering static, avoid `new Date()` / request APIs in server
  components unless wrapped as the docs require.
