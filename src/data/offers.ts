// Offers, from the ShanMay brand kit's collateral.json (the file the vouchers and the loyalty card are printed from),
// copied by `npm run sync-brand`. Only the standing offers are shown: the weekly discount and the loyalty card. The
// opening offer (`promos.opening`, 10.10) is over and left out.
import collateral from "./shanmay/collateral.json";

/** e.g. { eyebrow: "ƯU ĐÃI TRONG TUẦN", value: "-20%", offer: "Cho đơn từ 2 ly", detail: "Thứ 2 – Thứ 4 · …" } */
// TODO(boongee): collateral.json gives no end date: confirm the weekly offer is a standing one before launch.
export const weeklyOffer = collateral.promos.sale;

/** e.g. { stamps: 10, reward: "TẶNG 1 LY", headline: "Mua 9 ly, ly thứ 10 miễn phí", terms: "…" } */
export const loyalty = collateral.loyalty;
