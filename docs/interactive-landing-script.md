# Kịch bản landing tương tác: "Ánh sáng chạm vào, hương hiện ra"

Bản ngày 18/11/2026. Chủ quán đã chốt cả ba quyết định (§10); bước 0 đã xong, trên nhánh `redesign/interactive-webgpu` (§11). Kịch bản thay toàn bộ phần trình diễn của trang chủ (landing ở commit `9ea1736`) và giữ nguyên nội dung. Nghiên cứu ở §1, nguồn ở cuối file.

## 0. Tóm tắt

- **Ý lớn.** Design DNA v2 viết: "bạc ánh kim là hương, thứ chỉ hiện ra khi có ánh sáng chạm vào". Trang biến đúng câu đó thành tương tác. Con trỏ chuột, hay ngón tay trên điện thoại, của khách là ánh sáng. Ánh sáng đi tới đâu, sương tan tới đó và mực bạc ánh lên tới đó.
- **Đường đi của trang.** Trang mở bằng sương núi (ảnh hero). Sương dày dần thành nền trắng của trang. Màu đậm đầu tiên chỉ xuất hiện khi trà được rót vào ly. Cách đi này giữ đúng tỷ lệ 70 % trắng · 20 % bạc · 8 % mực · ≤ 2 % màu nhấn.
- **Kịch bản là chính slogan.** Bốn nhịp TRÀ · HƯƠNG · THANH · VỊ. Bốn chữ của slogan trong hero lần lượt đậm lên theo từng nhịp. Không thêm câu chữ mới.
- **Công nghệ.**
  - three.js r187 với `WebGPURenderer`, tự lùi về WebGL 2 khi máy không có WebGPU.
  - Shader viết một lần bằng TSL, hậu kỳ bằng `RenderPipeline`.
  - Ánh kim trên mực bạc phản chiếu một "phòng softbox" dựng bằng code.
  - Chất liệu "giấy thật, bạc thật": vật liệu PBR của chính mô hình bộ in.
- **Không đổi.**
  - Nội dung và nguồn dữ liệu: Odoo và brandkit.
  - Ba mục Menu · Ưu đãi · Cửa hàng, cùng các trang `/menu` và `/system-design`.
  - Slot và bàn phím của cốc 3D.
  - Ảnh hero vẫn là thứ hiện ra đầu tiên.
- **Đã chốt (chủ quán, 18/11/2026):**
  - chất liệu 3D "giấy thật, bạc thật";
  - trang gọi thực đơn là "Menu" (đã đổi trên trang);
  - có phần câu chuyện không chữ giữa hero và mục Menu;
  - dùng hoa dành dành thật trong cảnh Hương.

## 1. Nghiên cứu

### 1.1 Các site đáng học (2024–2026)

| Site                                                            | Điểm mạnh                                                                                                                                                   | Lấy cho Boongee                                         |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Oryzo (Lusion), Awwwards Site of the Month 4/2026 (theo Utsubo) | Cả trang chỉ có một sản phẩm khiêm tốn (miếng lót cốc bằng bần), dựng 3D trực tiếp, chất liệu thật; cuộn trang là camera đi vào chiều sâu                   | Một chiếc ly đủ làm nhân vật chính, miễn chất liệu thật |
| Igloo Inc (Abeto), Awwwards Site of the Year 2024               | 3D nhập vai mà vẫn cuộn như trang thường; khối băng sinh bằng thuật toán; hạt tụ thành hình theo từng đường link                                            | 3D phục vụ việc xem, không giành quyền cuộn             |
| IVRESS (Utsubo), FWA Site of the Month 5/2026                   | `WebGPURenderer` có đường lùi WebGL; shader TSL chạy trên cả hai; cảnh có "ngân sách" từ đầu                                                                | Đúng kiến trúc trang cần                                |
| Portfolio 2025 của Bruno Simon                                  | Viết lại toàn bộ bằng TSL, tự chạy WebGPU khi máy có; mã nguồn mở (MIT)                                                                                     | TSL đã đủ chín để làm thật                              |
| Explore Primland, Awwwards SOTD 2/2026                          | Địa hình thật, sương khí quyển, camera lướt theo cuộn                                                                                                       | Sương là chiều sâu và tâm trạng; của Boongee là núi chè |
| Cartier Watches & Wonders 2026 (Immersive Garden)               | Sáu "hốc" 3D, mỗi hốc một chiếc đồng hồ; cử chỉ ẩn thưởng cho người tò mò                                                                                   | Mỗi cảnh một vật; khám phá mà không cần hướng dẫn       |
| SŌM (đồ uống), Awwwards SOTD 4/4/2026                           | Sản phẩm 3D phản ứng theo chuột                                                                                                                             | Ly đáp lại ngay khi chuột lướt qua                      |
| Codrops 2026 (bài hướng dẫn TSL)                                | "Fluid reveal": con trỏ làm lộ cảnh thứ hai qua mô phỏng chất lỏng. "Relighting images with depth maps": ảnh phẳng có ánh sáng và bóng nhờ bản đồ chiều sâu | Hai kỹ thuật cho cảnh hero                              |

Rút ra: site thắng giải không nhồi hiệu ứng. Mỗi site có **một ý** và **một vật**, chất liệu thật, cuộn trang tự nhiên, và đường lùi cho máy yếu.

