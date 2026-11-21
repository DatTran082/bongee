import {
  Color,
  DirectionalLight,
  HemisphereLight,
  NoToneMapping,
  type Object3D,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { type GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import tokens from "@/data/brand-tokens.json";
import { Actor, type ActorSpec, type CupPlacement, type Frame } from "./actor";
import { ACTORS, type ActorName } from "./actors";
import { disposeScene } from "./dispose";
import { DISTANCE, FOV } from "./fit";
import { MODELS, NODES } from "./model";
import { livePosesVersion } from "./live-pose";
import { needsRedraw } from "./motion";
import { qualityFor } from "./quality";
import { seeded } from "./random";
import { createSplash, type Splash } from "./splash";
import { toonCup } from "./toon/cups";
import { setOutlineSize } from "./toon/outline";
import { Lean } from "./steppers";
import type { CupTarget } from "./track";

// The 3D stage: a canvas behind the page with its actors on it, each in its section's slot as the page scrolls
// (track.ts, actor.ts), posed by the page's scroll timeline where it has one (live-pose.ts): the frosted PP cup of
// grape tea with grapes and ice in it and floating round it (splash.ts) and the lidded paper cup, side by side in
// the cups section; a second paper cup in the visit section. Everything is drawn as a smooth stylized game asset (toon/: the Làng Mây edition's toon
// rules): soft cel bands, sticker outlines, flat white highlights. No flowers drift behind them (the owner took them
// out, 22/10/2026), and no sparkles twinkle round them (the owner, 27/10/2026). The canvas is transparent, so the page's painted scenery (sky, clouds)
// stays behind the actors. A drag turns an actor, a tap on a lid flips its strap,
// the keyboard does both. With reduced motion nothing moves on its own: everything sits in its slot, follows the
// scroll, and frames are drawn only when something changed.

export { ACTORS, type ActorName };

/** Longest step (ms) an animation takes per frame: slow devices still finish on time, a stalled tab does not leap. */
const MAX_STEP = 250;
/** The actors lean against the scroll: radians per px/ms of scroll speed, the most, the smoothing (ms). */
const LEAN = { perSpeed: 0.05, max: 0.14, tau: 90 };
const SPLASH_SEED = 19;
const CLEAR = new Color(tokens["bg"]); // the page's cream ground
/** Idle motion and flight of the cups: they float, and a drag turns them. */
const CUP_MOTION = { bob: 0.016, sway: 0.08, roll: 0.02, hz: 0.24, spin: 1.1, turnable: true };
/** The PP cup's lid rises this far (metres) in a slot that asks for it. */
const PP_LID_LIFT = 0.055;
/** The key light's direction: from the upper left, toward the viewer. */
const KEY = new Vector3(-0.9, 1.3, 1.1);
/** Light levels (no tone mapping): the key's lit band shows a surface at about its own colour, the shade ~ 70 %. */
const LIGHT = { key: 2.3, ambient: 1.05 };
/** The shade side's colour: a neutral silver (the brand's base is white and silver, 18/11/2026; lilac, then blue before). */
const SHADE = "#DFE2E5";

export type { CupPlacement };

export interface CupSceneOptions {
  /** read on each use, so a change of the OS setting applies at once */
  readonly reducedMotion: () => boolean;
  /** each actor's place for the page's scroll position (track.ts); a missing or null actor has no slot */
  readonly measure: () => Record<string, CupTarget | null>;
  readonly scrollY: () => number;
  /** an actor's strap was opened or closed (by a tap, a click or the keyboard) */
  readonly onStrapChange: (actor: ActorName, open: boolean) => void;
  /** where an actor is after each frame, for the element that takes its pointer */
  readonly onPlace: (actor: ActorName, place: CupPlacement | null) => void;
  /** aborts the set-up (the component unmounted while the models were loading) */
  readonly signal: AbortSignal;
}

export interface CupScene {
  /** Sizes the drawing buffer to the canvas's CSS size (the viewport) and draws. */
  resize(width: number, height: number): void;
  /** The page's layout changed under the slots: measure them again on the next frame. */
  invalidate(): void;
  turnBy(actor: ActorName, radians: number): void;
  reset(actor: ActorName): void;
  /** Opens or closes the actor's strap over its lid's drinking hole. */
  toggleStrap(actor: ActorName): void;
  dispose(): void;
}

function required(root: Object3D, name: string, url: string): Object3D {
  const node = root.getObjectByName(name);
  if (!node) throw new Error(`${url} has no "${name}" node: rebuild brandkit/3d and run npm run sync-brand.`);
  return node;
}

/** Fetches a GLB (abortable, so an unmount during the download stops it) and parses it. */
async function loadScene(url: string, signal: AbortSignal): Promise<Object3D> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  signal.throwIfAborted();
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await new Promise<GLTF>((resolve, reject) => loader.parse(buffer, "", resolve, reject));
  return gltf.scene;
}

async function loadCup(model: { url: string; root: string }, signal: AbortSignal): Promise<Object3D> {
  return required(await loadScene(model.url, signal), model.root, model.url);
}

/**
 * Compiles every shader the stage may need, hidden parts too (compileAsync skips what is not visible: a part shown
 * later would compile mid-scroll, the first time it shows, and stall that frame).
 */
async function compileAll(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera): Promise<void> {
  const hidden: Object3D[] = [];
  scene.traverse((object) => {
    if (!object.visible) {
      hidden.push(object);
      object.visible = true;
    }
  });
  try {
    await renderer.compileAsync(scene, camera);
  } finally {
    for (const object of hidden) object.visible = false;
  }
}

const sameTarget = (a: CupTarget | null, b: CupTarget | null) =>
  a === b ||
  (!!a &&
    !!b &&
    a.x === b.x &&
    a.y === b.y &&
    a.size === b.size &&
    a.room === b.room &&
    a.turn === b.turn &&
    a.tilt === b.tilt &&
    a.lid === b.lid &&
    a.strap === b.strap &&
    a.flight === b.flight);

const sameTargets = (a: Record<string, CupTarget | null>, b: Record<string, CupTarget | null>) =>
  ACTORS.every((name) => sameTarget(a[name] ?? null, b[name] ?? null));

/** This device's quality (quality.ts), read once. */
function deviceQuality() {
  const { deviceMemory } = navigator as Navigator & { deviceMemory?: number };
  return qualityFor({
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    width: window.innerWidth,
    cores: navigator.hardwareConcurrency || 4,
    memory: deviceMemory,
  });
}

export async function createCupScene(
  canvas: HTMLCanvasElement,
  hits: Record<ActorName, HTMLElement>,
  options: CupSceneOptions,
): Promise<CupScene> {
  const quality = deviceQuality();
  const [pp, paper] = await Promise.all([loadCup(MODELS.pp, options.signal), loadCup(MODELS.paper, options.signal)]);
  const scene = new Scene();
  const listeners = new AbortController();
  const actors: Partial<Record<ActorName, Actor>> = {};
  let splash: Splash | null = null;
  let renderer: WebGLRenderer | null = null;
  let frame = 0;

  function dispose(): void {
    cancelAnimationFrame(frame);
    frame = 0;
    listeners.abort();
    for (const actor of Object.values(actors)) actor.dispose();
    splash?.dispose();
    disposeScene(scene);
    renderer?.dispose();
    renderer?.forceContextLoss(); // free the context now, not when the GC gets to it (dev reloads pile them up)
  }

  try {
    options.signal.throwIfAborted();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 10);
    camera.position.set(0, 0, DISTANCE);
    camera.lookAt(0, 0, 0);
    // transparent: the page's own ground (the hero's sky) shows behind the actors
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: quality.tier === "full" ? "high-performance" : "default",
    });
    renderer.setClearColor(CLEAR, 0);
    renderer.toneMapping = NoToneMapping; // toon colours are the palette's own: nothing should bend them

    // the actors, toon from the start (the clones below share the toon geometry and materials)
    toonCup(pp, "grapeTea");
    toonCup(paper, "milkTea");
    const single = paper.clone(true);
    const visitCup = paper.clone(true);
    const specs: Record<ActorName, ActorSpec> = {
      pp: {
        subject: pp,
        lid: required(pp, NODES.lid, MODELS.pp.url),
        strap: required(pp, NODES.strap, MODELS.pp.url),
        lidLift: PP_LID_LIFT,
        ...CUP_MOTION,
        phase: 1.7,
      },
      paper: {
        subject: single,
        lid: required(single, NODES.lid, MODELS.paper.url),
        strap: required(single, NODES.strap, MODELS.paper.url),
        lidLift: 0,
        ...CUP_MOTION,
        phase: 3.9,
      },
      visit: {
        subject: visitCup,
        lid: required(visitCup, NODES.lid, MODELS.paper.url),
        strap: required(visitCup, NODES.strap, MODELS.paper.url),
        lidLift: 0,
        ...CUP_MOTION,
        phase: 5.3,
      },
    };
    const hire = (name: ActorName) => {
      const actor = new Actor(specs[name], hits[name], {
        reducedMotion: options.reducedMotion,
        onInput: invalidate,
        onLidTap: () => toggleStrap(name),
        camera,
        canvas,
      });
      actors[name] = actor; // for dispose(), should the set-up fail from here on
      scene.add(actor.root);
      return actor;
    };
    const cast: Record<ActorName, Actor> = {
      pp: hire("pp"),
      paper: hire("paper"),
      visit: hire("visit"),
    };

    /**
     * What floats round the PP cup is not seen at first: they are made after the stage shows (their
     * shaders compile then), and hang on their actors. Without them the page still works, only plainer.
     */
    /** Waits for an idle moment (or the next frame): the extras are built in small steps, not one long task. */
    const breathe = () =>
      new Promise<void>((resolve) => {
        if (typeof window.requestIdleCallback === "function")
          window.requestIdleCallback(() => resolve(), { timeout: 300 });
        else requestAnimationFrame(() => resolve());
      });

    async function loadExtras(): Promise<void> {
      await breathe(); // after the first frames
      options.signal.throwIfAborted();
      const made = createSplash(seeded(SPLASH_SEED));
      splash = made;
      pp.add(made.inside); // what stands in the tea, in the cup's space
      cast.pp.decorate(made.group);
      // compile their shaders now, while nothing moves: not mid-scroll when they first come in
      await breathe();
      if (renderer) await compileAll(renderer, scene, camera);
      options.signal.throwIfAborted();
      invalidate();
    }

    // lights: warm daylight from the upper left (the toon bands follow it, and so do the highlights); the shade side
    // takes a neutral silver from below
    scene.add(new HemisphereLight(tokens.cloud, SHADE, LIGHT.ambient));
    const key = new DirectionalLight("#fff8ee", LIGHT.key);
    key.position.copy(KEY);
    scene.add(key);

    const lean = new Lean(LEAN.perSpeed, LEAN.max, LEAN.tau);
    let width = 1;
    let height = 1;
    let last = 0;
    let time = 0;
    let paused = false;
    let sized = false; // resize() has run: the canvas has a size to draw into
    let dirty = true; // an input, a resize or a layout change: measure and draw
    let targets: Record<string, CupTarget | null> = {};
    let lastScroll = NaN;
    let lastPoses = -1; // the live poses' version (live-pose.ts) last measured

    /** While only the idle float moves, a frame at most this often (ms): 30 fps on a light device, a little slack. */
    const idleFrameMs = 1000 / quality.idleFps - 4;
    let lastDraw = 0;

    function schedule(): void {
      if (sized && !paused && !frame) frame = requestAnimationFrame(tick);
    }

    function invalidate(): void {
      dirty = true;
      schedule();
    }

    function toggleStrap(name: ActorName): void {
      const actor = cast[name];
      options.onStrapChange(name, actor.toggleStrap(options.reducedMotion()));
      invalidate();
    }

    /** Lays everything out for `now` and draws when something changed. */
    function place(now: number): void {
      const dt = last ? Math.max(0, Math.min(MAX_STEP, now - last)) : 16; // resize() may draw "later" than the next frame
      last = now;
      time += dt / 1000;
      const reduced = options.reducedMotion();
      const scroll = options.scrollY();
      const scrolled = scroll !== lastScroll;
      const poses = livePosesVersion();
      const remeasure = dirty || scrolled || poses !== lastPoses; // a scrubbed timeline may settle after the scroll
      lastScroll = scroll;
      lastPoses = poses;
      const next = remeasure ? options.measure() : targets;
      const targetChanged = !sameTargets(next, targets);
      targets = next;
      const moving = [...ACTORS.map((name) => cast[name].step(dt)), lean.moving].some(Boolean);
      const frameState: Frame = {
        dt,
        time,
        reduced,
        lean: lean.update(scroll, dt, reduced),
        width,
        height,
      };
      for (const name of ACTORS) options.onPlace(name, cast[name].place(targets[name] ?? null, frameState));
      splash?.update(time, reduced ? 0 : dt / 1000);
      const sinceDraw = now - lastDraw;
      if (needsRedraw({ reduced, moving, dirty, scrolled, targetChanged, sinceDraw, idleFrameMs })) {
        renderer?.render(scene, camera);
        lastDraw = now;
      }
      dirty = false;
    }

    function tick(now: number): void {
      frame = 0;
      try {
        place(now);
      } finally {
        schedule(); // a throw must not stop the loop for good
      }
    }

    const { signal } = listeners;
    canvas.addEventListener("webglcontextlost", (event) => event.preventDefault(), { signal }); // allow a restore
    canvas.addEventListener("webglcontextrestored", () => invalidate(), { signal });
    document.addEventListener(
      "visibilitychange",
      () => {
        paused = document.hidden;
        last = 0; // the next frame starts afresh, without the time away
        schedule();
      },
      { signal },
    );
    await compileAll(renderer, scene, camera);
    options.signal.throwIfAborted();
    loadExtras().catch((error: unknown) => {
      if (!options.signal.aborted) console.warn("Không tải được topping 3D.", error);
    });

    return {
      resize(w, h) {
        if (w < 1 || h < 1 || !renderer) return;
        width = w;
        height = h;
        sized = true;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.dprMax)); // the window may have moved to another screen
        renderer.setSize(w, h, false);
        const ratio = renderer.getPixelRatio();
        setOutlineSize(w * ratio, h * ratio, ratio);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        dirty = true;
        place(performance.now()); // setSize cleared the canvas: draw now, not a frame later
        schedule();
      },
      invalidate,
      turnBy: (name, radians) => {
        cast[name].turnBy(radians);
        invalidate();
      },
      reset: (name) => {
        cast[name].reset();
        invalidate();
      },
      toggleStrap,
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
