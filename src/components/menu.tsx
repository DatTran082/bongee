import { MenuPicker } from "@/components/menu-picker";
import { SectionHeading } from "@/components/section-heading";
import { menuIntro, sections } from "@/data/boongee";
import { formatPrice, itemCount, priceRange, sizes } from "@/data/menu";

const sizeLine = sizes.map((s) => `${s.label} ${s.volume.replace("ml", " ml")}`).join(" · ");

/**
 * The menu (the shop's Odoo, src/data/menu.ts): its heading, then the picker (src/components/menu-picker.tsx), laid
 * out as the printed menu board: featured cups, groups with their prices, the lookbook poster, the topping, sugar and
 * ice strips; each group's mark turns while the group is active.
 */
export function Menu() {
  return (
    <section id={sections.menu} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        tagline={menuIntro.tagline}
        title={menuIntro.title}
        subtitle={`${itemCount} món, từ ${formatPrice(priceRange.min)} đến ${formatPrice(priceRange.max)}. Cỡ ly ${sizeLine}.`}
      />
      <MenuPicker />
    </section>
  );
}
