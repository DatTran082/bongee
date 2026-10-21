# Boongee · Landing page

Trang giới thiệu một trang của **Boongee — Trà hương thanh vị**. Dựng bằng **Next.js 16** (App Router, React 19,
TypeScript, Tailwind CSS 4), khởi tạo từ `create-next-app` chính thức. Mọi trang đều dựng sẵn thành trang tĩnh.

## Chạy

Cần Node.js ≥ 22.18 (`npm test` chạy file `.ts` bằng type stripping có sẵn của Node).

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # dựng bản production
npm run start        # chạy bản đã dựng
npm run check        # ESLint + TypeScript + Prettier + test
npm run test         # test phần toán của ly 3D (node --test)
npm run format       # định dạng lại mã (Prettier, có sắp xếp class Tailwind)
npm run sync-brand   # chép lại tài sản thương hiệu từ ../brandkit và màu phụ, luật toon từ ../brandkit-ghibli (xem dưới)
```

## Nội dung trang

Một trang (`src/app/page.tsx`), giao diện sáng, tiếng Việt. Nội dung lấy từ bộ brand kit gốc **ShanMay**
(`../../ShanMay/brand-kit`): câu chuyện và giọng văn từ `docs/01-brand-foundation.md`, thực đơn từ
`menu-posm/print-ready/menu-data.json`, ưu đãi từ `collateral/collateral.json`.

| Phần                     | Mã nguồn                      | Nội dung                                                                      |
| ------------------------ | ----------------------------- | ----------------------------------------------------------------------------- |
| Hero                     | `src/components/hero.tsx`     | slogan **Trà hương / thanh vị** (thẻ `<h1>` duy nhất) bên bộ ảnh bìa dựng 3D  |
| Câu chuyện `#cau-chuyen` | `src/components/story.tsx`    | Gốc · Nghi thức · Cảm xúc, hoạ tiết monogram                                  |
| Điều Boongee giữ         | `src/components/promises.tsx` | hoa thật, ngọt vừa (mặc định 50%), pha thật nhẹ                               |
| Thực đơn `#thuc-don`     | `src/components/menu.tsx`     | 6 nhóm, 23 món + topping, giá M 500 ml / L 700 ml, tuỳ chỉnh đường và đá      |
| Ưu đãi `#uu-dai`         | `src/components/offers.tsx`   | giảm 20% thứ 2 – thứ 4 cho đơn từ 2 ly, thẻ tích điểm 10 dấu                  |
| Hỏi đáp `#hoi-dap`       | `src/components/faq.tsx`      | 7 câu, trả lời ghép từ dữ liệu thực đơn, ưu đãi, địa chỉ                      |
| Ghé quán `#ghe-quan`     | `src/components/visit.tsx`    | 14B ngách 7/72 phố Hoa Bằng, Cầu Giấy, Hà Nội, bản đồ, giờ mở cửa, điện thoại |

Kèm theo: header dính đầu trang có menu cho điện thoại, footer, trang 404 tiếng Việt, `sitemap.xml`, `robots.txt`,
dữ liệu có cấu trúc (JSON-LD: WebSite, CafeOrCoffeeShop, FAQPage), favicon, icon iOS và ảnh chia sẻ.

### Cảnh 3D bay theo trang

Hai mô hình ly của brand kit (`brandkit/3d/boongee-paper-16oz.glb` ≈ 510 kB và `boongee-pp-700ml.glb` ≈ 360 kB sau
nén, tên file theo nội dung trong `public/models/`) được vẽ bằng **three.js** trên một canvas trong suốt cố định phía
sau nội dung (`src/components/cup-stage.tsx`, `src/lib/cup-scene/`). Có ba "diễn viên", mỗi diễn viên bay theo các ô
của riêng mình:

- **Bộ ảnh bìa** (`src/lib/cup-scene/set/`) nổi ở hero: hai ly giấy 16 oz, ly trước đội kem bông hai tầng rắc cánh
  hồng, đứng trên tảng đá; ly sau đậy nắp bật trắng, đứng trên khúc gỗ cao, khúc gỗ thấp phía sau; hai đám mây trôi
  phía sau; không có cây hay hoa; bóng đổ từ đèn chếch trái, cả bộ bồng bềnh như một đảo nhỏ.
- **Ly nhựa** 700 ml trong suốt: bên trong là **trà nho** xanh đậm dần xuống đáy; chùm nho và viên đá đứng trong nước
  và lơ lửng xoay quanh ly, kèm đốm lấp lánh; không có giọt nước, không mô phỏng chất lỏng. Ô ở câu chuyện (nắp nhấc lên, nhìn xuống mặt trà), thực đơn (cột dính bên phải), ưu đãi.
- **Ly giấy** đậy nắp: ô ở ưu đãi (đứng cạnh ly nhựa: **hai ly** vì giảm giá cho đơn từ 2 ly) và ghé quán.

- **Xoay ly đổi hương vị** (`#huong-vi`, `src/components/flavors.tsx`): section ghim cố định khi cuộn, mỗi nhóm
  thực đơn một vị (hương hoa, kem bông, trái cây, kem cheese, cà phê). Cuộn tới đâu ly xoay một vòng và đổi sang ly
  của vị kế tiếp (ly giấy đậy nắp, ly giấy kem bông, ly nhựa trà trái cây, ly giấy kem cheese), topping quanh ly
  chuyển dần (hoa năm cánh, bọt kem và cánh hồng, nho, xoài và đá, phô mai và mâm xôi, hạt cà phê), nền chuyển trong
  dải kem và trắng của thương hiệu. Dùng GSAP ScrollTrigger (tải sau khi trang hiện), dừng đúng từng vị; chấm bên dưới để nhảy
  tới vị bất kỳ. Tên nhóm và tên món lấy từ thực đơn.

