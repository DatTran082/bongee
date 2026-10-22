/**
 * A four-pointed sparkle, as the 3D stage scatters round its cups (Làng Mây), twinkling on its own beat. Decoration
 * only. Its colour is the text colour's: give it a token class (text-brand-honey-400, text-brand-cloud…).
 */
export function Sparkle({
  className = "size-4 text-brand-honey-400",
  delay = "0s",
}: {
  className?: string;
  /** its twinkle's offset, so neighbours do not blink together */
  delay?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`sparkle-twinkle inline-block ${className}`}
      style={{ "--twinkle-delay": delay } as React.CSSProperties}
    >
      <path d="M12 0Q13.4 10.6 24 12Q13.4 13.4 12 24Q10.6 13.4 0 12Q10.6 10.6 12 0Z" fill="currentColor" />
    </svg>
  );
}
