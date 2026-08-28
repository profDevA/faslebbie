/**
 * Figma / template defaults as Sanity appearance objects — single source for
 * schema initialValue and backfill patches. Render fallbacks stay in
 * caseStudyDefaults.ts + appearanceSpacing.ts until fields are stored.
 */
import {
  CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS,
  CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS,
  CORE_EXPERIENCE_POPUP_DEFAULTS,
  REFLECTION_DEFAULTS,
} from "@/lib/caseStudyDefaults";
import { gapDefault, padDefaults } from "@/lib/appearanceSpacing";

export type SanityColorValue = {
  _type: "color";
  hex: string;
  alpha: number;
};

export function sanityColor(hex: string, alpha = 1): SanityColorValue {
  return { _type: "color", hex, alpha };
}

const mdOverlay = padDefaults("md", false);
const lgOverlay = padDefaults("lg", false);
const mdPage = padDefaults("md", true);

/** §11 Reflection — Figma 2110:41713 */
export const REFLECTION_APPEARANCE_DEFAULTS = {
  backgroundColor: sanityColor(REFLECTION_DEFAULTS.backgroundColor),
  textColor: sanityColor("#ffffff"),
  paddingTop: REFLECTION_DEFAULTS.paddingTop,
  paddingBottom: REFLECTION_DEFAULTS.paddingBottom,
  contentGap: REFLECTION_DEFAULTS.contentGap,
  contentGapInner: REFLECTION_DEFAULTS.contentGapInner,
  contentAlignment: "center" as const,
  maxWidth: "default" as const,
};

/** §07 Key Product Experiences — slate band */
export const MOTION_SHOWCASE_APPEARANCE_DEFAULTS = {
  backgroundColor: sanityColor("#52747e"),
  paddingTop: lgOverlay.paddingTop,
  paddingBottom: lgOverlay.paddingBottom,
  contentGap: gapDefault("lg", false),
  contentAlignment: "center" as const,
  maxWidth: "default" as const,
};

/** §05 Design Process split band — sage tint */
export const ACCORDION_APPEARANCE_DEFAULTS = {
  backgroundColor: sanityColor("#99B29D", 0.4),
  paddingTop: mdOverlay.paddingTop,
  paddingBottom: mdOverlay.paddingBottom,
  contentGap: gapDefault("md", false),
  contentAlignment: "left" as const,
  maxWidth: "default" as const,
};

/** §06 Research Artifacts — black band */
export const SHOWCASE_GALLERY_APPEARANCE_DEFAULTS = {
  backgroundColor: sanityColor("#000000"),
  textColor: sanityColor("#ffffff"),
  paddingTop: mdOverlay.paddingTop,
  paddingBottom: mdOverlay.paddingBottom,
  contentGap: gapDefault("lg", false),
  contentAlignment: "left" as const,
  maxWidth: "default" as const,
};

/** §03 Problem Context — centred prose (overlay baseline) */
export const PROBLEM_CONTEXT_APPEARANCE_DEFAULTS = {
  paddingTop: mdOverlay.paddingTop,
  paddingBottom: mdOverlay.paddingBottom,
  contentGap: gapDefault("md", false),
  contentAlignment: "center" as const,
  maxWidth: "default" as const,
};

/** §03 full-page route uses taller prose band */
export const PROBLEM_CONTEXT_PAGE_APPEARANCE_DEFAULTS = {
  ...PROBLEM_CONTEXT_APPEARANCE_DEFAULTS,
  paddingTop: mdPage.paddingTop,
  paddingBottom: mdPage.paddingBottom,
  contentGap: gapDefault("md", true),
};

function bandAppearance(padLevel: "md" | "lg") {
  const pad = padDefaults(padLevel, false);
  return {
    paddingTop: pad.paddingTop,
    paddingBottom: pad.paddingBottom,
    contentGap: gapDefault(padLevel, false),
    contentAlignment: "left" as const,
    maxWidth: "default" as const,
  };
}

/** §04 Core Experience band */
export const CORE_EXPERIENCE_BAND_APPEARANCE_DEFAULTS = bandAppearance("md");

