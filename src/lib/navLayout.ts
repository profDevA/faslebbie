/** Figma holistic nav bar height (2229:25243 / 1:128). Sticky site header. */
export const NAV_H_PX = 82;
export const NAV_H = "h-[82px]";
/** Offset below the sticky nav (mobile menu, home intro layers). */
export const NAV_TOP = "top-[82px]";
/** Listing-page brighten pin — sticks under the sticky nav. */
export const STICKY_UNDER_NAV = "lg:sticky lg:top-[82px]";
/** Holistic desktop artboard — Figma frames are 1440px wide. */
export const SITE_MAX_W = "max-w-[1440px]";
/** Slightly more right than left padding — nudges content left within the centred shell. */
export const LISTING_INSET_X = "px-6 lg:pl-12 lg:pr-20";
export const LISTING_SHELL = `mx-auto w-full ${SITE_MAX_W} ${LISTING_INSET_X}`;
export const LISTING_GRID =
  "grid grid-cols-1 gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16";
