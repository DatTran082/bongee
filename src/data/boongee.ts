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
    "Boongee · Trà hương thanh vị: trà sữa hương hoa, kem bông, trà trái cây, kem cheese, cà phê phin và coldbrew, pha nhẹ, vị thanh.",
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
  menu: "thuc-don",
  offers: "uu-dai",
  faq: "hoi-dap",
  visit: "ghe-quan",
} as const;

export const nav = [
  { label: "Câu chuyện", id: sections.story },
  { label: "Thực đơn", id: sections.menu },
  { label: "Ưu đãi", id: sections.offers },
  { label: "Ghé quán", id: sections.visit },
];

export const hero = {
  intro: "Trà ướp hoa dành dành, bạch lan, hoa trúc. Pha thật nhẹ: thơm dịu, vị thanh.",
  /** the cover photo, shown in the hero's slot only when the 3D cup cannot be */
  imageAlt: "Hai ly Boongee trên nền hồng: ly kem bông rắc cánh hồng khô và ly giấy đậy nắp, in hoa monogram màu bạc",
};

/** The 3D stage's actors, floating through the page (src/components/cup-stage.tsx). */
export const cup = {
  actors: {
    set: {
      short: "Bộ ảnh bìa",
      label:
        "Bộ ảnh bìa Boongee dựng 3D: hai ly giấy 16 oz in bốn dấu monogram màu bạc và chữ Boongee; ly kem bông rắc cánh hồng khô đứng trên khối đá granite, ly đậy nắp bật trắng đứng trên khúc gỗ, bên cạnh một bông ly trắng, một cành nụ xanh và dây leo hoa nhài.",
    },
    pp: {
      short: "Ly nhựa",
      label:
        "Ly Boongee 700 ml, mô hình 3D: ly nhựa nhám in bốn dấu monogram và chữ Boongee, bên trong là trà nho xanh, đậy nắp bật nút trong; nho xanh, viên đá và giọt nước lơ lửng xung quanh.",
    },
    paper: {
      short: "Ly giấy",
      label:
        "Ly giấy Boongee 16 oz, mô hình 3D: ly giấy hai lớp in bốn dấu monogram màu bạc và chữ Boongee, đậy nắp bật nút trắng.",
    },
  },
  hint: "Kéo để xoay, chạm nắp để bật nút",
  keys: "Phím mũi tên trái, phải xoay; Enter bật hoặc đậy nút; Home về mặt trước.",
  strapOpened: "đã bật nút nắp.",
  strapClosed: "đã đậy nút nắp.",
};

/** The visual narrative of docs/01 §6: origin, ritual, feeling. */
export const story = {
  tagline: "Câu chuyện",
  title: "Một chút mây, một chút hoa",
  beats: [
    // TODO(boongee): this narrative (docs/01 §6) was written for the old name "Shan Mây" (mây = cloud; ShanMay
    // assumes a highland Shan tuyết base tea). docs/01 asks for a new name story once "boongee" has a meaning, and
    // the tea's origin is unconfirmed: rewrite or confirm "Gốc" and the cloud images (title, last beat) together.
    { label: "Gốc", text: "Trà mọc trên núi cao, nơi mây phủ quanh năm." },
    { label: "Nghi thức", text: "Ở Boongee, trà được ướp cùng hoa dành dành, bạch lan, hoa trúc, rồi pha thật nhẹ." },
    { label: "Cảm xúc", text: "Giữa phố đông, một ly trà thơm dịu, vị thanh, như mang theo chút mây trời." },
  ],
  closing: "Trà hương thanh vị.",
  marks:
    "Bông hoa năm cánh của logo đi cùng bốn dấu monogram: đĩa hoa, hoa đặc, sao hoa, hoa tròn đặc. Bạn sẽ gặp chúng trên mỗi chiếc ly.",
};

export type PromiseIcon = "flower" | "droplet" | "feather";

/** What a Boongee drink keeps to: the USP of docs/01 §1 and its proofs. */
export const promises = {
  tagline: "Điều Boongee giữ",
  title: "Thơm dịu, không gắt",
  items: [
    {
      title: "Hoa thật",
      text: "Trà ướp cùng hoa dành dành, bạch lan, hoa trúc.",
      icon: "flower",
    },
    {
      // TODO(boongee): 50 % is the default ShanMay proposes (USP proof 3); confirm it at the counter.
      title: "Ngọt vừa",
      text: "Mặc định ngọt 50% để giữ vị thanh. Chỉnh từ 0 đến 100%.",
      icon: "droplet",
    },
    {
      title: "Pha thật nhẹ",
      text: "Vị thanh, không gắt: một ly trà nhẹ nhàng giữa phố.",
      icon: "feather",
    },
  ] satisfies Array<{ title: string; text: string; icon: PromiseIcon }>,
};

export const menuIntro = {
  tagline: "Thực đơn",
  title: "Hương dịu, vị thanh",
  // TODO(boongee): ShanMay menu_data.py → HERO is a *sample* featured drink ("món nổi bật mẫu"); confirm or change.
  featured: "Trà Sữa Bạch Lan Hoa",
};

export const offersIntro = {
  tagline: "Ưu đãi",
  title: "Ghé thường, có quà",
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
  title: "Hẹn bạn ở Boongee",
  address: ADDRESS,
  addressLine: `${ADDRESS.street}, ${ADDRESS.district}, ${ADDRESS.city}`,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${ADDRESS.street}, ${ADDRESS.district}, ${ADDRESS.city}`,
  )}`,
  hours: null as string | null, // TODO(boongee): giờ mở cửa, ví dụ "7:00 – 22:00 mỗi ngày"
  phone: null as string | null, // TODO(boongee): số điện thoại / Zalo đặt món
  services: "Uống tại quán và mang đi.", // collateral.json → promos.sale.detail ("tại quán và mang đi")
};

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
  title: "Trước khi ghé",
};

export const PENDING = "Đang cập nhật";
