// The words of the /system-design page: Boongee's Design DNA and the rules of its Design System, as the team's
// reference for every new design. The written spec is ../brandkit/design-system/ (design-dna.md, design-system.md);
// the values come from its tokens.json (src/data/design-system.json, by `npm run sync-design-system`). When a rule
// changes: update the brand kit's files, rebuild and sync the tokens, change the text here, and add a line to
// `changelog` (newest first).

export const intro = {
  title: "Hệ thống thiết kế",
  lead: "Tham chiếu cho mọi thiết kế của Boongee: in ấn, website, minh hoạ, ảnh món, chuyển động.",
  sources: [
    { label: "Design DNA", path: "brandkit/design-system/design-dna.md" },
    { label: "Design System", path: "brandkit/design-system/design-system.md" },
    { label: "Tokens", path: "brandkit/design-system/tokens.json" },
    { label: "Quy cách in", path: "brandkit/print/README.md" },
  ],
};

export const essence = {
  slogan: "Trà hương thanh vị",
  /** the picture of the whole brand (design-dna.md §1) */
  image: "Bạc trên trắng: một ly giấy trắng in hoa nhũ bạc. Trắng là khoảng thở, bạc ánh kim là hương.",
  pillars: [
    { word: "Hương", line: "Mùi hoa là thứ khách nhớ trước tiên. Hoa là chữ ký của mọi thiết kế, in bạc." },
    { word: "Thanh", line: "Vị nhẹ, uống dễ. Thiết kế cũng nhẹ: nền trắng, nhiều khoảng thở, ít chi tiết." },
    { word: "Vị", line: "Đồ uống thật, giá thật, ảnh món ghi rõ là minh hoạ. Màu đậm đến từ chính ly nước." },
  ],
  personality: [
    ["Thanh nhã, tinh tế", "Sang chảnh, phô trương, dát kim loại"],
    ["Sáng, sạch, nhẹ", "Lạnh lẽo như phòng thí nghiệm"],
    ["Dịu, mềm", "Ngọt sến, trẻ con"],
    ["Mộc, thật thà", "Quảng cáo dồn dập"],
    ["Có chút thơ", "Hoa mỹ, sáo rỗng"],
  ] as const,
};

export const principles = [
  {
    title: "Trắng là nền, bạc là dấu",
    line: "70 % trắng, 20 % bạc, 8 % đen than cho chữ, tối đa 2 % màu nhấn. Màu đậm chỉ đến từ đồ uống và ảnh.",
  },
  {
    title: "Một màu hoạ tiết trên một màu nền",
    line: "Bạc trên trắng, đen trên trắng, đen trên bạc nhạt. Không trắng trên hồng hay hồng trên trắng cho chữ.",
  },
  {
    title: "Bạc cho dấu, đen cho chữ",
    line: "Bạc ánh kim (3,3 : 1) chỉ cho hoa, logo, chữ Boongee cỡ lớn và vạch kẻ; chữ đọc được là đen than hoặc bạc đậm.",
  },
  { title: "Khoảng thở hơn trang trí", line: "Bỏ bớt trước khi thêm. Một màn hình, một ý." },
  {
    title: "Hoa là chữ ký",
    line: "Hoa 5 cánh của logo và bốn dấu monogram, in bạc, là hình nhận diện. Không thêm biểu tượng cạnh tranh.",
  },
  {
    title: "Thật trước đẹp",
    line: "Không bịa địa chỉ, giá, số điện thoại, lời khen. Ảnh món làm bằng AI ghi “Ảnh minh hoạ”, thông tin chưa có ghi “Đang cập nhật”.",
  },
  {
    title: "Ánh kim, không lấp lánh",
    line: "Bạc được có một dải sáng mềm, nhưng không sao lấp lánh, hạt sáng hay glitter, ở 2D lẫn 3D.",
  },
];

export const surfaces = [
  {
    name: "In ấn, bao bì",
    since: "18/11/2026",
    palette:
      "Mặc định: bạc 877 C trên giấy trắng, chữ nhỏ đen. Bản hồng phấn và túi bản Xanh là bản cũ, dùng tới lần in lại",
    look: "Phẳng, chặt chẽ, ánh nhũ",
  },
  {
    name: "Website",
    since: "18/11/2026",
    palette: "Trắng, dải bạc, ánh kim cho vạch kẻ; chữ đen than; không hồng, không xanh trong giao diện",
    look: "Tinh tế, tối giản; ảnh hero sương sớm; cốc 3D cel-shading",
  },
  {
    name: "Minh hoạ, mạng xã hội, ưu đãi (Làng Mây)",
    since: "21/10/2026",
    palette: "Trắng và bạc làm nền, màu thiên nhiên ≤ 30 % khung hình, không cho chữ và logo",
    look: "Hoạt hình vẽ tay, cảm hứng anime thập niên 90",
  },
  {
    name: "Ảnh món, ảnh hero",
    since: "16/11/2026",
    palette: "Ly trắng in bạc là nhân vật chính; màu nền riêng từng món; sương trắng bạc ở hero",
    look: "Ảnh studio, ảnh không khí; tên chỉ in trên ly",
  },
];

