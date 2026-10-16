/**
 * Mobile case-study type system (Fas Oct 13, Figma 4507:23593) — exactly two
 * tiers below lg, applied with `!` so Sanity marks, per-component sizes and
 * legacy captions can't drift:
 *   title — 17px / 1.25 / bold (section titles, subheads, accordion rows)
 *   body  — 19px / 1.4 / light (paragraphs, meta, captions, links, notes)
 * Duration:/Team: stay bold labels on body text.
 * Desktop (lg+) keeps its own sizes.
 */
export const CS_M_TITLE =
  'max-lg:!text-[17px] max-lg:!leading-[1.25] max-lg:!font-bold max-lg:!tracking-normal'
export const CS_M_BODY =
  'max-lg:!text-[19px] max-lg:!leading-[1.4] max-lg:!font-light max-lg:!tracking-normal max-lg:!normal-case'

export function csBodyText(extra = '') {
  return `text-[19px] font-light leading-[1.4] lg:text-[22px] lg:leading-[1.65] lg:!font-light ${CS_M_BODY} ${extra}`
}

export function csBodySm(extra = '') {
  return `text-[17px] lg:text-[18px] font-normal leading-[1.6] ${CS_M_BODY} ${extra}`
}

/** Section titles — mobile 17 / desktop 20, bold, a step under body (19 / 22). */
export function csSectionTitle(desktopSize = 'lg:text-[20px]') {
  return `text-[17px] font-bold capitalize leading-tight lg:!font-bold ${CS_M_TITLE} ${desktopSize}`
}

export function csImpactTitle(desktopSize = 'lg:text-[26px]') {
  return `text-[17px] font-bold capitalize leading-tight lg:!font-bold ${CS_M_TITLE} ${desktopSize}`
}

/** Band CTA that opens a popup. Stored View More / See more → View All. */
export function csExpandLabel(label?: string) {
  const t = label?.trim()
  if (!t || /^(view|see)\s+(more|all)$/i.test(t)) return 'View All'
  return t
}

/** In-place / in-popup pagination. Stored View More / Load More → Load More. */
export function csLoadMoreLabel(label?: string) {
  const t = label?.trim()
  if (!t || /^(view|see|load|show)\s+(more|all)$/i.test(t)) return 'Load More'
  return t
}

/** Collapse after Load More. Stored Show Less / View Less → Load Less. */
export function csCollapseLabel(label?: string) {
  const t = label?.trim()
  if (!t || /^(show|see|view|load)\s+less$/i.test(t)) return 'Load Less'
  return t
}

/** One underlined CTA style for every expand / collapse button on mobile. */
export const CS_M_EXPAND_BTN = `max-lg:after:!hidden max-lg:!border-0 max-lg:!pb-0 max-lg:!underline max-lg:!decoration-1 max-lg:!underline-offset-4 max-lg:!normal-case max-lg:!font-normal ${CS_M_TITLE}`

/** Subheadings (accordion rows, service label) — title tier on mobile. */
export const CS_SUBHEAD_MOBILE = CS_M_TITLE

export function csUiText(extra = '') {
  return `text-[17px] lg:text-[18px] ${extra}`
}

export function csMetaSm(extra = '') {
  return `text-[16px] font-normal leading-[1.6] ${CS_M_BODY} ${extra}`
}

export function csMetaXs(extra = '') {
  return `text-[14px] font-normal italic leading-4.25 ${CS_M_BODY} ${extra}`
}

export function csHeroCap(extra = '') {
  return `text-[18px] leading-[1.6] lg:text-[19px] ${extra}`
}

export const CS_KICKER = 'text-[13px] sm:text-[14px]'
export const CS_CAPTION_LG = `text-[15px] sm:text-[16px] ${CS_M_BODY}`
export const CS_CAPTION_SM = `text-[13px] sm:text-[14px] ${CS_M_BODY}`
/** CE band tile captions — 13px (Fas Oct 16). Beats CS_M_BODY so they stay small on mobile. */
export const CS_CE_CAPTION =
  'text-[13px] font-normal leading-[1.4] max-lg:!text-[13px] max-lg:!leading-[1.4] max-lg:!font-normal'

export function csReflectionTitle() {
  return csSectionTitle()
}

export function csReflectionBody() {
  return csBodyText()
}
