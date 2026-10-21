import { CanvasTexture, Group, SRGBColorSpace, Sprite, SpriteMaterial } from "three";
import tokens from "@/data/brand-tokens.json";
import { between, type Random } from "../random";

// The four-pointed sparkles a game asset scatters round a fresh drink: flat white stars about a cup, each twinkling
// (growing and shrinking) on its own beat. With reduced motion they hold still at their resting size.

/** Where they hang (metres from the cup's middle), their size and their beat (hertz). */
const SPREAD = { radius: [0.055, 0.085] as const, y: [-0.07, 0.09] as const };
const SIZE = [0.008, 0.014] as const;
const HZ = [0.35, 0.7] as const;

/** A four-pointed star, drawn once on a canvas. */
function starTexture(): CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available.");
  const c = size / 2;
  const waist = size * 0.07;
  ctx.fillStyle = tokens.cloud;
  ctx.beginPath();
  ctx.moveTo(c, 0);
  ctx.quadraticCurveTo(c + waist, c - waist, size, c);
  ctx.quadraticCurveTo(c + waist, c + waist, c, size);
  ctx.quadraticCurveTo(c - waist, c + waist, 0, c);
  ctx.quadraticCurveTo(c - waist, c - waist, c, 0);
  ctx.fill();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export interface Sparkles {
  readonly group: Group;
  /** Twinkles them for `time` (s); `still` holds them at rest. */
  update(time: number, still: boolean): void;
  dispose(): void;
}

export function createSparkles(random: Random, count: number): Sparkles {
  const texture = starTexture();
  const material = new SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const group = new Group();
  group.name = "sparkles";
  const stars = Array.from({ length: count }, () => {
    const sprite = new Sprite(material);
    const a = between(random, 0, Math.PI * 2);
    const r = between(random, ...SPREAD.radius);
    sprite.position.set(r * Math.cos(a), between(random, ...SPREAD.y), r * Math.sin(a));
    sprite.renderOrder = 6;
    group.add(sprite);
    return { sprite, size: between(random, ...SIZE), hz: between(random, ...HZ), phase: random() * Math.PI * 2 };
  });
  const update = (time: number, still: boolean) => {
    for (const star of stars) {
      const beat = still ? 0.75 : 0.5 + 0.5 * Math.sin(2 * Math.PI * star.hz * time + star.phase);
      star.sprite.scale.setScalar(Math.max(0.0001, star.size * beat));
    }
  };
  update(0, true);
  return {
    group,
    update,
    dispose() {
      texture.dispose();
      material.dispose();
    },
  };
}