### 1.2 three.js hôm nay

- **Phiên bản.** Bản mới nhất là r187 (30/10/2026); landing đang dùng 0.186.1. Hai lối vào `three/webgpu` và `three/tsl` có từ r171.
- **WebGPU và WebGL 2.** `WebGPURenderer` tự lùi về WebGL 2. Shader TSL biên dịch ra WGSL hoặc GLSL nên chỉ viết một lần.
- **Hậu kỳ.** `PostProcessing` đổi tên thành `RenderPipeline` từ r183. Bản 0.186.1 đang cài đã có đủ các nút cần (đã kiểm tra trong `node_modules`):
  - `pass` và `mrt`;
  - bóng tiếp xúc GTAO (`ao`), chiều sâu trường ảnh (`dof`);
  - khử răng cưa TRAA, FXAA, SMAA;
  - hạt phim (`film`), LUT màu (`lut3D`), chuyển cảnh bằng mặt nạ (`transition`), viền toon (`toonOutlinePass`);
  - vật liệu tán xạ dưới bề mặt (`MeshSSSNodeMaterial`), nhiễu `mx_fractal_noise_float` và `curlNoise`.
- **Môi trường.** `PMREMGenerator.fromSceneAsync()` dựng ánh sáng môi trường từ một cảnh nhỏ, không cần tải ảnh HDR. `scene.environmentRotation` xoay nó. r187 dựng lại PMREM cho phản chiếu đẹp hơn.
- **Không chạy trên WebGPU.** `ShaderMaterial` và `onBeforeCompile` không chạy trên `WebGPURenderer`, ở cả hai backend. Vật liệu toon (`src/lib/cup-scene/toon/material.ts`) và viền (`toon/outline.ts`) đều dùng `onBeforeCompile`. Với hướng "giấy thật, bạc thật" không cần chuyển chúng: vật liệu PBR của chính mô hình thay chỗ, và `toon/` bị xoá khi sân khấu mới lên.
- **Bẫy đã biết.**
  - Import `WebGLRenderer` từ `three` cạnh `three/webgpu` kéo thêm khoảng 363 KB.
  - WebGPU cần HTTPS. Mở trang trên điện thoại qua `http://192.168…` sẽ luôn rơi về WebGL 2: dùng `next dev --experimental-https` hoặc bản preview Vercel.
  - Có cảnh chạy WebGPU chậm hơn WebGL, nên phải đo cả hai.
  - r183 đến r187 bản nào cũng có thay đổi phá vỡ: khoá đúng phiên bản, đọc changelog trước mỗi lần nâng.

### 1.3 Máy của khách

- **Thị phần.** Trình duyệt điện thoại ở Việt Nam, tháng 7/2026 (StatCounter): Chrome 62,3 %, Safari 30,1 %, UC 2,8 %, Cốc Cốc 2,1 %, Samsung Internet 2,1 %.
- **Máy có WebGPU sẵn:**
  - Safari trên iOS 26. Mọi trình duyệt trên iPhone đều chạy WebKit, nên cùng mốc iOS 26.
  - Chrome Android 121 trở lên, trên Android 12+ có GPU Qualcomm hoặc ARM.
- **Máy chưa có:**
  - Firefox Android.
  - Trình duyệt trong app (TikTok, Facebook, Zalo): chưa có thông tin chắc chắn, coi như WebGL 2.
- **Hệ quả:** trang phải **đẹp trọn vẹn trên WebGL 2**; WebGPU chỉ làm mượt và nét hơn; ảnh tĩnh lo phần còn lại.

### 1.4 Đo thử dung lượng (esbuild, minify, nén như production)

| Bộ import                                                                                         | Minify  | gzip   | brotli |
| ------------------------------------------------------------------------------------------------- | ------- | ------ | ------ |
| Hiện tại: `WebGLRenderer`, vật liệu toon, `GLTFLoader`                                            | 643 KB  | 162 KB | 134 KB |
| Mới: `WebGPURenderer`, `RenderPipeline`, TSL, GTAO, DOF, TRAA, `transition`, `film`, `GLTFLoader` | 1,18 MB | 310 KB | 249 KB |

Phần thêm là khoảng 115 KB (brotli). Gói này vẫn tải sau khi trang đã hiện, như bây giờ (`whenSettled`), nên không làm chậm lần hiện đầu tiên.

## 2. Nguyên tắc

1. **Ánh sáng là tương tác chính.** Chuột hay ngón tay di đến đâu, ánh sáng theo đến đó ngay trong khung hình kế tiếp. Không có nút bật, không có gợi ý.
2. **Không hướng dẫn trên trang** (chủ quán, 22/10/2026). Mọi tương tác tự lộ ra ngay lần đầu khách di chuột hay chạm. Mô tả cho trình đọc màn hình vẫn giữ.
3. **Không thêm chữ.** Bốn chữ của slogan làm mục lục; tiêu đề các mục giữ như cũ.
4. **Trắng là nền, bạc là dấu, màu từ đồ uống.** Cảnh 3D chỉ có trắng, các sắc bạc và mực; màu đậm duy nhất là đồ uống.
5. **Ánh kim, không lấp lánh.** Mực bạc chỉ có một dải sáng mềm. Không bloom, không lens flare, không hạt sáng, không glitter.
6. **Không parallax** (chủ quán, 22/10/2026). Ảnh và chữ không trượt theo chuột hay theo cuộn. Chỉ ánh sáng, sương và vật 3D chuyển động.
7. **Nội dung trước, 3D sau.** Mỗi cảnh có ảnh tĩnh đứng sẵn trong trang. 3D chỉ thay ảnh khi đã chạy mượt; không có màn hình chờ.
8. **Một màn hình, một ý.**

