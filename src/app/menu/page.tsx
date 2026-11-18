import type { Metadata } from "next";
import { LookbookGallery } from "@/components/lookbook-gallery";
import { MenuHeroLottie } from "@/components/menu-hero-lottie";
import { lookbookAnimation, lookbookGroups, lookbookSyncedOn } from "@/data/lookbook";

const [year, month, day] = lookbookSyncedOn.split("-");

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Menu Boongee: từng món trà sữa hương hoa, trà trái cây, kem cheese, cà phê và combo, kèm ảnh minh hoạ và giá tại quầy.",
  alternates: { canonical: "/menu" },
};

/**
 * The menu with a photo per dish, from the till (Odoo) and the brand kit's lookbook; linked from the home page's
 * menu. Its header is the hand-drawn Lottie, straight on the page (no frame) on a pale silver wash, and the groups as a
 * quiet index; the page's name is for assistive tech and search only (owner, 17/11/2026).
 */
export default function MenuPage() {
  return (
    <div className="bg-gradient-to-b from-silver-50 via-white to-white">
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-20 sm:px-6 md:pt-16 md:pb-28">
        <header className="mb-16 grid items-center gap-8 md:mb-24 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-16">
          <MenuHeroLottie src={lookbookAnimation} className="mx-auto w-56 md:order-2 md:w-full" />
          <div className="md:order-1">
            <h1 className="sr-only">Menu</h1>
            <p className="eyebrow">Boongee</p>
            <nav aria-label="Nhóm món" className="mt-8">
              <ol className="divide-y divide-silver-200 border-y border-silver-200">
                {lookbookGroups.map((group, i) => (
                  <li key={group.id}>
                    <a
                      href={`#${group.id}`}
                      className="group flex items-baseline gap-6 py-4 transition-colors hover:text-silver-700 focus-visible:outline-2 focus-visible:outline-brand-ink"
                    >
                      <span className="w-6 text-xs tracking-[0.2em] text-silver-500 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-xl font-light md:text-2xl">{group.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <p className="mt-6 text-xs tracking-[0.12em] text-silver-700">
              Ảnh minh hoạ · Giá tại quầy, cập nhật {day}/{month}/{year}
            </p>
          </div>
        </header>

        <LookbookGallery groups={lookbookGroups} />
      </div>
    </div>
  );
}
