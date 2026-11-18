import {
  Color,
  DirectionalLight,
  HemisphereLight,
  type Material,
  Mesh,
  MeshBasicNodeMaterial,
  type Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  type RenderPipeline,
  Scene,
  type Texture,
} from "three/webgpu";
import { color, uv } from "three/tsl";
import { PBR_MODELS } from "@/lib/cup-scene/model";
import { approach } from "@/lib/cup-scene/motion";
import { QUALITY, type Tier } from "@/lib/cup-scene/quality";
import type { StageFlags } from "./flags";
import { judge, quantile, type Verdict } from "./frame-budget";
import { loadGlb, required } from "./load";
import { createPipeline } from "./pipeline";
import { type Backend, createGpu } from "./renderer";
import { softboxEnvironment } from "./room";

// The WebGPU stage's test bench (/lab; step 0 of docs/interactive-landing-script.md): the 16 oz paper cup in "giấy
// thật, bạc thật" (the print kit's own PBR materials: matte paper with its grain, metal silver ink) on the page's
// white, lit by the softbox room (room.ts). The pointer turns the room, so the sheen slides across the four marks.
// It times its frames and reports them with the backend and the tier, to measure phones before anything ships.

export interface LabInfo {
  readonly backend: Backend;
  readonly tier: Tier;
  readonly dpr: number;
  /** frame intervals (ms) over the last frames, after the warm-up */
  readonly p50: number;
  readonly p90: number;
  readonly frames: number;
  /** frame-budget.ts's judgement of the first window */
  readonly verdict: Verdict;
}

export interface LabOptions {
  readonly flags: StageFlags;
  readonly tier: Tier;
  readonly signal: AbortSignal;
  /** read on each frame, so a change of the OS setting applies at once */
  readonly reducedMotion: () => boolean;
  readonly onInfo: (info: LabInfo) => void;
}

export interface LabStage {
  resize(width: number, height: number): void;
  /** the pointer, 0–1 across the viewport */
  point(x: number): void;
  dispose(): void;
}

/** The camera (metres; the cup stands on the origin, its print toward +z) and the share of the view the cup fills. */
const VIEW = { fov: 26, height: 0.1, target: 0.074, fill: 0.62, cup: { width: 0.105, height: 0.16 } };
/** The room turns this far (radians) from one edge of the viewport to the other, and follows the pointer this fast (ms). */
const TURN = { range: 2, tau: 220 };
/** The contact shadow under the cup: its size (metres), darkness and colour. */
const SHADOW = { size: 0.2, opacity: 0.32, colour: "#5F6366" };
/** Light (three.js units): a key from the upper left, toward the viewer, and a soft fill. */
const LIGHT = { key: 1.6, keyAt: [-0.6, 1.1, 0.9], fill: 0.5, sky: "#FFFFFF", ground: "#CFD3D6" } as const;
/** Time before timing starts (shaders warming up), frames kept for the readout, readout interval (ms). */
const MEASURE = { warmupMs: 600, keep: 240, reportMs: 250 };

/** The camera's distance that fits the cup in the view at this aspect ratio (narrow phones fit its width). */
function distanceFor(aspect: number): number {
  const tan = Math.tan((VIEW.fov * Math.PI) / 360);
  const byHeight = VIEW.cup.height / VIEW.fill / (2 * tan);
  const byWidth = VIEW.cup.width / VIEW.fill / (2 * tan * aspect);
  return Math.max(byHeight, byWidth);
}

function contactShadow(): Mesh {
  const material = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  const fromCentre = uv().sub(0.5).length().mul(2); // 0 at the centre, 1 at the edge
  material.colorNode = color(new Color(SHADOW.colour));
  material.opacityNode = fromCentre.oneMinus().clamp(0, 1).pow(2).mul(SHADOW.opacity);
  const mesh = new Mesh(new PlaneGeometry(SHADOW.size, SHADOW.size), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.0005;
  return mesh;
}

function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if ((value as Texture | null)?.isTexture) (value as Texture).dispose();
  }
  material.dispose();
}

function disposeTree(root: Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    for (const material of [object.material].flat()) disposeMaterial(material);
  });
}

export async function createLabStage(canvas: HTMLCanvasElement, options: LabOptions): Promise<LabStage> {
  const { flags, tier, signal } = options;
  const model = PBR_MODELS.paper;
  const [gpu, glb] = await Promise.allSettled([
    createGpu(canvas, { forceWebGL: flags.forceWebGL, highPerformance: tier === "full" }),
    loadGlb(model.url, signal),
  ]);
  if (gpu.status === "rejected") throw gpu.reason;
  const { renderer, backend } = gpu.value;
  const scene = new Scene();
  let environment: Texture | null = null;
  let pipeline: RenderPipeline | null = null;

  function dispose(): void {
    renderer.setAnimationLoop(null);
    pipeline?.dispose();
    disposeTree(scene);
    environment?.dispose();
    renderer.dispose();
  }

  try {
    if (glb.status === "rejected") throw glb.reason;
    signal.throwIfAborted();
    scene.add(required(glb.value, model.root, model.url), contactShadow());
    environment = softboxEnvironment(renderer);
    scene.environment = environment;
    const key = new DirectionalLight("#FFFFFF", LIGHT.key);
    key.position.set(...LIGHT.keyAt);
    scene.add(key, new HemisphereLight(LIGHT.sky, LIGHT.ground, LIGHT.fill));

    const camera = new PerspectiveCamera(VIEW.fov, 1, 0.05, 20);
    const frame = (aspect: number) => {
      camera.aspect = aspect;
      camera.position.set(0, VIEW.height, distanceFor(aspect));
      camera.lookAt(0, VIEW.target, 0);
      camera.updateProjectionMatrix();
    };
    frame(1);
    pipeline = createPipeline(renderer, scene, camera, tier);
    if (flags.inspect) {
      const { Inspector } = await import("three/addons/inspector/Inspector.js");
      renderer.inspector = new Inspector();
    }
    await renderer.compileAsync(scene, camera); // before the first frame: no stall when it shows
    signal.throwIfAborted();

    let target = 0;
    let turn = 0;
    let last = 0;
    let started = 0;
    let lastReport = 0;
    let verdict: Verdict = "measuring";
    const judged: number[] = []; // the first window, for the verdict
    const recent: number[] = []; // the last frames, for the readout

    renderer.setAnimationLoop((now: number) => {
      const dt = last ? now - last : 16;
      last = now;
      started ||= now;
      const timed = now - started - MEASURE.warmupMs;
      if (timed > 0) {
        recent.push(dt);
        if (recent.length > MEASURE.keep) recent.shift();
        if (verdict === "measuring") {
          judged.push(dt);
          verdict = judge(judged, timed);
        }
      }
      turn = options.reducedMotion() ? target : approach(turn, target, dt, TURN.tau);
      scene.environmentRotation.y = turn;
      pipeline?.render();
      if (now - lastReport > MEASURE.reportMs) {
        lastReport = now;
        options.onInfo({
          backend,
          tier,
          dpr: renderer.getPixelRatio(),
          p50: quantile(recent, 0.5),
          p90: quantile(recent, 0.9),
          frames: recent.length,
          verdict,
        });
      }
    });

    return {
      resize(width, height) {
        if (width < 1 || height < 1) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY[tier].dprMax));
        renderer.setSize(width, height, false);
        frame(width / height);
      },
      point(x) {
        target = (x - 0.5) * TURN.range;
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
