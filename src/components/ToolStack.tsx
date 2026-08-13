"use client";

import Image from "next/image";

import { STACK_ICONS_PER_ROW } from "@/lib/portraitLayout";
import { toolStackLogos } from "@/lib/content";

/** Display height for stack icons (listing scale). */
const ICON_H = 16;

export type StackLogo = {
  src: string;
  label: string;
  width: number;
  height: number;
};

function iconWidth(logo: StackLogo) {
  const h = logo.height > 0 ? logo.height : ICON_H;
  const w = logo.width > 0 ? logo.width : h;
  return Math.max(8, Math.round((w / h) * ICON_H));
}

function LogoIcon({ logo }: { logo: StackLogo }) {
  const w = iconWidth(logo);
  const src =
    logo.src.includes("cdn.sanity.io") && !logo.src.includes("?")
      ? `${logo.src}?h=64&auto=format&fit=max&q=90`
      : logo.src;

  return (
    <span className="group pointer-events-auto relative flex h-4 w-full items-center justify-center">
      <Image
        src={src}
        alt=""
        aria-hidden
        width={w}
        height={ICON_H}
        className="max-h-full max-w-full object-contain"
        unoptimized={!src.includes("cdn.sanity.io")}
      />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-[60] -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-[8px] bg-white px-[10px] py-[5px] font-grotesk text-[13px] font-medium leading-none text-black opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.16)] transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {logo.label}
      </span>
    </span>
  );
}

export default function ToolStack({
  logos,
  className = "",
  perRow = STACK_ICONS_PER_ROW,
}: {
  /** Sanity stack; falls back to bundled logos when empty. */
  logos?: StackLogo[];
  className?: string;
  /** Icons per row — extra icons wrap to the next row(s). */
  perRow?: number;
}) {
  const items: StackLogo[] =
    logos && logos.length > 0
      ? logos
      : toolStackLogos.map((l) => ({
          src: l.src,
          label: l.name,
          width: l.w,
          height: l.h,
        }));

  const cols = Math.max(1, Math.min(12, perRow));

  return (
    <span
      className={`grid w-full gap-x-[6px] gap-y-[8px] overflow-visible ${className}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {items.map((logo) => (
        <LogoIcon key={`${logo.src}-${logo.label}`} logo={logo} />
      ))}
    </span>
  );
}
