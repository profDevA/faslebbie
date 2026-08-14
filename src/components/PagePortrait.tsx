"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

import {
  LISTING_PORTRAIT_HEIGHT,
  LISTING_PORTRAIT_IMAGE_CLASS,
  LISTING_PORTRAIT_WIDTH,
} from "@/lib/portraitLayout";
import { useSite } from "@/components/SiteProvider";

/**
 * The portrait in the left column of every listing page — About, Work,
 * Research, Build, Leadership, Teaching.
 *
 * Source: Site Settings → Brand → Master portrait (fallback /portrait-master.png).
 * Figma 2647:3716 — ~271×305 (956∶1076 export; Home uses 161×145 crop).
 */

/**
 * Shared resting offset for the portrait column. 207px is where the pages that
 * carry a ".txt/.img" switch naturally land (nav + switch + padding); `sticky`
 * pushes the switch-less pages (About, Research) down to match, so the photo
 * sits at the same height whichever page you arrive on.
 *
 * Every portrait column uses this, including Work — it previously stuck at
 * 150px, which is ABOVE where it naturally sits, so the photo visibly slid
 * upward as you scrolled before locking (Fas 07/30: "the portrait moves as the
 * user scrolls, which is incorrect"). Matching the offset to the resting
 * position is what makes it look pinned from the first paint.
 */
export const PORTRAIT_STICKY_TOP = "lg:top-[207px]";

/**
 * Where the big page wordmark starts, shared by all six portrait pages (Fas
 * 07/30). It had been vertically centred in the viewport on most pages — and
 * pushed 20vh below centre on About — so its start point moved as you clicked
 * between pages, and moved again on a different screen height. A single fixed
 * offset from the top makes it land identically everywhere, since the wordmark
 * and the portrait are both viewport-fixed layers.
 *
 * 120 (= 480px) is Fas's value, set by eye against the portrait. Note the ink
 * starts a little above the padding edge: the span's inline box includes the
 * font's ascent, so the visible letters sit ~20px higher than this number.
 *
 * Pair with `items-start` / `justify-start` so the padding actually positions
 * the word instead of being absorbed by centring.
 */
export const WORDMARK_TOP = "lg:pt-120";

export default function PagePortrait({
  style,
  className = "",
}: {
  /** Per-page reveal transform/opacity (inert while INTRO_REVEAL is off). */
  style?: CSSProperties;
  /** Page-specific spacing only — never size or source. */
  className?: string;
}) {
  const { brand } = useSite();
  return (
    <Image
      src={brand.portraitSrc}
      alt="Portrait of Fas Lebbie"
      width={LISTING_PORTRAIT_WIDTH}
      height={LISTING_PORTRAIT_HEIGHT}
      quality={92}
      sizes="(max-width: 1024px) 220px, 271px"
      priority
      style={style}
      className={`${LISTING_PORTRAIT_IMAGE_CLASS} ${className}`}
    />
  );
}
