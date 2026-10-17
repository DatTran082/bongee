import Image from "next/image";
import logo from "@/assets/brand/logo-ngang.svg";

/** Boongee horizontal logo (flower + wordmark, Đen Than), from the brand kit (`npm run sync-brand`). */
export function Logo({ className = "h-9 w-auto md:h-10" }: { className?: string }) {
  return <Image src={logo} alt="Boongee" loading="eager" className={className} />;
}
