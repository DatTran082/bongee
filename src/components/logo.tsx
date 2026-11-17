import Image from "next/image";
import logo from "@/assets/brand/logo-ngang-den.svg";

/**
 * Boongee horizontal logo in Đen Than, without the slogan: the print kit's own
 * (brandkit/print/identity/01-logo/logo-ngang-khong-slogan_den.svg, copied to src/assets/brand/).
 */
export function Logo({ className = "h-7 w-auto md:h-8" }: { className?: string }) {
  return <Image src={logo} alt="Boongee" loading="eager" className={className} />;
}