export const voice = {
  do: [
    "Câu ngắn, mỗi câu một ý, tối đa hai tính từ.",
    "Viết “Boongee” (chỉ B hoa); tên file viết thường.",
    "Tiếng Việt có dấu đầy đủ; giá “32K”, dung tích “500 ml”, ngày “dd/mm/yyyy”.",
    "Thơ ngắn và mộc được phép, không ở chỗ cần thông tin.",
  ],
  dont: [
    "“siêu”, “đỉnh”, “mê”, “tuyệt hảo”, “tinh hoa” và từ thổi phồng.",
    "Hướng dẫn thao tác trên màn hình (“cuộn xuống”, “kéo để xoay”).",
    "Đếm số lượng ở trang chủ (“23 món”, “từ 32K”).",
    "Gọi phong cách bằng tên một studio.",
  ],
};

export const toonRules = [
  "Khối mượt, bo tròn; cốc không cắt mặt.",
  "Ba dải sáng mềm (0,62 · 0,84 · 1), không tone mapping, không khúc xạ.",
  "Một nét viền 1,5 px cùng tông đậm hơn; vật gần trắng viền bạc. Không viền đen.",
  "Vệt sáng trắng phẳng, hẹp; không ánh viền.",
  "Nắng ấm từ trên trái, mặt khuất ngả bạc trung tính.",
  "Nhựa trong bằng alpha 0,25–0,4; đồ uống 2–3 lớp, ranh giới lượn sóng.",
  "Asset ngoài chỉ CC0 hoặc license rõ; nhuộm lại bằng toonMaterial({ tint }).",
];

export const photoRules = [
  "Mỗi món một màu nền tông-trên-tông, một đĩa sứ, một bệ thạch cao, một cành ngang phía trên.",
  "Chữ “Boongee” chỉ nằm trên ly, không bao giờ đè lên ảnh.",
  "Tạo mới kèm tờ in mẫu ref-04, không sửa ảnh bằng prompt.",
  "Nho Thanh Trúc dùng nho Shine Muscat xanh; Nho Cheese màu tím. Ảnh món trên web ghi “Ảnh minh hoạ”; ảnh hero là ảnh không khí, không cần ghi.",
];

export const motion = [
  { what: "Chuyển trạng thái giao diện", value: "120–250 ms" },
  { what: "Ảnh món khi rê chuột", value: "phóng 1,04 trong 700 ms, ease-out" },
  { what: "Lật thẻ ưu đãi", value: "600 ms" },
  { what: "Lottie vẽ tay", value: "12 fps, mực + một màu bạc, intro rồi lặp, đứng yên khi giảm chuyển động" },
  { what: "Ánh kim", value: "đứng yên: không chạy, không nhấp nháy" },
  { what: "Cốc 3D", value: "lơ lửng 1,6 cm, 0,24 Hz; bộ ảnh bìa đứng yên" },
];

export const checklist = [
  "Chỉ Fraunces.",
  "Mỗi mặt một màu hoạ tiết trên một màu nền.",
  "Trắng là nền, bạc là dấu; màu nhấn ≤ 2 %.",
  "Bạc không dùng cho chữ đọc.",
  "Đúng bề mặt, không trộn.",
  "Không lấp lánh, không chữ đè lên ảnh món.",
  "Không thông tin bịa; ảnh AI ghi “Ảnh minh hoạ”.",
  "Chữ chính ≥ 4,5 : 1.",
  "Văn bản ngắn, không từ thổi phồng.",
  "Đổi quy cách in: cập nhật brandkit/print/README.md.",
];

/** What changed in the system, newest first. Add a line with every change of rule. */
export const changelog = [
  {
    date: "18/11/2026",
    lines: [
      "Design DNA và Design System bản 2: tông chủ đạo là trắng và bạc ánh kim (70 · 20 · 8 · 2).",
      "Thêm dải bạc 50–800 và ánh kim; hồng phấn lùi thành bao bì cũ và điểm nhấn, xanh pastel chỉ còn trong ảnh.",
      "Web bỏ xanh pastel khỏi giao diện; 3D và Lottie chuyển sang bạc trung tính.",
    ],
  },
  {
    date: "17/11/2026",
    lines: [
      "Website đổi sang trắng, bạc, xanh pastel; bỏ thẻ sticker và nút “game”.",
      "Hero: ảnh “Sương sớm trên núi” (hai ly trên đế sứ, Nho Cheese tím, đồi chè trong sương), không ghi “Ảnh minh hoạ”; đã thử rồi bỏ núi mây 2.5D và đảo bay cel-shading.",
      "Lottie /menu 6 giây “Hương thành hoa”: ấm trà rót vào ly giấy, bốn hoa monogram mọc dọc thân ly, hơi trà vẽ thành bông hoa, màu xanh pastel.",
      "Lập Design DNA, Design System, tokens.json và trang /system-design.",
    ],
  },
  { date: "16/11/2026", lines: ["Lookbook v3; túi giấy ba bản; túi giữ nhiệt in bạc mặt trước."] },
  { date: "27/10/2026", lines: ["Bỏ mọi hiệu ứng lấp lánh trong mọi thiết kế."] },
  { date: "21/10/2026", lines: ["Bản Làng Mây: minh hoạ vẽ tay và quy tắc toon cho 3D."] },
  { date: "17/10/2026", lines: ["Thêm bạc ánh kim Pantone 877 C cho cốc giấy 2 lớp."] },
  { date: "12/10/2026", lines: ["Chốt ba màu in Hồng phấn, Đen Than, trắng giấy; tên viết “Boongee”."] },
];
