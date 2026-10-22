import Image from "next/image";
import hills from "@/assets/lang-may/doi-che.svg";

/** Rolling tea hills (Làng Mây): where the tea grows, "trên núi cao, nơi mây phủ quanh năm". Decoration only. */
export function TeaHills({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden ${className}`}>
      <Image src={hills} alt="" className="h-auto w-full min-w-[48rem]" />
    </div>
  );
}
