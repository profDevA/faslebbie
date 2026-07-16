"use client";

import type { LeadershipGalleryItem } from "@/lib/content";

// ".img" masonry of leadership-moment cards (Figma 1-45118). White placeholder
// tiles in a 4-column masonry; one card is the light-blue highlight. Each card
// opens the unified moment popup.
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
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            data-cursor="hover"
            className="group block w-full text-left"
          >
            <div
              className={`w-full ${SPAN_H[item.span]} ${
                item.highlight ? "bg-[#eef1fb]" : "bg-white"
              } transition-opacity group-hover:opacity-90`}
            />
            <p className="mt-2 w-fit border-b border-black pb-1 font-grotesk text-[16px] font-medium leading-tight text-black transition-colors group-hover:text-accent">
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