## 3. Dòng thời gian

Hero thành một khối dính (sticky): khung hình đứng yên, câu chuyện chạy theo cuộn, rồi nhả ra mục Menu. Quãng cuộn thêm là 160 vh trên máy tính và 100 vh trên điện thoại. Mốc tính theo phần trăm của quãng đó.

| Nhịp                       | Quãng cuộn               | Trên màn hình                                            | Slogan                          |
| -------------------------- | ------------------------ | -------------------------------------------------------- | ------------------------------- |
| Cảnh 0 · Mở trang          | 0–2 s sau khi tải        | ảnh hero tĩnh, rồi ảnh "sống dậy"                        |                                 |
| Cảnh 1 · TRÀ               | 0–10 %                   | sương sớm trên núi chè, ánh sáng theo chuột              | **TRÀ** đậm                     |
| Chuyển · sương thành trắng | 10–35 %                  | sương dày dần, phủ trắng cả khung                        |                                 |
| Cảnh 2 · HƯƠNG             | 35–65 %                  | hoa dành dành trắng nở, sợi hương bạc vẽ bông hoa 5 cánh | **HƯƠNG** đậm                   |
| Cảnh 3 · THANH             | 65–100 %                 | bông hoa đáp xuống ly giấy, bốn dấu bạc nở trên thân ly  | **THANH** đậm                   |
| Cảnh 4 · VỊ                | mục Menu                 | trà rót vào ly nhựa: màu đậm đầu tiên của trang          | **VỊ** đậm khi khối hero nhả ra |
| Cảnh 5 · Ưu đãi            | mục Ưu đãi               | nghỉ, không 3D                                           |                                 |
| Cảnh 6 · Cửa hàng          | mục Cửa hàng, chân trang | ly giấy có nắp; sương mỏng quay về ở chân trang          |                                 |

Trong khi khối hero dính, slogan và hai nút luôn ở trên màn hình: bên trái trên máy tính, bên trên trên điện thoại. Nút "Xem menu" nhảy thẳng tới mục Menu, bỏ qua câu chuyện.

## 4. Kịch bản từng cảnh

### Cảnh 0 · Mở trang

- **Thấy:** đúng như hôm nay: ảnh 2K "Sương sớm trên núi", slogan, hai nút. Ảnh vẫn là phần tử LCP.
- **Rồi:**
  - Sau `load` và một khoảnh khắc rảnh, three.js tải về.
  - Khung hình đầu tiên của canvas vẽ lại chính tấm ảnh đó, khớp từng điểm ảnh: cùng cách cắt `object-cover`, không tone mapping. Nhờ vậy lúc canvas thay ảnh khách không thấy gì đổi.
  - Sau đó sương bắt đầu trôi: ảnh "sống dậy". Không màn hình chờ, không logo xoay.
- **Dự phòng:** máy yếu, chế độ tiết kiệm dữ liệu, giảm chuyển động, máy không có WebGL 2, hay không chạy JS đều giữ ảnh tĩnh, như hôm nay.

### Cảnh 1 · TRÀ: sương sớm trên núi (ảnh sống)

- **Thấy:** tấm ảnh hero có thêm ba lớp sương trôi chậm giữa các sườn đồi. Lớp xa trôi chậm hơn lớp gần. Sương dày ở xa, mỏng ở gần.
- **Tương tác:**
  - Con trỏ là ánh nắng sớm. Quanh con trỏ sương mỏng đi và sáng ấm hơn một chút. Phía sau con trỏ, sương khép lại trong khoảng 1,5 s.
  - Khi ánh sáng lướt qua ly giấy trong ảnh, cụm hoa bạc trên thân ly ánh lên một dải sáng mềm rồi tắt. Đây là lần đầu khách thấy "ánh sáng chạm vào, hương hiện ra".
  - Ảnh không trượt, không nghiêng theo chuột.
- **Kỹ thuật:**
  - Một lượt vẽ toàn màn hình viết bằng TSL.
  - Bản đồ chiều sâu (Depth Anything V2, dựng một lần từ ảnh) xếp sương theo độ xa; pháp tuyến tính sẵn từ chiều sâu để đổ ánh sáng.
  - Nhiễu `mx_fractal_noise_float` làm sương trôi.
  - Vệt con trỏ là một texture 128 × 128 tự phai.
  - Mặt nạ vùng in bạc của ly giấy, tách từ ảnh, nhận dải ánh kim.
  - Chi phí thấp: một lượt vẽ và vài lần đọc texture cho mỗi điểm ảnh.
- **Điện thoại:** dùng ảnh 4:5. Ngón tay khi cuộn chính là con trỏ: vuốt tới đâu sương tan tới đó. Không dùng con quay hồi chuyển, vì iPhone bắt xin quyền.
- **Giảm chuyển động:** ảnh tĩnh.
- **Chữ:** như hôm nay. Trong slogan, chữ của nhịp đang chạy màu mực, ba chữ còn lại `silver-700`. Đó là sắc bạc nhạt nhất còn đủ đọc theo DNA, và chữ slogan là chữ lớn.

