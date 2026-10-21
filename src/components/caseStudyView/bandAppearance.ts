import type { CSSProperties } from 'react'

import type { Appearance } from '@/sanity/types'
import {
  gapDefault,
  padDefaults,
  sectionGapStyle,
  sectionPadStyle,
} from '@/lib/appearanceSpacing'

import { bandUsesLightText, colorToCss, isLight } from './colors'

export { bandUsesLightText, isLight }

export function bandStyle(
  a?: Appearance,
  defaultBg?: string,
  defaultLight?: boolean,
) {
  const style: CSSProperties = {}
  const bg = colorToCss(a?.backgroundColor) ?? defaultBg
  if (bg) style.backgroundColor = bg
  const tc =
    colorToCss(a?.textColor) ?? (defaultLight ? '#ffffff' : undefined)
  if (tc) style.color = tc
  return style
}

/**
 * Empty Studio fields fall back to the same values Studio gives a new section
 * (`sanityAppearanceDefaults.ts`), which is what Coral stores — so bands left
 * empty by the old migrations match Coral (Fas Oct 20: apply Coral to all).
 */
export function sectionStyle(
  a: Appearance | undefined,
  _page: boolean,
  padLevel: 'md' | 'lg',
  defaultBg?: string,
  defaultLight?: boolean,
) {
  return {
    ...bandStyle(a, defaultBg, defaultLight),
    ...sectionPadStyle(a, padDefaults(padLevel, false), true),
  }
}

export function flexSectionStyle(
  a: Appearance | undefined,
  _page: boolean,
  padLevel: 'md' | 'lg',
  defaultBg?: string,
  defaultLight?: boolean,
) {
  return {
    ...sectionStyle(a, true, padLevel, defaultBg, defaultLight),
    ...sectionGapStyle(a, gapDefault(padLevel, false), true),
  }
}

/** Dark bands — white dot cursor so it stays visible on black / navy fills. */
export function cursorInvertAttrs(light?: boolean) {
  return light ? ({ 'data-cursor-invert': '' as const }) : {}
}

/** Figma featured-band caption inset — Census mobile 2229:30254, desktop 2229:30434. */
export function featuredCaptionInset(side: 'left' | 'right') {
  return side === 'right'
    ? { marginLeft: 'auto' as const, maxWidth: 'min(445px, 42%)' }
    : {
        marginLeft: 'max(24px, calc(50% - 220px))' as const,
        maxWidth: 'min(445px, 90%)',
      }
}
