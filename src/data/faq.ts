// Questions a visitor asks before coming, answered only from the data the rest of the page shows (menu, offers,
// address), so an answer can never drift from the section it summarises. Also the FAQPage structured data.
import { menuIntro, promises, visit } from "./boongee";
import { categories, customisation, formatPrice, priceRange, pricesAreIllustrative, sizes } from "./menu";
import { loyalty, weeklyOffer } from "./offers";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const sizeText = sizes.map((s) => `${s.label} ${s.volume.replace("ml", " ml")}`).join(" và ");
const singleSize = categories
  .filter((c) => !c.sized && c.id !== "topping") // a topping has no size of its own
  .map((c) => c.title.replaceAll(" · ", ", ").toLowerCase())
  .join(" và ");
const toppingFrom = Math.min(...(categories.find((c) => c.id === "topping")?.items.flatMap((i) => i.prices) ?? [0]));
const sweetness = promises.items.find((p) => p.icon === "droplet")?.text ?? "";
const featuredNote = categories.flatMap((c) => c.items).find((i) => i.name === menuIntro.featured)?.note;
const levels = customisation.options.map((o) => `${o.label.toLowerCase()} ${o.options}`).join("; ");

/** `topic` lets the structured data leave out answers built on unconfirmed facts (address, prices). */
export const faq: Array<{ question: string; answer: string; topic: "address" | "price" | "other" }> = [
  {
    question: "Boongee ở đâu?",
    topic: "address",
    answer: `${visit.addressLine}. ${visit.services}${visit.hours ? ` Giờ mở cửa: ${visit.hours}.` : ""}`,
  },
  {
    question: "Giá một ly bao nhiêu?",
    topic: "price",
    answer: `Từ ${formatPrice(priceRange.min)} đến ${formatPrice(priceRange.max)}, tuỳ món và cỡ ly. Topping thêm từ ${formatPrice(toppingFrom)}.${pricesAreIllustrative ? " Giá tham khảo, đang cập nhật." : ""}`,
  },
  {
    question: "Ly có mấy cỡ?",
    topic: "other",
    answer: `Hai cỡ: ${sizeText}. ${capitalize(singleSize)} chỉ có một cỡ.`,
  },
  {
    question: "Có chỉnh độ ngọt và đá không?",
    topic: "other",
    answer: `Có: ${levels}. ${sweetness.split(".")[0]}.`,
  },
  {
    question: "Nên thử món nào trước?",
    topic: "other",
    answer: `Bạn có thể bắt đầu với ${menuIntro.featured}${featuredNote ? ` (${featuredNote.toLowerCase()})` : ""}.`,
  },
  {
    question: "Thẻ tích điểm hoạt động thế nào?",
    topic: "other",
    answer: `${loyalty.headline}. ${loyalty.terms}.`,
  },
  {
    question: "Có ưu đãi trong tuần không?",
    topic: "other",
    answer: `Giảm ${weeklyOffer.value.replace("-", "")} ${weeklyOffer.offer.toLowerCase()}, ${weeklyOffer.detail.replaceAll(" · ", ", ").toLowerCase()}.`,
  },
];
