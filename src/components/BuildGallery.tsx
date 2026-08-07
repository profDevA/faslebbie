"use client";

import type { BuildProject } from "@/lib/build";

// ".img" masonry of build cards (Figma 16-2783 / 16-3446). Real project image
// at natural aspect (same as Work wall); tinted title placeholder when missing.
const PLACEHOLDER_H: Record<BuildProject["span"], string> = {
  sm: "h-[180px]",
  md: "h-[220px]",
  lg: "h-[280px]",
};

export default function BuildGallery({
  items,
  onOpen,
}: {
  items: BuildProject[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1350px] px-6 lg:px-12">
      <div className="columns-2 gap-4 [column-fill:balance] lg:columns-4 lg:gap-6 *:mb-6 *:break-inside-avoid lg:*:mb-9">
        {items.map((item) => {
          const cover = item.images?.[0];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              data-cursor="hover"
              className="group block w-full text-left"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN cover
                <img
                  src={cover}
                  alt={item.title}
                  className="h-auto w-full bg-[#f0f0f0] transition-opacity group-hover:opacity-90"
                />
              ) : (
                <div
                  style={{ backgroundColor: item.tint }}
                  className={`relative flex w-full items-center justify-center overflow-hidden ${PLACEHOLDER_H[item.span]} transition-opacity group-hover:opacity-90`}
                >
                  <span
                    className={`px-4 text-center font-logo text-[clamp(22px,2.4vw,34px)] font-semibold tracking-tight ${
                      item.lightArt ? "text-black/20" : "text-white/90"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              )}
              <p className="mt-3 w-fit border-b border-black pb-1 font-grotesk text-[16px] font-medium leading-tight text-black transition-colors group-hover:text-accent">
                {item.title}
              </p>
              <p className="mt-2 font-grotesk text-[13px] font-medium tracking-wide text-black/70">
                {item.tech.join(" · ")}
              </p>
              <p className="mt-1 font-grotesk text-[13px] leading-[1.55] text-black/55">
                {item.blurb}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
