/** Figma 2647:3713 — Home hero + Contact drawer (same master image, tighter crop). */
export const HOME_PORTRAIT_WIDTH = 161;
export const HOME_PORTRAIT_HEIGHT = 145;

export const HOME_PORTRAIT_IMAGE_CLASS =
  "aspect-161/145 w-[161px] shrink-0 bg-[#f0f0f0] object-cover object-top";

/** Figma 2647:3716 listing column — 271px wide (was 318; scaled down Aug 12). */
export const LISTING_PORTRAIT_WIDTH = 271;
/** Master export 956×1076 — height follows width. */
export const LISTING_PORTRAIT_HEIGHT = Math.round(
  (LISTING_PORTRAIT_WIDTH * 1076) / 956,
);

export const LISTING_PORTRAIT_IMAGE_CLASS =
  "mx-auto aspect-[956/1076] w-full max-w-[271px] bg-[#f0f0f0] object-cover object-top lg:mx-0";

/** Work `.txt` column — portrait + Stack share this width. */
export const LISTING_PORTRAIT_COLUMN_CLASS = "sm:w-[271px]";

/** Fallback when Work Page → toolStackPerRow is unset in Sanity. */
export const STACK_ICONS_PER_ROW = 6;
