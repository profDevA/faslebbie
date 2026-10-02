/** Figma holistic nav — 82px desktop (2229:25243); compact bar on mobile (Fas Oct 2026). */
export const NAV_H_PX = 82;
/** Mobile sticky header height (matches Contact drawer chrome `h-14`). */
export const NAV_H_MOBILE_PX = 56;
export const NAV_H = "h-14 lg:h-[82px]";
/** Offset below the sticky nav (mobile menu, fixed layers). */
export const NAV_TOP = "top-14 lg:top-[82px]";
/** Listing-page brighten pin — sticks under the sticky nav. */
export const STICKY_UNDER_NAV = "lg:sticky lg:top-[82px]";
/** Holistic desktop artboard — Figma frames are 1440px wide. */
export const SITE_MAX_W = "max-w-[1440px]";
/** Slightly more right than left padding — nudges content left within the centred shell. */
export const LISTING_INSET_X = "px-6 lg:pl-12 lg:pr-20";
export const LISTING_SHELL = `mx-auto w-full ${SITE_MAX_W} ${LISTING_INSET_X}`;
export const LISTING_GRID =
  "grid grid-cols-1 gap-10 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-16";
