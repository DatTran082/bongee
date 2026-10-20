import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { between, pick, type Random } from "./random";

// Textures for the grapes, drawn on canvases at start-up: the skin as an equirectangular map round the berry
// (a yellow-green ground, darker mottling, a few fine veins, pale speckles and the waxy bloom's soft lightness
// at the top), its roughness and bump maps from the same marks, and the cut face of a half.

const SKIN = { w: 512, h: 256 };
const FLESH = 256;
const COLOURS = {
  skin: "#a7cf47",
  deep: ["#8fb63a", "#9bc342", "#7fa634"],
  pale: ["#c9e37a", "#d8ec8c"],
  vein: "#8aae36",
  bloom: "#e2f0b8",
  flesh: "#d7e98a",
  fleshDeep: "#c2d972",
  fibre: "#b7d066",
  seed: "#9fae52",
};

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement("canvas");
  element.width = w;
  element.height = h;
  const ctx = element.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available.");
  return [element, ctx];
}

function texture(element: HTMLCanvasElement, colour: boolean): CanvasTexture {
  const map = new CanvasTexture(element);
  if (colour) map.colorSpace = SRGBColorSpace;
  map.wrapS = RepeatWrapping; // the equirect seam at u = 0 / 1
  map.anisotropy = 4;
  return map;
}

/** Draws `count` soft blotches, each also across the left/right seam so the map wraps. */
function blotches(
  ctx: CanvasRenderingContext2D,
  random: Random,
  count: number,
  colours: readonly string[],
  size: [number, number],
  alpha: [number, number],
) {
  for (let i = 0; i < count; i++) {
    const x = random() * SKIN.w;
    const y = random() * SKIN.h;
    const r = between(random, size[0], size[1]);
    ctx.globalAlpha = between(random, alpha[0], alpha[1]);
    ctx.fillStyle = pick(random, colours);
    for (const dx of [-SKIN.w, 0, SKIN.w]) {
      ctx.beginPath();
      ctx.ellipse(x + dx, y, r, r * between(random, 0.6, 1), random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

export interface GrapeMaps {
  readonly map: CanvasTexture;
  readonly roughnessMap: CanvasTexture;
  readonly bumpMap: CanvasTexture;
  readonly flesh: CanvasTexture;
  dispose(): void;
}

export function grapeTextures(random: Random): GrapeMaps {
  // the skin's colour
  const [skin, ctx] = canvas(SKIN.w, SKIN.h);
  const ground = ctx.createLinearGradient(0, 0, 0, SKIN.h);
  ground.addColorStop(0, COLOURS.bloom); // the stem end, under the waxy bloom
  ground.addColorStop(0.2, COLOURS.skin);
  ground.addColorStop(0.85, COLOURS.skin);
  ground.addColorStop(1, COLOURS.deep[2]);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, SKIN.w, SKIN.h);
  blotches(ctx, random, 90, COLOURS.deep, [14, 48], [0.08, 0.2]);
  blotches(ctx, random, 60, COLOURS.pale, [8, 30], [0.08, 0.18]);
  ctx.strokeStyle = COLOURS.vein;
  for (let i = 0; i < 26; i++) {
    // veins run down from the stem end, wandering
    const x0 = random() * SKIN.w;
    ctx.globalAlpha = between(random, 0.1, 0.25);
    ctx.lineWidth = between(random, 0.8, 1.8);
    for (const dx of [-SKIN.w, 0, SKIN.w]) {
      ctx.beginPath();
      ctx.moveTo(x0 + dx, between(random, 0, 30));
      let x = x0 + dx;
      for (let y = 30; y < SKIN.h * between(random, 0.5, 0.95); y += 12) {
        x += between(random, -5, 5);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  blotches(ctx, random, 500, [COLOURS.pale[1], "#eef8c8"], [0.6, 1.8], [0.25, 0.6]); // speckles

  // roughness: the bloom is matte, the skin between it glossy; the speckles a little rougher
  const [rough, rctx] = canvas(SKIN.w, SKIN.h);
  const rg = rctx.createLinearGradient(0, 0, 0, SKIN.h);
  rg.addColorStop(0, "#9a9a9a");
  rg.addColorStop(0.25, "#4a4a4a");
  rg.addColorStop(1, "#5a5a5a");
  rctx.fillStyle = rg;
  rctx.fillRect(0, 0, SKIN.w, SKIN.h);
  rctx.globalAlpha = 1;
  const roughSeed = random();
  blotches(rctx, random, 300, ["#8a8a8a", "#707070"], [1, 6], [0.2, 0.5]);
  void roughSeed;

  // bump: the mottling and the speckles, faint
  const [bump, bctx] = canvas(SKIN.w, SKIN.h);
  bctx.fillStyle = "#808080";
  bctx.fillRect(0, 0, SKIN.w, SKIN.h);
  blotches(bctx, random, 120, ["#8c8c8c", "#747474"], [10, 40], [0.3, 0.6]);
  blotches(bctx, random, 400, ["#a0a0a0"], [0.6, 1.6], [0.5, 0.9]);

  // the cut face: pale translucent flesh, fibres radiating from a lighter centre, the seed cavity
  const [flesh, fctx] = canvas(FLESH, FLESH);
  const c = FLESH / 2;
  const radial = fctx.createRadialGradient(c, c, 4, c, c, c);
  radial.addColorStop(0, "#e9f3b0");
  radial.addColorStop(0.55, COLOURS.flesh);
  radial.addColorStop(1, COLOURS.fleshDeep);
  fctx.fillStyle = radial;
  fctx.fillRect(0, 0, FLESH, FLESH);
  fctx.strokeStyle = COLOURS.fibre;
  for (let i = 0; i < 140; i++) {
    const a = random() * Math.PI * 2;
    const r0 = between(random, 10, 40);
    const r1 = between(random, r0 + 20, c);
    fctx.globalAlpha = between(random, 0.15, 0.4);
    fctx.lineWidth = between(random, 0.6, 1.6);
    fctx.beginPath();
    fctx.moveTo(c + r0 * Math.cos(a), c + r0 * Math.sin(a));
    fctx.lineTo(
      c + r1 * Math.cos(a + between(random, -0.05, 0.05)),
      c + r1 * Math.sin(a + between(random, -0.05, 0.05)),
    );
    fctx.stroke();
  }
  fctx.globalAlpha = 0.55;
  fctx.fillStyle = COLOURS.seed;
  fctx.beginPath();
  fctx.ellipse(c, c, 11, 16, 0.4, 0, Math.PI * 2);
  fctx.fill();
  fctx.globalAlpha = 1;

  const maps = {
    map: texture(skin, true),
    roughnessMap: texture(rough, false),
    bumpMap: texture(bump, false),
    flesh: texture(flesh, true),
  };
  return {
    ...maps,
    dispose() {
      for (const t of Object.values(maps)) t.dispose();
    },
  };
}
