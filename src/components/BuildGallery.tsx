"use client";

import type { BuildProject } from "@/lib/build";

// ".img" masonry of build cards (Figma 16-2783 / 16-3446). Placeholder tinted
// art (real project imagery pending), the title, a "Claude · GPT · Figma" tech
// line, and a short description. Each card opens the paged project modal.
const SPAN_H: Record<BuildProject["span"], string> = {
  sm: "h-[240px]",
  md: "h-[300px]",
  lg: "h-[380px]",
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
      <div className="columns-2 gap-6 [column-fill:balance] lg:columns-4 *:mb-9 *:break-inside-avoid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpen(item.id)}
            data-cursor="hover"
            className="group block w-full text-left"
          >
            <div
              style={{ backgroundColor: item.tint }}
              className={`flex w-full items-center justify-center overflow-hidden ${SPAN_H[item.span]} transition-opacity group-hover:opacity-90`}
            >
              <span
                className={`px-4 text-center font-logo text-[clamp(22px,2.4vw,34px)] font-semibold tracking-tight ${
                  item.lightArt ? "text-black/20" : "text-white/90"
                }`}
              >
                {item.title}
              </span>
            </div>
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
        ))}
      </div>
    </div>
  );
}