### Chuyển · sương thành trắng

- **Thấy:** khách cuộn tiếp, sương từ xa tràn lên phủ dần cả khung, đến khi khung hình trắng hẳn, đúng màu trắng của trang. Từ đây khách đứng trên nền trắng của thương hiệu.
- **Kỹ thuật:** nút `transition()` của `RenderPipeline` trộn lượt ảnh sống với lượt cảnh 3D bằng một mặt nạ nhiễu hình sương. Ảnh chụp và đồ hoạ 3D không bao giờ đứng cạnh nhau, nên khác biệt giữa hai thứ được giấu trong lớp trắng.
- **Giảm chuyển động:** đổi bằng một lần mờ chéo ngắn.

### Cảnh 2 · HƯƠNG: hoa trắng, sợi hương bạc

- **Thấy:** giữa nền trắng, một bông dành dành trắng nở chậm, loài hoa thật dùng để ướp trà, cánh mềm như sứ mỏng. Từ nhuỵ hoa, một sợi bạc rất mảnh bay lên, uốn lượn, rồi vẽ thành bông hoa 5 cánh của Boongee, như Lottie "Hương thành hoa" ở `/menu`.
- **Vì sao không dùng hơi nóng:** menu trên Odoo không có món nóng nào, nên hơi bốc lên từ một ly đá sẽ sai. Sợi hương là hình ảnh tượng trưng, không giả làm hơi nước.
- **Tương tác:** ánh sáng vẫn theo con trỏ; sợi bạc ánh lên ở chỗ ánh sáng đi qua. Bông hoa nghiêng nhẹ về phía con trỏ, tối đa 6°.
- **Kỹ thuật:**
  - Cánh hoa sinh bằng code: sáu vòng cánh xếp xoắn, không tải mô hình. Vật liệu `MeshSSSNodeMaterial` cho cánh độ trong của sứ mỏng.
  - Sợi hương là một ống mảnh chạy theo đường cong nhiễu `curlNoise`, rồi hội tụ vào đường viền bông hoa logo (lấy từ `hoa-den.svg`).
  - Tiến độ vẽ gắn với cuộn. Sợi hương là một nét liền, không phải hạt.
- **Giảm chuyển động, dự phòng:** một ảnh tĩnh, hoa đã nở và bông hoa bạc đã vẽ xong.

### Cảnh 3 · THANH: ly giấy trắng in bạc

- **Thấy:**
  - Bông hoa bạc bay xuống, đáp lên thân ly giấy 16 oz và thành dấu đầu tiên (trên trái) của cụm 2 × 2.
  - Ba dấu còn lại nở theo, mỗi dấu 0,6 s, rồi đến chữ "Boongee".
  - Ly đứng trên đế sứ hình viên sỏi như trong ảnh hero, trên nền trắng, bóng mềm dưới chân. Cuộn thêm, ly xoay chậm 25° để lộ cụm hoa.
- **Tương tác:**
  - Con trỏ xoay "phòng sáng" quanh ly: dải ánh kim trượt qua bốn dấu bạc. Đây là ánh kim thật, vì mực nhũ trong mô hình là kim loại (bản đồ metal-rough của file in), không phải màu xám.
  - Kéo để xoay ly, chạm nắp để bật nút, như hôm nay. Bàn phím giữ nguyên.
- **Kỹ thuật:**
  - Dùng mô hình ly của bộ in (`boongee-paper-16oz.glb`) với vật liệu PBR thật của nó: giấy nhám, vân sợi giấy, mực nhũ kim loại.
  - Ánh sáng môi trường là một phòng trắng có một dải softbox đứng, dựng bằng code rồi nướng thành PMREM (§5). Thứ duy nhất mực bạc phản chiếu là dải sáng mềm đó, nên quy tắc "ánh kim, không lấp lánh" thành vật lý.
  - Các dấu nở ra bằng mặt nạ hoà tan theo nhiễu, chạy trên chính mặt nạ mực của file in.
  - Hậu kỳ: GTAO cho bóng tiếp xúc, DOF lấy nét vào ly (máy tính), TRAA, hạt phim ≤ 3 % cho cảm giác giấy.

### Cảnh 4 · VỊ: màu đến từ ly (mục Menu)

- **Thấy:**
  - Khối hero nhả ra, mục "Thức uống đặc trưng" hiện lên.
  - Ly giấy bay về slot của nó ở mục Cửa hàng, đi sau các thẻ trắng như hôm nay.
  - Ly nhựa 700 ml vào slot cạnh các thẻ nhóm món, còn rỗng. Một dòng trà rót từ trên xuống, mặt nước dâng lên: lần đầu tiên trang có màu đậm.
- **Tương tác:**
  - Rê chuột lên một thẻ nhóm, hoặc Tab tới nó: ly nhựa đổi sang món đặc trưng của nhóm đó, cả lớp màu lẫn topping (nho, đá, nắp cheese); mặt nước gợn khi đổi.
  - Kéo xoay ly thật nhanh: mặt nước sóng sánh, nắp cheese rung nhẹ rồi lặng.
