"use client";

import type { LeadershipGalleryItem } from "@/lib/content";

// ".img" masonry of leadership-moment cards (Figma 1-45118). Shows the Sanity
// image when present; otherwise the white / light-blue placeholder tile. Each
// card opens the unified moment popup.
const SPAN_H: Record<LeadershipGalleryItem["span"], string> = {
  sm: "h-[240px]",
  md: "h-[340px]",
  lg: "h-[440px]",
};

export default function LeadershipGallery({
  items,
  onOpen,
}: {
  items: LeadershipGalleryItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1350px] px-6 lg:px-12">
      <p className="mb-8 w-fit font-grotesk text-[20px] font-medium capitalize text-black underline underline-offset-4 lg:text-[24px]">
        My leadership moments
      </p>
      <div className="columns-2 gap-5 [column-fill:balance] lg:columns-4 *:mb-5 *:break-inside-avoid">
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
              <div
                className={`relative w-full overflow-hidden ${SPAN_H[item.span]} ${
                  src
                    ? "bg-black/5"
                    : item.highlight
                      ? "bg-[#eef1fb]"
                      : "bg-white"
                } transition-opacity group-hover:opacity-90`}
              >
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
                  <img
                    src={src}
                    alt={item.label || item.popup.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
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