/** §04 View More popup */
export const CORE_EXPERIENCE_POPUP_APPEARANCE_DEFAULTS = {
  contentAlignment: CORE_EXPERIENCE_POPUP_DEFAULTS.contentAlignment,
  paddingTop: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingTop,
  paddingBottom: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingBottom,
  paddingLeft: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingLeft,
  paddingRight: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingRight,
  contentGap: CORE_EXPERIENCE_POPUP_DEFAULTS.contentGap,
  contentGapInner: CORE_EXPERIENCE_POPUP_DEFAULTS.contentGapInner,
  introMaxWidth: CORE_EXPERIENCE_POPUP_DEFAULTS.introMaxWidth,
  tileBackgroundColor: sanityColor(
    CORE_EXPERIENCE_POPUP_DEFAULTS.tileBackgroundColor,
  ),
};

export function coreExperiencePreviewAppearanceDefaults(
  layoutVariant?: string,
) {
  const mobile = layoutVariant !== "desktopGrid";
  return {
    contentGap: mobile
      ? CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS.columnGap
      : CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.columnGap,
    contentGapInner: mobile
      ? undefined
      : CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.rowGap,
    tileBackgroundColor: sanityColor(
      mobile
        ? CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS.cardBackground
        : CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.cardBackground,
    ),
  };
}

/** §08 Desktop motion */
export const DESKTOP_MOTION_APPEARANCE_DEFAULTS = bandAppearance("md");

/** §09 Impact */
export const STATS_APPEARANCE_DEFAULTS = {
  ...bandAppearance("lg"),
  contentGapInner: 48,
};

/** §10 Highlight reel */
export const HIGHLIGHT_REEL_APPEARANCE_DEFAULTS = bandAppearance("lg");

/** Section _type → band appearance defaults (overlay / Coral popup baseline). */
export const SECTION_APPEARANCE_DEFAULTS: Record<
  string,
  Record<string, unknown>
> = {
  reflectionSection: REFLECTION_APPEARANCE_DEFAULTS,
  motionShowcase: MOTION_SHOWCASE_APPEARANCE_DEFAULTS,
  accordionSection: ACCORDION_APPEARANCE_DEFAULTS,
  showcaseGallery: SHOWCASE_GALLERY_APPEARANCE_DEFAULTS,
  problemContextSection: PROBLEM_CONTEXT_APPEARANCE_DEFAULTS,
  coreExperience: CORE_EXPERIENCE_BAND_APPEARANCE_DEFAULTS,
  desktopMotionShowcase: DESKTOP_MOTION_APPEARANCE_DEFAULTS,
  statsSection: STATS_APPEARANCE_DEFAULTS,
  highlightReel: HIGHLIGHT_REEL_APPEARANCE_DEFAULTS,
  proseSection: PROBLEM_CONTEXT_APPEARANCE_DEFAULTS,
  bulletSection: bandAppearance("md"),
  mediaSection: bandAppearance("md"),
};

/** Nested appearance keys on specific section types. */
export const SECTION_NESTED_APPEARANCE_DEFAULTS: Record<
  string,
  { field: string; defaults: Record<string, unknown> | ((section: Record<string, unknown>) => Record<string, unknown>) }[]
> = {
  coreExperience: [
    {
      field: "popupAppearance",
      defaults: CORE_EXPERIENCE_POPUP_APPEARANCE_DEFAULTS,
    },
    {
      field: "previewAppearance",
      defaults: (section) =>
        coreExperiencePreviewAppearanceDefaults(
          section.layoutVariant as string | undefined,
        ),
    },
  ],
};

export function mergeAppearanceDefaults(
  existing: Record<string, unknown> | undefined | null,
  defaults: Record<string, unknown>,
): { next: Record<string, unknown>; changed: string[] } {
  const next: Record<string, unknown> = {
    _type: "appearance",
    ...(existing ?? {}),
  };
  const changed: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    if (value === undefined) continue;
    const cur = next[key];
    if (cur !== null && cur !== undefined) continue;
    next[key] = value;
    changed.push(key);
  }

  return { next, changed };
}
