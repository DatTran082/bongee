import Link from "next/link";
import { MenuPicker } from "@/components/menu-picker";
import { SectionHeading } from "@/components/section-heading";
import { menuIntro, sections } from "@/data/boongee";
import { formatPrice, itemCount, priceRange, sizes } from "@/data/menu";

const sizeLine =
  sizes.length > 1
    ? `Cỡ ly ${sizes.map((s) => `${s.label} ${s.volume.replace("ml", " ml")}`).join(" · ")}`
    : `Một cỡ ly ${sizes[0].volume.replace("ml", " ml")}`;

/**
 * The menu section: the shop's Odoo menu laid out as the printed menu board (brandkit/menu-board/thuc-don.pdf):
 * featured cups, groups with their prices, lookbook poster, topping, sugar and ice strips.
 * Links to /menu, the same menu with a photo per dish.
 */
export function Menu() {
  return (
    <section id={sections.menu} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        tagline={menuIntro.tagline}
        title={menuIntro.title}
        subtitle={`${itemCount} món chính thức, từ ${formatPrice(priceRange.min)} đến ${formatPrice(priceRange.max)}. ${sizeLine}.`}
      />

      {/* the same menu with a photo per dish */}
      <div className="mb-10 text-center">
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 border-b border-brand-ink/40 pb-1 text-sm font-medium text-brand-ink transition-colors hover:border-brand-ink hover:text-brand-ink"
        >
          <span>Xem ảnh từng món và combo</span>
          <span aria-hidden="true" className="font-serif">
            →
          </span>
        </Link>
      </div>

      <MenuPicker />
    </section>
  );
}
