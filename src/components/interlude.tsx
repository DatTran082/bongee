import { getImageProps } from "next/image";
import { covers } from "@/data/lookbook";

/**
 * A pause between the menu and the offers (21/11/2026): the v5 cover of the paper cup beside Xoài Hạ Tuyết, as large
 * as the screen (on phones a 4:5 band, so the picture is never stretched past its pixels). A mood picture, like the
 * hero's: no words and no "Ảnh minh hoạ". With motion allowed its frame sticks and the page's scroll timeline
 * (src/components/scroll-motion.tsx) opens it from a narrow slit to the full frame, the picture inside held at its
 * own size (the window grows, not the picture) and settling from a slight zoom. Otherwise it simply stands there.
 */
export function Interlude() {
  const cover = covers.interlude;
  if (!cover) return null;
  const common = { alt: "", sizes: "100vw" } as const;
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, src: cover.wide.src, width: cover.wide.width, height: cover.wide.height });
  const {
    props: { srcSet: tall, ...rest },
  } = getImageProps({ ...common, src: cover.tall.src, width: cover.tall.width, height: cover.tall.height });
  return (
    <div data-interlude aria-hidden className="relative bg-white motion-safe:h-[150svh]">
      <div className="top-0 flex h-[min(100svh,125vw)] items-center overflow-hidden motion-safe:sticky lg:h-svh">
        <div data-interlude-window className="relative h-full w-full overflow-hidden bg-[#C6B7AC]">
          <picture>
            <source media="(min-width: 64rem)" srcSet={wide} />
            <img
              {...rest}
              srcSet={tall}
              alt=""
              data-interlude-image
              className="h-full w-full object-cover object-[50%_55%] lg:object-[60%_50%]"
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
