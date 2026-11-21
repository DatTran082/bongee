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
npm run sync-models  # only its 3D cups (both looks: toon, and -pbr for the WebGPU stage), nothing else
npm run sync-collateral  # only the offers' printed pieces (../brandkit/collateral → public/uu-dai), nothing else
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
  `null`; components render them as "Đang cập nhật" and drop unset links. **No prices on the site** (owner, 21/11/2026: "bỏ giá bán"; Odoo still holds them, sync-menu still copies them, nothing shows them, and the structured data has no price range). Each dish shows its **short description** (`src/data/descriptions.ts`, owner, 21/11/2026: "thêm mô tả ngắn gọn cho từng món", in the sensory way of the delivery-app examples they sent): one or two sentences, by Odoo dish name, written from the dish's Odoo recipe (only ingredients the recipe has, no tea origin, no health claims; Thanh Nho Tươi and its combos without kumquat, its grapes on top of the cup), `descriptions.test.ts` checking every dish on the till has one, at most two sentences, no price. Read a description again when its recipe changes in Odoo. A dish without one falls back to its plain line ("Trà sữa dành dành"), written by sync-menu from its Odoo recipe (`src/lib/menu/describe.ts`, tested); no recipe, no line. Never invent addresses, prices, phone numbers,
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
  inside `main` (mounted by `page.tsx`, after the hero), transparent; the actors pass behind the white cards. Three
  actors (`ACTORS`, one `Actor` each, `actor.ts`; the hero's `set` actor, the cover photo rebuilt in 3D, was removed
  with its shadows when the hero became a photograph, 17/11/2026; no parallax anywhere on the page since 22/10/2026,
  the owner: it made phones lag): `pp`, the 700 ml PP cup,
  frosted milk-white plastic by alpha (21/11/2026; sky-tinted clear before), holding grape tea poured in three greens with waving borders, round grapes, ice and bubbles
  standing in it and drifting round it (`splash.ts`); `paper`, the lidded paper cup, both in the cups section; `visit`,
  a second paper cup in the visit section (one actor per slot: a cup flying between the two sections would drift for
  screens behind the menu and the offers) (the flavour carousel's
  `flavor` actor, its toppings and the PET cup were removed with the carousel, 17/11/2026). Both GLBs (`brandkit/print/3d/boongee-{pp-700ml,paper-16oz}.glb`) are compressed by sync-brand with
  meshopt + WebP to `public/models/<name>.<hash>.glb`, URLs in `src/data/cup-model.json`, cached immutable by
  `next.config.ts`. Sections lay out empty slots with `<CupAnchor name actor turn tilt lid fill>`; `track.ts`
  rests each actor in its own slot nearest above the viewport's middle and flies it to its next (dwell 12 % at
  each end, smooth step between; with reduced motion it jumps halfway and nothing bobs, sways or drifts); an actor
  with one slot stays in it. Hidden slots are skipped, so a section can have one for phones and one for `lg`; a slot
  may be `sticky`; two slots side by side (`cup-row`) put two actors together (none does now: the offers show their
  printed pieces instead). A slot's pose can be driven by the page's scroll timeline (`live-pose.ts`: one mutable
  record per slot element that GSAP tweens: turn, tilt, lid, strap, fill and an offset; `measureAnchors` reads it
  instead of the data attributes, and a version counter makes the stage measure again while a scrub settles); the
  pose's `strap` (0 … 1) folds the strap open on top of a tap's flip. A hit element per actor
  takes the pointer while it rests on screen (drag turns, a tap on the lid flips the strap; arrows / Enter / Home on
  the keyboard). No flowers drift behind (removed 22/10/2026) and no sparkles twinkle anywhere on the page, 2D or
  3D (removed, owner, 27/10/2026: no sparkle stars in any design). No parallax (removed 22/10/2026); since
  21/11/2026 (owner: "scroll motion gsap … mượt mà nhất, hiệu năng tốt nhất") headings and blocks rise in once as
  they come into view (see the scroll motion below). No WebGL 2, data saver or no model: `<html class="cup-failed">`,
  the slots and the `cup-grid` / `cup-row` wrappers collapse (without script too). The pure maths (`track`, `fit`, `motion`) has `node --test`
  tests (`npm test`, part of `npm run check`).
