/** Template defaults (Figma Coral) — used when Sanity appearance fields are empty. */

export const REFLECTION_DEFAULTS = {
  backgroundColor: "#171717",
  paddingTop: 63,
  paddingBottom: 63,
  contentGap: 66,
  contentGapInner: 20,
} as const;

export const OVERVIEW_SIDE_TEAL = "#52747e";

export const OVERVIEW_COPY_COLUMN_PAD = {
  paddingTop: 56,
  paddingBottom: 80,
  paddingLeft: 0,
  paddingRight: 0,
} as const;

/** Full-page route (`/casestudies/[slug]`) — Figma Acme overview gutters. */
export const OVERVIEW_COPY_COLUMN_PAD_PAGE = {
  paddingTop: 56,
  paddingBottom: 80,
  paddingLeft: 48,
  paddingRight: 64,
} as const;

export const OVERVIEW_MEDIA_COLUMN_PAD = {
  paddingTop: 56,
  paddingBottom: 80,
  paddingLeft: 0,
  paddingRight: 0,
} as const;

export const OVERVIEW_MEDIA_COLUMN_PAD_PAGE = {
  paddingTop: 56,
  paddingBottom: 80,
  paddingLeft: 40,
  paddingRight: 40,
} as const;

/** Overlay mobile media inset (~10% of 360px band). */
export const OVERVIEW_MEDIA_MOBILE_INSET = 36;

export const OVERVIEW_COLUMN_GAP = 40;

/** Accordion split panel (Design Process column). */
export const ACCORDION_PANEL_BACKGROUND = "#ffffff";

/** Case studies authored for the full-page template first (also render in Work overlay). */
export const PAGE_TEMPLATE_SLUGS = ["acme-lending"] as const;

/** §10 Highlight reel — grid cell matte (Figma Coral 3×2). */
export const HIGHLIGHT_REEL_GRID_DEFAULTS = {
  cellMatteColor: "#d4e9d7",
  cellInsetVerticalPercent: 14,
  cellInsetHorizontalPercent: 10.5,
  gridGap: 14,
} as const;

/** §10 Highlight reel — single rotating card (Experian / Memory Tubes). */
export const HIGHLIGHT_REEL_SINGLE_DEFAULTS = {
  cardMatteColor: "#ffffff",
  cardPadding: 4,
} as const;

/** §04 Core Experience — per-screen card fallback when band preview appearance is empty. */
export const CORE_EXPERIENCE_SCREEN_APPEARANCE = {
  tileBackgroundColor: "#ffffff",
} as const;

/** §09 Impact — metric grid gaps (Figma 2110:40267). */
export const STATS_BAND_DEFAULTS = {
  metricGridGap: 48,
  metricGridGapDesktop: 56,
  titleMarginBottom: 48,
  titleMarginBottomDesktop: 64,
  bodyMarginBottom: 48,
} as const;

/** §06 Research Artifacts expandable slider. */
export const SHOWCASE_ARTIFACT_DEFAULTS = {
  sliderGap: 20,
} as const;

/** §07 Motion showcase band. */
export const MOTION_SHOWCASE_BAND_DEFAULTS = {
  titleMarginBottom: 40,
  titleMarginBottomDesktop: 56,
  introMarginBottom: 40,
} as const;

/** §07 Motion row — device strip + caption. */
export const MOTION_ROW_DEFAULTS = {
  /** Work popup desktop row — Figma Census 2229:30437 (~728px in 1099 modal). */
  rowWidthPercentOverlayDesktop: 66,
  /** Work popup featured mobile — Figma Census 2229:30257 (~245px in 1099 modal). */
  rowWidthPercentOverlayFeaturedMobile: 22,
  rowWidthPercent: 54,
  itemGapPercent: 3,
  captionMarginTop: 28,
  tileBackgroundColor: "#ffffff",
} as const;

/** §07 Featured motion band — cream mobile (Figma Census 2229:30253). */
export const MOTION_FEATURED_BAND_DEFAULTS = {
  backgroundColor: "#e3e3db",
} as const;

/** /work page shell — optional band tint (empty = page default). */
export const WORK_PAGE_APPEARANCE_DEFAULTS = {
  paddingTop: 0,
  paddingBottom: 0,
} as const;

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
