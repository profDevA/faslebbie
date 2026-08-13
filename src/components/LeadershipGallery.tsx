"use client";

import type { LeadershipGalleryItem } from "@/lib/content";

// ".img" masonry of leadership-moment cards (Figma 1-45118). Natural image
// aspect (match Work); placeholder tiles keep a modest fixed height.
const PLACEHOLDER_H: Record<LeadershipGalleryItem["span"], string> = {
  sm: "h-[180px]",
  md: "h-[240px]",
  lg: "h-[300px]",
};

export default function LeadershipGallery({
  items,
  onOpen,
}: {
  items: LeadershipGalleryItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
      <p className="mb-8 w-fit font-grotesk text-[20px] font-medium capitalize text-black underline underline-offset-4 lg:text-[24px]">
        My leadership moments
      </p>
      <div className="columns-2 gap-4 [column-fill:balance] lg:columns-4 lg:gap-5 *:mb-4 *:break-inside-avoid lg:*:mb-5">
        {items.map((item) => {
          const src = item.popup.image;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              data-cursor="hover"
              className="group block w-full text-left"
            >
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
                <img
                  src={src}
                  alt={item.label || item.popup.name}
                  className="h-auto w-full bg-black/5 transition-opacity group-hover:opacity-90"
                />
              ) : (
                <div
                  className={`relative w-full overflow-hidden ${PLACEHOLDER_H[item.span]} ${
                    item.highlight ? "bg-[#eef1fb]" : "bg-white"
                  } transition-opacity group-hover:opacity-90`}
                />
              )}
              <p className="mt-2 w-fit border-b border-black pb-1 font-grotesk text-[16px] font-medium leading-tight text-black transition-colors group-hover:text-accent">
                {item.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
