'use client'

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'

const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h3: ({ children }) => (
      <h3 className="text-[1.1em] font-semibold">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-current/40 pl-4 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc space-y-3 pl-5">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal space-y-3 pl-5">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="hover"
        className="underline underline-offset-2 transition-colors hover:text-accent"
      >
        {children}
      </a>
    ),
  },
}

/** A text block whose spans hold only whitespace (Studio leftovers: an empty bold H3, a stray Enter). */
function isBlankBlock(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false
  const b = v as { _type?: unknown; children?: unknown }
  if (b._type !== 'block' || !Array.isArray(b.children)) return false
  return b.children.every(
    c =>
      !!c &&
      typeof c === 'object' &&
      (c as { _type?: unknown })._type === 'span' &&
      !String((c as { text?: unknown }).text ?? '').trim(),
  )
}

/**
 * Drops blank text blocks from every portable-text array in a case study's
 * sections (deep). A field left with no blocks becomes undefined, so the
 * `s.intro && …` / `s.body?.length` wrappers and their margins don't render
 * (Census KPE empty H3 = +40 px, audit Nov 27). Untouched objects keep their
 * identity.
 */
export function withoutBlankProse<T>(value: T): T {
  if (Array.isArray(value)) {
    let changed = false
    const out: unknown[] = []
    for (const item of value) {
      if (isBlankBlock(item)) {
        changed = true
        continue
      }
      const next = withoutBlankProse(item)
      if (next !== item) changed = true
      out.push(next)
    }
    return (changed ? out : value) as T
  }
  if (!value || typeof value !== 'object') return value
  let changed = false
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(value)) {
    if (Array.isArray(v) && v.length > 0 && v.every(isBlankBlock)) {
      changed = true
      continue
    }
    const next = withoutBlankProse(v)
    if (next !== v) changed = true
    out[k] = next
  }
  return (changed ? out : value) as T
}

export function CaseStudyProse({
  value,
  className = '',
}: {
  value?: PortableTextBlock[]
  className?: string
}) {
  if (!value?.length) return null
  return (
    <div className={`space-y-5 ${className}`}>
      <PortableText value={value} components={ptComponents} />
    </div>
  )
}