- **Kỹ thuật:**
  - Đồ uống là một shader TSL: các lớp màu với ranh giới gợn (chuyển từ toon hiện tại), mặt nước nghiêng theo vận tốc xoay của ly. Dòng rót là một ống có nhiễu chạy dọc.
  - Ly nhựa nhám nhờ độ trong suốt và fresnel mềm, **không** khúc xạ.
  - Màu đồ uống chỉ hắt lên bóng và đế sứ, không nhuộm nền trang.
- **Điện thoại:** dải thẻ cuộn ngang; thẻ đang đứng giữa quyết định món trong ly. Ly nằm ở một slot mới phía trên dải thẻ; hôm nay slot này chỉ có từ `lg`.
- **Dữ liệu cần thêm:** bảng `drinkLooks` cho 5 nhóm (màu từng lớp, topping). Màu lấy mẫu từ ảnh lookbook của món đầu nhóm, không tự đặt.
- **Giảm chuyển động:** ly đổi món ngay, không rót, không sóng.

### Cảnh 5 · Ưu đãi: nghỉ

Mục này không có 3D, và canvas ngừng vẽ cho đỡ pin. Các ấn phẩm vẫn lật như hôm nay. Sau hai cảnh nhiều chuyển động, mắt cần một khoảng thở.

### Cảnh 6 · Cửa hàng và chân trang

- **Thấy:** ly giấy có nắp chờ sẵn ở slot cạnh địa chỉ và hai app giao hàng. Chạm nắp bật nút như hôm nay. Ở chân trang, sương quay lại thật mỏng từ mép dưới: trang mở bằng sương và khép bằng sương.
- **Tuỳ chọn, làm sau:** khi khách tới phần "Đặt giao tận nơi", ly trượt vào túi giấy trắng in bạc, dựng từ thiết kế túi của bộ in.

## 5. Ngôn ngữ hình ảnh 3D

- **"Giấy thật, bạc thật"** (chủ quán chốt, 18/11/2026). Mọi vật dùng vật liệu node PBR: khối mượt, ánh sáng liền như ảnh chụp, không dải toon, không viền toon.
  - Ly lấy vật liệu của chính mô hình bộ in: giấy nhám có vân sợi (normal map), mực nhũ là kim loại theo bản đồ metal-rough của file in, nắp nhựa satin.
  - Đế sứ và cánh hoa dùng `MeshSSSNodeMaterial` cho độ trong mờ của sứ mỏng.
  - Bóng mềm, có bóng tiếp xúc dưới chân ly.
- **Bạc:** kim loại thật, độ nhám 0,35–0,45, chỉ phản chiếu phòng softbox, tức một dải sáng. Độ chói bị kẹp trần để không có điểm loé.
- **Nhựa PP:** nhám nhờ độ trong suốt, không khúc xạ. Giữ quyết định cũ: khúc xạ làm ly trông như thuỷ tinh.
- **Không có:** viền đen, viền sáng trắng, bloom, lens flare, quang sai màu, motion blur, hạt sáng.
- **Màu:** trắng và thang bạc; màu đậm chỉ ở đồ uống. Tone mapping Khronos PBR Neutral giữ màu đồ uống đúng và trắng vẫn trắng. Nền canvas trong suốt, trang trắng thật nằm bên dưới.

Phác thảo "phòng softbox", nguồn của ánh kim:

```ts
import { Color, Mesh, MeshBasicNodeMaterial, PlaneGeometry, PMREMGenerator, Scene } from "three/webgpu";

// A white room with one tall soft light strip: the only thing the silver ink can mirror,
// so the metal shows one soft band and never a glint.
const room = new Scene();
room.background = new Color("#F7F8F9"); // silver-50
const strip = new Mesh(new PlaneGeometry(0.5, 4), new MeshBasicNodeMaterial({ color: new Color(5, 5, 5) }));
strip.position.set(-1.6, 0.4, 1.2);
strip.lookAt(0, 0, 0);
room.add(strip);
studio.environment = (await new PMREMGenerator(renderer).fromSceneAsync(room, 0.04)).texture;

// every frame: the pointer turns the room, so the band slides across the four marks
studio.environmentRotation.y = pointer.x * 0.6;
```

Đường hậu kỳ:

```text
ảnh sống (TSL, không tone mapping) ────────────────────────────────────────┐
                                                                           ├─ transition (mặt nạ sương) ─ film ─ màn hình
cảnh 3D: pass + mrt ─ GTAO ─ DOF ─ TRAA hoặc FXAA ─ tone mapping Neutral ──┘
```

## 6. Kiến trúc kỹ thuật

**Giữ:**

- Cách gắn sân khấu của `cup-stage.tsx`: tải sau `load` và một khoảnh khắc rảnh qua dynamic import; tiết kiệm dữ liệu hay không có WebGL 2 thì vào `cup-failed`.
- Slot `CupAnchor` và `track.ts` (ly bay giữa các slot), `fit.ts`, `motion.ts` (chỉ vẽ khi có thay đổi), `quality.ts` (mở rộng thêm, §7).
- Phần tử nhận chuột, bàn phím, vùng thông báo cho trình đọc màn hình, `dispose`.

**Đổi:**

