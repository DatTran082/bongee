"use client";

import { IconRotate360 } from "@tabler/icons-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal, preload } from "react-dom";
import { hero } from "@/data/boongee";
import type { HeroScene as Scene } from "@/lib/hero-scene";
import { CUP_MODEL } from "@/lib/hero-scene/model";

type Status = "loading" | "ready" | "failed";

/** Tailwind's xl breakpoint, where the hero's text sits over the scene's left side. */
const XL = "(min-width: 80rem)";
/** Gap (px) between the hero's text and the strip the set is framed in. */
const TEXT_GAP = 32;
const KEY_STEP = Math.PI / 12;

/** From xl up the canvas runs under the text: the set is framed in the strip right of the text column. */
function subjectLeft(stage: HTMLElement): number {
  const copy = stage.closest("section")?.querySelector("[data-hero-copy]");
  if (!copy || !window.matchMedia(XL).matches) return 0;
  return copy.getBoundingClientRect().right - stage.getBoundingClientRect().left + TEXT_GAP;
}

/**
 * The hero's interactive 3D scene, in place of the cover photo: the two Boongee paper cups on the granite block and
 * the logs (src/lib/hero-scene). three.js and the cup model load after the page shows; until then the hero's pink
 * shows, and without WebGL the stage drops out and the hero is its text alone. Drag (or the arrow keys) turns the
 * set; a tap on the lid (or Enter) swings its strap open. Nothing moves by itself. The hint saying so is portalled
 * into the line the hero holds for it under its buttons, where it never covers the scene.
 */
export function HeroScene() {
  preload(CUP_MODEL, { as: "fetch", crossOrigin: "anonymous" }); // fetch the model alongside three.js
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [hintSlot, setHintSlot] = useState<Element | null>(null);
  const [strapOpen, setStrapOpen] = useState<boolean | null>(null); // null until first toggled: nothing to announce
  const hintId = useId();

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const controller = new AbortController();
    let observer: ResizeObserver | null = null;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    import("@/lib/hero-scene")
      .then(({ createHeroScene }) =>
        createHeroScene(canvas, {
          reducedMotion: () => motion.matches,
          onStrapChange: setStrapOpen,
          signal: controller.signal,
        }),
      )
      .then((scene) => {
        if (controller.signal.aborted) {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        const fit = () => scene.resize(stage.clientWidth, stage.clientHeight, subjectLeft(stage));
        fit();
        observer = new ResizeObserver(fit);
        observer.observe(stage);
        setHintSlot(stage.closest("section")?.querySelector("[data-hero-hint]") ?? null);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        // no WebGL, or the model failed to load: the hero stands on its text
        console.warn("Không dựng được cảnh 3D ở đầu trang.", error);
        setStatus("failed");
      });
    return () => {
      controller.abort();
      observer?.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    if (!scene) return;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => scene.turnBy(-KEY_STEP),
      ArrowRight: () => scene.turnBy(KEY_STEP),
      Home: () => scene.reset(),
      Enter: () => scene.toggleStrap(),
      " ": () => scene.toggleStrap(),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  const ready = status === "ready";
  return (
    <div
      ref={stageRef}
      role="group"
      aria-roledescription="cảnh 3D"
      aria-label={hero.sceneLabel}
      aria-describedby={ready && hintSlot ? hintId : undefined}
      tabIndex={ready ? 0 : -1}
      onKeyDown={onKeyDown}
      className={`relative aspect-[4/3] w-full transition-opacity duration-700 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-ink motion-reduce:transition-none md:aspect-[16/9] xl:absolute xl:inset-0 xl:aspect-auto ${ready ? "opacity-100" : "opacity-0"} ${status === "failed" ? "hidden" : ""}`}
    >
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full touch-pan-y select-none" />
      <p aria-live="polite" className="sr-only">
        {strapOpen === null ? "" : strapOpen ? hero.strapOpened : hero.strapClosed}
      </p>
      {ready &&
        hintSlot &&
        createPortal(
          <p id={hintId} className="flex items-center justify-center gap-2 text-sm xl:justify-start">
            <IconRotate360 aria-hidden className="size-5" />
            {hero.sceneHint}
            <span className="sr-only"> {hero.sceneKeys}</span>
          </p>,
          hintSlot,
        )}
    </div>
  );
}
