import type { CSSProperties } from "react";

import {
  OVERVIEW_COPY_COLUMN_PAD,
  OVERVIEW_MEDIA_COLUMN_PAD,
} from "@/lib/caseStudyDefaults";

/** Legacy enum values still stored on older Sanity documents. */
export type LegacyPaddingToken = "none" | "sm" | "md" | "lg" | "xl";

export type SpacingValue = number | LegacyPaddingToken | undefined;

export interface AppearanceSpacing {
  paddingTop?: SpacingValue;
  paddingBottom?: SpacingValue;
  paddingLeft?: SpacingValue;
  paddingRight?: SpacingValue;
  contentGap?: SpacingValue;
  contentGapInner?: SpacingValue;
}

export interface PadDefaults {
  paddingTop: number;
  paddingBottom: number;
}

const OVERLAY_PAD: Record<LegacyPaddingToken, number> = {
  none: 0,
  sm: 32,
  md: 60,
  lg: 96,
  xl: 128,
};

const PAGE_PAD: Record<LegacyPaddingToken, number> = {
  none: 0,
  sm: 40,
  md: 56,
  lg: 80,
  xl: 96,
};

const OVERLAY_GAP: Record<LegacyPaddingToken, number> = {
  none: 0,
  sm: 24,
  md: 40,
  lg: 48,
  xl: 64,
};

const PAGE_GAP: Record<LegacyPaddingToken, number> = {
  none: 0,
  sm: 48,
  md: 96,
  lg: 128,
  xl: 160,
};

export const PAD_MD: { page: PadDefaults; overlay: PadDefaults } = {
  page: { paddingTop: 56, paddingBottom: 56 },
  overlay: { paddingTop: 60, paddingBottom: 60 },
};

export const PAD_LG: { page: PadDefaults; overlay: PadDefaults } = {
  page: { paddingTop: 80, paddingBottom: 80 },
  overlay: { paddingTop: 96, paddingBottom: 96 },
};

export const GAP_MD = { page: 96, overlay: 40 };
export const GAP_LG = { page: 128, overlay: 48 };

export const PAGE_PROSE_PAD: PadDefaults = {
  paddingTop: 80,
  paddingBottom: 80,
};

function legacyPadMap(page: boolean) {
  return page ? PAGE_PAD : OVERLAY_PAD;
}

function legacyGapMap(page: boolean) {
  return page ? PAGE_GAP : OVERLAY_GAP;
}

export function resolveSpacingPx(
  value: SpacingValue,
  legacyMap: Record<LegacyPaddingToken, number>,
  fallback: number,
): number {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value);
  }
  if (typeof value === "string" && value in legacyMap) {
    return legacyMap[value as LegacyPaddingToken];
  }
  return fallback;
}

export function sectionPadStyle(
  a: AppearanceSpacing | undefined,
  defaults: PadDefaults,
  page: boolean,
): CSSProperties {
  const map = legacyPadMap(page);
  return {
    paddingTop: resolveSpacingPx(a?.paddingTop, map, defaults.paddingTop),
    paddingBottom: resolveSpacingPx(
      a?.paddingBottom,
      map,
      defaults.paddingBottom,
    ),
  };
}

export function sectionHorizontalPadStyle(
  a: AppearanceSpacing | undefined,
  defaults: { paddingLeft: number; paddingRight: number },
  page: boolean,
): CSSProperties {
  const map = legacyPadMap(page);
  return {
    paddingLeft: resolveSpacingPx(a?.paddingLeft, map, defaults.paddingLeft),
    paddingRight: resolveSpacingPx(a?.paddingRight, map, defaults.paddingRight),
  };
}

export function sectionGapStyle(
  a: AppearanceSpacing | undefined,
  defaultGap: number,
  page: boolean,
): CSSProperties {
  const map = legacyGapMap(page);
  return {
    gap: resolveSpacingPx(a?.contentGap, map, defaultGap),
  };
}

export function sectionInnerGapStyle(
  a: AppearanceSpacing | undefined,
  defaultGap: number,
  page: boolean,
): CSSProperties {
  const map = legacyGapMap(page);
  return {
    gap: resolveSpacingPx(a?.contentGapInner, map, defaultGap),
  };
}

function columnPadStyle(
  top: number | undefined,
  bottom: number | undefined,
  defaults: PadDefaults,
): CSSProperties {
  return {
    paddingTop: typeof top === "number" && top >= 0 ? top : defaults.paddingTop,
    paddingBottom:
      typeof bottom === "number" && bottom >= 0 ? bottom : defaults.paddingBottom,
  };
}

export function overviewCopyPadStyle(section: {
  copyPaddingTop?: number;
  copyPaddingBottom?: number;
}): CSSProperties {
  return columnPadStyle(
    section.copyPaddingTop,
    section.copyPaddingBottom,
    OVERVIEW_COPY_COLUMN_PAD,
  );
}

export function overviewMediaPadStyle(section: {
  mediaPaddingTop?: number;
  mediaPaddingBottom?: number;
}): CSSProperties {
  return columnPadStyle(
    section.mediaPaddingTop,
    section.mediaPaddingBottom,
    OVERVIEW_MEDIA_COLUMN_PAD,
  );
}

export function padDefaults(
  level: "md" | "lg",
  page: boolean,
): PadDefaults {
  const preset = level === "lg" ? PAD_LG : PAD_MD;
  return page ? preset.page : preset.overlay;
}

export function gapDefault(level: "md" | "lg", page: boolean): number {
  const preset = level === "md" ? GAP_MD : GAP_LG;
  return page ? preset.page : preset.overlay;
}

/** Grouped prose bands: top pad from first block, bottom from last. */
export function proseGroupPadStyle(
  first: AppearanceSpacing | undefined,
  last: AppearanceSpacing | undefined,
  page: boolean,
  defaults: PadDefaults = page ? PAGE_PROSE_PAD : PAD_MD.overlay,
): CSSProperties {
  const map = legacyPadMap(page);
  const bottomSource = last?.paddingBottom ?? first?.paddingBottom;
  return {
    paddingTop: resolveSpacingPx(first?.paddingTop, map, defaults.paddingTop),
    paddingBottom: resolveSpacingPx(
      bottomSource,
      map,
      defaults.paddingBottom,
    ),
  };
}
