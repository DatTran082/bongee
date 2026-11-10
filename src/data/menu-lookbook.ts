import lookbookData from "./menu-lookbook.json";

export interface LookbookItem {
  id: string;
  name: string;
  category: "huong-hoa" | "kem-bong" | "trai-cay" | "kem-cheese" | "ca-phe" | "combo" | "topping";
  groupTitle: string;
  prices: number[];
  note: string;
  cupType: string;
  badge: string | null;
  bgColor: string;
  bgName: string;
  decor: string;
  file: string;
  imageThumb: string;
  imageFull: string;
}

export interface LookbookCategory {
  id: string;
  title: string;
  shortTitle: string;
  count: number;
}

export const lookbookItems: LookbookItem[] = lookbookData as LookbookItem[];

export const lookbookCategories: LookbookCategory[] = [
  { id: "all", title: "Tất cả món", shortTitle: "Tất cả", count: lookbookItems.length },
  {
    id: "huong-hoa",
    title: "Trà sữa hương hoa",
    shortTitle: "Hương hoa",
    count: lookbookItems.filter((i) => i.category === "huong-hoa").length,
  },
  {
    id: "kem-bong",
    title: "Trà sữa kem bông",
    shortTitle: "Kem bông",
    count: lookbookItems.filter((i) => i.category === "kem-bong").length,
  },
  {
    id: "trai-cay",
    title: "Trà trái cây",
    shortTitle: "Trái cây",
    count: lookbookItems.filter((i) => i.category === "trai-cay").length,
  },
  {
    id: "kem-cheese",
    title: "Kem cheese",
    shortTitle: "Kem cheese",
    count: lookbookItems.filter((i) => i.category === "kem-cheese").length,
  },
  {
    id: "ca-phe",
    title: "Cà phê · Coldbrew",
    shortTitle: "Cà phê & Coldbrew",
    count: lookbookItems.filter((i) => i.category === "ca-phe").length,
  },
  {
    id: "combo",
    title: "Combo ưu đãi",
    shortTitle: "Combo",
    count: lookbookItems.filter((i) => i.category === "combo").length,
  },
  {
    id: "topping",
    title: "Topping thêm",
    shortTitle: "Topping",
    count: lookbookItems.filter((i) => i.category === "topping").length,
  },
];
