"use client";

import type { BuildProject } from "@/lib/build";

// ".img" grid of build cards (Figma 16:2783 / 16:3446). Desktop: 4 equal
// columns, fixed ~420px portrait covers; title underlined + tech + blurb.
export default function BuildGallery({
  items,
  onOpen,
}: {
  items: BuildProject[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1350px] px-3 sm:px-6 lg:px-12">
      {/* Figma 16:3446 mobile = 2 cols; 16:2783 desktop = 4 cols. */}
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-20">
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
                  className="aspect-3/4 w-full object-cover bg-[#f0f0f0] transition-opacity group-hover:opacity-90 lg:aspect-auto lg:h-[420px]"
                />
              ) : (
                <div
                  style={{ backgroundColor: item.tint }}
                  className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden transition-opacity group-hover:opacity-90 lg:aspect-auto lg:h-[420px]"
                >
                  <span
                    className={`px-3 text-center font-logo text-[clamp(16px,4vw,34px)] font-semibold tracking-tight ${
                      item.lightArt ? "text-black/20" : "text-white/90"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              )}
              {/* Figma 16:2783 — 10px under cover, 15px between title / tech+blurb.
                  Spans (not <p>) — <button> cannot contain paragraphs. */}
              <span className="mt-2.5 block font-grotesk text-[14px] font-medium capitalize leading-[1.35] tracking-[0.9px] text-black underline underline-offset-2 transition-colors group-hover:text-accent sm:text-[16px] sm:tracking-[1.65px] lg:text-[18px]">
                {item.title}
              </span>
              <span className="mt-3.5 block font-grotesk text-[12px] font-light leading-[1.35] tracking-[0.9px] text-black sm:text-[13px] sm:tracking-[1.65px] lg:text-[18px]">
                <span className="block">{item.tech.join(" · ")}</span>
                {item.blurb ? <span className="block">{item.blurb}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
