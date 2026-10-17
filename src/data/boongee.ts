// Boongee: every word and fact the landing page shows, in one place. Facts about the cups come from the brand kit
// (brandkit/packaging/catalog.json). Anything marked TODO(boongee) is not known yet: fill it in before launch. A
// `null` renders as "Đang cập nhật" (never as a dead link).

// The domain is not here: it comes from the environment, server-side only (src/lib/site-url.ts).
export const site = {
  title: "Boongee — Trà hương thanh vị",
  description:
    "Boongee: trà sữa, trà trái cây và trà kem bông, hương dịu vị thanh, đựng trong ly giấy và ly nhám in hoa monogram.",
  locale: "vi_VN",
};

export const brand = {
  name: "Boongee",
  slogan: "Trà hương thanh vị",
  sloganLines: ["Trà hương", "thanh vị"],
};

/** Section anchors, shared by the page and the navigation. */
export const sections = {
  story: "cau-chuyen",
  drinks: "do-uong",
  cups: "ly-boongee",
  visit: "ghe-quan",
} as const;

export const nav = [
  { label: "Câu chuyện", id: sections.story },
  { label: "Đồ uống", id: sections.drinks },
  { label: "Ly Boongee", id: sections.cups },
  { label: "Ghé quán", id: sections.visit },
];

export const hero = {
  // TODO(boongee): câu giới thiệu chính thức.
  intro: "Trà pha mỗi ngày, hương dịu và vị thanh, trong chiếc ly in hoa monogram của Boongee.",
  imageAlt: "Hai ly Boongee trên nền hồng: ly kem bông rắc cánh hồng khô và ly giấy đậy nắp, in hoa monogram màu bạc",
};

export const story = {
  tagline: "Câu chuyện",
  title: "Một bông hoa, bốn dấu monogram",
  // TODO(boongee): câu chuyện thương hiệu thật.
  paragraphs: [
    "Logo Boongee là bông hoa năm cánh. Từ bông hoa ấy có bốn dấu monogram: đĩa hoa, hoa đặc, sao hoa và hoa tròn đặc: xếp thành cụm 2 × 2 trên ly giấy, thành một cột dọc trên ly nhựa.",
    "Ba màu của Boongee là hồng phấn, đen than và trắng, cùng nét chữ Fraunces mềm mại. Ly giấy in hoa bạc ánh kim, ly nhựa nhám in hoa trắng.",
  ],
  imageAlt: "Hoạ tiết monogram Boongee: bốn dấu hoa màu đen than trên nền hồng phấn",
};

export type DrinkIcon = "cup" | "lemon" | "ice-cream" | "mug";

export const drinks = {
  tagline: "Đồ uống",
  title: "Hương dịu, vị thanh",
  // TODO(boongee): thay bằng thực đơn và giá thật.
  subtitle: "Thực đơn đầy đủ đang được cập nhật.",
  items: [
    { title: "Trà sữa", description: "Trà đậm hương, sữa béo vừa, ngọt nhẹ.", icon: "cup" },
    { title: "Trà trái cây", description: "Trà thanh cùng trái cây, uống mát.", icon: "lemon" },
    { title: "Trà kem bông", description: "Lớp kem bông mịn trên nền trà, rắc cánh hồng khô.", icon: "ice-cream" },
    { title: "Đồ uống nóng", description: "Đựng trong ly giấy hai lớp, cầm không nóng tay.", icon: "mug" },
  ] satisfies Array<{ title: string; description: string; icon: DrinkIcon }>,
};

export const cups = {
  tagline: "Ly Boongee",
  title: "Xoay thử chiếc ly của bạn",
  subtitle: "Kéo để xoay, chụm hai ngón để phóng to. Hình in trên thân ly đúng như bản in thật.",
  items: [
    {
      model: "/models/boongee-paper-16oz.glb",
      poster: "/models/boongee-paper-16oz.webp",
      title: "Ly giấy hai lớp 500 ml",
      description:
        "Cụm bốn hoa monogram in bạc ánh kim. Hai lớp giấy giữ ấm, cầm đồ nóng không cần cover. Nắp bật nút rời.",
      alt: "Mô hình 3D ly giấy hai lớp Boongee 16 oz, in cụm hoa monogram màu bạc, nắp trắng",
    },
    {
      model: "/models/boongee-pp-700ml.glb",
      poster: "/models/boongee-pp-700ml.webp",
      title: "Ly nhựa nhám 700 ml",
      description: "Nhựa PP nhám trong mờ, bốn hoa xếp dọc in trắng. Dành cho trà sữa và trà trái cây.",
      alt: "Mô hình 3D ly nhựa nhám Boongee 700 ml, in bốn hoa monogram màu trắng xếp dọc, nắp trong",
    },
  ],
};

export const visit = {
  tagline: "Ghé quán",
  title: "Hẹn bạn ở Boongee",
  address: null as string | null, // TODO(boongee): địa chỉ quán
  mapUrl: null as string | null, // TODO(boongee): link Google Maps
  hours: null as string | null, // TODO(boongee): giờ mở cửa, ví dụ "7:00 – 22:00 mỗi ngày"
  phone: null as string | null, // TODO(boongee): số điện thoại / Zalo đặt món
};

export type SocialIcon = "facebook" | "instagram" | "tiktok" | "zalo";

/** Social pages. A `null` href is left out of the page. */
export const socials: Array<{ name: string; icon: SocialIcon; href: string | null }> = [
  { name: "Facebook", icon: "facebook", href: null }, // TODO(boongee)
  { name: "Instagram", icon: "instagram", href: null }, // TODO(boongee)
  { name: "TikTok", icon: "tiktok", href: null }, // TODO(boongee)
  { name: "Zalo", icon: "zalo", href: null }, // TODO(boongee)
];

export const PENDING = "Đang cập nhật";
