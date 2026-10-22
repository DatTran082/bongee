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

## Phong cách giao diện: Làng Mây

Cả trang (không chỉ cảnh 3D) theo bản DNA **Boongee · Làng Mây** (`../brandkit-ghibli`, hoạt hình vẽ tay):

- hero dưới **bầu trời** xanh sớm tan vào kem (không có mây), **biển mây** ở chân hero; bộ ảnh bìa 3D
  đứng yên và **nghiêng theo chuột**, biển mây lệch theo (parallax);
- **đồi chè** ở đầu footer;
- logo hoa low-poly ở header và footer, hoa low-poly cạnh tiêu đề và làm gạch đầu dòng, **đốm lấp lánh**;
- thẻ trắng **viền sticker**, **nút kiểu game** nhấn xuống được, huy hiệu biểu tượng tròn trên nền màu phụ.

Chữ vẫn đen than trên kem hoặc trắng; màu phụ (trời, rêu, mật ong) chỉ để trang trí. Mã ở `src/styles/lang-may.css` và
`src/components/lang-may/`; tài sản ở `src/assets/lang-may/` (do `npm run sync-brand` chép từ bộ DNA).

## Nội dung trang

Một trang (`src/app/page.tsx`), giao diện sáng, tiếng Việt. **Thực đơn** (tên món, nhóm, giá tại quầy) lấy từ **Odoo**
của quán (`npm run sync-menu`, qua MCP của Odoo). Phần còn lại lấy từ bộ brand kit gốc **ShanMay**
(`../../ShanMay/brand-kit`): giọng văn từ `docs/01-brand-foundation.md`, cỡ ly và mức đường/đá từ
`menu-posm/print-ready/menu-data.json`, ưu đãi từ `collateral/collateral.json`. Câu chữ viết đơn giản, không bay
bổng; phần câu chuyện mở đầu bằng một bài thơ ngắn.

| Phần                     | Mã nguồn                      | Nội dung                                                                       |
| ------------------------ | ----------------------------- | ------------------------------------------------------------------------------ |
| Hero                     | `src/components/hero.tsx`     | slogan **Trà hương / thanh vị** (thẻ `<h1>` duy nhất) bên bộ ảnh bìa dựng 3D   |
| Câu chuyện `#cau-chuyen` | `src/components/story.tsx`    | Gốc · Nghi thức · Cảm xúc, hoạ tiết monogram                                   |
| Ba điều Boongee giữ      | `src/components/promises.tsx` | hoa thật, ngọt tuỳ bạn (mặc định 50%), vị thanh                                |
| Thực đơn `#thuc-don`     | `src/components/menu.tsx`     | 6 nhóm, 23 món + topping, giá M 500 ml / L 700 ml, tuỳ chỉnh đường và đá       |
| Ưu đãi `#uu-dai`         | `src/components/offers.tsx`   | ấn phẩm Làng Mây: bài đăng ưu đãi tuần, thẻ tích điểm, 2 voucher (lật, tải về) |
| Hỏi đáp `#hoi-dap`       | `src/components/faq.tsx`      | 7 câu, trả lời ghép từ dữ liệu thực đơn, ưu đãi, địa chỉ                       |
| Ghé quán `#ghe-quan`     | `src/components/visit.tsx`    | 14B ngách 7/72 phố Hoa Bằng, Cầu Giấy, Hà Nội, bản đồ, giờ mở cửa, điện thoại  |

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
  và lơ lửng xoay quanh ly, kèm đốm lấp lánh; không có giọt nước, không mô phỏng chất lỏng. Ô ở câu chuyện (nắp nhấc lên, nhìn xuống mặt trà).
- **Ly giấy** đậy nắp: ô ở ghé quán.

- **Thực đơn tương tác** (`#thuc-don`, `src/components/menu-picker.tsx`) có cùng bố cục và thiết kế với bảng menu in
  (`../brandkit-ghibli/thuc-don/thuc-don.pdf`):
  - cột ly nổi bật (ảnh ly render bằng Blender);
  - các nhóm món có dấu hoa tròn, mỗi món có dòng mô tả và giá M/L trong vòng tròn nhỏ;
  - ảnh lookbook;
  - dải topping, đường, đá ở cuối.

  Bấm một món hoặc một ly thì thanh **Ly của bạn** ở cuối màn hình hiện món đó, chọn size và cộng giá tạm tính (giá tại
  quầy, từ Odoo). Không đặt món trên web. Ảnh ly và ảnh lookbook chép từ bộ DNA bằng `npm run sync-brand`.

- **Xoay ly đổi hương vị** (`#huong-vi`, `src/components/flavors.tsx`): section ghim cố định khi cuộn, mỗi nhóm
  thực đơn một vị (hương hoa, kem bông, trái cây, kem cheese, cà phê). Cuộn tới đâu ly xoay một vòng và đổi sang ly
  của vị kế tiếp (ly giấy đậy nắp, ly giấy kem bông, ly nhựa trà trái cây, ly giấy kem cheese), topping quanh ly
  chuyển dần (hoa năm cánh, bọt kem và cánh hồng, nho, xoài và đá, phô mai và mâm xôi, hạt cà phê), nền chuyển trong
  dải kem và trắng của thương hiệu. Dùng GSAP ScrollTrigger (tải sau khi trang hiện), dừng đúng từng vị; chấm bên dưới để nhảy
  tới vị bất kỳ. Tên nhóm và tên món lấy từ thực đơn.

