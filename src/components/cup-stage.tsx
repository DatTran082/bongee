"use client";

import Image from "next/image";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal, preload } from "react-dom";
import heroPhoto from "@/assets/images/hero.jpg";
import { cup, hero } from "@/data/boongee";
import type { CupPlacement, CupScene } from "@/lib/cup-scene";
import { ACTORS, type ActorName } from "@/lib/cup-scene/actors";
import { findAnchors, measureAnchors } from "@/lib/cup-scene/anchors";
import { isOnScreen } from "@/lib/cup-scene/fit";
import { MODELS } from "@/lib/cup-scene/model";
import { targetsByActor } from "@/lib/cup-scene/track";

type Status = "loading" | "ready" | "failed";

const KEY_STEP = Math.PI / 12;
/** Set on <html> when the stage cannot be shown: the slots collapse, the hero shows the cover photo. */
const FAILED_CLASS = "cup-failed";
/** The longest the stage waits for an idle moment after the page has loaded (ms). */
const IDLE_WAIT = 1500;
const CANVAS_CLASS = "block h-full w-full opacity-0 transition-opacity duration-700 motion-reduce:transition-none";

/**
 * three.js needs WebGL 2. Only the API is checked: a throwaway context would cost a GPU context and, on a phone, a
 * long pause while the page loads. A browser with the API but a blocked GPU fails when the renderer starts, and the
 * page falls back then (the same path as a model that fails to load).
 */
function webglAvailable(): boolean {
  return typeof WebGL2RenderingContext !== "undefined";
}

/**
 * Runs `start` once the page has loaded and the browser is idle (at most `IDLE_WAIT` ms later), so the 3D stage's
 * download (three.js, the models) and set-up never compete with the first paint, the fonts and hydration. Returns a
 * cancel.
 */
