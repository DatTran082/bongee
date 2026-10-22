import Image from "next/image";
import flower from "@/assets/lang-may/hoa.svg";

/** The logo flower, low-poly (Làng Mây), as a small mark: beside a tagline, as a bullet. Decoration only. */
export function FlowerMark({ className = "size-5" }: { className?: string }) {
  return <Image src={flower} alt="" aria-hidden className={`inline-block shrink-0 ${className}`} />;
}
