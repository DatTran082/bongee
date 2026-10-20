import { CupAnchor } from "@/components/cup-anchor";
import { SectionHeading } from "@/components/section-heading";
import { menuIntro, sections } from "@/data/boongee";
import {
  categories,
  customisation,
  formatPrice,
  itemCount,
  priceRange,
  pricesAreIllustrative,
  sizes,
  type MenuCategory,
} from "@/data/menu";

const sizeLine = sizes.map((s) => `${s.label} ${s.volume.replace("ml", " ml")}`).join(" · ");

/** One menu category as a price table: name, then M / L prices (or one price for single-size categories). */
function CategoryTable({ category }: { category: MenuCategory }) {
  return (
    <div className="parallax-rise rounded-3xl border border-brand-line bg-brand-bg-alt p-6">
      <table className="w-full border-collapse text-left">
        <caption className="mb-4 text-left text-xl font-semibold md:text-2xl">{category.title}</caption>
        <thead>
          <tr className="text-xs tracking-[0.15em] text-brand-ink-muted uppercase">
            <th scope="col" className="pb-2 font-normal">
              <span className="sr-only">Món</span>
            </th>
            {category.sized ? (
              sizes.map((s) => (
                <th key={s.label} scope="col" className="w-14 pb-2 text-right font-normal">
                  <span aria-hidden>{s.label}</span>
                  <span className="sr-only">{`Cỡ ${s.label}, ${s.volume.replace("ml", " ml")}`}</span>
                </th>
              ))
            ) : (
              <th scope="col" className="w-14 pb-2 text-right font-normal">
                <span className="sr-only">Giá</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {category.items.map((item) => (
            <tr key={item.name} className="border-t border-brand-line">
              <th scope="row" className="py-2.5 pr-3 font-normal">
                {item.name}
                {item.name === menuIntro.featured && (
                  <span className="ml-2 inline-block rounded-full border border-brand-ink px-2 py-0.5 align-middle text-xs">
                    Nên thử
                  </span>
                )}
              </th>
              {item.prices.map((price, i) => (
                <td key={i} className="py-2.5 text-right">
                  {formatPrice(price)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The full menu (from ShanMay menu-data.json), in the printed menu's order, then the sugar / ice options. From lg
 * up the PP cup keeps a sticky column on the right; below that it rests above the tables.
 */
export function Menu() {
  const pose = { turn: -0.4, tilt: 0.1 };
  return (
    <section id={sections.menu} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
      <SectionHeading
        tagline={menuIntro.tagline}
        title={menuIntro.title}
        subtitle={`${itemCount} món, từ ${formatPrice(priceRange.min)} đến ${formatPrice(priceRange.max)}. Cỡ ly ${sizeLine}.`}
      />
      <div className="cup-grid lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <CupAnchor name="menu" {...pose} className="mb-8 h-[40vh] max-h-[22rem] lg:hidden" />
          <div className="grid items-start gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <CategoryTable key={category.id} category={category} />
            ))}
          </div>
          <div className="parallax-rise mx-auto mt-8 max-w-3xl rounded-3xl bg-brand-bg-alt px-6 py-6 text-center md:px-10">
            <h3 className="text-xl font-semibold">{customisation.title}</h3>
            <dl className="mt-3 flex flex-col justify-center gap-2 text-lg sm:flex-row sm:gap-10">
              {customisation.options.map((option) => (
                <div key={option.label} className="flex justify-center gap-3">
                  <dt className="font-semibold">{option.label}</dt>
                  <dd>{option.options}</dd>
                </div>
              ))}
            </dl>
          </div>
          {pricesAreIllustrative && <p className="mt-6 text-center text-sm">Giá tham khảo, đang cập nhật.</p>}
        </div>
        <div className="hidden lg:block lg:self-stretch">
          {/* self-stretch: the item runs the row's full height, so the slot has room to stick in */}
          <CupAnchor name="menu-side" {...pose} className="sticky top-24 h-[72vh] max-h-[44rem]" />
        </div>
      </div>
    </section>
  );
}
