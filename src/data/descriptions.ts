// Each dish's short description, by its name on the till (owner, 21/11/2026: "bỏ giá bán và thêm mô tả ngắn gọn cho
// từng món", in the sensory way of the delivery-app descriptions they sent). Written from each dish's Odoo recipe as
// read on 21/11/2026: only ingredients the recipe has, no tea origin and no health claims; Thanh Nho Tươi and its
// combos never mention kumquat, and their grapes sit on top of the cup (owner, 20/11/2026). The combos name their cups
// as their recipes make them. When a recipe changes in Odoo, read its description again; a dish missing here shows
// its plain line (src/lib/menu/describe.ts) instead (descriptions.test.ts checks every dish on the till has one).
// Brand review of 27/11/2026: at most two adjectives a clause, no "mê", no slang ("càng uống càng cuốn").

export const DESCRIPTIONS: Readonly<Record<string, string>> = {
  // Trà sữa hương hoa
  "Bạch Lan Hoa":
    "Cốt trà bạch lan hoa thơm thanh, hoà cùng sữa và chút sữa đặc. Hương hoa dịu nơi đầu lưỡi, hậu ngọt nhẹ.",
  "Bạch Thiên Hương":
    "Cốt trà hoa dành dành hương ngát, quyện cùng sữa béo nhẹ và chút sữa đặc. Vị trà thanh, hương hoa lưu lại lâu sau từng ngụm.",
  "Bạch Đào Hoa": "Trà ô long bạch đào phảng phất hương đào chín, hoà cùng sữa mềm mượt. Vị trà sâu mà vẫn thanh.",
  "Thanh Nhài":
    "Cốt trà hoa nhài trong trẻo hoà cùng sữa béo nhẹ. Hương nhài thanh mát, uống đến ngụm cuối vẫn không ngấy.",
  "Thanh Trúc": "Trà ô long trúc thơm sâu, quyện cùng sữa mượt và chút sữa đặc. Vị trà đậm, hậu ngọt dịu.",
  // Trà sữa kem bông
  "Bông Lan": "Trà sữa bạch lan hoa phủ lớp kem bông nhẹ như mây, rắc vụn hoa. Hương hoa thanh, kem béo dịu.",
  "Bông Trúc": "Trà sữa ô long trúc dưới lớp kem bông mềm mịn, điểm vụn hoa. Vị trà đậm hương gặp kem béo nhẹ.",
  "Bông Đào": "Trà sữa ô long bạch đào thơm hương đào, phủ kem bông bồng bềnh và vụn hoa. Ngọt dịu, béo thanh.",
  // Trà trái cây
  "Hồng Bì Cóc Xanh":
    "Trà hoa nhài thanh mát gặp quất hồng bì chua ngọt và nước cóc xanh. Vị chua dịu, thơm hương nhài.",
  "Thanh Nho Tươi":
    "Trà hoa nhài thanh mát cùng mứt nho xanh ngọt dịu, điểm nho tươi trên miệng ly. Hương nhài nhẹ, vị nho trong trẻo.",
  "Thanh Nho Tằm": "Trà hoa nhài hoà cùng mứt nho tím và dâu tằm. Vị chua ngọt hài hoà, thoảng hương nhài.",
  "Thanh Xoài Tươi":
    "Trà bạch lan hoa thơm thanh cùng mứt xoài và những miếng xoài tươi. Vị xoài ngọt đậm, hương hoa nhẹ.",
  "Xoài Hạ Tuyết":
    "Xoài tươi xay mịn cùng đá, sữa dừa béo nhẹ và chút trà bạch lan hoa. Mát lạnh như tuyết đầu hạ, ngọt thơm vị xoài chín.",
  // Kem cheese
  "Dâu Cheese":
    "Trà ô long bạch đào cùng mứt dâu tằm chua ngọt, phủ lớp kem cheese béo mịn. Chua, ngọt và béo đan xen, hậu vị thơm hương trà.",
  "Lài Cheese": "Trà hoa nhài thanh mát dưới lớp kem cheese béo mịn. Vị trà trong trẻo, kem béo đậm.",
  "Nho Cheese": "Trà ô long trúc cùng nho tím dầm và nho xanh, phủ kem cheese béo mịn. Sắc tím đậm, vị nho chua ngọt.",
  // Cà phê phin · Coldbrew
  "Bạc Xỉu": "Cà phê phin hoà cùng sữa và sữa đặc, nhiều sữa ít cà phê. Ngọt béo, thơm nhẹ mùi cà phê.",
  "Cà Phê Muối":
    "Cà phê phin đậm vị cùng sữa đặc, phủ lớp kem muối béo, mằn mặn. Đắng, ngọt và mặn quyện vào nhau trong từng ngụm.",
  "Cà Phê Đen Đá": "Cà phê phin pha đậm, thêm chút đường, uống cùng đá. Đắng thơm, hậu vị sâu và tròn.",
  "Coldbrew Nguyên Bản": "Cà phê ủ lạnh nhiều giờ, vị êm, ít đắng. Uống cùng đá, giữ trọn nét mộc của cà phê.",
  "Coldbrew Chanh Vàng": "Coldbrew ủ lạnh gặp siro chanh vàng thơm mát. Vị cà phê êm, chua nhẹ, dễ uống.",
  "Coldbrew Khế": "Coldbrew ủ lạnh cùng khế xay và chanh vàng tươi. Chua thanh, thơm vị khế.",
  "Coldbrew Bưởi": "Coldbrew ủ lạnh hoà cùng bưởi hồng thơm mát. Vị cà phê êm, đắng nhẹ, thoảng hương bưởi.",
  // Topping
  "Kem Bông": "Lớp kem bông mềm nhẹ như mây, thêm vào ly trà sữa cho vị béo thanh.",
  "Kem Cheese": "Lớp kem cheese béo mịn, đậm vị, thêm vào ly trà cho một tầng béo ngậy.",
  "Thạch Trà Làng Mây": "Thạch trà mềm và mát, thêm vào ly cho từng ngụm có vị trà.",
  "Hạt Nổ Củ Năng": "Hạt nổ củ năng tròn mọng, thêm vào ly trà cho từng ngụm vui miệng.",
  "Hạt Nổ Phô Mai": "Hạt nổ vị phô mai, vỡ nhẹ khi cắn, thêm một chút béo cho ly trà.",
  "Phô Mai Viên Tươi": "Phô mai lăn bột năng, mềm dẻo, béo mặn nhẹ, hợp với ly trà sữa.",
  // Combo
  "Combo Bộ Ba Làng Mây":
    "Ba ly cho nhóm bạn: Bạch Lan Hoa, Bông Đào và Thanh Nho Tươi. Đủ cả hương hoa, kem bông và trái cây trong một lần đặt.",
  "Combo Cặp Đôi Đối Lập":
    "Cà Phê Muối đậm vị đi cùng Bông Đào ngọt dịu phủ kem bông. Một đắng, một ngọt, cho hai người hai khẩu vị.",
  "Combo Song Hoa Tinh Túy":
    "Đôi trà sữa hương hoa: Bạch Lan Hoa thơm thanh và Bông Đào phủ kem bông. Hai tầng hương hoa cho người thích vị trà.",
  "Combo Thanh Mát Làng Mây":
    "Bạch Lan Hoa thơm thanh cùng Thanh Nho Tươi mát lành. Một ly trà sữa, một ly trà trái cây, vừa vặn cho hai người.",
  "Combo Trái Cây & Kem Cheese":
    "Thanh Nho Tươi mát lành cùng Lài Cheese phủ kem cheese béo mịn. Trong trẻo và béo ngậy, đủ cho hai người.",
  "Combo Tỉnh Táo & Thanh Lọc":
    "Coldbrew Chanh Vàng tươi mát cùng Bạch Lan Hoa thơm thanh. Một ly cà phê, một ly trà sữa cho cả buổi dài.",
};

/** A dish's description, or `fallback` (its plain line from Odoo) when it has none yet. */
export function dishDescription(name: string, fallback?: string): string | undefined {
  return DESCRIPTIONS[name] ?? fallback;
}
