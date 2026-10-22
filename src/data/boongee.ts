// Boongee: the words and facts the landing page shows. Sources:
//   - brand story, tone and promises: ShanMay brand-kit docs/01-brand-foundation.md (USP, visual narrative, tone);
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
  story: "cau-chuyen",
  flavors: "huong-vi",
  menu: "thuc-don",
  offers: "uu-dai",
  faq: "hoi-dap",
  visit: "ghe-quan",
} as const;

export const nav = [
  { label: "Câu chuyện", id: sections.story },
  { label: "Menu", id: sections.menu },
  { label: "Ưu đãi", id: sections.offers },
  { label: "Ghé quán", id: sections.visit },
];

export const hero = {
  intro: "Trà ướp hoa dành dành, bạch lan, hoa trúc. Pha nhẹ, uống dễ.",
  /** the cover photo, shown in the hero's slot only when the 3D cup cannot be */
  imageAlt: "Hai ly Boongee: ly kem bông rắc cánh hồng khô và ly giấy đậy nắp, in hoa monogram màu bạc",
};

/** The 3D stage's actors, floating through the page (src/components/cup-stage.tsx). */
export const cup = {
  actors: {
    set: {
      short: "Bộ ảnh bìa",
      label:
        "Bộ ảnh bìa Boongee dựng 3D kiểu hoạt hình: hai ly giấy 16 oz in bốn dấu monogram và chữ Boongee; ly kem bông rắc cánh hồng khô đứng trên tảng đá, ly đậy nắp bật trắng đứng trên khúc gỗ, mây trắng trôi phía sau.",
    },
    flavor: {
      short: "Ly theo hương vị",
      label:
        "Ly Boongee 3D đổi theo hương vị khi cuộn: ly giấy in monogram bạc cho trà sữa hương hoa, kem bông, kem cheese và cà phê, ly nhựa trong cho trà trái cây; topping của từng vị bay quanh ly.",
    },
    pp: {
      short: "Ly nhựa",
      label:
        "Ly Boongee 700 ml, mô hình 3D kiểu hoạt hình: ly nhựa trong in bốn dấu monogram và chữ Boongee, bên trong là trà nho xanh, đậy nắp bật nút trong; nho xanh, viên đá và đốm lấp lánh quanh ly.",
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

/** The flavour carousel (src/components/flavors.tsx); the flavours' names come from the menu (src/data/flavors.ts). */
export const flavorsIntro = {
  tagline: "Hương vị",
  title: "Từng vị một",
  nav: "Chọn hương vị",
  counter: (index: number, count: number) =>
    `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`,
  more: "Xem menu",
};

/**
 * The story: a short poem, then three plain lines on what is in the cup. Words kept simple (the owner, 22/10/2026:
 * no flowery copy); the pictures are small, quiet ones (clouds, wind, a kitchen), as in a hand-drawn film.
 */
export const story = {
  tagline: "Câu chuyện",
  title: "Trà ướp hoa",
  // The clouds and the wind are pictures, not facts: the tea's origin is not confirmed yet (TODO(boongee): docs/01
  // asks for a name story once "boongee" has a meaning; add the origin then, if it is confirmed).
  poem: ["Mây đi ngang mái nhà,", "gió mang hương hoa vào bếp.", "Ấm trà để yên một lúc,", "rồi rót ra, thật nhẹ."],
  beats: [
    { label: "Hoa", text: "Trà ướp cùng hoa dành dành, bạch lan, hoa trúc." },
    { label: "Pha", text: "Pha nhẹ tay cho vị thanh, không gắt." },
    { label: "Ly", text: "Mỗi ly in bông hoa năm cánh và bốn dấu hoa nhỏ." },
  ],
  closing: "Trà hương thanh vị.",
};

export type PromiseIcon = "flower" | "droplet" | "feather";

/** What a Boongee drink keeps to: the USP of docs/01 §1 and its proofs. */
export const promises = {
  tagline: "Cam kết",
  title: "Ba điều Boongee giữ",
  items: [
    {
      title: "Hoa thật",
      // the teas in the till's recipes (Odoo): cốt trà dành dành, bạch lan hoa, quế hoa, hoa nhài
      text: "Cốt trà ướp cùng hoa dành dành, bạch lan, quế hoa và hoa nhài.",
      icon: "flower",
    },
    {
      // TODO(boongee): 50 % is the default ShanMay proposes (USP proof 3); confirm it at the counter.
      title: "Ngọt tuỳ bạn",
      text: "Mặc định 50% đường. Muốn ngọt hơn hay ít hơn, cứ dặn quầy.",
      icon: "droplet",
    },
    {
      title: "Vị thanh",
      text: "Trà pha vừa tay, uống đến cuối ly vẫn nhẹ.",
      icon: "feather",
    },
  ] satisfies Array<{ title: string; text: string; icon: PromiseIcon }>,
};

export const menuIntro = {
  tagline: "Menu",
  title: "Món ở quán",
  // TODO(boongee): ShanMay menu_data.py → HERO is a *sample* featured drink ("món nổi bật mẫu"); confirm or change.
  featured: "Bạch Lan Hoa",
};

export const offersIntro = {
  tagline: "Ưu đãi",
  title: "Giảm giá và tích điểm",
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
  tagline: "Ghé quán",
  title: "Đường đến quán",
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
 * (brandkit-ghibli giao_hang.py → src/assets/lang-may/). A `null` href shows the app without a link: the page then
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

export const faqIntro = {
  tagline: "Hỏi đáp",
  title: "Hay được hỏi",
};

export const PENDING = "Đang cập nhật";
