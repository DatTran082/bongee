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

Một trang (`src/app/page.tsx`), giao diện sáng, tiếng Việt. Nội dung lấy từ bộ brand kit gốc **ShanMay**
(`../../ShanMay/brand-kit`): câu chuyện và giọng văn từ `docs/01-brand-foundation.md`, thực đơn từ
`menu-posm/print-ready/menu-data.json`, ưu đãi từ `collateral/collateral.json`.

| Phần                     | Mã nguồn                      | Nội dung                                                                      |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------- |
| Hero                     | `src/components/hero.tsx`     | ảnh hai ly, slogan **Trà hương / thanh vị** (thẻ `<h1>` duy nhất)             |
| Câu chuyện `#cau-chuyen` | `src/components/story.tsx`    | Gốc · Nghi thức · Cảm xúc, hoạ tiết monogram                                  |
| Điều Boongee giữ         | `src/components/promises.tsx` | hoa thật, ngọt vừa (mặc định 50%), pha thật nhẹ                               |
| Thực đơn `#thuc-don`     | `src/components/menu.tsx`     | 6 nhóm, 23 món + topping, giá M 500 ml / L 700 ml, tuỳ chỉnh đường và đá      |
| Ưu đãi `#uu-dai`         | `src/components/offers.tsx`   | giảm 20% thứ 2 – thứ 4 cho đơn từ 2 ly, thẻ tích điểm 10 dấu                  |
| Hỏi đáp `#hoi-dap`       | `src/components/faq.tsx`      | 7 câu, trả lời ghép từ dữ liệu thực đơn, ưu đãi, địa chỉ                      |
| Ghé quán `#ghe-quan`     | `src/components/visit.tsx`    | 14B ngách 7/72 phố Hoa Bằng, Cầu Giấy, Hà Nội, bản đồ, giờ mở cửa, điện thoại |

Kèm theo: header dính đầu trang có menu cho điện thoại, footer, trang 404 tiếng Việt, `sitemap.xml`, `robots.txt`,
dữ liệu có cấu trúc (JSON-LD: WebSite, CafeOrCoffeeShop, FAQPage), favicon, icon iOS và ảnh chia sẻ.

### Sửa nội dung ở đâu

| Nội dung                                                   | Sửa ở                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| Món, giá, cỡ ly, tuỳ chỉnh                                 | ShanMay `menu-posm/print-ready/menu-data.json`, rồi `npm run sync-brand` |
| Ưu đãi trong tuần, thẻ tích điểm                           | ShanMay `collateral/collateral.json`, rồi `npm run sync-brand`           |
| Câu chuyện, cam kết, địa chỉ, giờ, điện thoại, mạng xã hội | `src/data/boongee.ts`                                                    |
| Câu hỏi đáp                                                | `src/data/faq.ts` (câu trả lời tự lấy số liệu từ các file trên)          |

Thực đơn trên web và thực đơn in luôn trùng nhau vì cùng một file. Món không có mô tả, vì nguồn không có (không tự viết).

**Cần xác nhận trước khi ra mắt** (đánh dấu `TODO(boongee)` trong mã):

- **giá**: `menu-data.json` ghi `illustrativePrices: true` (giá minh hoạ). Khi còn cờ này, trang ghi "Giá tham khảo,
  đang cập nhật" và dữ liệu cấu trúc (JSON-LD) bỏ khoảng giá. Chốt giá thì đổi thành `false` trong ShanMay rồi
  `npm run sync-brand`;
- **địa chỉ** và khu vực (Hoa Bằng, Cầu Giấy, Hà Nội): tài liệu ShanMay ghi là giả định. Trang vẫn hiện địa chỉ,
  nhưng mô tả SEO và JSON-LD chỉ dùng nó khi `ADDRESS.confirmed: true` trong `src/data/boongee.ts`;
- **câu chuyện** (Gốc · Nghi thức · Cảm xúc, hình ảnh "mây") viết cho tên cũ Shan Mây, nguồn trà núi cao chưa xác
  nhận; **mặc định ngọt 50%**, **món nên thử** (Trà Sữa Bạch Lan Hoa) và **ưu đãi trong tuần** cũng cần chốt;
- **giờ mở cửa, số điện thoại, link mạng xã hội**: chưa có (trang hiện "Đang cập nhật", link chưa có thì ẩn);
- **tên miền**: biến môi trường `NEXT_PUBLIC_SITE_URL` (xem `.env.example`), dùng cho đường dẫn chuẩn, sitemap, robots
  và ảnh chia sẻ. Trên Vercel có thể bỏ trống (dùng tên miền production của dự án); chạy `npm run dev` thì dùng
  `localhost`. **Build production mà không có tên miền sẽ báo lỗi**, để không khai báo nhầm địa chỉ với Google.

## Bộ nhận diện

- **Màu** sinh từ `brandkit/color/tokens.json` thành `src/styles/brand-tokens.css` (lớp Tailwind `bg-brand-pink-500`,
  `text-brand-ink`, `border-brand-line`…) và `src/data/brand-tokens.json`. Không gõ mã màu trong component. Chữ luôn là
  Đen Than trên nền hồng hoặc trắng; chữ trắng chỉ trên nền Đen Than.
- **Font** duy nhất là Fraunces (SIL OFL), tự host qua `next/font`, có bộ ký tự tiếng Việt và các trục SOFT, WONK, opsz.
- **Logo** `src/assets/brand/logo-ngang.svg`; favicon và icon iOS là bông hoa logo trên nền hồng phấn.

### Đồng bộ với brandkit

Tài sản thương hiệu được chép vào repo (dựng và deploy không cần `brandkit/`). Khi brandkit đổi, chạy
`npm run sync-brand` (đường dẫn khác: `BOONGEE_BRANDKIT=…` cho brandkit, `BOONGEE_SHANMAY=…` cho ShanMay
`brand-kit`). Ngoài các file dưới, script chép `menu-data.json` và `collateral.json` của ShanMay vào
`src/data/shanmay/`:

| Từ `brandkit/`                                      | Sang                                                            |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `color/tokens.json`                                 | `src/styles/brand-tokens.css`, `src/data/brand-tokens.json`     |
| `nhan-dien/01-logo/logo-ngang-khong-slogan_den.svg` | `src/assets/brand/logo-ngang.svg`                               |
| `nhan-dien/01-logo/bieu-tuong-hoa_den.svg`          | `src/app/icon.svg`, `favicon.ico`, `apple-icon.png`             |
| `nhan-dien/03-hoa-tiet/monogram_hong.png`           | `src/assets/images/monogram-hong.png`                           |
| `lookbook/anh-bia/facebook.png`                     | `src/assets/images/hero.jpg` (ảnh hero)                         |
| `nhan-dien/04-anh-bia/facebook-slogan-den.png`      | `src/app/opengraph-image.jpg`, `twitter-image.jpg` (1200 × 628) |

## Deploy

Hợp nhất với **Vercel** (nhập repo; đặt `NEXT_PUBLIC_SITE_URL` khi có tên miền riêng). Chạy được trên mọi máy chủ Node (`npm run build` rồi
`npm run start`). CI trên GitHub (`.github/workflows/ci.yml`) chạy `npm run check` và `npm run build` cho mỗi lần push /
pull request vào `main`.

`npm audit` báo lỗ hổng trong `eslint-config-next` (gói `braces` cũ): chỉ là công cụ kiểm tra mã lúc phát triển,
không có trong trang gửi tới người xem.
