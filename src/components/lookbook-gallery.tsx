"use client";

import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/data/menu";
import type { LookbookDish, LookbookGroup } from "@/lib/lookbook/join";

const SIZE_LABELS = ["M", "L"];

/** "40K", or "M 40K · L 50K" for a sized drink. */
function priceLine(prices: number[]): string {
  if (prices.length === 1) return formatPrice(prices[0]);
  return prices.map((p, i) => `${SIZE_LABELS[i] ?? ""} ${formatPrice(p)}`.trim()).join(" · ");
}

function NoPhoto({ className = "" }: { className?: string }) {
  return (
    <div className={`grid place-items-center gap-2 bg-white text-silver-700 ${className}`}>
      <div className="text-xs tracking-[0.2em] uppercase">Ảnh đang cập nhật</div>
    </div>
  );
}

interface DishCardProps {
  dish: LookbookDish;
  onOpen: () => void;
}

function DishCard({ dish, onOpen }: DishCardProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        disabled={!dish.photo}
        className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink disabled:cursor-default"
      >
        {dish.photo ? (
          <Image
            src={dish.photo.thumb}
            alt={`Ảnh minh hoạ ${dish.name}`}
            width={600}
            height={750}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="aspect-[4/5] w-full rounded-2xl bg-silver-100 object-cover transition-opacity group-enabled:group-hover:opacity-90"
          />
        ) : (
          <NoPhoto className="aspect-[4/5] w-full rounded-2xl border border-silver-200" />
        )}
        <span className="mt-4 flex items-baseline justify-between gap-3">
          <span className="text-lg font-normal">{dish.name}</span>
          <span className="shrink-0 text-sm text-silver-700 tabular-nums">{priceLine(dish.prices)}</span>
        </span>
        {dish.note && <span className="mt-1 block text-sm text-silver-700">{dish.note}</span>}
      </button>
    </li>
  );
}

/**
 * The /menu page's groups: each dish's photo, name, price and plain line in a grid; a photo opens enlarged in a
 * modal <dialog> (Esc or the backdrop closes it; arrows go through the dishes that have a photo, in menu order).
 */
export function LookbookGallery({ groups }: { groups: LookbookGroup[] }) {
  const withPhoto = useMemo(
    () => groups.flatMap((g) => g.items.filter((d) => d.photo).map((d) => ({ dish: d, group: g.title }))),
    [groups],
  );
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const show = (name: string) => setOpen(withPhoto.findIndex((x) => x.dish.name === name));

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open === null) {
      if (el.open) el.close();
      return;
    }
    if (!el.open) el.showModal();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const step = (by: number) => setOpen((i) => (i === null ? i : (i + by + withPhoto.length) % withPhoto.length));
  const current = open === null ? null : withPhoto[open];

  return (
    <>
      <div className="space-y-20 md:space-y-28">
        {groups.map((group, index) => (
          <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-28">
            <h2
              id={`${group.id}-title`}
              className="mb-8 flex items-baseline gap-6 border-b border-silver-200 pb-4 text-2xl font-light tracking-tight md:text-4xl"
            >
              <span aria-hidden className="text-xs tracking-[0.2em] text-silver-500 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              {group.title}
            </h2>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.items.map((dish) => (
                <DishCard key={dish.name} dish={dish} onOpen={() => show(dish.name)} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="lookbook-dialog-title"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto w-[min(92vw,56rem)] overflow-hidden rounded-3xl border border-silver-200 bg-white p-0 text-brand-ink backdrop:bg-brand-ink/50 backdrop:backdrop-blur-sm"
      >
        {current?.dish.photo && (
          <div className="grid max-h-[90dvh] md:grid-cols-[minmax(0,1fr)_18rem]">
            <Image
              src={current.dish.photo.full}
              alt={`Ảnh minh hoạ ${current.dish.name}`}
              width={current.dish.photo.width}
              height={current.dish.photo.height}
              sizes="(min-width: 768px) 38rem, 92vw"
              className="aspect-[4/5] max-h-[70dvh] w-full object-cover md:max-h-[90dvh]"
            />
            <div className="flex flex-col gap-3 p-6">
              <p className="eyebrow">{current.group}</p>
              <h2 id="lookbook-dialog-title" className="text-2xl font-light">
                {current.dish.name}
              </h2>
              <p className="text-silver-700 tabular-nums">{priceLine(current.dish.prices)}</p>
              {current.dish.note && <p className="text-sm text-silver-700">{current.dish.note}</p>}
              <div className="mt-auto flex items-center gap-2 pt-4">
                <button
                  type="button"
                  className="btn size-11 justify-center"
                  data-variant="outline"
                  onClick={() => step(-1)}
                >
                  <IconChevronLeft className="size-5" aria-hidden />
                  <span className="sr-only">Món trước</span>
                </button>
                <button
                  type="button"
                  className="btn size-11 justify-center"
                  data-variant="outline"
                  onClick={() => step(1)}
                >
                  <IconChevronRight className="size-5" aria-hidden />
                  <span className="sr-only">Món sau</span>
                </button>
                <button
                  type="button"
                  className="btn ml-auto size-11 justify-center"
                  data-variant="primary"
                  onClick={() => setOpen(null)}
                  autoFocus
                >
                  <IconX className="size-5" aria-hidden />
                  <span className="sr-only">Đóng</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