- `three` 0.186.1 lên 0.187.x, khoá đúng phiên bản. Chỉ import từ `three/webgpu`, `three/tsl`, `three/addons/…`; không bao giờ trộn với `three`.
- `WebGLRenderer` thành `WebGPURenderer({ canvas, alpha: true })` với `await renderer.init()`; nhận biết backend qua `renderer.backend.isWebGPUBackend`.
- Vật liệu toon (`toon/`) không chuyển sang TSL: vật liệu PBR của chính GLB thay chỗ, và `toon/` bị xoá khi trang chủ chuyển sang sân khấu mới. Đạo cụ trong `shapes.ts`, `splash.ts` giữ hình, đổi sang vật liệu node.
- `renderer.render()` thành `RenderPipeline.render()`.

**Thêm** (trong `src/lib/stage/`, thư mục riêng của sân khấu WebGPU: ESLint chặn mọi import từ `three`, chỉ cho `three/webgpu`, `three/tsl`, `three/addons/…`; phần toán thuần dùng chung vẫn ở `src/lib/cup-scene/`):

- Đã có từ bước 0:
  - `renderer.ts` (WebGPU hoặc WebGL 2), `pipeline.ts` (đường hậu kỳ theo mức), `room.ts` (phòng softbox);
  - `flags.ts` (các cờ), `frame-budget.ts` (đo khung hình, quyết định hạ bậc), `device.ts`, `load.ts`;
  - `lab.ts`, cảnh của trang thử `/lab`.
- `director.ts`, thuần và có test: vị trí cuộn thành tiến độ từng nhịp (0–1), đo từ khối hero; với giảm chuyển động thì nhảy bậc.
- `hero/living-photo.ts`, `hero/wake.ts`: ảnh sống và vệt con trỏ.
- `studio/stand.ts` (đế sứ, bóng sàn), `studio/gardenia.ts`, `studio/thread.ts`.
- `materials/paper.ts` (giấy, sứ, mực bạc, từ vật liệu PBR của GLB) và `materials/drink.ts` (lớp màu, rót, sóng sánh).
- Dữ liệu: `src/data/story.ts` (các nhịp, ảnh tĩnh) và `src/data/drink-looks.ts` (5 nhóm).
- Bộ thương hiệu: `brandkit/scripts/build_hero_depth.py` dựng bản đồ chiều sâu (16:9 và 4:5) và mặt nạ vùng in vào `lookbook/hero-web/depth/`; `sync-brand` chép sang landing. Như mọi file sinh ra khác, không sửa tay.

**Cờ để kiểm thử:**

- `?webgl` ép chạy backend WebGL 2.
- `?tier=full|light|low` ép một mức chất lượng.
- `?inspect` bật Inspector của three.js.
- `?still=tra|huong|thanh` vẽ một nhịp đứng yên. Chrome headless chụp lại các nhịp để làm ảnh tĩnh, giống cách dựng file in thử.

**Kiểm tra:**

- Test `node --test` cho `director`, `quality` (thêm backend), cách lấy điểm trên đường hoa logo, và `drinkLooks`: nhóm nào cũng phải có.
- Chụp từng nhịp bằng Chrome headless trên cả WebGPU và `?webgl` để so bằng mắt.
- Thử trên điện thoại qua HTTPS (`next dev --experimental-https` hoặc preview Vercel).

## 7. Chất lượng theo thiết bị

| Mức     | Máy                                                   | Hero                          | Câu chuyện                              | Hậu kỳ                                  | Độ phân giải | Khung hình/giây              |
| ------- | ----------------------------------------------------- | ----------------------------- | --------------------------------------- | --------------------------------------- | ------------ | ---------------------------- |
| `full`  | máy tính, máy tính bảng mạnh                          | ảnh sống, đủ ba lớp sương     | 3D đầy đủ                               | GTAO nửa phân giải, DOF, TRAA, hạt phim | ≤ 2×         | 60                           |
| `light` | điện thoại, máy tầm trung                             | ảnh sống, vệt con trỏ 64 × 64 | 3D, bóng nướng sẵn thay GTAO, không DOF | FXAA, hạt phim                          | ≤ 1,5×       | 60 khi cuộn, 30 khi đứng yên |
| `low`   | máy rất yếu, tiết kiệm dữ liệu, giảm chuyển động, lỗi | ảnh tĩnh                      | ảnh tĩnh từng cảnh                      | không                                   |              |                              |

- **Tự hạ bậc:** trong 2 s đầu, sân khấu đo thời gian từng khung hình. Nếu 90 % khung chậm hơn 22 ms, nó hạ một bậc: tắt DOF và GTAO, rồi giảm độ phân giải, cuối cùng về ảnh tĩnh.
- **Chọn backend:** nếu đo thấy một nhóm máy chạy WebGL 2 nhanh hơn WebGPU, nhóm đó dùng WebGL 2.
- **Mức `low` không tải three.js.**

## 8. Ngân sách hiệu năng

- **LCP** không đổi: vẫn là ảnh hero, mục tiêu ≤ 2,5 s trên điện thoại 4G.
- **CLS bằng 0:** chỗ của câu chuyện có sẵn trong HTML cùng ảnh tĩnh, nên khi 3D hiện ra trang không nhảy.
- **JS:** gói 3D ≤ 320 KB brotli (riêng phần three.js đo được 249 KB), tải sau `load`.
- **Tài nguyên:**
  - Hai GLB bản PBR (giữ bản đồ kim loại và vân giấy): ly giấy 591 KB, ly nhựa 423 KB. Bản toon hiện nay là 423 KB và 306 KB.
  - Bản đồ chiều sâu và mặt nạ ≤ 150 KB.
  - Hoa dành dành và sợi hương là code, 0 KB.
