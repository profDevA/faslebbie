'use client'

import { Fragment, useEffect, useState } from 'react'
import {
  NavPillButton,
  PopupTrigger,
  expandPillClass,
  onActivateKey,
} from '@/components/InlineToken'
import TestimonialsFooterLink from '@/components/TestimonialsFooterLink'
import { openContactDrawer } from '@/lib/contactDrawer'
import type { AboutToken, Testimonial } from '@/lib/content'
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
      onKeyDown={onActivateKey(onToggle)}
      className={expandPillClass(open)}
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
  testimonials = [],
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
  testimonials?: Testimonial[]
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
      className={`font-grotesk text-[28px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
      {/* Block rhythm mirrors Research (mb-12 / lg:mb-16 between prose blocks,
          mb-5 under a kicker) so the section pages read on one system. */}
      <p className="mb-12 lg:mb-16">
        {renderProse(intro, 'intro', openKey, toggle, expansions)}
      </p>

      <div className="mb-12 lg:mb-16">
        <p className="mb-5 font-grotesk text-[20px] font-bold capitalize leading-[1.6] tracking-[0.5px] text-black lg:text-[24px]">
          {momentsHeading}
        </p>
        <p className="mb-2">{renderProse(lead, 'lead', openKey, toggle, expansions)}</p>
        {/* Takes you to the moments gallery — navigation, so it's a pill. */}
        <p>
          <NavPillButton onClick={onExplore}>{exploreText}</NavPillButton>
        </p>
      </div>

      <div className="mb-12 lg:mb-16">
        <p className="mb-2">
          {renderProse(closing, 'closing', openKey, toggle, expansions)}
        </p>
        {/* Opens the contact drawer over the page — underline. */}
        <p>
          <PopupTrigger onClick={openContactDrawer}>{contactText}</PopupTrigger>
        </p>
      </div>

      {/* Fas 07/28: testimonials link at the bottom (same as About CV). */}
      <TestimonialsFooterLink
        testimonials={testimonials}
        section="Leadership"
      />
    </section>
  )
}
