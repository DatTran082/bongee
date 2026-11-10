"use client";

import { IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect } from "react";
import type { LookbookItem } from "@/data/menu-lookbook";

interface PreviewLightboxProps {
  item: LookbookItem | null;
  onClose: () => void;
}

/**
 * Editorial Lightbox Modal for inspecting lookbook studio photos.
 * Strictly adheres to Brand DNA: Fraunces typography, calm borders, no AI-slop animations.
 */
export function PreviewLightbox({ item, onClose }: PreviewLightboxProps) {
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
    >
      {/* Calm Backdrop */}
      <div
        className="fixed inset-0 bg-brand-ink/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-brand-ink/20 bg-brand-bg shadow-2xl md:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ"
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-brand-ink/20 bg-brand-bg/90 text-brand-ink transition-colors hover:bg-brand-ink hover:text-white"
        >
          <IconX className="size-4" />
        </button>

        {/* High-Resolution Image Container */}
        <div className="relative aspect-[3/4] w-full shrink-0 bg-brand-bg-alt md:w-1/2">
          <Image
            src={item.imageFull}
            alt={item.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Editorial Information Panel */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold tracking-widest text-brand-ink-muted uppercase">{item.groupTitle}</p>
              <div className="mt-1 flex items-baseline justify-between gap-4 border-b border-brand-ink/15 pb-3">
                <h2 id="lightbox-title" className="font-serif text-2xl font-bold text-brand-ink">
                  {item.name}
                </h2>
                <span className="font-serif text-xl font-bold text-brand-ink tabular-nums">{item.prices[0]}K</span>
              </div>
            </div>

            {/* Recipe and Tasting Note */}
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-brand-ink uppercase">Hương vị & Thành phần</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-ink-muted italic">{item.note}</p>
            </div>

            {/* Specifications Details */}
            <div className="space-y-3 border-t border-brand-ink/10 pt-4 text-xs">
              <div>
                <span className="font-semibold text-brand-ink">Quy cách ly: </span>
                <span className="text-brand-ink-muted">{item.cupType}</span>
              </div>
              <div>
                <span className="font-semibold text-brand-ink">Nguyên liệu decor bệ: </span>
                <span className="text-brand-ink-muted">{item.decor}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-brand-ink">Tone phông nền: </span>
                <span className="inline-flex items-center gap-1.5 text-brand-ink-muted">
                  <span
                    className="inline-block size-3 rounded-sm border border-black/15"
                    style={{ backgroundColor: item.bgColor }}
                    aria-hidden="true"
                  />
                  {item.bgName} ({item.bgColor})
                </span>
              </div>
              {item.badge && (
                <div>
                  <span className="font-semibold text-brand-ink">Định vị thực đơn: </span>
                  <span className="text-brand-ink-muted">{item.badge}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 border-t border-brand-ink/10 pt-4">
            <p className="text-[0.75rem] text-brand-ink-muted">
              Quy chuẩn Open-Top Boongee: Không nắp · Không ống hút · Bệ trắng lượn sóng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
