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
  pillars: [
    { word: "Hương", line: "Mùi hoa là thứ khách nhớ trước tiên. Hoa là chữ ký của mọi thiết kế." },
    { word: "Thanh", line: "Vị nhẹ, uống dễ. Thiết kế cũng nhẹ: ít chi tiết, nhiều khoảng thở." },
    { word: "Vị", line: "Đồ uống thật, giá thật, ảnh ghi rõ là minh hoạ. Không thổi phồng." },
  ],
  personality: [
    ["Thanh nhã, tinh tế", "Sang chảnh, phô trương"],
    ["Dịu, mềm", "Ngọt sến, trẻ con"],
    ["Mộc, thật thà", "Quảng cáo dồn dập"],
    ["Gọn, rõ ràng", "Nhiều chữ, nhiều hiệu ứng"],
    ["Có chút thơ", "Hoa mỹ, sáo rỗng"],
  ] as const,
};

export const principles = [
  {
    title: "Một màu hoạ tiết trên một màu nền",
    line: "Đen trên hồng, hồng trên đen, đen trên trắng, bạc trên trắng. Không trắng trên hồng hay hồng trên trắng cho chữ.",
  },
  { title: "Khoảng thở hơn trang trí", line: "Bỏ bớt trước khi thêm. Một màn hình, một ý." },
  {
    title: "Hoa là chữ ký",
    line: "Hoa 5 cánh của logo và bốn dấu monogram là hình nhận diện. Không thêm biểu tượng cạnh tranh.",
  },
  {
    title: "Thật trước đẹp",
    line: "Không bịa địa chỉ, giá, số điện thoại, lời khen. Ảnh món làm bằng AI ghi “Ảnh minh hoạ”, thông tin chưa có ghi “Đang cập nhật”.",
  },
  { title: "Mềm mà rõ", line: "Khối bo tròn, bóng mềm; mép sắc bằng nét mảnh cùng tông; chữ luôn đủ tương phản." },
  { title: "Không lấp lánh", line: "Không sao lấp lánh, hạt sáng hay glitter, ở 2D lẫn 3D." },
];

export const surfaces = [
  {
    name: "In ấn, bao bì",
    since: "12/10/2026",
    palette: "Hồng phấn, Đen Than, trắng giấy; bạc 877 C chỉ trên trắng; xanh blue-700 chỉ túi giấy bản Xanh",
    look: "Ba màu phẳng, chặt chẽ",
  },
  {
    name: "Website",
    since: "17/11/2026",
    palette: "Trắng, bạc, xanh pastel; chữ đen than; không hồng trong giao diện",
    look: "Tinh tế, tối giản; cốc 3D cel-shading",
  },
  {
    name: "Minh hoạ, mạng xã hội, ưu đãi (Làng Mây)",
    since: "21/10/2026",
    palette: "Màu lõi + màu thiên nhiên ≤ 30 % khung hình, không cho chữ và logo",
    look: "Hoạt hình vẽ tay, cảm hứng anime thập niên 90",
  },
  {
    name: "Ảnh món (lookbook)",
    since: "16/11/2026",
    palette: "Màu nền riêng từng món, tông-trên-tông",
    look: "Ảnh studio; tên chỉ in trên ly",
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
  "Một nét viền 1,5 px cùng tông đậm hơn; vật gần trắng viền xanh bạc. Không viền đen.",
  "Vệt sáng trắng phẳng, hẹp; không ánh viền.",
  "Nắng ấm từ trên trái, mặt khuất ngả xanh bạc.",
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
  { what: "Lottie vẽ tay", value: "12 fps, mực + một màu, intro rồi lặp, đứng yên khi giảm chuyển động" },
  { what: "Cốc 3D", value: "lơ lửng 1,6 cm, 0,24 Hz; bộ ảnh bìa đứng yên" },
];

export const checklist = [
  "Chỉ Fraunces.",
  "Mỗi mặt một màu hoạ tiết trên một màu nền.",
  "Đúng bảng màu của bề mặt, không trộn.",
  "Không lấp lánh, không chữ đè lên ảnh món.",
  "Không thông tin bịa; ảnh AI ghi “Ảnh minh hoạ”.",
  "Chữ chính ≥ 4,5 : 1.",
  "Văn bản ngắn, không từ thổi phồng.",
  "Đổi quy cách in: cập nhật brandkit/print/README.md.",
];

/** What changed in the system, newest first. Add a line with every change of rule. */
export const changelog = [
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