**Phong cách 3D: low-poly hoạt hình, kiểu "stylized drink game asset"** (chọn ngày 21/10/2026, thay bản tả thực;
bản cũ vẫn giữ trong `git stash`). Theo luật toon của bản DNA Làng Mây (`../brandkit-ghibli`):

- Ly của brand kit được nắn còn 12 mặt phẳng; hình in giữ nguyên chỗ.
- Mỗi mặt một màu, ánh sáng chia vài dải rõ, vệt sáng trắng phẳng.
- Viền cùng tông và đậm hơn màu thân, không dùng viền đen.
- Nhựa trong vẽ bằng độ mờ, không khúc xạ.
- Đá, gỗ, mây và mọi topping (nho, xoài, đá viên, hạt cà phê, phô mai, mâm xôi, hoa năm cánh, bọt kem, cánh hồng)
  đều dựng bằng code trong `src/lib/cup-scene/toon/`, cùng một bảng màu; không tải model ngoài.

Mỗi section chừa **ô trống** (`<CupAnchor actor=…>`) kèm tư thế; khi cuộn, diễn viên đậu ở ô gần nhất phía trên giữa
màn hình rồi **bay** sang ô kế tiếp của nó; ở điện thoại các ô nằm xen giữa chữ. Mọi thứ ở sau các thẻ trắng nên không
bao giờ che chữ.

- **Tương tác**: kéo để xoay, chạm nắp để bật nút; bàn phím: mũi tên trái / phải xoay, Enter bật / đậy nút, Home về
  mặt trước; mỗi diễn viên là một vùng chạm riêng.
- **Parallax**: bông hoa logo trôi phía sau ở nhiều độ sâu (xa thì chạy chậm hơn); tiêu đề và thẻ trôi nhẹ bằng CSS
  scroll-driven animation ở trình duyệt hỗ trợ. Với `prefers-reduced-motion`, chỉ đổi ô, không bay, không bồng bềnh.
- Không có WebGL 2, bật tiết kiệm dữ liệu, tắt JavaScript hoặc tải model lỗi: hero hiện lại ảnh bìa, các ô khác thu lại.

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
- **Nền** cả trang là hồng phấn `pink-500` như hero; các khối (thực đơn, ưu đãi, địa chỉ…) là thẻ trắng. Chữ xám
  `ink-muted` chỉ dùng trong thẻ trắng (trên nền hồng không đủ tương phản). Mép ảnh hero mờ dần vào nền hồng.
- **Font** duy nhất là Fraunces (SIL OFL), tự host qua `next/font`, có bộ ký tự tiếng Việt và các trục SOFT, WONK, opsz.
- **Logo** `src/assets/brand/logo-ngang.svg`; favicon và icon iOS là bông hoa logo trên nền hồng phấn.

### Đồng bộ với brandkit

Tài sản thương hiệu được chép vào repo (dựng và deploy không cần `brandkit/`). Khi brandkit đổi, chạy
`npm run sync-brand` (đường dẫn khác: `BOONGEE_BRANDKIT=…` cho brandkit, `BOONGEE_SHANMAY=…` cho ShanMay
`brand-kit`). Ngoài các file dưới, script chép `menu-data.json` và `collateral.json` của ShanMay vào
`src/data/shanmay/`:

| Từ `brandkit/`                                         | Sang                                                                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `color/tokens.json`                                    | `src/styles/brand-tokens.css`, `src/data/brand-tokens.json`                                                                                   |
| `nhan-dien/01-logo/logo-ngang-khong-slogan_den.svg`    | `src/assets/brand/logo-ngang.svg`                                                                                                             |
| `nhan-dien/01-logo/bieu-tuong-hoa_den.svg`             | `src/app/icon.svg`, `favicon.ico`, `apple-icon.png`                                                                                           |
| `nhan-dien/03-hoa-tiet/monogram_hong.png`              | `src/assets/images/monogram-hong.png`                                                                                                         |
| `nhan-dien/01-logo/bieu-tuong-hoa_den.svg`             | `src/assets/brand/hoa.svg` (hoa trôi sau ly 3D)                                                                                               |
| `lookbook/anh-bia/facebook.png`                        | `src/assets/images/hero.jpg` (ảnh hero dự phòng khi không có ly 3D)                                                                           |
| `3d/boongee-pp-700ml.glb`, `3d/boongee-paper-16oz.glb` | `public/models/<tên>.<hash>.glb` (hai ly 3D, nén meshopt + WebP; tên theo nội dung, cache vĩnh viễn) và `src/data/cup-model.json` (đường dẫn) |
| `nhan-dien/04-anh-bia/facebook-slogan-den.png`         | `src/app/opengraph-image.jpg`, `twitter-image.jpg` (1200 × 628)                                                                               |

## Deploy

Hợp nhất với **Vercel** (nhập repo; đặt `NEXT_PUBLIC_SITE_URL` khi có tên miền riêng). Chạy được trên mọi máy chủ Node (`npm run build` rồi
`npm run start`). CI trên GitHub (`.github/workflows/ci.yml`) chạy `npm run check` và `npm run build` cho mỗi lần push /
pull request vào `main`.

`npm audit` báo lỗ hổng trong `eslint-config-next` (gói `braces` cũ): chỉ là công cụ kiểm tra mã lúc phát triển,
không có trong trang gửi tới người xem.
