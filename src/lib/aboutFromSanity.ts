import type { PortableTextBlock } from '@portabletext/types'
import type { SanityAboutPage } from '@/sanity/types'
import { aboutLogos, type AboutToken } from '@/lib/content'

export interface AboutLink {
  label: string
  href: string
  passwordProtected?: boolean
}

export interface AboutContentData {
  headline: string
  intro: AboutToken[][]
  paragraphs: AboutToken[][]
  expansions: Record<string, AboutToken[]>
  links: AboutLink[]
}

interface Child {
  _type?: string
  _key?: string
  text?: string
  marks?: string[]
  words?: string[]
  name?: string
  src?: string
  alt?: string
}

interface MarkDef {
  _key?: string
  _type?: string
  href?: string
  kind?: string
}

const LOGO_NAMES = new Set(Object.keys(aboutLogos))

function childToToken(child: Child, markDefs: MarkDef[]): AboutToken | null {
  if (child._type === 'aboutTyper')
    return child.words?.length ? { t: 'typer', words: child.words } : null

  if (child._type === 'aboutLogo')
    return child.name && LOGO_NAMES.has(child.name)
      ? { t: 'logo', name: child.name as keyof typeof aboutLogos }
      : null

  if (child._type === 'aboutPhoto')
    return child.src ? { t: 'photo', src: child.src, alt: child.alt ?? '' } : null

  const text = child.text
  if (!text) return null

  const mark = (child.marks ?? [])
    .map(k => markDefs.find(d => d._key === k))
    .find(Boolean)

  if (mark?._type === 'pill') return { t: 'key', text, tone: 'gray' }
  if (mark?._type === 'redKey') return { t: 'key', text }
  if (mark?._type === 'link' && mark.href)
    return { t: 'link', text, href: mark.href }

  return { t: 'text', text }
}

function blocksToParagraphs(blocks?: PortableTextBlock[]): AboutToken[][] {
  if (!blocks?.length) return []
  const paras: AboutToken[][] = []
  for (const block of blocks) {
    if (block._type !== 'block') continue
    const markDefs = (block.markDefs ?? []) as MarkDef[]
    const tokens = ((block.children ?? []) as Child[])
      .map(c => childToToken(c, markDefs))
      .filter((t): t is AboutToken => t !== null)
    if (tokens.length) paras.push(tokens)
  }
  return paras
}

function blocksToTokens(blocks?: PortableTextBlock[]): AboutToken[] {
  return blocksToParagraphs(blocks).flat()
}

const empty: AboutContentData = {
  headline: '',
  intro: [],
  paragraphs: [],
  expansions: {},
  links: [],
}

/** Sanity About page only — no in-code seed fallback. */
export function aboutFromSanity(
  data: SanityAboutPage | null | undefined,
): AboutContentData {
  if (!data) return empty

  const headline = data.headline?.trim() ?? ''
  const intro = blocksToParagraphs(data.intro)
  const paragraphs = blocksToParagraphs(data.bio)

  const expansions: Record<string, AboutToken[]> = {}
  for (const e of data.expansions ?? []) {
    if (!e.keyword) continue
    const body = blocksToTokens(e.body)
    if (body.length) expansions[e.keyword] = body
  }

  const links: AboutLink[] = []
  for (const l of data.links ?? []) {
    let href = (l.pdfUrl || l.href || '').trim()
    if (!l.label || !href) continue
    if (
      !/^[a-z][a-z0-9+.-]*:/i.test(href) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)
    ) {
      href = `mailto:${href}`
    }
    const lockedDefault = /^(cv|resume)$/i.test(l.label.trim())
    links.push({
      label: l.label,
      href,
      passwordProtected: l.passwordProtected ?? lockedDefault,
    })
  }

  return { headline, intro, paragraphs, expansions, links }
}
