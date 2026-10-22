import Image from "next/image";
import bank from "@/assets/lang-may/bien-may.svg";

/**
 * A bank of clouds across the foot of a section (Làng Mây): it runs down into the page's cream, so the section ends
 * in the clouds and the next begins below them. It lies in front of the 3D stage, so whatever floats low (the hero's
 * set) sinks a little into it. It holds still (no parallax).
 */
export function CloudBank({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`}>
      <Image src={bank} alt="" className="h-auto w-full min-w-[56rem]" />
    </div>
  );
}
