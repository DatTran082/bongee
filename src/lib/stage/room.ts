import {
  BackSide,
  Color,
  DoubleSide,
  Mesh,
  MeshBasicNodeMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGPURenderer,
} from "three/webgpu";
import { color, mix, positionLocal, smoothstep } from "three/tsl";

/**
 * The light the silver ink mirrors (Design DNA: "ánh kim, không lấp lánh"): a soft grey room with one tall softbox
 * strip, baked into an environment map. Matte paper hardly notices it; the metal ink shows the room: mid grey at rest
 * (near the print's silver, Pantone 877 C), one soft bright band where it faces the strip, never a glint. Turning
 * the room (`scene.environmentRotation`) slides that band across the marks: the pointer does it.
 */
const ROOM = {
  /** floor, walls, ceiling: a vertical gradient on a sphere about the cup */
  floor: "#9A9EA1",
  wall: "#C4C8CB",
  ceiling: "#ECEEF0",
  /**
   * The softbox: metres, its brightness (HDR, white is 1), and where it stands (radians about the up axis; 0 = +z,
   * behind the camera, where the cup's front mirrors it). A little to the left: at rest the band lies on the left
   * marks, and turning the room sweeps it across the cluster.
   */
  strip: { width: 0.8, height: 6, intensity: 6, distance: 4, azimuth: -0.4 },
  /** blur of the baked map: a soft band, not a mirror image */
  blur: 0.05,
} as const;

export function softboxEnvironment(renderer: WebGPURenderer): Texture {
  const room = new Scene();
  const shellMaterial = new MeshBasicNodeMaterial({ side: BackSide });
  const up = positionLocal.normalize().y;
  shellMaterial.colorNode = mix(
    mix(color(new Color(ROOM.floor)), color(new Color(ROOM.wall)), smoothstep(-0.5, 0.05, up)),
    color(new Color(ROOM.ceiling)),
    smoothstep(0.35, 0.95, up),
  );
  const shell = new Mesh(new SphereGeometry(10, 48, 24), shellMaterial);
  const { strip: s } = ROOM;
  const stripMaterial = new MeshBasicNodeMaterial({ color: new Color().setScalar(s.intensity), side: DoubleSide });
  const strip = new Mesh(new PlaneGeometry(s.width, s.height), stripMaterial);
  strip.position.set(Math.sin(s.azimuth) * s.distance, 0.6, Math.cos(s.azimuth) * s.distance);
  strip.lookAt(0, 0.6, 0);
  room.add(shell, strip);
  const pmrem = new PMREMGenerator(renderer);
  try {
    return pmrem.fromScene(room, ROOM.blur).texture; // the renderer is initialised (renderer.ts): no async variant needed
  } finally {
    pmrem.dispose();
    for (const mesh of [shell, strip]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
  }
}
