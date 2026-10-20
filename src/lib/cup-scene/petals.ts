import { CanvasTexture, Group, Sprite, SpriteMaterial, SRGBColorSpace } from "three";
import { depthFactor, pxPerMetre, viewAt } from "./fit";
import { wrap } from "./motion";
import { between, type Random } from "./random";

// The logo flower, floating behind the cup at several depths. Each mark is fixed to the page in the world (it moves
// with a scroll by the same metres the page does), so the farther ones move less on screen: parallax. A mark that
// leaves the view at its depth comes back on the other side, so the page can be any length.

const TEXTURE_PX = 160;
/** On-screen size of a mark, px, and the depths it can lie at (metres behind the cup's plane). */
const SIZE_PX = { min: 22, max: 52 };
const DEPTH = { near: -0.5, far: -1.6 };
const OPACITY = 0.45;
/** Slow drift when motion is allowed: metres at depth, and radians of spin per second. */
const DRIFT = { amplitude: 0.025, hz: 0.05, spin: 0.08 };

interface Mark {
  readonly sprite: Sprite;
  /** place in the view at its depth, 0 … 1 across and down */
  readonly u: number;
  readonly v: number;
  readonly z: number;
  readonly px: number;
  readonly phase: number;
}

export interface Petals {
  readonly group: Group;
  /** Lays the marks out for the page's scroll (px) at `time` (s); `dt` (s) of drift, or 0 to hold still. */
  update(scrollY: number, time: number, dt: number, viewportWidth: number, viewportHeight: number): void;
  dispose(): void;
}

/** The flower SVG drawn in `colour` on a square canvas (the SVG's own fill is ink). */
async function flowerTexture(url: string, colour: string, signal: AbortSignal): Promise<CanvasTexture> {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  signal.throwIfAborted();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEXTURE_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available.");
  const scale = Math.min(TEXTURE_PX / image.width, TEXTURE_PX / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (TEXTURE_PX - w) / 2, (TEXTURE_PX - h) / 2, w, h);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, TEXTURE_PX, TEXTURE_PX);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export async function createPetals(
  flowerUrl: string,
  colour: string,
  count: number,
  random: Random,
  signal: AbortSignal,
): Promise<Petals> {
  const map = await flowerTexture(flowerUrl, colour, signal);
  const group = new Group();
  const marks: Mark[] = Array.from({ length: count }, () => {
    const sprite = new Sprite(new SpriteMaterial({ map, transparent: true, opacity: OPACITY, depthWrite: false }));
    sprite.material.rotation = between(random, 0, Math.PI * 2);
    group.add(sprite);
    return {
      sprite,
      u: random(),
      v: random(),
      z: between(random, DEPTH.far, DEPTH.near),
      px: between(random, SIZE_PX.min, SIZE_PX.max),
      phase: between(random, 0, Math.PI * 2),
    };
  });
  return {
    group,
    update(scrollY, time, dt, viewportWidth, viewportHeight) {
      const scrolled = scrollY / pxPerMetre(viewportHeight); // metres the page has moved up
      const drift = dt > 0;
      for (const mark of marks) {
        const view = viewAt(mark.z, viewportWidth, viewportHeight);
        const sway = drift ? DRIFT.amplitude * Math.sin(2 * Math.PI * DRIFT.hz * time + mark.phase) : 0;
        const x = (mark.u - 0.5) * view.width + sway;
        const y = wrap((mark.v - 0.5) * view.height - scrolled, view.height);
        mark.sprite.position.set(x, y, mark.z);
        const size = (mark.px / pxPerMetre(viewportHeight)) * depthFactor(mark.z);
        mark.sprite.scale.set(size, size, 1);
        if (drift) mark.sprite.material.rotation += DRIFT.spin * dt * Math.sin(mark.phase);
      }
    },
    dispose() {
      for (const mark of marks) mark.sprite.material.dispose();
      map.dispose();
    },
  };
}
