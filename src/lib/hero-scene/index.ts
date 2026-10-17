import {
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  type Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Raycaster,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import tokens from "@/data/brand-tokens.json";
import { createCream } from "./cream";
import { AXIS, CAMERA, FRAME, LIDDED_CUP, LILY, LILY_FACING, LOGS, OPEN_CUP, type Placement } from "./layout";
import { disposeScene } from "./dispose";
import { createLily } from "./lily";
import { CUP_MODEL } from "./model";
import { createLog, createStone } from "./props";
import { Turntable } from "./turntable";

/**
 * The press-button strap on the lid swings open on its hinge (the `lid-strap` node's origin), past upright and
 * forward over the front edge, so it stays inside the frame above the lid.
 */
const STRAP_OPEN = 2.6;
const STRAP_MS = 420;
/** Longest step (ms) an animation takes per frame: slow devices still finish on time, a stalled tab does not leap. */
const MAX_STEP = 250;
/** How much of the environment the metallic ink reflects (the paper takes 1). */
const PRINT_SHEEN = 3.6;

export interface HeroSceneOptions {
  /** read on each use, so a change of the OS setting applies at once */
  readonly reducedMotion: () => boolean;
  /** the strap was opened or closed (by a tap, a click or the keyboard) */
  readonly onStrapChange: (open: boolean) => void;
  /** aborts the set-up (the component unmounted while the model was loading) */
  readonly signal: AbortSignal;
}

export interface HeroScene {
  /** Sizes the drawing buffer to the canvas's CSS size and frames the set in the strip from `subjectLeft` (px). */
  resize(width: number, height: number, subjectLeft: number): void;
  turnBy(radians: number): void;
  reset(): void;
  /** Opens or closes the strap over the lid's drinking hole. */
  toggleStrap(): void;
  dispose(): void;
}

function required(root: Object3D, name: string): Object3D {
  const node = root.getObjectByName(name);
  if (!node) throw new Error(`${CUP_MODEL} has no "${name}" node: rebuild brandkit/3d and run npm run sync-brand.`);
  return node;
}

function place<T extends Object3D>(object: T, at: Placement): T {
  object.position.set(at.x, at.y, at.z);
  object.rotation.y = at.turn;
  return object;
}

const easeInOut = (t: number) => t * t * (3 - 2 * t);

/** The two cups: the open one wearing the cream dome, the lidded one with its strap and a hit target over its lid. */
function cups(template: Object3D) {
  // the silver ink is metal: let it take more of the environment, so it reads as light satin silver, not grey
  template.traverse((object) => {
    if (object instanceof Mesh && object.material instanceof MeshStandardMaterial && object.material.metalnessMap) {
      object.material.envMapIntensity = PRINT_SHEEN;
    }
  });
  const open = template.clone(true);
  required(open, "lid").removeFromParent();
  required(open, "drink").removeFromParent();
  open.add(createCream());
  const lidded = template.clone(true);
  const strap = required(lidded, "lid-strap");
  // an invisible drum over the lid, bigger than the strap, so a finger finds it
  const lidTarget = new Mesh(new CylinderGeometry(0.052, 0.052, 0.032, 24), new MeshBasicMaterial({ visible: false }));
  lidTarget.position.y = required(lidded, "lid").position.y + 0.012;
  lidded.add(lidTarget);
  for (const cup of [open, lidded]) {
    cup.traverse((object) => {
      if (object instanceof Mesh) object.castShadow = object.receiveShadow = true;
    });
  }
  return { open: place(open, OPEN_CUP), lidded: place(lidded, LIDDED_CUP), strap, lidTarget };
}

function lights(scene: Scene): void {
  // soft daylight from the upper left, as in the photo; the pink of the backdrop bounces up from below
  scene.add(new HemisphereLight("#ffffff", tokens["pink-500"], 0.4));
  const key = new DirectionalLight("#fffaf4", 2.7);
  key.position.set(AXIS.x - 0.9, 1.3, AXIS.z + 1.1);
  key.target.position.set(AXIS.x, 0.08, AXIS.z);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.intensity = 0.55;
  key.shadow.radius = 5;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.0015;
  Object.assign(key.shadow.camera, { left: -0.3, right: 0.3, top: 0.3, bottom: -0.3, near: 0.5, far: 3.5 });
  const fill = new DirectionalLight("#fff4f2", 0.3);
  fill.position.set(AXIS.x + 1, 0.4, AXIS.z + 0.6);
  scene.add(key, key.target, fill);
}

export async function createHeroScene(canvas: HTMLCanvasElement, options: HeroSceneOptions): Promise<HeroScene> {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(CUP_MODEL);
  options.signal.throwIfAborted();

  const scene = new Scene();
  const set = new Group(); // turns about AXIS
  set.position.set(AXIS.x, 0, AXIS.z);
  const props = new Group();
  props.position.set(-AXIS.x, 0, -AXIS.z);
  set.add(props);
  scene.add(set);
  const { open, lidded, strap, lidTarget } = cups(required(gltf.scene, "boongee-paper-16oz"));
  const lily = place(createLily(), LILY);
  lily.quaternion
    .setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...LILY_FACING).normalize())
    .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), LILY.turn));
  props.add(createStone(), ...LOGS.map(createLog), open, lidded, lily);
  lights(scene);

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  const pmrem = new PMREMGenerator(renderer);
  const turntable = new Turntable(canvas, {
    reducedMotion: options.reducedMotion,
    onChange: () => invalidate(),
    onTap: (x, y) => {
      if (hitsLid(x, y)) toggleStrap();
    },
    onHover: (x, y) => {
      canvas.style.cursor = hitsLid(x, y) ? "pointer" : "grab";
    },
    onDragChange: (dragging) => {
      canvas.style.cursor = dragging ? "grabbing" : "grab";
    },
  });
  const camera = new PerspectiveCamera(15, 1, 0.1, 10);
  camera.position.set(AXIS.x, CAMERA.height, AXIS.z + CAMERA.distance);
  camera.lookAt(AXIS.x, CAMERA.target, AXIS.z);
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const strapRest = strap.rotation.x;
  let strapGoal = 0;
  let strapT = 0;
  let frame = 0;
  let last = 0;

  function hitsLid(clientX: number, clientY: number): boolean {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObject(lidTarget).length > 0;
  }

  function stepStrap(dt: number): boolean {
    if (strapT === strapGoal) return false;
    const delta = dt / STRAP_MS;
    strapT = strapGoal > strapT ? Math.min(strapGoal, strapT + delta) : Math.max(strapGoal, strapT - delta);
    return strapT !== strapGoal;
  }

  function tick(now: number): void {
    frame = 0;
    const dt = last ? Math.min(MAX_STEP, now - last) : 16;
    const moving = [turntable.step(dt), stepStrap(dt)].some(Boolean);
    set.rotation.y = turntable.angle;
    strap.rotation.x = strapRest + STRAP_OPEN * easeInOut(strapT);
    renderer.render(scene, camera);
    last = moving ? now : 0;
    if (moving) invalidate();
  }

  function invalidate(): void {
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function toggleStrap(): void {
    strapGoal = 1 - strapGoal;
    if (options.reducedMotion()) strapT = strapGoal;
    options.onStrapChange(strapGoal === 1);
    invalidate();
  }

  function dispose(): void {
    cancelAnimationFrame(frame);
    turntable.dispose();
    canvas.removeEventListener("webglcontextrestored", invalidate);
    disposeScene(scene);
    pmrem.dispose();
    renderer.dispose();
  }

  try {
    renderer.setClearColor(0x000000, 0); // the hero's own pink shows through
    renderer.toneMapping = NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    // a neutral studio environment: the silver ink is real metal and needs something to reflect
    const room = new RoomEnvironment();
    scene.environment = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    scene.environmentIntensity = 0.5;
    canvas.addEventListener("webglcontextrestored", invalidate);
    canvas.style.cursor = "grab";
    await renderer.compileAsync(scene, camera);
    options.signal.throwIfAborted();
  } catch (error) {
    dispose();
    throw error;
  }

  return {
    resize(width, height, subjectLeft) {
      if (width < 1 || height < 1) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // the window may have moved to another screen
      renderer.setSize(width, height, false);
      const left = MathUtils.clamp(subjectLeft, 0, width * 0.6);
      const subjectWidth = width - left;
      const centre = left + subjectWidth / 2;
      // fit FRAME in the subject strip, then shift the projection so the camera's axis falls on the strip's centre
      const needed = Math.max(FRAME.height, (FRAME.width * height) / subjectWidth);
      const fullWidth = 2 * Math.max(centre, width - centre);
      camera.fov = 2 * MathUtils.radToDeg(Math.atan(needed / 2 / CAMERA.distance));
      camera.aspect = fullWidth / height;
      camera.setViewOffset(fullWidth, height, fullWidth / 2 - centre, 0, width, height);
      invalidate();
    },
    turnBy: (radians) => turntable.turnBy(radians),
    reset: () => turntable.reset(),
    toggleStrap,
    dispose,
  };
}
