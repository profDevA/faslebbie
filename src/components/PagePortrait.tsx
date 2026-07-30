"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * The portrait in the left column of every listing page — About, Work,
 * Research, Build, Leadership, Teaching.
 *
 * Fas 07/28 ("a big one"): this had drifted into two source images
 * (portrait.png vs portrait-about.png) at two different sizes, so the photo
 * visibly changed as you clicked between pages — "not a small one that
 * changes… just make it constant, one image across all of this." He named the
 * About/Research photo as the one to keep, so that's the canonical source here.
 *
 * Pair with PORTRAIT_STICKY_TOP on the column wrapper so it also comes to rest
 * at the same height on every page.
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
  return (
    <Image
      src="/portrait-about.png"
      alt="Portrait of Fas Lebbie"
      width={620}
      height={684}
      priority
      style={style}
      className={`h-74.75 w-full bg-[#f0f0f0] object-cover object-top lg:h-74.75 lg:w-67.75 ${className}`}
    />
  );
}
