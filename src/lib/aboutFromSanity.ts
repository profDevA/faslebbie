import type { PortableTextBlock } from '@portabletext/types'
import type { SanityAboutPage } from '@/sanity/types'
import {
  aboutExpansions,
  aboutLinks,
  aboutLogos,
  aboutParagraphs,
  type AboutToken,
} from '@/lib/content'

export interface AboutContentData {
  paragraphs: AboutToken[][]
  expansions: Record<string, AboutToken[]>
  links: { label: string; href: string }[]
}

// About needs its own flattener rather than the shared `proseRuns`: that one
// drops any child without a `text` field, which would silently swallow the
// inline logo chips, cycling tags and photo. Here every child is mapped —
// annotated spans become keys/links, inline objects become their own tokens.

interface Child {
  _type?: string
  _key?: string
  text?: string
  marks?: string[]
  // inline object payloads
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
  // Inline objects first — they carry no text.
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
  // Red keyword — the testimonials pop-up. Default tone/behaviour already means
  // "red text, opens a panel", and AboutContent routes this one to the modal.
  if (mark?._type === 'redKey') return { t: 'key', text }
  if (mark?._type === 'link' && mark.href)
    return { t: 'link', text, href: mark.href }

  return { t: 'text', text }
}

/** One token array per block, i.e. per rendered paragraph. */
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

/** Expansions are single-flow, so every block is concatenated into one run. */
function blocksToTokens(blocks?: PortableTextBlock[]): AboutToken[] {
  return blocksToParagraphs(blocks).flat()
}

/**
 * Map the Sanity About document onto the token model the page already renders.
 * Every field falls back to the in-code copy in `content.ts`, so an empty or
 * unreachable dataset leaves the page exactly as it is today.
 */
export function aboutFromSanity(
  data: SanityAboutPage | null | undefined,
): AboutContentData {
  const defaults: AboutContentData = {
    paragraphs: aboutParagraphs,
    expansions: aboutExpansions,
    links: aboutLinks.map(l => ({ label: l.label, href: l.href })),
  }
  if (!data) return defaults

  const paragraphs = blocksToParagraphs(data.bio)

  const expansions: Record<string, AboutToken[]> = {}
  for (const e of data.expansions ?? []) {
    if (!e.keyword) continue
    const body = blocksToTokens(e.body)
    if (body.length) expansions[e.keyword] = body
  }

  const links = (data.links ?? [])
    .filter(l => l.label && l.href)
    .map(l => ({ label: l.label as string, href: l.href as string }))

  return {
    paragraphs: paragraphs.length ? paragraphs : defaults.paragraphs,
    expansions: Object.keys(expansions).length ? expansions : defaults.expansions,
    links: links.length ? links : defaults.links,
  }
}
