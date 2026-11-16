import type { Metadata } from "next";
import Link from "next/link";
import { FlowerMark } from "@/components/lang-may/flower-mark";
import { LookbookGallery } from "@/components/lookbook-gallery";
import { MenuHeroLottie } from "@/components/menu-hero-lottie";
import { lookbookAnimation, lookbookGroups, lookbookSyncedOn } from "@/data/lookbook";

const dishCount = lookbookGroups.reduce((n, g) => n + g.items.length, 0);
const [year, month, day] = lookbookSyncedOn.split("-");

export const metadata: Metadata = {
  title: "Thực đơn",
  description:
    "Thực đơn Boongee: từng món trà sữa hương hoa, trà trái cây, kem cheese, cà phê và combo, kèm ảnh minh hoạ và giá tại quầy.",
  alternates: { canonical: "/menu" },
};

/** The menu with a photo per dish, from the till (Odoo) and the brand kit's lookbook; linked from the home page's menu. */
export default function MenuPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-20">
      <header className="mb-14 grid items-center gap-8 md:mb-20 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-12">
        <div className="card-sticker mx-auto w-56 rounded-[2.5rem] bg-brand-bg-alt p-4 md:order-2 md:w-full md:p-6">
          <MenuHeroLottie src={lookbookAnimation} className="w-full" />
        </div>
        <div className="text-center md:order-1 md:text-left">
          <p className="flex items-center justify-center gap-3 text-sm font-semibold tracking-[0.2em] text-brand-pink-800 uppercase md:justify-start">
            <FlowerMark className="size-5" />
            Boongee
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance text-brand-ink md:text-7xl">Thực đơn</h1>
          <p className="mt-4 text-lg md:max-w-xl md:text-xl">
            {dishCount} món đang bán. Ảnh minh hoạ, giá tại quầy cập nhật ngày {day}/{month}/{year}.
          </p>
          <nav aria-label="Nhóm món" className="mt-8 flex flex-wrap justify-center gap-2 md:justify-start">
            {lookbookGroups.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-full border border-brand-line bg-brand-bg-alt px-4 py-1.5 text-[0.95rem] transition-colors hover:border-brand-ink focus-visible:outline-2 focus-visible:outline-brand-ink"
              >
                {group.title}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <LookbookGallery groups={lookbookGroups} />

      <p className="mt-16 text-center">
        <Link
          href="/"
          className="button-game inline-flex items-center rounded-full px-6 py-3 font-semibold"
          data-variant="outline"
        >
          Về trang chủ
        </Link>
      </p>
    </div>
  );
}
