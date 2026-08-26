import type { CSSProperties, ReactNode } from "react";

import { LISTING_INSET_X, SITE_MAX_W } from "@/lib/navLayout";

type WordmarkFrameProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
};

/**
 * Keeps desktop wordmarks inside the 1440px listing shell — on ultra-wide
 * monitors the artboard stops growing so "Build/Play" + "Ground" (etc.) stay
 * aligned with content instead of stretching across the viewport.
 */
export default function WordmarkFrame({
  children,
  className = "",
  innerClassName = "",
  style,
}: WordmarkFrameProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 flex select-none items-start overflow-hidden px-5 will-change-[color,opacity] sm:px-6 lg:fixed lg:px-0 ${className}`}
      style={style}
    >
      <div
        className={`w-full lg:mx-auto lg:w-full ${SITE_MAX_W} ${LISTING_INSET_X} ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
