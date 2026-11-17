// Boongee: the words and facts the landing page shows. Sources:
//   - brand tone: ShanMay brand-kit docs/01-brand-foundation.md (USP, visual narrative, tone);
//   - menu and offers: ShanMay menu-data.json and collateral.json, through src/data/menu.ts and src/data/offers.ts.
// ShanMay marks some facts as assumptions ([GIẢ ĐỊNH]); they carry a TODO(boongee) here: confirm before launch.
// Tone (docs/01 §7): short sentences, one idea each, at most two adjectives, no "siêu / đỉnh / mê / tuyệt hảo /
// tinh hoa". A `null` renders as "Đang cập nhật" (never as a dead link).

// The domain is not here: it comes from the environment, server-side only (src/lib/site-url.ts).
export const site = {
  title: "Boongee — Trà hương thanh vị",
  // No address here until visit.address.confirmed (it would be indexed): see ADDRESS below.
  description:
    "Boongee · Trà hương thanh vị: trà sữa ướp hoa dành dành, bạch lan, hoa trúc; kem bông, trà trái cây, kem cheese, cà phê phin và coldbrew.",
  locale: "vi_VN",
};

export const brand = {
  name: "Boongee",
  slogan: "Trà hương thanh vị",
  sloganLines: ["Trà hương", "thanh vị"],
};

/** Section anchors, shared by the page and the navigation. */
export const sections = {
  menu: "thuc-don",
  offers: "uu-dai",
  visit: "cua-hang",
} as const;

export const nav = [
  { label: "Thực đơn", id: sections.menu },
  { label: "Ưu đãi", id: sections.offers },
  { label: "Cửa hàng", id: sections.visit },
];

/** The hero's two calls to action and the header's button. */
export const actions = {
  menu: "Xem thực đơn",
  visit: "Tìm cửa hàng",
};

export const hero = {
  /** the hero's photograph (src/assets/images/hero-suong-som-*.jpg, brandkit/lookbook/hero-web/) */
  imageAlt:
    "Hai ly Boongee trên phiến đá giữa đồi chè trong sương sớm: ly giấy kem bông rắc cánh hồng khô in hoa monogram màu bạc, ly nhựa trà nho xanh in cột hoa trắng. Ảnh minh hoạ.",
};

/** The 3D stage's actors, floating through the page (src/components/cup-stage.tsx). */
export const cup = {
  actors: {
    pp: {
      short: "Ly nhựa",
      label:
        "Ly Boongee 700 ml, mô hình 3D kiểu hoạt hình: ly nhựa trong in bốn dấu monogram và chữ Boongee, bên trong là trà nho xanh, đậy nắp bật nút trong; nho xanh và viên đá quanh ly.",
    },
    paper: {
      short: "Ly giấy",
      label:
        "Ly giấy Boongee 16 oz, mô hình 3D kiểu hoạt hình: ly giấy hai lớp in bốn dấu monogram và chữ Boongee, đậy nắp bật nút trắng.",
    },
  },
  /** read by assistive tech only (aria-describedby): the page itself shows no instructions */
  hint: "Kéo ly để xoay, chạm nắp để bật nút.",
  keys: "Phím mũi tên trái, phải xoay; Enter bật hoặc đậy nút; Home về mặt trước.",
  strapOpened: "đã bật nút nắp.",
  strapClosed: "đã đậy nút nắp.",
};

export const menuIntro = {
  tagline: "Thực đơn",
  title: "Thức uống đặc trưng",
  more: "Xem toàn bộ thực đơn",
};

export const offersIntro = {
  tagline: "Ưu đãi",
  title: "Ưu đãi thành viên",
};

// TODO(boongee): ShanMay places the shop in phố Hoa Bằng, Cầu Giấy, Hà Nội as an assumption; the street address is
// the one printed on its menu and vouchers. Confirm all of it, then set confirmed: true. Until then the page shows
// it, but the meta description and the structured data for search engines leave it out.
const ADDRESS = {
  confirmed: false,
  street: "14B ngách 7/72 phố Hoa Bằng",
  district: "Cầu Giấy",
  city: "Hà Nội",
};

export const visit = {
  tagline: "Cửa hàng",
  title: "Ghé thăm Boongee",
  address: ADDRESS,
  addressLine: `${ADDRESS.street}, ${ADDRESS.district}, ${ADDRESS.city}`,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${ADDRESS.street}, ${ADDRESS.district}, ${ADDRESS.city}`,
  )}`,
  hours: null as string | null, // TODO(boongee): giờ mở cửa, ví dụ "7:00 – 22:00 mỗi ngày"
  phone: null as string | null, // TODO(boongee): số điện thoại / Zalo đặt món
  services: "Uống tại quán, mang đi, hoặc đặt giao qua GrabFood, ShopeeFood.", // collateral.json → promos.sale.detail ("tại quán và mang đi"); the apps: owner, 22/10/2026
};

/**
 * The delivery apps Boongee is on (owner, 22/10/2026), shown in the visit section with their painted badges
 * (brandkit giao_hang.py → src/assets/lang-may/). A `null` href shows the app without a link: the page then
 * asks to search the shop's name in the app.
 */
export const delivery = {
  title: "Đặt giao tận nơi",
  line: "Boongee đã có mặt trên GrabFood và ShopeeFood.",
  search: "Tìm “Boongee” trên app",
  apps: [
    { name: "GrabFood", badge: "grabfood", href: null as string | null }, // TODO(boongee): link quán trên GrabFood
    { name: "ShopeeFood", badge: "shopeefood", href: null as string | null }, // TODO(boongee): link quán trên ShopeeFood
  ],
} as const;

export type SocialIcon = "facebook" | "instagram" | "tiktok" | "zalo";

/** Social pages. A `null` href is left out of the page. */
export const socials: Array<{ name: string; icon: SocialIcon; href: string | null }> = [
  { name: "Facebook", icon: "facebook", href: null }, // TODO(boongee)
  { name: "Instagram", icon: "instagram", href: null }, // TODO(boongee)
  { name: "TikTok", icon: "tiktok", href: null }, // TODO(boongee)
  { name: "Zalo", icon: "zalo", href: null }, // TODO(boongee)
];

export const PENDING = "Đang cập nhật";