- **The two 3D cups** (`src/components/cup-showcase.tsx`, id `ly`, 21/11/2026, owner: "đưa ly nhựa và ly giấy vào
  landing", then the same day "bỏ hết mô tả ly …, ly 3D chỉ mang tính chất visual và gây ấn tượng thị giác"): a
  band between the lookbook reel and the menu holding only the 3D paper cup and the frosted PP cup side by side, large
  (slots 62 svh, 72 from `lg`); no heading, names, sizes or lines about the cups, `aria-hidden` (each cup's hit
  element names it). With motion allowed it is 240 svh tall (280 from `lg`) and its frame sticks by CSS
  (`motion-safe:sticky`, no GSAP pin, so no pin-spacer reflow); with reduced motion it is one screen of the two cups
  standing still; without script (noscript style) or without the 3D (`.cup-failed`) it is not shown.
- **Scroll motion** (`src/components/scroll-motion.tsx`, mounted last by the home page; one module per scene in
  `src/lib/scroll/`; GSAP 3.15.1 pinned, its free standard licence, with ScrollTrigger): loaded by a dynamic import
  after hydration, run inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")` so a change of the setting
  reverts it all (a scene returns what GSAP's context cannot undo: heights, attributes, live poses). Scenes, top down
  (`SCENES`; the reel before the ones below it, since it sets its section's height; one `ScrollTrigger.refresh()`
  after all): `hero` (the words and, on phones, their canvas ground fade and rise away; the picture is drawn back
  to 72 % (86 % on phones) and moved to the middle, a framed canvas on the white page, the still life zooming
  gently out); `reel` (sets `data-driven` and the section's height to the row's length beyond the screen on every
  `refreshInit`, the frame sticks by CSS, the row moves by transform with `scrub: 0.6`, a silver line fills, each
  picture settles from a 1.18 zoom through `containerAnimation`; its clipped pictures are switched to eager loading
  as the reel nears); `showcase` (the two 3D cups: while the band comes up they rise from below and either side,
  leaning back (`dx`, `dy`, `tilt` only); while its frame sticks the paper cup comes forward and turns once round,
  then the PP cup the other way with its lid lifted off and set back, then both fold their straps open; the two
  timelines never tween the same property, a refresh renders each and they would fight); `interlude` (the window
  opens from a slit along its top edge, 64 % × 14 %, to the whole frame, the picture inside counter-scaled so it
  keeps its size while it settles from a 1.12 zoom); `wordmark` (the footer name's letters rise one by one);
  `reveal` (`data-reveal` blocks and `data-reveal-group` children rise 28 px and fade in, `data-reveal-line`
  headings rise out of their masks, batched, once, only those still below the viewport; props cleared after). No
  smooth-scroll hijack and no GSAP pinning: frames stick by CSS, and every tween is a transform, an opacity or a
  number the 3D stage reads. The hero's load motion and the marquee are CSS (`look.css`), on elements no scene
  touches (a running CSS animation would override GSAP's inline transform). Measured on an emulated phone (4× CPU,
  real GPU, production build, 21/11/2026, after the redesign): the whole page scrolls at 60 fps, p99 16.8 ms, no
  frame over 50 ms; CLS 0; at load 1.1 MB including the 3D models and the six reel pictures.
- **The home page: a still-life gallery (owner, 21/11/2026: "design và refactor lại landing mới và sử dụng bộ lookbook
  mới, tự do sáng tạo, yêu cầu gây ấn tượng thị giác mạnh"; before, 17/11/2026, "tinh tế, tối giản"; white and
  metallic silver since 18/11/2026).** Built round the v5 lookbook ("Tĩnh vật vải toan"): very large Fraunces type,
  the still lifes as big framed canvases on the white page, scroll-driven scenes. Top down: the hero (the v5 cover
  of two paper cups, the slogan set huge), a marquee of the drink groups (`marquee.tsx`), the lookbook reel
  (`lookbook-reel.tsx`, id `bo-suu-tap`, "Bộ sưu tập · Thức uống đặc trưng"), the two 3D cups (a wordless band),
  Menu · "Chọn một ly" (with its spotlight), the interlude (`interlude.tsx`, the v5 cover of the paper cup and
  Xoài Hạ Tuyết, a mood picture), Ưu đãi · "Ưu đãi thành viên", Cửa hàng · "Ghé thăm Boongee" (3D paper cup), and the
  footer's name set as wide as the page. Section headings (`SectionHeading`) are display size (up to 7rem) and rise
  out of a mask that leaves room for Vietnamese marks. The story and FAQ sections are gone (FAQ and its structured data removed 17/11/2026), and the page shows no
  counts (no "23 món, 32K – 65K", no per-group counts or starting prices; numbers in the reel and the menu only
  order the plates and groups). Section ids: `bo-suu-tap`, `ly`, `thuc-don`, `uu-dai`,
  `cua-hang`; the nav has "Bộ sưu tập" first. The site says **"Menu", never "Thực đơn"** (owner, 18/11/2026): the nav, the hero's "Xem menu", the
  section's eyebrow, "Xem toàn bộ menu", /menu's title and `<h1>` (all in `src/data/boongee.ts` but /menu's own
  metadata; the anchor stays `#thuc-don`, the route `/menu`). The 7-viewport flavour
  carousel and the interactive menu-board picker (`menu-picker.tsx`) were removed (the board came back static, 18/11/2026); the full menu with a photo and a description
  per dish lives on `/menu`.
- **The lookbook reel** (`src/components/lookbook-reel.tsx`, `src/data/featured.ts`): the menu board's featured drinks
  (`menu-featured.json`, in its order) as plates of their v5 photos, hung in one row like a gallery wall: tall plates
  with their words under, shorter ones with their words over, each numbered, with its group, name and short
  description; an intro card ("Bộ sưu tập" · **"Signature"**, owner, 21/11/2026, before "Thức uống đặc trưng") and a
  closing link to /menu. As served it
  is a native sideways row with snap (scroll padding keeps the margins), which is what reduced motion and no script
  get; the `reel` scene turns it into the sticky sideways walk.
- **The menu section** (`src/components/menu.tsx`, server, with `menu-spotlight.tsx`, client; 21/11/2026, replacing
  the printed-board layout of 18/11/2026): every drink by till group (numbered, under its monogram mark, a
  `GroupMark`) with its short description; the topping / sugar / ice strips at the foot (ink pill labels, names
  only); "Xem toàn bộ menu" beside the heading. From
  `lg` the spotlight stands sticky beside the list: the v5 still life of the drink in focus (the one under the mouse,
  or the row crossing the middle of the screen: one IntersectionObserver line), its group, name and description under it;
  pictures are put in only once their drink comes into focus (with the next one), as `getImageProps` props built on
  the server, and cross-fade once loaded; the focused row steps in (`data-active`, look.css). Decorative
  (`aria-hidden`): the list says everything. On phones each row carries a small 4:5 picture instead. `hasMenu`
  points to `/menu`.
- **The /menu page** (`src/app/menu/page.tsx`, `src/components/lookbook-gallery.tsx`; 16/11/2026, it replaced the
  old `/preview` and `/thuc-don`, which held invented copy and hard-coded prices): every dish on the till, combos
  included, group by group in the till's order, each with its lookbook studio photo (4:5), its name (Odoo) and its
  short description (`src/data/lookbook.ts` joins them, `src/lib/lookbook/join.ts`, tested). A photo opens in a
  modal `<dialog>` (arrows go through the dishes; Esc or the backdrop closes). A dish with no photo shows "Ảnh đang
  cập nhật"; a photo whose dish is not on the till is not shown. The photos are AI-made; since 21/11/2026 the site does
  not label them "Ảnh minh hoạ" (owner), and their alt is the dish's name. `npm run sync-lookbook` (`scripts/sync-lookbook.mjs`; sync-brand runs it too, right after it wipes
  `public/menu`) writes `public/menu/lookbook/*.<hash>.webp` and `src/data/lookbook.json` from
  `../brandkit/lookbook`: Odoo dish name → photo stem in `PHOTOS`, its v5 photo (`assets-v5/<stem>.png`, the
  "Tĩnh vật vải toan" set, 20/11/2026) when there is one, else a v3 photo (`assets-v3/<stem>.png`) for the stems in `V3`,
  else the v2 one (`assets/<stem>.jpg`); and the home page's covers (`COVERS`: `hero`, `interlude` from
  `v5/bia/`, each a wide WebP and a 4:5 cut round the cups at `centre`, with a 16 px blurred data URL; `covers` in
  lookbook.json, typed in `src/data/lookbook.ts`). The home page's menu links to it; it is in the sitemap.
  `next.config.ts` caches `/menu/:path+` immutable, not the page itself.
  Its header (17/11/2026): the group index as numbered hairline rows beside the Lottie, which plays straight on the
  page's pale blue wash (no frame, no card); the page's name "Menu" is an `sr-only` <h1> (owner: no visible title);
  no dish count, only "Cập nhật <date>". Groups are numbered light headings on a hairline.
  The Lottie (`src/components/menu-hero-lottie.tsx`, lottie-web's light SVG player,
  loaded in the browser only; 6 s since 17/11/2026, "Hương thành hoa"): a teapot pours into a silver paper
  cup while the four monogram marks grow up its face (a sprout at its foot, each mark budding from the one below
  and rising into the print's column order, edges still), two curls of steam rise and draw a hand-drawn
  five-petalled flower above it (not the logo); the loop: the flower bobs on its scent, the steam sways, the marks
  breathe bottom to top. Earlier versions (monogram on a paper cup, monogram column on the PP
  cup) are in `~/Documents/Boongee-luu-tru/2026-11-17/lottie-menu-hero-*`. Intro frames 0–48 once, then the
  loop 48–72; paused off screen; frame 48 still with reduced motion. Its source is
  `../brandkit/lottie/menu-hero.scene.mjs` (skill `hand-drawn-lottie`: 12 fps, ink Đen Than + one colour, silver `#CDD1D4` since 18/11/2026 (pastel blue before),
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
- **The offers are their printed pieces** (`src/components/offers.tsx`, `flip-card.tsx`): the brand kit's collateral,
  edition "Tĩnh vật · bạc trên trắng" since 21/11/2026 (silver and ink on white, large light numerals, the v5 still
  life on the posts; the Làng Mây edition before it is archived), built by `../brandkit/scripts/build_an_pham.py`
  from the same `collateral.json` (vouchers front and back, the loyalty card front and back, the weekly-offer post,
  an A4 poster, a story, a cup sticker), copied by sync-brand (or `npm run sync-collateral` alone) to
  `public/uu-dai/*.<hash>.png` (resized; URLs in `src/data/uu-dai.json`). Like the models, every picture sync-brand
  writes to `public/menu` and `public/uu-dai` is named after its content and cached immutable (next.config.ts), so a
  re-render is a new URL and no cache shows the old one. The section shows the weekly post, the loyalty card and both vouchers in one row from `lg`; each card
  turns over (`.flip` in look.css; instant with reduced motion), each voucher can be downloaded to show at the
  counter. The pictures carry the words, so every `alt` says them in full and the terms are also set as text.
- **Next: the interactive refactor** (`docs/interactive-landing-script.md`, the owner's go of 18/11/2026 for its
  look): three.js r187 `WebGPURenderer` (WebGL 2 fallback), TSL, `RenderPipeline`; the light follows the pointer; the
  3D becomes **"giấy thật, bạc thật"** (the GLBs' own PBR paper and metallic silver ink, lit by a softbox environment
  built in code; no black outline, no white rim, no refraction). The toon look below stays until that ships. The owner
  also chose the wordless story between the hero and the menu and the real gardenia in its "Hương" beat (18/11/2026).
  Step 0 is in (branch `redesign/interactive-webgpu`):
  - three and `@types/three` pinned at 0.187.0;
  - the WebGPU stage in `src/lib/stage/` (renderer, pipeline, softbox room, test switches, frame budget). ESLint
    forbids importing `three` there: only `three/webgpu`, `three/tsl`, `three/addons/…`, or the WebGL renderer
    would be bundled too. The pure maths it shares (quality tiers, `approach`) stays in `src/lib/cup-scene/`;
  - its bench `/lab` (`src/app/lab/`, `src/components/lab-bench.tsx`; noindex, not in the sitemap or the nav): the
    paper cup's `-pbr` model, a readout of backend, tier and frame times; `?webgl`, `?tier=full|light|low`,
    `?inspect`.
  - **The pipeline (`pipeline.ts`):** the scene is drawn on transparent black, tone mapped (PBR Neutral), laid over
    white (empty pixels stay #FFFFFF), and only then anti-aliased (TRAA keeps no alpha; FXAA below `full`).
  - **Phones:** WebGPU needs HTTPS, so test them on a Vercel preview or `next dev --experimental-https`.
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
- **Colours and the UI (owner, 18/11/2026: the brand's base is white and metallic silver; before, 17/11/2026: white,
  silver, pastel blue; before that the Làng Mây sticker UI).** The rules are `../brandkit/design-system/` (Design DNA
  and Design System v2: 70 % white · 20 % silver · 8 % ink · ≤ 2 % accent). Brand tokens are `--color-brand-<token>`
  (generated); `src/styles/look.css` adds the silver scale `silver-50 … 800` (`silver-600` is the print silver, Pantone
  877 C) and the metallic sheen `bg-sheen` (`--background-image-sheen`), and, in `@layer components` so utilities win,
  `.card-line` (white panel on a silver hairline), `.eyebrow` (tracked small caps after a short sheen rule),
  `.rule-sheen` (a short metallic rule), `.btn` with `data-variant="primary" | "outline"` (flat pill: white on ink,
  hover `silver-800`; or ink on a silver hairline, hover the metallic silver), `.flip`. The page stands on white; text is
  ink, secondary lines `text-silver-700`; headings light, set left (`<SectionHeading tagline title aside>`); the sheen
  only on rules and dividers, never on text, never animated. No pink and no blue in the UI (pastel blue lives only in
  photographs). The still lifes' canvas greige (#BDAFA3) is the pictures' stand-in and the phones' hero ground, never a
  UI colour elsewhere. Large type may be drawn as a silver outline (`.text-outline`, the marquee). The four monogram
  marks are crisp vectors in flat silver (owner, 21/11/2026: "làm nét 4 hoạ tiết hoa monogram"; `<MonogramMark>`,
  `<GroupMark>`: the cup print's own flat paths in `src/data/monogram.json`, written by `npm run sync-design-system`,
  filled with the current colour, `text-silver-*`; before, the menu board's painted marks as CSS masks, whose soft
  painted edge blurred). A glossy "chrome" silver tried the same day was reverted (owner: "không ổn"). Light only.
- **The hero** (`src/components/hero.tsx`, 21/11/2026, the redesign): the v5 cover with two paper cups
  (`../brandkit/lookbook/v5/bia/`: 16:9 for wide screens, its 3:2 twin cut to 4:5 round the cups for phones;
  written with a blurred stand-in by sync-lookbook as `covers.hero` in `src/data/lookbook.json`), alt in
  `hero.imageAlt`. One `<picture>` (art direction with `getImageProps`): only the cut that shows is fetched, eager, at
  high priority. From `lg` the picture fills the screen and the slogan ("Trà hương / thanh vị", up to 9vw: clear of
  the cups down to 1024 px) stands on the canvas left of the cups; below, the slogan comes first on the canvas's
  own greige (#BDAFA3) and the picture follows, its top melting into it. On load (CSS) the slogan's lines rise out
  of their masks, the rest fades up, the picture settles from a slow zoom. With motion allowed the section is
  150 svh (175 from `lg`) and its frame sticks while the `hero` scene draws the picture back into a framed canvas.
  No caption (a mood picture). The earlier hero (direction B "Sương sớm trên núi",
  the tea-hill fog photo, 17/11/2026) is no longer used; its JPEGs stay in `src/assets/images/`. The hero has no 3D
  (the `set` actor was removed 17/11/2026; CC0 models in `../brandkit/3d-nature/`, `toonMaterial({ tint })` stays).
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
