/** Template defaults (Figma Coral) — used when Sanity appearance fields are empty. */

export const REFLECTION_DEFAULTS = {
  backgroundColor: "#171717",
  paddingTop: 63,
  paddingBottom: 63,
  contentGap: 66,
  contentGapInner: 20,
} as const;

export const OVERVIEW_SIDE_TEAL = "#52747e";

/** Overview copy-column fill (Coral). Empty Studio color inherits `.cs-page` white. */
export const OVERVIEW_BAND_BACKGROUND = "#e3e3db";

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
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
} as const;

export const OVERVIEW_MEDIA_COLUMN_PAD_PAGE = {
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
} as const;

/** Overlay mobile media inset when left/right Studio fields are empty. */
export const OVERVIEW_MEDIA_MOBILE_INSET = 0;

export const OVERVIEW_COLUMN_GAP = 40;

/** Accordion split panel (Design Process column). */
export const ACCORDION_PANEL_BACKGROUND = "#ffffff";

/** Acme Lending full-page — Design Process accordion panel (Figma Holistic). */
export const ACME_ACCORDION_PANEL_BACKGROUND = "#4c79c8";

/** Case studies authored for the full-page template first (also render in Work overlay). */
export const PAGE_TEMPLATE_SLUGS = ["acme-lending"] as const;

/** §10 Highlight reel — grid cell matte (Figma Coral 3×2). */
export const HIGHLIGHT_REEL_GRID_DEFAULTS = {
  cellMatteColor: "#d4e9d7",
  cellInsetVerticalPercent: 14,
  cellInsetHorizontalPercent: 10.5,
  gridGap: 14,
} as const;

/** §10 Highlight reel — single rotating card (legacy; Memory Tubes). */
export const HIGHLIGHT_REEL_SINGLE_DEFAULTS = {
  cardMatteColor: "#ffffff",
  cardPadding: 4,
} as const;

/** §10 Highlight reel — one static board image (Experian Boost Figma 3778:130432). */
export const HIGHLIGHT_REEL_COMPOSITE_DEFAULTS = {
  maxWidth: 973,
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
  /** Live WP #user_impact .impact_count — 8.5vw desktop, 60px mobile. */
  valueFontSize: "clamp(60px, 8.5vw, 160px)",
  gridMaxWidth: 1280,
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

/** §07 Featured motion band — mobile stack (Figma FDX 3928:49325 / 3928:49660). */
export const MOTION_FEATURED_MOBILE_DEFAULTS = {
  contentMaxWidth: 344,
  mockupWidth: 148,
  stackGap: 79,
  sectionPaddingY: 66,
  mockupRadius: 12,
  captionTitleSize: 14,
  captionBodySize: 16,
} as const;

/** §07 Featured motion band — US Census mobile (Figma 3999:55762). */
export const MOTION_FEATURED_MOBILE_CENSUS_DEFAULTS = {
  contentMaxWidth: 344,
  mockupWidth: 135,
  stackGap: 57,
  sectionPaddingY: 66,
  mockupRadius: 15,
  captionTitleSize: 14,
  captionBodySize: 16,
} as const;

/** /work page shell — optional band tint (empty = page default). */
export const WORK_PAGE_APPEARANCE_DEFAULTS = {
  paddingTop: 0,
  paddingBottom: 0,
} as const;

/** Vertical stack gap on mobile bands — not page-template contentGap (96px desktop). */
export const BAND_STACK_GAP_MOBILE = 24;

/** §08 Desktop motion showcase — centred mockup + bottom-right copy. */
export const DESKTOP_MOTION_SHOWCASE_DEFAULTS = {
  /** Census Figma 2229:30432 */
  mockupMaxWidth: 762,
  /** Acme Figma 3795:152730 — art includes frame, shadow, and radius */
  mockupMaxWidthWide: 873,
} as const;

/** Core Experience band — desktop staggered rows (Figma 2271:58148 Acme / 3999:59093 Census). */
export const CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS = {
  columns: 2,
  columnGap: 43,
  /** Acme 2271:58148 row blocks — 87px. Census 3999:59093 uses 116px (Sanity contentGapInner). */
  rowGap: 87,
  rowStagger: 145,
  cardBackground: "#ffffff",
  cardBorderRadius: 25,
  /** Mobile stack for desktopGrid bands (Figma 3928:7320). */
  mobileStackGap: 40,
  mobileStackBorderRadius: 12,
  mobileTileMaxWidth: 323,
  imageAspectWidth: 762,
  imageAspectHeight: 467,
} as const;

/** desktopGrid band shell rhythm — Figma 3999:59093 / 2271:58148 (Acme shares layout; row gap via Sanity). */
export const CORE_EXPERIENCE_DESKTOP_GRID_BAND_GAPS = {
  paddingTop: 120,
  paddingBottom: 120,
  titleToPreview: 64,
  previewToViewMore: 96,
  /** Tile bottom → caption (Figma ~38px). */
  captionGap: 38,
} as const;

/** Core Experience band — mobile phone row (Coral). */
export const CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS = {
  columnGap: 32,
  cardBackground: "#ffffff",
  imageAspectWidth: 210,
  imageAspectHeight: 483,
} as const;

/** Core Experience band — mobile 2-col rows (Figma 3928:15359 Experian / 3928:29088 Coral). */
export const CORE_EXPERIENCE_BAND_MOBILE_GRID_DEFAULTS = {
  columns: 2,
  /** Figma mobile band content width. */
  maxWidth: 330,
  columnGap: 37,
  /** Figma 3928:15359 — ~22px between row groups (not 50). */
  rowGap: 22,
  captionGap: 27,
  /** Figma column ~139.12px. */
  tileMaxWidth: 139,
  tileBorderRadius: 10,
} as const;

/** Core Experience View More popup — full width by default; tune in popupAppearance.
 *  introMaxWidth is template render-only (caseStudyDefaults); not stored in Sanity. */
export const CORE_EXPERIENCE_POPUP_DEFAULTS = {
  contentAlignment: "left" as const,
  paddingTop: 40,
  paddingBottom: 48,
  paddingLeft: 20,
  paddingRight: 20,
  contentGap: 24,
  contentGapInner: 12,
  tileBackgroundColor: "#4f6b76",
  introMaxWidth: 960,
  gridColumnGap: 16,
  gridRowGap: 24,
  /** Mobile single-column stack (Figma 3928:22975) — not Sanity contentGapInner. */
  gridRowGapMobile: 40,
  /** Popup device tab bar — Figma 3928:22982. */
  tabGap: 46,
} as const;
