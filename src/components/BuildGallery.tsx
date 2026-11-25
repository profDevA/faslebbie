"use client";

import type { BuildProject } from "@/lib/build";

export default function BuildGallery({
  items,
  onOpen,
}: {
  items: BuildProject[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-[min(6.85vw,99px)]">
      {/* Desktop: 3 + 3 at every width, per Israel's Build/Playground_img frame
          (Final Cleanup 1394:17869). Fas's Nov 24 evening call corrected the
          Nov 23 doc note ("make it an even 6" had been built as six in one
          row): "follow this", spaced, not congested. Figma @1440: 99 side
          margins, 127 between columns, 67 between rows, 329.6 × 420 images,
          scaled with the window (vw) and held at the 1440 values above that
          (the shell stops at 1440). Phones / tablet unchanged. */}
      <div className="grid grid-cols-2 items-start gap-x-2.5 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-[min(8.81vw,127px)] lg:gap-y-[min(4.65vw,67px)]">
        {items.map((item) => {
          const cover = item.images?.[0];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              data-cursor="hover"
              className="group reckless-prose flex h-full w-full flex-col text-left"
            >
              <div className="w-full shrink-0">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={item.title}
                  className="aspect-3/4 w-full bg-[#f0f0f0] object-cover object-top transition-opacity group-hover:opacity-90 lg:aspect-[329.6/420]"
                />
              ) : (
                <div
                  style={{ backgroundColor: item.tint }}
                  className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden transition-opacity group-hover:opacity-90 lg:aspect-[329.6/420]"
                >
                  <span
                    className={`px-3 text-center text-[clamp(16px,4vw,34px)] font-semibold tracking-tight ${
                      item.lightArt ? "text-black/20" : "text-white/90"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              )}
              </div>
              <span className="mt-2.5 block text-[14px] font-normal capitalize leading-[1.35] text-black underline underline-offset-2 transition-colors group-hover:text-accent sm:text-[16px] lg:text-[18px]">
                {item.title}
              </span>
              {item.blurb ? (
                <span className="mt-3.5 block text-[12px] font-normal leading-[1.35] text-black sm:text-[13px] lg:mt-3.75 lg:text-[18px]">
                  {item.blurb}
                </span>
              ) : null}
              <span className="mt-1.5 block text-[11px] font-normal italic leading-[1.35] text-black sm:text-[12px] lg:mt-3.75 lg:text-[14px]">
                {item.tech.join(" · ")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
