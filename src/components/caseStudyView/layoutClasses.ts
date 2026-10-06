export const CS_CONTENT_MAXW = {
  narrow: 'max-w-160',
  default: 'max-w-285',
  wide: 'max-w-[1440px]',
  full: 'max-w-none',
} as const

export type CsContentMaxWidth = keyof typeof CS_CONTENT_MAXW

export const CS_TEXT_ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const

export type CsTextAlign = keyof typeof CS_TEXT_ALIGN

/** Oct 2026 mobile QA — desktop alignment from Sanity; phone stays left-aligned. */
export function csBandTextAlign(align: CsTextAlign) {
  if (align === 'center') return 'max-lg:text-left lg:text-center'
  if (align === 'right') return 'max-lg:text-left lg:text-right'
  return CS_TEXT_ALIGN[align]
}

export function csTitleTextAlign(align: CsTextAlign) {
  if (align === 'center') return 'max-lg:text-left lg:text-center'
  if (align === 'right') return 'max-lg:text-left lg:text-right'
  return 'text-left'
}

/** Band titles/copy centered on desktop, left on phone (Oct 2026 QA). */
export const CS_MOBILE_LEFT_DESKTOP_CENTER =
  'max-lg:text-left max-lg:items-start lg:text-center lg:items-center'

/** Full-page desktop: one band = scrollport + bleed (see `--cs-band-bleed` in globals). */
export function pageScreenBandClass(enabled = true) {
  return enabled
    ? 'lg:h-[calc(100cqh+var(--cs-band-bleed))] lg:min-h-[calc(100cqh+var(--cs-band-bleed))] lg:flex lg:flex-col lg:justify-center'
    : ''
}

/** At least one scrollport tall; band grows when two-column copy exceeds 100cqh. */
export function pageBandMinHeightClass() {
  return 'lg:min-h-[calc(100cqh+var(--cs-band-bleed))]'
}

export function pageScreenBandInnerClass() {
  return 'flex w-full flex-1 flex-col justify-center'
}

/** Full-page shell (Fas Aug 2026). */
export function csShell(
  extra = '',
  opts?: { /** CE mobileRow: one inset on phone — no calc(100%-2.5rem) plus px-5. */ mobileSingleInset?: boolean },
) {
  const base =
    'mx-auto w-full max-w-[min(1400px,calc(100%-2.5rem))] px-5 sm:px-8 lg:px-12'
  const mobileInset = opts?.mobileSingleInset
    ? 'max-lg:max-w-full max-lg:!px-[22px]'
    : ''
  return `${base} ${mobileInset} ${extra}`.replace(/\s+/g, ' ').trim()
}

export function csProseInner(
  align: 'left' | 'center' | 'right',
  widthKey: CsContentMaxWidth,
) {
  if (widthKey === 'wide') return 'mx-auto w-full max-w-[min(1280px,100%)]'
  if (widthKey === 'full') return 'mx-auto w-full max-w-none'
  if (align === 'center')
    return 'mx-auto w-full max-w-[min(1000px,100%)] max-lg:max-w-none'
  return 'mx-auto w-full max-w-[min(1000px,100%)] max-lg:max-w-none'
}

export function csBandGutter(extra = '') {
  return `px-5 sm:px-8 lg:px-12 ${extra}`
}

/** Desktop inset shared by split My Approach + Research Artifacts. */
export const CS_WIDE_BAND_GUTTER = 'lg:px-6 xl:px-[3.5vw]'

export function csPagerShell(extra = '') {
  return `flex w-full items-center justify-between ${extra}`
}