function whenSettled(start: () => void): () => void {
  let idle = 0;
  let timer = 0;
  const go = () => {
    if (typeof window.requestIdleCallback === "function")
      idle = window.requestIdleCallback(start, { timeout: IDLE_WAIT });
    else timer = window.setTimeout(start, 200);
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
  return () => {
    window.removeEventListener("load", go);
    if (idle) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
}

/** The visitor asked for less data (Chrome's Data Saver): the cover photo will do. */
function savesData(): boolean {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
  return connection?.saveData === true;
}

const isActor = (value: string | undefined): value is ActorName => ACTORS.includes(value as ActorName);

/** Writes an actor's place to its hit element, touching the DOM only for what changed. */
function placeHit(hit: HTMLElement, placement: CupPlacement | null): void {
  const focusable = !!placement && placement.resting && isOnScreen(placement.y, placement.height, window.innerHeight);
  const tabIndex = focusable ? 0 : -1;
  if (hit.tabIndex !== tabIndex) {
    hit.tabIndex = tabIndex; // in flight or off screen: not a tab stop, and not in the accessibility tree
    hit.setAttribute("aria-hidden", String(!focusable));
  }
  const resting = String(!!placement?.resting);
  if (hit.dataset.resting !== resting) hit.dataset.resting = resting;
  if (!placement) return;
  const transform = `translate(${(placement.x - placement.width / 2).toFixed(1)}px, ${(placement.y - placement.height / 2).toFixed(1)}px)`;
  if (hit.style.transform !== transform) hit.style.transform = transform;
  const width = `${placement.width.toFixed(1)}px`;
  const height = `${placement.height.toFixed(1)}px`;
  if (hit.style.width !== width) hit.style.width = width;
  if (hit.style.height !== height) hit.style.height = height;
}

/**
 * The 3D stage: a fixed, transparent canvas behind the page on which three actors float, flying between the
 * sections' slots (CupAnchor) as the page scrolls and passing behind the white cards: the cover photo's set in
 * the hero, the frosted PP cup of grape tea with grapes and ice about it, the lidded paper cup. three.js (loaded
 * after the page shows, by the dynamic import below: nothing here imports it eagerly) and the models load after
 * the page shows; until then the slots are empty pink, and if WebGL or a model fails (or the visitor saves data)
 * the hero's slot shows the cover photo instead. While an actor rests in a slot an invisible element over it takes
 * the pointer: a drag turns it, a tap on a lid flips its strap; the arrow keys, Enter and Home do the same. The
 * hint saying so is portalled into the line the hero holds for it under its buttons. Mounted by the home page (not
 * the layout), so only that page pays for it. The canvas is made by the effect, fresh each time it runs: a WebGL
 * context is lost for good on dispose, so a re-run (Fast Refresh, a page shown again) must not reuse the element.
 */
export function CupStage() {
  const layerRef = useRef<HTMLDivElement>(null);
  const hitRefs = useRef<Partial<Record<ActorName, HTMLDivElement>>>({});
  const sceneRef = useRef<CupScene | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [hintSlot, setHintSlot] = useState<Element | null>(null);
  const [heroSlot, setHeroSlot] = useState<Element | null>(null);
  const [announcement, setAnnouncement] = useState(""); // the last strap change, for the live region
  const hintId = useId();

  useEffect(() => {
    const layer = layerRef.current;
    const hits = hitRefs.current;
    if (!layer || !ACTORS.every((name) => hits[name])) return;
    const fail = (error: unknown) => {
      console.warn("Không dựng được cảnh 3D.", error);
      document.documentElement.classList.add(FAILED_CLASS);
      setHeroSlot(document.querySelector('[data-cup-anchor="hero"]'));
      setStatus("failed");
    };
    if (savesData() || !webglAvailable()) {
      fail(savesData() ? "data saver" : "no WebGL 2");
      return () => document.documentElement.classList.remove(FAILED_CLASS);
    }
    const canvas = document.createElement("canvas");
    canvas.className = CANVAS_CLASS;
    layer.replaceChildren(canvas);
    const controller = new AbortController();
    const { signal } = controller;
    const observers: ResizeObserver[] = [];
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const anchors = findAnchors(document);
    // the scroll, kept from the scroll event: reading window.scrollY every frame would force a layout each time
    let scrollTop = window.scrollY;
    const onScroll = () => {
      scrollTop = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const cancelStart = whenSettled(() => {
      for (const model of Object.values(MODELS)) preload(model.url, { as: "fetch", crossOrigin: "anonymous" }); // alongside three.js
      import("@/lib/cup-scene")
        .then(({ createCupScene }) =>
          createCupScene(canvas, hits as Record<ActorName, HTMLElement>, {
            reducedMotion: () => motion.matches,
            measure: () => targetsByActor(measureAnchors(anchors), window.innerHeight, motion.matches),
            scrollY: () => scrollTop,
            onStrapChange: (name, open) =>
              setAnnouncement(`${cup.actors[name].short}: ${open ? cup.strapOpened : cup.strapClosed}`),
            onPlace: (name, placement) => {
              const hit = hits[name];
              if (hit) placeHit(hit, placement);
            },
            signal,
          }),
        )
        .then((scene) => {
          if (signal.aborted) {
            scene.dispose();
            return;
          }
          sceneRef.current = scene;
          const fit = () => scene.resize(layer.clientWidth, layer.clientHeight);
          fit();
          observers.push(new ResizeObserver(fit), new ResizeObserver(() => scene.invalidate()));
          observers[0].observe(layer); // the viewport
          observers[1].observe(document.body); // the page's height: a <details> opened, a font arrived
          canvas.classList.replace("opacity-0", "opacity-100");
          setHintSlot(document.querySelector("[data-cup-hint]"));
          setStatus("ready");
        })
        .catch((error: unknown) => {
          if (!signal.aborted) fail(error); // no WebGL, or a model failed to load: the page stands without the stage
        });
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelStart();
      controller.abort();
      for (const observer of observers) observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
      canvas.remove();
      document.documentElement.classList.remove(FAILED_CLASS);
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    const name = event.currentTarget.dataset.actor;
    if (!scene || !isActor(name) || event.altKey || event.ctrlKey || event.metaKey) return; // Alt / Cmd + arrows are the browser's
    const actions: Record<string, () => void> = {
      ArrowLeft: () => scene.turnBy(name, -KEY_STEP),
      ArrowRight: () => scene.turnBy(name, KEY_STEP),
      Home: () => scene.reset(name),
      Enter: () => scene.toggleStrap(name),
      " ": () => scene.toggleStrap(name),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    if (event.repeat && (event.key === "Enter" || event.key === " ")) return; // a held key flips the strap once
    action();
  }

  const ready = status === "ready";
  return (
    <>
      {/* without script the slots stay empty: collapse them and let the hero's cover photo (noscript in hero.tsx) show */}
      <noscript>
        <style>{`.cup-anchor:not([data-cup-anchor="hero"]),.cup-row{display:none}.cup-grid{display:block}`}</style>
      </noscript>
      {/* the canvas goes in here (see above); React never renders children into this layer */}
      <div ref={layerRef} aria-hidden className="cup-layer pointer-events-none fixed inset-0 -z-10" />
      {ACTORS.map((name) => (
        <div
          key={name}
          ref={(element) => {
            hitRefs.current[name] = element ?? undefined;
          }}
          role="group"
          aria-roledescription="mô hình 3D"
          aria-label={cup.actors[name].label}
          aria-describedby={ready && hintSlot ? hintId : undefined}
          aria-hidden // until the actor rests on screen (placeHit)
          tabIndex={-1} // 0 only while the actor rests on screen (placeHit)
          hidden={!ready}
          onKeyDown={onKeyDown}
          data-actor={name}
          data-resting="false"
          className="pointer-events-none fixed top-0 left-0 z-20 touch-pan-y touch-pinch-zoom rounded-[40%] select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink data-[resting=true]:pointer-events-auto"
        />
      ))}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {ready &&
        hintSlot &&
        createPortal(
          // for assistive tech only: the page shows no instructions (owner, 22/10/2026)
          <p id={hintId} className="sr-only">
            {cup.hint} {cup.keys}
          </p>,
          hintSlot,
        )}
      {status === "failed" &&
        heroSlot &&
        createPortal(
          <Image
            src={heroPhoto}
            alt={hero.imageAlt}
            placeholder="blur"
            // shown only when the stage failed: then it is the hero's largest picture, wanted at once
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 80rem) 60vw, 100vw"
            className="h-full w-full rounded-3xl object-cover object-[72%_center]"
          />,
          heroSlot,
        )}
    </>
  );
}
