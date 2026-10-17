# Boongee · Landing page

Trang giới thiệu một trang của **Boongee — Trà hương thanh vị**. Dựng bằng **Next.js 16** (App Router, React 19,
TypeScript, Tailwind CSS 4), khởi tạo từ `create-next-app` chính thức. Mọi trang đều dựng sẵn thành trang tĩnh.

## Chạy

Cần Node.js ≥ 20.9.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # dựng bản production
npm run start        # chạy bản đã dựng
npm run check        # ESLint + TypeScript + Prettier
npm run format       # định dạng lại mã (Prettier, có sắp xếp class Tailwind)
npm run sync-brand   # chép lại tài sản thương hiệu từ ../brandkit (xem dưới)
```

## Nội dung trang

Một trang (`src/app/page.tsx`), giao diện sáng, tiếng Việt:

| Phần                     | Mã nguồn                         | Nội dung                                                                             |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------ |
| Hero                     | `src/components/hero.tsx`        | ảnh hai ly, slogan **Trà hương / thanh vị** (thẻ `<h1>` duy nhất)                    |
| Câu chuyện `#cau-chuyen` | `src/components/story.tsx`       | logo hoa, bốn dấu monogram, màu và chữ của thương hiệu                               |
| Đồ uống `#do-uong`       | `src/components/drinks.tsx`      | các nhóm đồ uống                                                                     |
| Ly Boongee `#ly-boongee` | `src/components/cup-viewers.tsx` | hai ly 3D kéo để xoay (`<model-viewer>`, chỉ tải khi cuộn tới, có ảnh tĩnh thay thế) |
| Ghé quán `#ghe-quan`     | `src/components/visit.tsx`       | địa chỉ, giờ mở cửa, điện thoại, mạng xã hội                                         |

Kèm theo: header dính đầu trang có menu cho điện thoại, footer, trang 404 tiếng Việt, `sitemap.xml`, `robots.txt`,
dữ liệu có cấu trúc (JSON-LD), favicon, icon iOS và ảnh chia sẻ Facebook / Zalo.

**Mọi chữ và thông tin trên trang nằm trong `src/data/boongee.ts`.** Những mục chưa biết để `null` và đánh dấu
`TODO(boongee)`: trang hiện "Đang cập nhật", link mạng xã hội chưa có thì không hiện. Trước khi ra mắt cần điền:

- địa chỉ, link Google Maps, giờ mở cửa, số điện thoại (`visit`);
- link Facebook, Instagram, TikTok, Zalo (`socials`);
- thực đơn và giá thật (`drinks`), câu giới thiệu và câu chuyện thương hiệu (`hero`, `story`);
- tên miền: biến môi trường `NEXT_PUBLIC_SITE_URL` (xem `.env.example`), dùng cho đường dẫn chuẩn, sitemap, robots và
  ảnh chia sẻ. Trên Vercel có thể bỏ trống (dùng tên miền production của dự án); chạy `npm run dev` thì dùng
  `localhost`. **Build production mà không có tên miền sẽ báo lỗi**, để không khai báo nhầm địa chỉ với Google.

## Bộ nhận diện

- **Màu** sinh từ `brandkit/color/tokens.json` thành `src/styles/brand-tokens.css` (lớp Tailwind `bg-brand-pink-500`,
  `text-brand-ink`, `border-brand-line`…) và `src/data/brand-tokens.json`. Không gõ mã màu trong component. Chữ luôn là
  Đen Than trên nền hồng hoặc trắng; chữ trắng chỉ trên nền Đen Than.
- **Font** duy nhất là Fraunces (SIL OFL), tự host qua `next/font`, có bộ ký tự tiếng Việt và các trục SOFT, WONK, opsz.
- **Logo** `src/assets/brand/logo-ngang.svg`; favicon và icon iOS là bông hoa logo trên nền hồng phấn.

### Đồng bộ với brandkit

Tài sản thương hiệu được chép vào repo (dựng và deploy không cần `brandkit/`). Khi brandkit đổi, chạy
`npm run sync-brand` (đường dẫn khác: `BOONGEE_BRANDKIT=/đường/dẫn/brandkit npm run sync-brand`):

| Từ `brandkit/`                                      | Sang                                                            |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `color/tokens.json`                                 | `src/styles/brand-tokens.css`, `src/data/brand-tokens.json`     |
| `nhan-dien/01-logo/logo-ngang-khong-slogan_den.svg` | `src/assets/brand/logo-ngang.svg`                               |
| `nhan-dien/01-logo/bieu-tuong-hoa_den.svg`          | `src/app/icon.svg`, `favicon.ico`, `apple-icon.png`             |
| `nhan-dien/03-hoa-tiet/monogram_hong.png`           | `src/assets/images/monogram-hong.png`                           |
| `lookbook/anh-bia/facebook.png`                     | `src/assets/images/hero.jpg` (ảnh hero)                         |
| `nhan-dien/04-anh-bia/facebook-slogan-den.png`      | `src/app/opengraph-image.jpg`, `twitter-image.jpg` (1200 × 628) |
| `3d/boongee-*.glb`, `3d/preview/boongee-*.png`      | `public/models/` (mô hình 3D và ảnh tĩnh của nó)                |

## Deploy

Hợp nhất với **Vercel** (nhập repo; đặt `NEXT_PUBLIC_SITE_URL` khi có tên miền riêng). Chạy được trên mọi máy chủ Node (`npm run build` rồi
`npm run start`). CI trên GitHub (`.github/workflows/ci.yml`) chạy `npm run check` và `npm run build` cho mỗi lần push /
pull request vào `main`.

`npm audit` báo lỗ hổng trong `eslint-config-next` (gói `braces` cũ): chỉ là công cụ kiểm tra mã lúc phát triển,
không có trong trang gửi tới người xem.
