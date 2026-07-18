'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import type { AboutToken } from '@/lib/content'
import {
  leadershipClosing,
  leadershipExpansions,
  leadershipIntro,
  leadershipLead,
} from '@/lib/content'

// Gray keyword pill (Figma 354:747) — click to expand a short continuation
// inline (like About/Research). Inverts to a black pill while open, and on
// hover, matching the About keyword system.
function GrayPill({
  text,
  open,
  onToggle,
}: {
  text: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      data-lead-key
      data-cursor="hover"
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      className={`mx-[0.05em] box-decoration-clone cursor-pointer rounded-full px-[0.3em] py-[0.095em] leading-none transition-colors duration-200 ${
        open
          ? 'bg-black text-white'
          : 'bg-pill text-black text-shadow-token hover:bg-black hover:text-white hover:text-shadow-none'
      }`}
    >
      {text}
    </span>
  )
}

function renderProse(
  tokens: AboutToken[],
  prefix: string,
  openKey: string | null,
  toggle: (key: string) => void,
  expansions: Record<string, string>,
) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`
    if (tok.t === 'key' && tok.tone === 'gray') {
      const isOpen = openKey === tok.text
      const expansion = expansions[tok.text]
      return (
        <Fragment key={key}>
          <GrayPill text={tok.text} open={isOpen} onToggle={() => toggle(tok.text)} />
          {isOpen && expansion && (
            <>
              {' '}
              {/* Fade the continuation in rather than snapping it open. */}
              <span className="animate-[panel-in_0.35s_ease-out] font-normal">
                {expansion}
              </span>
            </>
          )}
        </Fragment>
      )
    }
    if (tok.t === 'text') return <Fragment key={key}>{tok.text}</Fragment>
    return null
  })
}

// The holistic ".txt" view (Figma 1-45057): intro prose → "My leadership
// moments" label → lead prose → red "Explore my leadership moments" (opens the
// ".img" gallery) → closing prose → red "Get in touch". Gray pills in the prose
// expand inline on click.
export default function LeadershipContent({
  className = '',
  intro = leadershipIntro,
  lead = leadershipLead,
  closing = leadershipClosing,
  expansions = leadershipExpansions,
  momentsHeading = 'My leadership moments',
  exploreText = 'Explore my leadership moments',
  contactText = 'Get in touch',
  onExplore,
}: {
  className?: string
  intro?: AboutToken[]
  lead?: AboutToken[]
  closing?: AboutToken[]
  expansions?: Record<string, string>
  momentsHeading?: string
  exploreText?: string
  contactText?: string
  onExplore: () => void
}) {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const toggle = (key: string) =>
    setOpenKey(prev => (prev === key ? null : key))

  // Click outside a pill / Escape closes the open expansion.
  useEffect(() => {
    if (!openKey) return
    const close = () => setOpenKey(null)
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t?.closest?.('[data-lead-key]')) return
      close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openKey])

  return (
    <section
      className={`font-serif text-[28px] font-medium leading-[1.6] tracking-[0.5px] text-black md:text-[32px] lg:text-[42px] lg:leading-normal ${className}`}
    >
      <p className="mb-10">
        {renderProse(intro, 'intro', openKey, toggle, expansions)}
      </p>

      <p className="mb-6 font-serif text-[20px] font-bold capitalize leading-[1.6] tracking-[0.5px] text-black lg:text-[24px]">
        {momentsHeading}
      </p>

      <p className="mb-2">{renderProse(lead, 'lead', openKey, toggle, expansions)}</p>
      <p className="mb-10">
        <span
          role="button"
          tabIndex={0}
          data-cursor="hover"
          onClick={onExplore}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onExplore()
            }
          }}
          className="cursor-pointer text-accent underline decoration-from-font underline-offset-2"
        >
          {exploreText}
        </span>
      </p>

      <p className="mb-2">
        {renderProse(closing, 'closing', openKey, toggle, expansions)}
      </p>
      <p>
        <Link
          href="/contact"
          data-cursor="hover"
          className="text-accent underline decoration-from-font underline-offset-2"
        >
          {contactText}
        </Link>
      </p>
    </section>
  )
}