- **Bộ nhớ GPU** ≤ 64 MB trên điện thoại. Riêng ảnh 4:5 (1152 × 1440) chiếm khoảng 6,6 MB, chưa tính mipmap.
- **Cuộn:**
  - 60 khung/giây, p99 ≤ 16,8 ms trên điện thoại giả lập (cùng chuẩn đo ngày 22/10/2026).
  - Không tác vụ nào dài quá 50 ms khi đang cuộn.
  - Mọi shader biên dịch xong trước khi canvas thay ảnh.
- **Lighthouse mobile** ≥ 0,8, bằng hôm nay.

## 9. Cố ý không làm

- Thư viện cuộn mượt (Lenis…): giữ cuộn gốc của trình duyệt, nhất là trên màn hình cảm ứng.
- GSAP: không cần; phần toán cuộn là của mình (`track.ts`, `director.ts`) và đã có test.
- Âm thanh, con quay hồi chuyển, màn hình chờ, chữ hướng dẫn, câu chữ mới, con số đếm, mục hỏi đáp, parallax.
- Bloom, lens flare, hạt sáng, khúc xạ.
- Tính năng chỉ WebGPU mới có (compute shader) cho phần chính. Nếu dùng, nó chỉ là phần thêm, nằm sau một lần kiểm tra backend.
- `/menu` giữ DOM và Lottie: đó là trang để tra giá thật nhanh.

## 10. Quyết định của chủ quán (đã chốt cả ba, 18/11/2026)

1. **Chất liệu 3D: đã chốt "giấy thật, bạc thật"** (chủ quán, 18/11/2026).
   - PBR mềm của chính mô hình bộ in, khớp ảnh hero và mực nhũ thật của file in (§5).
   - Vẫn giữ: viền không đen, không viền sáng trắng, không khúc xạ.
   - Cốc toon hiện tại chạy tiếp cho tới khi sân khấu mới thay nó.
   - Cùng lúc chủ quán đổi chữ "Thực đơn" trên trang thành "Menu": đã làm (thanh điều hướng, "Xem menu", mục Menu, "Xem toàn bộ menu", trang `/menu`).
2. **Câu chuyện không chữ giữa hero và mục Menu: có.**
   - Trang dài thêm 160 vh trên máy tính, 100 vh trên điện thoại.
   - Mục câu chuyện cũ đã bỏ ngày 17/11/2026. Bản này không có câu nào, chỉ có bốn chữ của slogan, và nút "Xem menu" vẫn nhảy thẳng tới mục Menu.
3. **Hoa dành dành thật trong cảnh Hương: dùng.**
   - DNA nguyên tắc 5 không cho thêm biểu tượng cạnh tranh với hoa logo. Hoa thật ở đây không phải biểu tượng: nó là nguyên liệu ướp trà, "sinh ra" bông hoa logo rồi lui đi.

## 11. Lộ trình

| Giai đoạn        | Việc                                                                                                                                                                                                  | Chủ quán xem gì                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 0 · Nền móng     | three r187 (sân khấu toon hiện tại vẫn chạy WebGL như cũ); khung sân khấu mới trên route thử `/lab` (noindex): `WebGPURenderer` có đường lùi, `RenderPipeline`, các cờ, mức chất lượng, đo khung hình | chưa có gì mới; số đo trên ba máy: máy tính, iPhone iOS 26, Android tầm trung |
| 1 · Ảnh sống     | Cảnh 0–1 trên `/lab`: bản đồ chiều sâu, sương, ánh sáng theo chuột, ánh kim trên ly trong ảnh                                                                                                         | mở `/lab` trên điện thoại, cả trong TikTok, Facebook, Zalo                    |
| 2 · Hương, Thanh | Sương thành trắng; hoa dành dành; sợi hương bạc; ly giấy "giấy thật, bạc thật" trong phòng softbox; ảnh tĩnh từng cảnh                                                                                | xem hai cảnh trên điện thoại                                                  |
| 3 · Vị           | Shader đồ uống (lớp, rót, sóng sánh); `drinkLooks`; ly nhựa theo thẻ nhóm; slot điện thoại                                                                                                            | rê chuột qua 5 nhóm                                                           |
| 4 · Kết          | Ưu đãi nghỉ; Cửa hàng; sương chân trang; túi giấy (tuỳ chọn); trang chủ chuyển sang sân khấu mới, xoá sân khấu toon cũ                                                                                | xem cả trang                                                                  |
| 5 · Hoàn thiện   | Tự hạ bậc, giảm chuyển động, bàn phím, test, Lighthouse, đo trên máy thật; cập nhật `CLAUDE.md`, `/system-design` (quy tắc 3D mới, changelog)                                                         | duyệt bản preview Vercel                                                      |

Mỗi giai đoạn làm trên nhánh riêng và phải qua `npm run check`. Chỉ merge vào `main` khi chủ quán duyệt.

**Bước 0, kết quả (18/11/2026, nhánh `redesign/interactive-webgpu`):**

