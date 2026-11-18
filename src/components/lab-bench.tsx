"use client";

import { useEffect, useRef, useState } from "react";
import { deviceTier } from "@/lib/stage/device";
import { readFlags } from "@/lib/stage/flags";
import type { LabInfo, LabStage } from "@/lib/stage/lab";

const BACKEND = { webgpu: "WebGPU", webgl2: "WebGL 2" } as const;
const VERDICT = { measuring: "đang đo", keep: "giữ mức này", "step-down": "nên hạ một mức" } as const;

const ms = (value: number) => (Number.isFinite(value) ? `${value.toFixed(1).replace(".", ",")} ms` : "–");

/**
 * The WebGPU stage's test bench (/lab): its canvas, fixed behind the page like the home page's stage, and a readout
 * of what it runs on and how fast, for measuring phones (docs/interactive-landing-script.md, step 0). three.js
 * loads in the browser only (the dynamic import below), and the canvas is made fresh on each run: a disposed
 * renderer's context is gone for good, so a re-run (Fast Refresh) must not reuse the element.
 */
export function LabBench() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<LabInfo | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full";
    layer.replaceChildren(canvas);
    const controller = new AbortController();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const flags = readFlags(window.location.search);
    let stage: LabStage | null = null;
    const observer = new ResizeObserver(() => stage?.resize(layer.clientWidth, layer.clientHeight));
    const onPointer = (event: PointerEvent) => stage?.point(event.clientX / window.innerWidth);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    import("@/lib/stage/lab")
      .then(({ createLabStage }) =>
        createLabStage(canvas, {
          flags,
          tier: deviceTier(flags.tier),
          signal: controller.signal,
          reducedMotion: () => motion.matches,
          onInfo: setInfo,
        }),
      )
      .then((made) => {
        if (controller.signal.aborted) {
          made.dispose();
          return;
        }
        stage = made;
        made.resize(layer.clientWidth, layer.clientHeight);
        observer.observe(layer);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn("Không dựng được sân khấu WebGPU.", error);
        setFailure(error instanceof Error ? error.message : String(error));
      });
    return () => {
      controller.abort();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      observer.disconnect();
      stage?.dispose();
      canvas.remove();
    };
  }, []);

  const rows: Array<[string, string]> = info
    ? [
        ["Backend", BACKEND[info.backend]],
        ["Mức", info.tier],
        ["Độ phân giải", `${info.dpr.toFixed(2).replace(".", ",")}×`],
        ["Khung hình", `${ms(info.p50)} · p90 ${ms(info.p90)} (${info.frames} khung)`],
        ["Đánh giá", VERDICT[info.verdict]],
      ]
    : [["Trạng thái", failure ? `lỗi: ${failure}` : "đang tải three.js…"]];

  return (
    <>
      <div ref={layerRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />
      <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-between px-4 py-10 sm:px-6">
        <h1 className="eyebrow">Phòng thử 3D · bước 0</h1>
        <dl className="card-line grid w-fit grid-cols-[auto_auto] gap-x-6 gap-y-1 bg-white/80 p-5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-silver-700">{label}</dt>
              <dd className="tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
