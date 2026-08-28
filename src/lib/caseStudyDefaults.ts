/** Template defaults (Figma Coral) — used when Sanity appearance fields are empty. */

export const REFLECTION_DEFAULTS = {
  backgroundColor: "#171717",
  paddingTop: 63,
  paddingBottom: 63,
  contentGap: 66,
  contentGapInner: 20,
} as const;

export const OVERVIEW_COPY_COLUMN_PAD = {
  paddingTop: 56,
  paddingBottom: 80,
} as const;

export const OVERVIEW_MEDIA_COLUMN_PAD = {
  paddingTop: 56,
  paddingBottom: 80,
} as const;

export const OVERVIEW_COLUMN_GAP = 40;

/** Core Experience band — desktop staggered rows (Figma 2271:58148). */
export const CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS = {
  columns: 2,
  columnGap: 43,
  rowGap: 87,
  rowStagger: 145,
  cardBackground: "#ffffff",
  imageAspectWidth: 762,
  imageAspectHeight: 467,
} as const;

/** Core Experience band — mobile phone row (Coral). */
export const CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS = {
  columnGap: 32,
  cardBackground: "#ffffff",
  imageAspectWidth: 210,
  imageAspectHeight: 483,
} as const;

/** Core Experience View More popup — full width by default; tune in popupAppearance. */
export const CORE_EXPERIENCE_POPUP_DEFAULTS = {
  contentAlignment: "left" as const,
  paddingTop: 40,
  paddingBottom: 48,
  paddingLeft: 20,
  paddingRight: 20,
  contentGap: 24,
  contentGapInner: 12,
  tileBackgroundColor: "#4f6b76",
  introMaxWidth: 520,
  gridColumnGap: 16,
  gridRowGap: 24,
} as const;
