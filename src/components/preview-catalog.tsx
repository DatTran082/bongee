"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { PreviewLightbox } from "@/components/preview-lightbox";
import board from "@/data/menu-featured.json";
import { type LookbookItem, lookbookItems } from "@/data/menu-lookbook";

interface GroupSpec {
  id: string;
  title: string;
  mark: string;
  cupSpec: string;
  description: string;
  category: LookbookItem["category"];
}

const GROUPS: GroupSpec[] = [
  {
    id: "huong-hoa",
    title: "Trà sữa hương hoa",
    mark: board.marks["Trà sữa hương hoa"] ?? "/menu/mark/hoa-dac_hong.3d414bc4.svg",
    cupSpec: "Ly giấy 2 lớp 16oz (Ø90 × 135 mm) · In bạc Pantone 877 C · Nền hồng phấn #F5C4C4",
    description:
      "Cốt trà ướp hoa tươi truyền thống (hoa bạch lan, hoa dành dành, hoa đào, hoa nhài, hoa trúc), pha nhẹ tay với sữa tươi thanh trùng cho vị thơm thanh, êm dịu.",
    category: "huong-hoa",
  },
  {
    id: "kem-bong",
    title: "Trà sữa kem bông",
    mark: board.marks["Trà sữa kem bông"] ?? "/menu/mark/hoa-tron_troi.f0f78294.svg",
    cupSpec:
      "Ly giấy 2 lớp 16oz (Ø90 × 135 mm) · In bạc Pantone 877 C + Vòm kem bông rắc vụn hoa · Nền hồng kem #FCEDF2",
    description:
      "Trà sữa hương hoa kết hợp vòm kem tươi đánh bông xốp bồng bềnh như mây, điểm xuyết cánh hồng khô và nhị quế hoa vàng óng.",
    category: "kem-bong",
  },
  {
    id: "trai-cay",
    title: "Trà trái cây",
    mark: board.marks["Trà trái cây"] ?? "/menu/mark/sao-hoa_reu.4313ba3c.svg",
    cupSpec: "Ly nhựa PP tim nhám 700ml (Ø90 × 180 mm) · In lụa trắng cột 4 dấu hoa · Nền xanh rêu non #C3DAA6",
    description:
      "Trà trúc và trà hoa nhài ủ lạnh kết hợp trái cây tươi giòn tách vỏ (nho xanh, nho tím Kyoho, xoài tươi, dâu tằm, cóc xanh và quất hồng bì phố cổ Hà Nội).",
    category: "trai-cay",
  },
  {
    id: "kem-cheese",
    title: "Kem cheese",
    mark: board.marks["Kem cheese"] ?? "/menu/mark/dia-hoa_mat-ong.55d28688.svg",
    cupSpec:
      "Ly nhựa PP tim nhám 700ml (Ø90 × 180 mm) · In lụa trắng cột 4 dấu hoa + Lớp cheese 22% · Nền vàng kem #F8E8CF",
    description:
      "Lớp phô mai kem New Zealand sánh mịn với độ mặn nhẹ êm dịu phủ trên nền trà trái cây tươi mát hoặc trà hoa nhài vàng hổ phách.",
    category: "kem-cheese",
  },
  {
    id: "ca-phe",
    title: "Cà phê phin · Coldbrew",
    mark: board.marks["Cà phê phin · Coldbrew"] ?? "/menu/mark/dia-hoa_go.4c5c0e02.svg",
    cupSpec: "Ly nhựa PET trong 350ml (Ø84 × 120 mm) · In lụa trắng cột 4 dấu hoa · Nền ghi khói sáng #F2EEEF",
    description:
      "Cà phê Robusta phin truyền thống đậm đà và Arabica coldbrew ủ lạnh 18 giờ kết hợp trái cây tươi (bưởi hồng, chanh vàng Meyer, khế phố cổ).",
    category: "ca-phe",
  },
  {
    id: "combo",
    title: "Combo ghép vị",
    mark: "/menu/mark/hoa-dac_hong.3d414bc4.svg",
    cupSpec: "Bộ ly đối lập (Ly giấy 16oz + Ly PP 700ml / Ly PET 350ml) · Nền pastel đồng nhất",
    description:
      "Sự kết hợp cân bằng giữa các dòng đồ uống thanh nhẹ và béo đậm, thiết kế cho cặp đôi hoặc nhóm bạn thưởng thức trọn vẹn hương vị Boongee.",
    category: "combo",
  },
  {
    id: "topping",
    title: "Topping thêm",
    mark: "/menu/mark/dia-hoa_mat-ong.55d28688.svg",
    cupSpec: "Đĩa sứ trắng mờ tối giản · Nền pastel đồng nhất",
    description:
      "Thạch trà nấu chậm từ cốt trà ô long xanh thanh thuần, vòm kem bông xốp rắc vụn hoa và kem cheese New Zealand tươi.",
    category: "topping",
  },
];

