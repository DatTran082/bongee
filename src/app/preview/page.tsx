import type { Metadata } from "next";
import Link from "next/link";
import { PreviewCatalog } from "@/components/preview-catalog";

export const metadata: Metadata = {
  title: "Thực Đơn Hình Ảnh Lookbook Studio",
  description:
    "Bộ ảnh chụp thực tế 33 món, combo và topping của Boongee · Làng Mây theo quy chuẩn Open-Top (không nắp, không ống hút) và 3 dáng ly nhận diện thương hiệu.",
  alternates: { canonical: "/preview" },
};

export default function PreviewPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16">
      {/* Top Breadcrumb Navigation */}
      <nav aria-label="Đường dẫn trang" className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-brand-ink-muted uppercase transition-colors hover:text-brand-ink"
        >
          <span aria-hidden="true" className="font-serif">
            ←
          </span>
          <span>Về trang chủ</span>
        </Link>
      </nav>

      {/* Editorial Header */}
      <header className="mb-14 space-y-4">
        <div className="inline-block border-b border-brand-ink/30 pb-1 text-xs font-semibold tracking-widest text-brand-ink-muted uppercase">
          Boongee · Làng Mây — Brand Lookbook
        </div>
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl md:text-5xl">
          Thực Đơn Hình Ảnh Lookbook Studio
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-brand-ink-muted">
          Bộ ảnh chụp thực tế 33 món, combo và topping của Boongee theo quy chuẩn nhận diện Làng Mây: 100% mở nắp
          (Open-Top, không đậy nắp, không cắm ống hút) trên bệ thạch cao lượn sóng và phông nền pastel vô cực. Mọi thiết
          kế, tỉ lệ và màu sắc tuân thủ nghiêm ngặt Brand DNA.
        </p>
      </header>

      {/* Brand Packaging DNA Reference Matrix */}
      <div className="mb-14 grid grid-cols-1 gap-4 border-y border-brand-ink/15 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <div className="text-[0.7rem] font-bold tracking-wider text-brand-ink uppercase">1. Ly Giấy 2 Lớp 16oz</div>
          <p className="text-xs leading-relaxed text-brand-ink-muted">
            Giấy trắng 2 lớp (Ø90 × 135 mm), in cụm 4 hoa màu bạc Pantone 877 C. Dành cho Trà sữa hương hoa & Trà sữa
            kem bông.
          </p>
        </div>
        <div className="space-y-1">
          <div className="text-[0.7rem] font-bold tracking-wider text-brand-ink uppercase">
            2. Ly Nhựa PP Tim Nhám 700ml
          </div>
          <p className="text-xs leading-relaxed text-brand-ink-muted">
            Nhựa PP mờ tim nhám (Ø90 × 180 mm), in lụa trắng cột 4 dấu hoa. Dành cho Trà trái cây & Kem cheese 22%.
          </p>
        </div>
        <div className="space-y-1">
          <div className="text-[0.7rem] font-bold tracking-wider text-brand-ink uppercase">
            3. Ly Nhựa PET Trong 350ml
          </div>
          <p className="text-xs leading-relaxed text-brand-ink-muted">
            Nhựa PET trong suốt (Ø84 × 120 mm), in lụa trắng cột 4 hoa. Dành cho Cà phê phin truyền thống & Coldbrew
            trái cây.
          </p>
        </div>
        <div className="space-y-1">
          <div className="text-[0.7rem] font-bold tracking-wider text-brand-ink uppercase">
            4. Bệ Trắng & Nền Pastel
          </div>
          <p className="text-xs leading-relaxed text-brand-ink-muted">
            Bệ thạch cao trắng mờ lượn sóng, 3–5 hạt/quả decor rời rạc. Phông nền cyclorama 1 màu pastel đồng nhất không
            viền.
          </p>
        </div>
      </div>

      {/* Visual Catalog */}
      <PreviewCatalog />
    </div>
  );
}
