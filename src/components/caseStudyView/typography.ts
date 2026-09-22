/** Case-study type — 19/22 mobile, 20/26 laptop. No vw scale (too big on wide screens). */
export function csBodyText(extra = '') {
  return `text-[19px] font-normal leading-[1.65] lg:text-[20px] ${extra}`
}

export function csBodySm(extra = '') {
  return `text-[17px] lg:text-[18px] font-normal leading-[1.6] ${extra}`
}

export function csSectionTitle(sizeExtra = '') {
  const size = sizeExtra || 'text-[22px] lg:text-[26px]'
  return `font-normal capitalize leading-tight ${size}`
}

export function csImpactTitle(sizeExtra = '') {
  const size = sizeExtra || 'text-[22px] lg:text-[26px]'
  return `font-medium capitalize leading-tight ${size}`
}

export function csUiText(extra = '') {
  return `text-[17px] lg:text-[18px] ${extra}`
}

export function csMetaSm(extra = '') {
  return `text-[16px] font-normal leading-[1.6] ${extra}`
}

export function csMetaXs(extra = '') {
  return `text-[14px] font-normal italic leading-4.25 ${extra}`
}

export function csHeroCap(extra = '') {
  return `text-[18px] leading-[1.6] lg:text-[19px] ${extra}`
}

export const CS_KICKER = 'text-[13px] sm:text-[14px]'
export const CS_CAPTION_LG = 'text-[15px] sm:text-[16px]'
export const CS_CAPTION_SM = 'text-[13px] sm:text-[14px]'

export function csReflectionTitle() {
  return 'font-grotesk text-[22px] font-normal capitalize leading-tight lg:text-[26px]'
}

export function csReflectionBody() {
  return 'font-grotesk text-[19px] font-light leading-[1.6] lg:text-[20px]'
}