export function PreviewCatalog() {
  const [activeItem, setActiveItem] = useState<LookbookItem | null>(null);

  const itemsByGroup = useMemo(() => {
    const map = new Map<string, LookbookItem[]>();
    for (const group of GROUPS) {
      map.set(
        group.id,
        lookbookItems.filter((item) => item.category === group.category),
      );
    }
    return map;
  }, []);

  return (
    <div className="space-y-16">
      {/* Category Quick Navigation (Clean editorial anchor links - No bubble chips) */}
      <nav aria-label="Danh mục thực đơn" className="border-y border-brand-ink/15 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold tracking-wider text-brand-ink-muted uppercase">
          {GROUPS.map((group, index) => {
            const count = itemsByGroup.get(group.id)?.length ?? 0;
            return (
              <span key={group.id} className="inline-flex items-center gap-2">
                <a
                  href={`#${group.id}`}
                  className="underline-offset-4 transition-colors hover:text-brand-ink hover:underline"
                >
                  {group.title} ({count})
                </a>
                {index < GROUPS.length - 1 && (
                  <span aria-hidden="true" className="text-brand-ink/20">
                    ·
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </nav>

      {/* Main Groups */}
      <div className="space-y-20">
        {GROUPS.map((group) => {
          const items = itemsByGroup.get(group.id) ?? [];
          return (
            <section
              key={group.id}
              id={group.id}
              className="scroll-mt-24 space-y-8"
              aria-labelledby={`${group.id}-heading`}
            >
              {/* Group Editorial Header */}
              <div className="border-b border-brand-ink/15 pb-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={group.mark}
                    alt=""
                    width={32}
                    height={32}
                    aria-hidden="true"
                    unoptimized
                    className="size-8 shrink-0"
                  />
                  <h2
                    id={`${group.id}-heading`}
                    className="font-serif text-2xl font-bold tracking-wider text-brand-ink uppercase sm:text-3xl"
                  >
                    {group.title}
                  </h2>
                </div>
                <p className="mt-2 text-xs font-medium tracking-widest text-brand-ink-muted uppercase">
                  {group.cupSpec}
                </p>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-ink-muted">{group.description}</p>
              </div>

              {/* Items Grid (Flat, stable, editorial, no hover position shift, no chips) */}
              <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className="group flex cursor-pointer flex-col"
                  >
                    {/* Photo Frame (Stable, clean 3:4 ratio, no bouncing zoom, no chips) */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-brand-ink/10 bg-brand-bg-alt">
                      <Image
                        src={item.imageThumb}
                        alt={`Ảnh thực tế món ${item.name}`}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>

                    {/* Editorial Details Under Photo */}
                    <div className="mt-3.5 flex flex-1 flex-col justify-between">
                      <div>
                        {/* Title & Price on one baseline */}
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-serif text-lg font-bold text-brand-ink">{item.name}</h3>
                          <span className="font-serif text-base font-bold text-brand-ink tabular-nums">
                            {item.prices[0]}K
                          </span>
                        </div>

                        {/* Recipe & Tasting Note */}
                        <p className="mt-1 text-xs leading-relaxed text-brand-ink-muted italic">{item.note}</p>
                      </div>

                      {/* Technical specifications */}
                      <div className="mt-3 border-t border-brand-ink/10 pt-2 text-[0.72rem] leading-normal text-brand-ink-muted">
                        <div>
                          <span className="font-semibold text-brand-ink">Ly: </span>
                          <span>{item.cupType}</span>
                          {item.badge && <span className="ml-1 text-brand-ink">({item.badge})</span>}
                        </div>
                        <div className="mt-0.5 line-clamp-1">
                          <span className="font-semibold text-brand-ink">Decor: </span>
                          <span>{item.decor}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span
                            className="inline-block size-2.5 rounded-sm border border-black/15"
                            style={{ backgroundColor: item.bgColor }}
                            aria-hidden="true"
                          />
                          <span>
                            {item.bgName} ({item.bgColor})
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <PreviewLightbox item={activeItem} onClose={() => setActiveItem(null)} />
    </div>
  );
}
