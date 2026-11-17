"use client";

import { IconRotate2 } from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";

/**
 * A printed card shown both sides (a voucher, the loyalty card): the front, and a button that turns it over to the
 * back. The images carry the words as pictures, so each side's `alt` says them in full.
 */
export function FlipCard({
  front,
  back,
  width,
  height,
  label,
  className = "",
}: {
  front: { src: string; alt: string };
  back: { src: string; alt: string };
  width: number;
  height: number;
  /** what the card is, for the turn button ("voucher giảm 20K") */
  label: string;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const face = "flip-face h-auto w-full rounded-2xl drop-shadow-[0_18px_24px_rgb(120_140_155/0.18)]";
  return (
    <div className={className}>
      <div className="flip" data-flipped={flipped}>
        <div className="flip-inner">
          <Image
            src={front.src}
            alt={front.alt}
            width={width}
            height={height}
            sizes="(min-width: 64rem) 36rem, 92vw"
            className={face}
            aria-hidden={flipped}
          />
          <Image
            src={back.src}
            alt={back.alt}
            width={width}
            height={height}
            sizes="(min-width: 64rem) 36rem, 92vw"
            className={`${face} flip-back`}
            aria-hidden={!flipped}
          />
        </div>
      </div>
      <button
        type="button"
        aria-pressed={flipped}
        onClick={() => setFlipped((f) => !f)}
        className="mt-2 inline-flex items-center gap-1.5 py-1 text-xs tracking-[0.12em] text-silver-700 uppercase hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-brand-ink"
      >
        <IconRotate2 aria-hidden className="size-4" />
        {flipped ? `Xem mặt trước ${label}` : `Xem mặt sau ${label}`}
      </button>
    </div>
  );
}
