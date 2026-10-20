import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { STONE, WOOD } from "./palette";
import { between, pick, type Random } from "../random";

// Procedural textures for the props, drawn on 2D canvases at start-up (no image downloads). Each tiles seamlessly
// where it wraps: marks that cross an edge are drawn again on the other side.

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  const context = element.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available.");
  return [element, context];
}

function texture(element: HTMLCanvasElement, wrap: boolean): CanvasTexture {
  const map = new CanvasTexture(element);
  map.colorSpace = SRGBColorSpace;
  map.anisotropy = 4;
  if (wrap) map.wrapS = map.wrapT = RepeatWrapping;
  return map;
}

/** Calls draw at (x, y) and at its copies across the edges it comes within `reach` of, so the tile wraps. */
function wrapped(x: number, y: number, reach: number, w: number, h: number, draw: (x: number, y: number) => void) {
  for (const dx of [-w, 0, w]) {
    for (const dy of [-h, 0, h]) {
      const cx = x + dx;
      const cy = y + dy;
      if (cx > -reach && cx < w + reach && cy > -reach && cy < h + reach) draw(cx, cy);
    }
  }
}

/** Pale speckled granite: a beige ground, faint mottling, then dark, white and rosy grains. Tiles both ways. */
export function graniteTexture(random: Random): CanvasTexture {
  const size = 512;
  const [element, ctx] = canvas(size, size);
  ctx.fillStyle = STONE.ground;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = STONE.mottle;
  // a mark's shape is drawn once per mark, so its copies across the edges match and the tile stays seamless
  for (let i = 0; i < 70; i++) {
    const r = between(random, 12, 46);
    const squash = between(random, 0.5, 1);
    const angle = random() * Math.PI;
    ctx.globalAlpha = between(random, 0.08, 0.2);
    wrapped(random() * size, random() * size, r, size, size, (x, y) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * squash, angle, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  // sparse grains, most of them pale: the stone reads as pale beige with dark flecks, not as grey
  for (let i = 0; i < 2600; i++) {
    const r = between(random, 0.9, 2.6) * (random() < 0.05 ? 2.2 : 1);
    const squash = between(random, 0.5, 1);
    const angle = random() * Math.PI;
    const dark = random() < 0.35;
    ctx.globalAlpha = dark ? between(random, 0.5, 0.85) : between(random, 0.3, 0.6);
    ctx.fillStyle = pick(random, dark ? STONE.grains.slice(0, 2) : STONE.grains.slice(2));
    wrapped(random() * size, random() * size, r, size, size, (x, y) => {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * squash, angle, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.globalAlpha = 1;
  return texture(element, true);
}

/** The side of a barked-off log: fine vertical grain with a few dark fissures. Wraps round the log (left ↔ right). */
export function woodSideTexture(random: Random): CanvasTexture {
  const [w, h] = [1024, 1024];
  const [element, ctx] = canvas(w, h);
  ctx.fillStyle = WOOD.side;
  ctx.fillRect(0, 0, w, h);
  const line = (x0: number, width: number, colour: string, alpha: number, from: number, to: number) => {
    const amp = between(random, 1, 6);
    const freq = between(random, 0.004, 0.012);
    const phase = random() * Math.PI * 2;
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    for (const shift of [-w, 0, w]) {
      ctx.beginPath();
      for (let y = from; y <= to; y += 8) {
        const x = x0 + shift + amp * Math.sin(y * freq + phase);
        if (y === from) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };
  for (let i = 0; i < 260; i++) {
    line(random() * w, between(random, 0.6, 3.2), pick(random, WOOD.grain), between(random, 0.15, 0.55), 0, h);
  }
  for (let i = 0; i < 14; i++) {
    const from = random() * h * 0.7;
    line(random() * w, between(random, 1.2, 2.6), WOOD.fissure, between(random, 0.35, 0.7), from, from + h * 0.3);
  }
  ctx.globalAlpha = 1;
  return texture(element, true);
}

/** A sawn log end: wobbly growth rings round an off-centre pith, two checks (radial cracks), a darker edge. */
export function woodTopTexture(random: Random): CanvasTexture {
  const size = 512;
  const half = size / 2;
  const [element, ctx] = canvas(size, size);
  ctx.fillStyle = WOOD.top;
  ctx.fillRect(0, 0, size, size);
  const cx = half + between(random, -24, 24);
  const cy = half + between(random, -24, 24);
  const phase = random() * Math.PI * 2;
  ctx.strokeStyle = WOOD.ring;
  for (let r = 5; r < size * 0.7; r += between(random, 4, 10)) {
    ctx.globalAlpha = between(random, 0.25, 0.6);
    ctx.lineWidth = between(random, 0.8, 2.4);
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
      const rr = r * (1 + 0.035 * Math.sin(3 * a + phase) + 0.02 * Math.sin(5 * a - phase));
      const x = cx + rr * Math.cos(a);
      const y = cy + rr * Math.sin(a);
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = WOOD.fissure;
  for (let i = 0; i < 2; i++) {
    const a = random() * Math.PI * 2;
    const length = half * between(random, 0.45, 0.8);
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = between(random, 1.2, 2.2);
    ctx.beginPath();
    ctx.moveTo(cx + 10 * Math.cos(a), cy + 10 * Math.sin(a));
    ctx.lineTo(cx + length * Math.cos(a + 0.05), cy + length * Math.sin(a + 0.05));
    ctx.stroke();
  }
  // the cap's UVs map its rim onto the inscribed circle: darken just inside it
  const edge = ctx.createRadialGradient(half, half, half * 0.86, half, half, half);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, WOOD.edge);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 1;
  return texture(element, false);
}
