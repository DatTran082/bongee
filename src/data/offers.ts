// Offers, from the ShanMay brand kit's collateral.json (the file the vouchers and the loyalty card are printed from),
// copied by `npm run sync-brand`. The standing offers are shown: the weekly discount, the loyalty card and the
// vouchers (their printed Làng Mây designs, brandkit/collateral, in public/uu-dai). The opening offer
// (`promos.opening`, 10.10) is over and left out.
import collateral from "./shanmay/collateral.json";

/** e.g. { eyebrow: "ƯU ĐÃI TRONG TUẦN", value: "-20%", offer: "Cho đơn từ 2 ly", detail: "Thứ 2 – Thứ 4 · …" } */
// TODO(boongee): no end date yet. A price discount needs one (Decree 239/2026), and app-pricing.md §6 advises
// against a fixed counter discount (the counter price would fall below the app price): the owner decides.
export const weeklyOffer = collateral.promos.sale;

/** e.g. { stamps: 10, reward: "TẶNG 1 LY", headline: "Mua 9 ly, ly thứ 10 miễn phí", terms: "…" } */
export const loyalty = collateral.loyalty;

/** e.g. { slug: "giam-20k", label: "GIẢM", value: "20K", condition: "Cho hoá đơn từ 60K", expiry: "HSD: 31/12/2026" } */
export const vouchers = collateral.vouchers;

/** The vouchers' conditions, one sentence each. */
export const voucherTerms = collateral.voucher_terms;
