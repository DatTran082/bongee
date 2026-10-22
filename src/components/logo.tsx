import Image from "next/image";
import logo from "@/assets/lang-may/logo-ngang.svg";

/** Boongee horizontal logo, Làng Mây edition (low-poly pink flower + ink wordmark), from brandkit (`npm run sync-brand`). */
export function Logo({ className = "h-9 w-auto md:h-10" }: { className?: string }) {
  return <Image src={logo} alt="Boongee" loading="eager" className={className} />;
}
