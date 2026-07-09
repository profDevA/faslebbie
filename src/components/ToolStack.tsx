"use client";

import { toolStackLogos } from "@/lib/content";

/**
 * The design-tool stack row (Figma 1111:30779) rendered as `currentColor`-tinted
 * CSS masks, each with a hover tooltip carrying the tool name. Used both in the
 * desktop "Design Work" watermark and the mobile heading. The per-icon wrapper is
 * `pointer-events-auto` so tooltips still work inside the watermark's otherwise
 * `pointer-events-none` parallax layer (when it sits in front, at the top).
 */
export default function ToolStack({
  scale = 1,
  className = "",
}: {
  scale?: number;
  className?: string;
}) {
  return (
    <span className={`flex flex-wrap items-center gap-y-3 ${className}`}>
      {toolStackLogos.map((logo) => (
        <span
          key={logo.src}
          className="group pointer-events-auto relative inline-flex items-center justify-center"
        >
          <span
            aria-label={logo.name}
            role="img"
            className="inline-block shrink-0 bg-current"
            style={{
              width: `${logo.w * scale}px`,
              height: `${logo.h * scale}px`,
              WebkitMaskImage: `url(${logo.src})`,
              maskImage: `url(${logo.src})`,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-50 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[8px] bg-white px-[10px] py-[5px] font-grotesk text-[13px] font-medium leading-none text-black opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100"
          >
            {logo.name}
          </span>
        </span>
      ))}
    </span>
  );
}
