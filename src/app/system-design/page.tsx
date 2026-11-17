import { IconArrowUpRight } from "@tabler/icons-react";
import type { Metadata } from "next";
import Image from "next/image";
import cluster from "@/assets/brand/cum-4-hoa-den.svg";
import flower from "@/assets/brand/hoa-den.svg";
import logo from "@/assets/brand/logo-ngang-den.svg";
import { MenuHeroLottie } from "@/components/menu-hero-lottie";
import { SectionHeading } from "@/components/section-heading";
import { Part, Rows } from "@/components/system-design/part";
import { Pair, type Swatch, Swatches } from "@/components/system-design/swatches";
import tokens from "@/data/design-system.json";
import { lookbookAnimation } from "@/data/lookbook";
import {
  changelog,
  checklist,
  essence,
  intro,
  motion,
  photoRules,
  principles,
  surfaces,
  toonRules,
  voice,
} from "@/data/system-design";

export const metadata: Metadata = {
  title: intro.title,
  description: intro.lead,
  // the team's reference, not a page for customers: kept out of search and the sitemap
  robots: { index: false, follow: false },
};

const core = tokens.color.core as Record<string, { hex: string; role?: string | null; pantone?: string | null }>;
const swatch = (name: string): Swatch => ({ name, ...core[name] });
const PRINT = [
  "pink-500",
  "ink",
  "white",
  "silver",
  "pink-800",
  "ink-muted",
  "pink-100",
  "pink-300",
  "pink-700",
  "blue-700",
];
const WEB: Swatch[] = Object.entries(tokens.color.web).map(([name, hex]) => ({ name, hex }));
const ILLUSTRATION: Swatch[] = Object.entries(tokens.color.illustration).map(([name, v]) => ({ name, ...v }));
const PAIR_LABEL: Record<string, string> = {
  "ink/pink-500": "Đen trên hồng phấn",
  "pink-500/ink": "Hồng phấn trên đen",
  "ink/white": "Đen trên trắng",
  "silver/white": "Bạc trên trắng (cỡ lớn)",
  "white/blue-700": "Trắng trên xanh (túi giấy)",
  "white/pink-500": "Trắng trên hồng: cấm",
  "pink-500/white": "Hồng trên trắng: cấm",
};
const pairs = [
  ...tokens.color.pairs.allowed.map((p) => ({ p, allowed: true })),
  ...tokens.color.pairs.forbidden.map((p) => ({ p, allowed: false })),
];

const NAV = [
  ["dna", "Design DNA"],
  ["mau", "Màu"],
  ["chu", "Chữ"],
  ["luoi", "Lưới, khoảng cách"],
  ["thanh-phan", "Thành phần"],
  ["nhan-dien", "Logo, monogram"],
  ["chuyen-dong", "Chuyển động"],
  ["3d-anh", "3D, ảnh món"],
  ["giong", "Giọng nói"],
  ["kiem-tra", "Kiểm tra"],
  ["nhat-ky", "Nhật ký"],
] as const;

const webType = tokens.type.web;

/**
 * /system-design: Boongee's design system as a living page, the reference for every new design. Colours, scales and
 * toon values come from the brand kit's tokens (src/data/design-system.json); the components shown are the site's
 * own; the words are in src/data/system-design.ts. Not linked from the site and not indexed.
 */
