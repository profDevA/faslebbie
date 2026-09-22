import type { Appearance, SanityColor } from '@/sanity/types'

export function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map(c => c + c)
          .join('')
      : h
  const int = parseInt(full.slice(0, 6), 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return (r * 299 + g * 587 + b * 114) / 1000
}

export function colorToCss(c?: SanityColor): string | undefined {
  if (!c?.hex) return undefined
  const a = c.alpha ?? 1
  if (a >= 1) return c.hex
  const { r, g, b } = hexToRgb(c.hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function sanityColorIsLight(c?: SanityColor) {
  if (!c?.hex) return false
  return luminance(c.hex) > 180
}

/** Legacy fallback when accordionTextColor is unset — only deep panels → white copy. */
export function accordionPanelUsesLightText(c?: SanityColor) {
  if (!c?.hex) return false
  // Tan/lavender/magenta panels (DVA, Design Assist, Experian) sit ~130–145 — black per Figma.
  return luminance(c.hex) < 125
}

/** True when a band should treat its text as light (for default label colour). */
export function isLight(a?: Appearance, defaultLight?: boolean) {
  if (a?.textColor?.hex) {
    return luminance(a.textColor.hex) > 180
  }
  const bg = a?.backgroundColor
  if (bg?.hex && (bg.alpha ?? 1) > 0.5) {
    return luminance(bg.hex) < 140
  }
  return !!defaultLight
}

/** Render light/white copy — respects explicit textColor and dark band backgrounds. */
export function bandUsesLightText(a?: Appearance, defaultLight?: boolean) {
  if (a?.textColor?.hex) {
    return luminance(a.textColor.hex) > 180
  }
  return isLight(a, defaultLight)
}
