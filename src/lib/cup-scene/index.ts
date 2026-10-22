import {
  Color,
  DirectionalLight,
  HemisphereLight,
  NoToneMapping,
  type Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
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
import { approach, needsRedraw } from "./motion";
import { qualityFor } from "./quality";
import { seeded } from "./random";
import { createSet } from "./set";
import { createSplash, type Splash } from "./splash";
import { createToppings } from "./toppings";
import { toonCup } from "./toon/cups";
import { setOutlineSize } from "./toon/outline";
import { createPetCup, PET_PRINT_URL } from "./toon/pet-cup";
import { createSparkles, type Sparkles } from "./toon/sparkles";
import { flavors } from "@/data/flavors";
import { createFlavorRig, type FlavorRig } from "./flavor-rig";
import { flavorScroll } from "./flavor-scroll";
import { flavorState } from "./flavor-track";
import { Lean } from "./steppers";
import type { CupTarget } from "./track";

// The 3D stage: a canvas behind the page with its actors on it, each flying between the sections' slots as the
// page scrolls (track.ts, actor.ts): the cover photo's set (set/), which floats in the hero; the flavour carousel's
// cup (flavor-rig.ts: paper, the PP cup of the fruit teas, the PET cup of the coffees); the clear PP cup of grape tea with grapes and ice in it and floating round it (splash.ts);
// the lidded paper cup. Everything is drawn as a smooth stylized game asset (toon/: the Làng Mây edition's toon
// rules): soft cel bands, sticker outlines, flat white highlights, sparkles. No flowers drift behind them (the owner
// took them out, 22/10/2026). The canvas is transparent, so the page's painted scenery (sky, clouds)
// stays behind the actors; it takes the flavour section's tone only while that section has the viewport. A drag turns an actor, a tap on a lid flips its strap,
// the keyboard does both. With reduced motion nothing moves on its own: everything sits in its slot, follows the
// scroll, and frames are drawn only when something changed.

export { ACTORS, type ActorName };

/** Longest step (ms) an animation takes per frame: slow devices still finish on time, a stalled tab does not leap. */
const MAX_STEP = 250;
/** The actors lean against the scroll: radians per px/ms of scroll speed, the most, the smoothing (ms). */
const LEAN = { perSpeed: 0.05, max: 0.14, tau: 90 };
const SPLASH_SEED = 19;
const TOPPING_SEED = 43;
const SPARKLES = { seed: 61, count: 7 };
const CLEAR = new Color(tokens["bg"]); // the page's cream ground
/** Idle motion and flight of the cups: they float, and a drag turns them. */
const CUP_MOTION = { bob: 0.016, sway: 0.08, roll: 0.02, hz: 0.24, spin: 1.1, turnable: true };
/** The carousel's cup: a gentle float, no turn of its own (the scroll turns it). */
const FLAVOR_MOTION = { bob: 0.01, sway: 0.03, roll: 0.012, hz: 0.2, spin: 0, turnable: true };
/** The hero's set is a still picture: it does not float, turn or follow the pointer (no parallax, 22/10/2026). */
const SET_MOTION = { bob: 0, sway: 0, roll: 0, hz: 0, spin: 0, turnable: false };
/**
 * The carousel follows the section's scroll through this smoothing (ms): the scroll handler only stores where the
 * page is, and the cup glides there, so a wheel step or a flick never jerks it (flavors.tsx).
 */
const FLAVOR_TAU = 140;
/** The PP cup's lid rises this far (metres) in a slot that asks for it. */
const PP_LID_LIFT = 0.055;
/** The key light: from the upper left, as in the photo; it follows the set to throw its shadows. */
const KEY = { offset: new Vector3(-0.9, 1.3, 1.1), halfSize: 0.34, mapSize: 1024 };
/** Light levels (no tone mapping): the key's lit band shows a surface at about its own colour, the shade ~ 70 %. */
const LIGHT = { key: 2.3, ambient: 1.05 };

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

/** Fetches a model (abortable, so an unmount during the download stops it) and parses it. */
async function loadCup(model: { url: string; root: string }, signal: AbortSignal): Promise<Object3D> {
  const response = await fetch(model.url, { signal });
  if (!response.ok) throw new Error(`${model.url}: HTTP ${response.status}`);
  const buffer = await response.arrayBuffer();
  signal.throwIfAborted();
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await new Promise<GLTF>((resolve, reject) => loader.parse(buffer, "", resolve, reject));
  return required(gltf.scene, model.root, model.url);
}

/** A cup's print texture; null when it cannot be had (the cup is then drawn plain, the stage still works). */
async function loadPrint(url: string): Promise<Texture | null> {
  try {
    const texture = await new TextureLoader().loadAsync(url);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  } catch (error) {
    console.warn("Không tải được hình in ly PET.", error);
    return null;
  }
}

/**
 * Compiles every shader the stage may need, hidden parts too (compileAsync skips what is not visible: the
 * carousel's other cups would compile mid-scroll, the first time each shows, and stall that frame).
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
  const usesPet = flavors.some((flavor) => flavor.cup === "pet"); // the PET cup and its print only when served
  const [pp, paper, petPrint] = await Promise.all([
    loadCup(MODELS.pp, options.signal),
    loadCup(MODELS.paper, options.signal),
    usesPet ? loadPrint(PET_PRINT_URL) : null,
  ]);
  const scene = new Scene();
  const listeners = new AbortController();
  const actors: Partial<Record<ActorName, Actor>> = {};
  let splash: Splash | null = null;
  let toppingsDispose: (() => void) | null = null;
  let rig: FlavorRig | null = null;
  let renderer: WebGLRenderer | null = null;
  const sparkles: Sparkles[] = [];
  let frame = 0;

  function dispose(): void {
    cancelAnimationFrame(frame);
    frame = 0;
    listeners.abort();
    for (const actor of Object.values(actors)) actor.dispose();
    splash?.dispose();
    toppingsDispose?.();
    rig?.dispose();
    for (const s of sparkles) s.dispose();
    disposeScene(scene);
    renderer?.dispose();
    renderer?.forceContextLoss(); // free the context now, not when the GC gets to it (dev reloads pile them up)
  }

  try {
    options.signal.throwIfAborted();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 10);
    camera.position.set(0, 0, DISTANCE);
    camera.lookAt(0, 0, 0);
    // transparent: the page's scenery (the hero's sky and clouds, src/components/lang-may/) shows behind the actors
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: quality.tier === "full" ? "high-performance" : "default",
    });
    renderer.setClearColor(CLEAR, 0);
    renderer.toneMapping = NoToneMapping; // toon colours are the palette's own: nothing should bend them
    renderer.shadowMap.enabled = quality.shadows; // the set's cups and logs throw shadows on the boulder (not on a phone)
    renderer.shadowMap.type = PCFShadowMap;

    // the actors, toon from the start (the clones below share the toon geometry and materials)
    toonCup(pp, "grapeTea");
    toonCup(paper, "milkTea");
    const set = createSet(paper);
    const single = paper.clone(true);
    // the flavour carousel clones the prepared cups before any actor re-centres them
    const carousel = (rig = createFlavorRig(paper, pp, usesPet ? createPetCup(petPrint) : null, flavors));
    const specs: Record<ActorName, ActorSpec> = {
      set: { subject: set.group, lid: set.lid, strap: set.strap, lidLift: 0, ...SET_MOTION, phase: 0 },
      flavor: { subject: carousel.group, lid: null, strap: null, lidLift: 0, ...FLAVOR_MOTION, phase: 2.6 },
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
      set: hire("set"),
      flavor: hire("flavor"),
      pp: hire("pp"),
      paper: hire("paper"),
    };
    for (const name of ["pp", "flavor"] as const) {
      const made = createSparkles(seeded(SPARKLES.seed + sparkles.length), SPARKLES.count);
      sparkles.push(made);
      cast[name].decorate(made.group);
    }

    /**
     * The toppings and what floats round the PP cup are not seen at first: they are made after the stage shows (their
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
      carousel.pp.add(made.inside.clone(true)); // the carousel's PP cup holds the same tea
      cast.pp.decorate(made.group);
      await breathe();
      options.signal.throwIfAborted();
      const toppings = createToppings(seeded(TOPPING_SEED));
      toppingsDispose = () => toppings.dispose();
      carousel.setToppings(toppings);
      cast.flavor.decorate(toppings.group);
      // compile their shaders now, while nothing moves: not mid-scroll when a flavour's toppings first come in
      await breathe();
      if (renderer) await compileAll(renderer, scene, camera);
      options.signal.throwIfAborted();
      invalidate();
    }

    // lights: warm daylight from the upper left (the toon bands follow it, and so do the highlights); the shade side
    // takes a cool lilac from below, as a painted sky shades its clouds
    scene.add(new HemisphereLight(tokens.cloud, tokens["cloud-shade"], LIGHT.ambient));
    const key = new DirectionalLight("#fff8ee", LIGHT.key);
    key.castShadow = true;
    key.shadow.mapSize.set(KEY.mapSize, KEY.mapSize);
    key.shadow.intensity = 0.35;
    key.shadow.radius = 2;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.0015;
    scene.add(key, key.target);

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
    let flavorProgress = flavorScroll().progress; // the carousel's progress, smoothed toward the scroll's
    let lastPresence = flavorScroll().presence;
    const ground = new Color();
    const toneFrom = new Color();
    const toneTo = new Color();

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

    /** The key light stands over the set wherever it is and however big, so its shadow map covers just the set. */
    function followSet(): void {
      const root = cast.set.root;
      const scale = root.scale.x;
      key.position.copy(root.position).addScaledVector(KEY.offset, scale);
      key.target.position.copy(root.position);
      const half = KEY.halfSize * scale;
      const shadow = key.shadow.camera;
      if (shadow.right !== half) {
        shadow.left = shadow.bottom = -half;
        shadow.right = shadow.top = half;
        shadow.near = 0.1;
        shadow.far = 4 * scale + 1;
        shadow.updateProjectionMatrix();
      }
    }

    /** Lays everything out for `now` and draws when something changed. */
    function place(now: number): void {
      const dt = last ? Math.max(0, Math.min(MAX_STEP, now - last)) : 16; // resize() may draw "later" than the next frame
      last = now;
      time += dt / 1000;
      const reduced = options.reducedMotion();
      const scroll = options.scrollY();
      const scrolled = scroll !== lastScroll;
      const remeasure = dirty || scrolled;
      lastScroll = scroll;
      const next = remeasure ? options.measure() : targets;
      const targetChanged = !sameTargets(next, targets);
      targets = next;
      const fl = flavorScroll();
      const before = flavorProgress;
      flavorProgress = reduced ? fl.progress : approach(flavorProgress, fl.progress, dt, FLAVOR_TAU);
      if (Math.abs(flavorProgress - fl.progress) < 1e-4) flavorProgress = fl.progress;
      const flavorMoved = flavorProgress !== before || fl.presence !== lastPresence;
      lastPresence = fl.presence;
      const moving = [...ACTORS.map((name) => cast[name].step(dt)), lean.moving, flavorMoved].some(Boolean);
      const frameState: Frame = {
        dt,
        time,
        reduced,
        lean: lean.update(scroll, dt, reduced),
        width,
        height,
      };
      // while the flavour section has the viewport, the other cups make way for its carousel
      for (const name of ACTORS) {
        const fade = name === "pp" || name === "paper" ? fl.presence : 0;
        options.onPlace(name, cast[name].place(targets[name] ?? null, frameState, fade));
      }
      const state = flavorState(flavorProgress, flavors.length, reduced);
      carousel.update(state, time, !reduced);
      // the ground takes the flavour's tone (pink and cream only) while the section has the viewport
      toneFrom.set(flavors[state.from]?.toneHex ?? CLEAR);
      toneTo.set(flavors[state.to]?.toneHex ?? CLEAR);
      ground.lerpColors(toneFrom, toneTo, state.blend);
      renderer?.setClearColor(ground, fl.presence); // clear, but for the flavour section's tone while it has the view
      followSet();
      key.castShadow = quality.shadows && cast.set.root.visible; // the shadow pass serves the set alone
      splash?.update(time, reduced ? 0 : dt / 1000);
      for (const s of sparkles) s.update(time, reduced);
      const sinceDraw = now - lastDraw;
      if (
        needsRedraw({ reduced, moving: moving || flavorMoved, dirty, scrolled, targetChanged, sinceDraw, idleFrameMs })
      ) {
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
    if (petPrint) renderer.initTexture(petPrint); // upload it now: not on the coffee cup's first frame, mid-scroll
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