export default function SystemDesignPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6 md:pt-16">
      <header className="pb-12 md:pb-16">
        <p className="eyebrow">Boongee · v{tokens.version}</p>
        <h1 className="mt-6 text-4xl font-light tracking-tight md:text-6xl">{intro.title}</h1>
        <p className="mt-6 max-w-2xl text-lg">{intro.lead}</p>
        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs tracking-[0.08em] text-silver-700">
          {intro.sources.map((s) => (
            <li key={s.path}>
              {s.label}: <span className="break-all">{s.path}</span>
            </li>
          ))}
        </ul>
        <nav aria-label="Mục" className="mt-10 flex flex-wrap gap-2">
          {NAV.map(([id, label], i) => (
            <a key={id} href={`#${id}`} data-variant="outline" className="btn px-4 py-1.5 text-sm">
              <span className="text-silver-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <Part
        id="dna"
        index={1}
        title="Design DNA"
        lead="Vì sao Boongee trông như vậy. Mọi quy tắc phía dưới đi ra từ đây."
      >
        <p className="text-3xl font-light tracking-[0.18em] uppercase md:text-5xl">{essence.slogan}</p>
        <dl className="mt-10 grid gap-8 md:grid-cols-3">
          {essence.pillars.map((p) => (
            <div key={p.word}>
              <dt className="text-2xl font-light">{p.word}</dt>
              <dd className="mt-2 text-silver-700">{p.line}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-16 mb-4 text-xl font-light">Sáu nguyên tắc</h3>
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-silver-200 bg-silver-200 md:grid-cols-2 lg:grid-cols-3">
          {principles.map((p, i) => (
            <li key={p.title} className="bg-white p-6">
              <p className="text-xs text-silver-500 tabular-nums">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-lg">{p.title}</p>
              <p className="mt-2 text-sm text-silver-700">{p.line}</p>
            </li>
          ))}
        </ol>
        <h3 className="mt-16 mb-4 text-xl font-light">Tính cách</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-xs tracking-[0.2em] text-silver-700 uppercase">
            <tr>
              <th className="py-2 font-normal">Là</th>
              <th className="py-2 font-normal">Không là</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver-200 border-y border-silver-200">
            {essence.personality.map(([is, isNot]) => (
              <tr key={is}>
                <td className="py-3">{is}</td>
                <td className="py-3 text-silver-700">{isNot}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mt-16 mb-4 text-xl font-light">Bốn bề mặt, bốn bảng màu</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {surfaces.map((s) => (
            <div key={s.name} className="card-line p-6">
              <p className="text-xs tracking-[0.12em] text-silver-700">Từ {s.since}</p>
              <p className="mt-2 text-lg">{s.name}</p>
              <p className="mt-2 text-sm">{s.look}</p>
              <p className="mt-1 text-sm text-silver-700">{s.palette}</p>
            </div>
          ))}
        </div>
      </Part>

      <Part id="mau" index={2} title="Màu" lead="Giá trị từ tokens.json. Mỗi bề mặt dùng bảng của nó, không trộn.">
        <h3 className="mb-6 text-xl font-light">In ấn và màu lõi</h3>
        <Swatches items={PRINT.map(swatch)} />
        <h3 className="mt-16 mb-6 text-xl font-light">Website: trắng, bạc, xanh pastel</h3>
        <Swatches items={WEB} />
        <h3 className="mt-16 mb-6 text-xl font-light">Minh hoạ Làng Mây (≤ 30 % khung hình, không cho chữ)</h3>
        <Swatches items={ILLUSTRATION} />
        <h3 className="mt-16 mb-6 text-xl font-light">Một màu hoạ tiết trên một màu nền</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pairs.map(({ p: [mark, ground], allowed }) => (
            <Pair
              key={`${mark}/${ground}`}
              mark={swatch(mark)}
              ground={swatch(ground)}
              label={PAIR_LABEL[`${mark}/${ground}`] ?? `${mark} / ${ground}`}
              allowed={allowed}
            />
          ))}
        </ul>
      </Part>

      <Part id="chu" index={3} title="Chữ" lead="Chỉ Fraunces. Không font thứ hai, kể cả cho số.">
        <div className="divide-y divide-silver-200 border-y border-silver-200">
          {[
            {
              name: "H1 · slogan",
              spec: `${webType.h1.size} · ${webType.h1.weight} · giãn ${webType.h1.tracking} · chữ hoa`,
              sample: (
                <p className="text-4xl leading-[1.3] font-light tracking-[0.18em] uppercase md:text-6xl">Trà hương</p>
              ),
            },
            {
              name: "H2 · tiêu đề mục",
              spec: `${webType.h2.size} · ${webType.h2.weight}`,
              sample: <p className="text-3xl font-light tracking-tight md:text-5xl">Thức uống đặc trưng</p>,
            },
            {
              name: "Eyebrow",
              spec: `${webType.eyebrow.size} · giãn ${webType.eyebrow.tracking} · ${webType.eyebrow.color}`,
              sample: <p className="eyebrow">Thực đơn</p>,
            },
            {
              name: "Thân",
              spec: `${webType.body.size} · dòng ${webType.body.leading}`,
              sample: <p className="max-w-xl text-lg">Trà ướp hoa dành dành, bạch lan, hoa trúc.</p>,
            },
            {
              name: "Chú thích",
              spec: `${webType.caption.size} · ${webType.caption.color}`,
              sample: <p className="text-xs tracking-[0.12em] text-silver-700">Ảnh minh hoạ</p>,
            },
          ].map((row) => (
            <div key={row.name} className="grid gap-4 py-8 md:grid-cols-[14rem_1fr] md:items-center">
              <div>
                <p>{row.name}</p>
                <p className="mt-1 text-xs text-silver-700">{row.spec}</p>
              </div>
              {row.sample}
            </div>
          ))}
        </div>
      </Part>

      <Part id="luoi" index={4} title="Lưới, khoảng cách, bo góc">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-light">Thang khoảng cách (px)</h3>
            <ul className="space-y-3">
              {tokens.space.map((px) => (
                <li key={px} className="flex items-center gap-4 text-sm tabular-nums">
                  <span className="w-10 text-silver-700">{px}</span>
                  <span className="h-3 rounded-full bg-blue-200" style={{ width: px * 2 }} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-light">Bo góc</h3>
            <ul className="grid grid-cols-2 gap-4">
              {Object.entries(tokens.radius).map(([name, r]) => (
                <li key={name}>
                  <div className="aspect-[3/2] border border-silver-300 bg-silver-50" style={{ borderRadius: r }} />
                  <p className="mt-2 text-sm">
                    {name} <span className="text-silver-700">{r}</span>
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-silver-700">
              Khung tối đa {tokens.layout.maxWidth}; lề {tokens.layout.gutter.phone} (điện thoại),{" "}
              {tokens.layout.gutter.sm} (từ 640 px); mỗi mục cách nhau {tokens.layout.sectionY.phone} /{" "}
              {tokens.layout.sectionY.md}.
            </p>
          </div>
        </div>
      </Part>

      <Part
        id="thanh-phan"
        index={5}
        title="Thành phần"
        lead="Thành phần thật của website (look.css), không phải ảnh chụp."
      >
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="card-line p-8">
            <p className="mb-6 text-xs tracking-[0.2em] text-silver-700 uppercase">Nút · .btn</p>
            <div className="flex flex-wrap gap-3">
              <a href="#thanh-phan" data-variant="primary" className="btn px-6 py-3">
                Xem thực đơn
              </a>
              <a href="#thanh-phan" data-variant="outline" className="btn px-6 py-3">
                Tìm cửa hàng
              </a>
              <a href="#thanh-phan" data-variant="outline" className="btn px-5 py-2.5">
                Xem toàn bộ thực đơn
                <IconArrowUpRight aria-hidden className="size-4" />
              </a>
            </div>
          </div>
          <div className="card-line p-8">
            <p className="mb-6 text-xs tracking-[0.2em] text-silver-700 uppercase">Thẻ · .card-line</p>
            <p className="text-lg">Nền trắng, viền bạc 1 px, bo 20 px, không đổ bóng.</p>
          </div>
          <div className="card-line p-8 lg:col-span-2">
            <p className="mb-6 text-xs tracking-[0.2em] text-silver-700 uppercase">Tiêu đề mục · SectionHeading</p>
            <SectionHeading
              tagline="Ưu đãi"
              title="Ưu đãi thành viên"
              aside={
                <a href="#thanh-phan" data-variant="outline" className="btn px-5 py-2.5">
                  Hành động phụ
                </a>
              }
            />
          </div>
          <div className="card-line p-8 lg:col-span-2">
            <p className="mb-6 text-xs tracking-[0.2em] text-silver-700 uppercase">Danh mục đánh số</p>
            <ol className="divide-y divide-silver-200 border-y border-silver-200">
              {["Trà sữa hương hoa", "Trà trái cây", "Cà phê phin · Coldbrew"].map((t, i) => (
                <li key={t} className="flex items-baseline gap-6 py-4">
                  <span className="w-6 text-xs tracking-[0.2em] text-silver-500 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xl font-light">{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Part>

      <Part
        id="nhan-dien"
        index={6}
        title="Logo, monogram"
        lead="Logo đen trên trắng và hồng, hồng trên đen, bạc trên cốc giấy 2 lớp. Bốn dấu monogram: đĩa hoa, hoa đặc, sao hoa, hoa tròn đặc."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card-line flex aspect-[3/2] items-center justify-center p-8">
            <Image src={logo} alt="Logo ngang Boongee, Đen Than" className="h-12 w-auto" />
          </div>
          <div className="card-line flex aspect-[3/2] items-center justify-center p-8">
            <Image src={flower} alt="Biểu tượng hoa 5 cánh, Đen Than" className="h-24 w-auto" />
          </div>
          <div className="card-line flex aspect-[3/2] items-center justify-center p-8">
            <Image src={cluster} alt="Cụm 4 hoa monogram xếp 2 × 2" className="h-28 w-auto" />
          </div>
        </div>
        <p className="mt-6 text-sm text-silver-700">
          Cụm 2 × 2: hai hoa cánh tròn nằm một đường chéo, hai hoa cánh nhọn đường chéo kia. File gốc:
          brandkit/print/identity/01-logo/.
        </p>
      </Part>

      <Part id="chuyen-dong" index={7} title="Chuyển động">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <MenuHeroLottie src={lookbookAnimation} className="mx-auto w-64 lg:w-full" />
          <dl className="divide-y divide-silver-200 border-y border-silver-200">
            {motion.map((m) => (
              <div key={m.what} className="grid gap-1 py-3 sm:grid-cols-[16rem_1fr]">
                <dt>{m.what}</dt>
                <dd className="text-silver-700">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Part>

      <Part id="3d-anh" index={8} title="3D cel-shading, ảnh món">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-light">3D</h3>
            <Rows items={toonRules} />
            <p className="mt-4 text-xs text-silver-700">
              Dải sáng {tokens.toon.bands}, độ mềm {tokens.toon.softness}, viền {tokens.toon.outline.widthPx} px, mặt
              khuất {tokens.toon.webShade}, viền vật trắng {tokens.toon.nearWhiteOutline}.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-light">Ảnh món</h3>
            <Rows items={photoRules} />
          </div>
        </div>
      </Part>

      <Part id="giong" index={9} title="Giọng nói">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 text-xl font-light">Nên</h3>
            <Rows items={voice.do} />
          </div>
          <div>
            <h3 className="mb-4 text-xl font-light">Không</h3>
            <Rows items={voice.dont} />
          </div>
        </div>
      </Part>

      <Part id="kiem-tra" index={10} title="Kiểm tra trước khi giao">
        <ol className="grid gap-px overflow-hidden rounded-2xl border border-silver-200 bg-silver-200 sm:grid-cols-2">
          {checklist.map((item, i) => (
            <li key={item} className="flex gap-4 bg-white p-5">
              <span className="text-xs text-silver-500 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </Part>

      <Part
        id="nhat-ky"
        index={11}
        title="Nhật ký cập nhật"
        lead="Mỗi lần đổi quy tắc, thêm một dòng ở đầu (src/data/system-design.ts)."
      >
        <ol className="divide-y divide-silver-200 border-y border-silver-200">
          {changelog.map((entry) => (
            <li key={entry.date} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
              <p className="text-sm text-silver-700 tabular-nums">{entry.date}</p>
              <ul className="space-y-1">
                {entry.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Part>
    </div>
  );
}