- **Nâng cấp:** three.js và `@types/three` khoá ở 0.187.0. Sân khấu toon của trang chủ vẫn chạy như cũ.
- **Mô hình:** `npm run sync-models` dựng riêng hai ly (cờ `--models` của sync-brand), thêm bản `-pbr` giữ bản đồ kim loại và vân giấy (ly giấy 591 KB, ly nhựa 423 KB). Lần chạy này cũng lấy về ly giấy toon theo file bộ in ngày 16/11, có lớp ngoài nối liền tới vành miệng: cùng texture, chỉ đổi hình học.
- **Trang `/lab`:** noindex, không có trong sitemap. Ly giấy "giấy thật, bạc thật" đứng trên nền trắng tuyệt đối (#FFFFFF, ghép sau tone mapping), có bóng tiếp xúc mềm. Con trỏ xoay phòng softbox, dải ánh kim quét qua bốn dấu bạc. Góc trang hiện backend, mức chất lượng, thời gian khung hình và đánh giá.
- **Đã thử trên máy tính (Chrome, Apple GPU):** WebGPU và WebGL 2 (`?webgl`), mức `full` (TRAA) và `light` (FXAA), khung điện thoại 390 px. Đều 60 khung/giây, p90 16,7 ms.
- **Chưa thử:** iPhone iOS 26, Android tầm trung, và trình duyệt trong TikTok, Facebook, Zalo. Cần HTTPS: bản preview Vercel hoặc `next dev --experimental-https`.
- **Rút ra:** TRAA làm mất kênh trong suốt, nên đường hậu kỳ ghép lên nền trắng trước rồi mới khử răng cưa. PMREM ở r187 dùng `fromScene()` sau `renderer.init()`; `fromSceneAsync()` đã lỗi thời.

## 12. Rủi ro

| Rủi ro                                                                                | Cách đỡ                                                                      |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Trình duyệt trong app (TikTok, Facebook, Zalo) không có WebGPU, có khi WebGL cũng yếu | Lùi về WebGL 2, rồi về ảnh tĩnh; thử thật trong từng app ngay từ giai đoạn 1 |
| Ảnh chụp và đồ hoạ 3D trông lệch nhau                                                 | Lớp trắng ngăn giữa hai thế giới; ly 3D không bao giờ đặt lên ảnh chụp       |
| WebGPU chậm hơn WebGL trên vài máy                                                    | Đo cả hai, chọn backend theo nhóm máy                                        |
| Bản đồ chiều sâu sai ở viền ly, chỗ cheese tràn: sương đi xuyên qua ly                | Sửa mặt nạ cho đúng viền ly (chỉ sửa mặt nạ, không sửa ảnh)                  |
| Gói JS nặng thêm khoảng 115 KB; điện thoại yếu tốn thời gian đọc JS                   | Tải sau khi trang hiện; mức `low` không tải three.js                         |
| Trên iPhone, `100vh` nhảy khi thanh địa chỉ co giãn                                   | Khối dính dùng `100svh`                                                      |
| three.js đổi API nhanh                                                                | Khoá đúng phiên bản; đọc changelog trước mỗi lần nâng                        |

## Nguồn

- three.js: [r187 release notes](https://github.com/mrdoob/three.js/releases/tag/r187), [danh sách ví dụ](https://threejs.org/examples/)
- Utsubo: [three.js 2026, những gì đã đổi](https://www.utsubo.com/blog/threejs-2026-what-changed), [hướng dẫn chuyển sang WebGPU](https://www.utsubo.com/blog/webgpu-threejs-migration-guide), [8 site three.js hay nhất 2026](https://www.utsubo.com/blog/best-threejs-websites-2026)
- WebGPU: [web.dev, WebGPU đã có trên các trình duyệt lớn](https://web.dev/blog/webgpu-supported-major-browsers), [Chrome 121, WebGPU trên Android](https://developer.chrome.com/blog/new-in-webgpu-121), [Apple Developer Forums, WKWebView](https://developer.apple.com/forums/thread/770862)
- Thị phần: [StatCounter, trình duyệt điện thoại ở Việt Nam](https://gs.statcounter.com/browser-market-share/mobile/viet-nam)
- Site tham chiếu:
  - [Igloo Inc case study](https://awwwards.com/igloo-inc-case-study.html) và [Awwwards Site of the Year 2024](https://www.awwwards.com/annual-awards-2024/site-of-the-year)
  - [Bruno Simon, portfolio case study](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)
  - [Lusion, Oryzo BTS](https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction)
  - [SŌM trên Awwwards](https://www.awwwards.com/sites/som)
  - [Chipsa, hành trình WebGL (Chillbase: WebGPU và TSL)](https://medium.com/@Chipsa/the-evolution-of-webgl-at-chipsa-c68dca54d538)
- Codrops: [thẻ TSL](https://tympanus.net/codrops/tag/tsl/), [fluid X-ray reveal](https://tympanus.net/codrops/2026/03/23/building-a-dual-scene-fluid-x-ray-reveal-effect-in-three-js/), [relighting images with depth maps](https://tympanus.net/codrops/2026/08/19/relighting-images-with-depth-maps-and-three-js/)
- Bản đo dung lượng ở §1.4: esbuild 0.25.10 trên `three` 0.186.1 của landing, ngày 18/11/2026.