**Phong cách 3D: hoạt hình khối mượt, kiểu "stylized drink game asset"** (chọn ngày 21/10/2026, thay bản tả thực,
bản cũ vẫn giữ trong `git stash`; sau đó bỏ bản low-poly cắt mặt vì nhìn thô). Theo luật toon của bản DNA Làng Mây (`../brandkit-ghibli`):

- Ly của brand kit giữ nguyên độ tròn và hình in.
- Ánh sáng chia 3 dải mềm như tô màu, có vệt sáng trắng dọc thân ly.
- Viền sticker hai lớp: trong màu trắng ấm, ngoài một nét mảnh cùng tông, không dùng viền đen.
- Nước rót 3 lớp màu, ranh giới lượn sóng, có bọt li ti; kem là một chóp mịn, phồng, tràn nhẹ qua miệng ly.
- Nhựa trong vẽ bằng độ mờ, không khúc xạ.
- Đá, gỗ, mây và mọi topping (nho, xoài, đá viên, hạt cà phê, phô mai, mâm xôi, hoa năm cánh, bọt kem, cánh hồng)
  đều dựng bằng code trong `src/lib/cup-scene/toon/`, cùng một bảng màu; không tải model ngoài.

Mỗi section chừa **ô trống** (`<CupAnchor actor=…>`) kèm tư thế; khi cuộn, diễn viên đậu ở ô gần nhất phía trên giữa
màn hình rồi **bay** sang ô kế tiếp của nó; ở điện thoại các ô nằm xen giữa chữ. Mọi thứ ở sau các thẻ trắng nên không
bao giờ che chữ.

- **Tương tác**: kéo để xoay, chạm nắp để bật nút; bàn phím: mũi tên trái / phải xoay, Enter bật / đậy nút, Home về
  mặt trước; mỗi diễn viên là một vùng chạm riêng.
- **Parallax**: tiêu đề và thẻ trôi nhẹ bằng CSS
  scroll-driven animation ở trình duyệt hỗ trợ. Với `prefers-reduced-motion`, chỉ đổi ô, không bay, không bồng bềnh.
- Không có WebGL 2, bật tiết kiệm dữ liệu, tắt JavaScript hoặc tải model lỗi: hero hiện lại ảnh bìa, các ô khác thu lại.

### Sửa nội dung ở đâu

| Nội dung                                                   | Sửa ở                                                                                                                              |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Món, nhóm món, giá                                         | Odoo của quán, rồi `npm run sync-menu`                                                                                             |
| Cỡ ly (ml), mức đường và đá                                | ShanMay `menu-posm/print-ready/menu-data.json`, rồi `npm run sync-brand`                                                           |
| Ưu đãi trong tuần, thẻ tích điểm, voucher                  | ShanMay `collateral/collateral.json`, rồi dựng lại ấn phẩm (`build_an_pham.py` trong `../brandkit-ghibli`) và `npm run sync-brand` |
| Câu chuyện, cam kết, địa chỉ, giờ, điện thoại, mạng xã hội | `src/data/boongee.ts`                                                                                                              |
| Câu hỏi đáp                                                | `src/data/faq.ts` (câu trả lời tự lấy số liệu từ các file trên)                                                                    |

Thực đơn trên web trùng với máy bán hàng vì cùng lấy từ Odoo. Dưới tên mỗi món có một **dòng nói món đó là gì**
("Bạch Thiên Hương — trà sữa dành dành"), học theo cách đặt tên hai tầng của thực đơn Bông Biêng. Dòng này được ghép
tự động từ **công thức món trên Odoo** (cốt trà, trái cây, kem, cà phê; bỏ đường, đá, sữa), không viết tay; món chưa
có công thức thì không có dòng. Muốn sửa dòng mô tả thì sửa công thức trên Odoo rồi `npm run sync-menu`.

**Giọng văn:** câu ngắn, chữ thường ngày, nói điều có thật (tên hoa, tên cốt trà, giá), không dùng chữ khen chung chung
như "cao cấp", "mê hoặc", "tinh tế". Tiêu đề mỗi phần gọi đúng thứ bên trong (ví dụ "Giảm giá và tích điểm"). Chỗ
cần cảm xúc thì dùng một bài thơ ngắn với hình ảnh nhỏ, có thật (mây, gió, bếp, ấm trà). Không có câu hướng dẫn kiểu
"cuộn để…", "kéo để…".

`npm run sync-menu` chạy MCP của Odoo (`../odoo/mcp-boongee/run.sh prod`, khoá API nằm trong `.env.prod` của nó, script
không đọc khoá). Ở mạng văn phòng (chặn sslip.io), mở SSH tunnel tới Odoo rồi đặt `BOONGEE_MCP=<lệnh chạy MCP qua tunnel>`.

**Cần xác nhận trước khi ra mắt** (đánh dấu `TODO(boongee)` trong mã):

- **giá**: đã là giá thật trên máy bán hàng (Odoo), không còn là giá minh hoạ;
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
