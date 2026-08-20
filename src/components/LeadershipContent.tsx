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
import type { LeadershipSection } from '@/lib/leadershipFromSanity'
import type { AboutToken, Testimonial } from '@/lib/content'

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
  interactive: boolean,
) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`
    if (tok.t === 'key' && tok.tone === 'gray' && interactive) {
      const expansion = expansions[tok.text]
      if (!expansion) {
        return (
          <span
            key={key}
            className="mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-black text-shadow-token"
          >
            {tok.text}
          </span>
        )
      }
      const isOpen = openKey === tok.text
      return (
        <Fragment key={key}>
          <GrayPill text={tok.text} open={isOpen} onToggle={() => toggle(tok.text)} />
          {isOpen && (
            <>
              {' '}
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

const sectionTitleClass =
  'mb-5 font-grotesk text-[20px] font-bold capitalize leading-[1.6] tracking-[0.5px] text-black lg:text-[24px]'

const subheadingClass =
  'mb-3 font-grotesk text-[18px] font-bold leading-[1.5] tracking-[0.5px] text-black lg:text-[22px]'

export default function LeadershipContent({
  className = '',
  sections = [],
  intro = [],
  lead = [],
  closing = [],
  expansions = {},
  momentsHeading = '',
  exploreText = '',
  contactText = '',
  onExplore,
  testimonials = [],
}: {
  className?: string
  sections?: LeadershipSection[]
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

  const useSections = sections.length > 0

  return (
    <section
      className={`font-grotesk text-[28px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
      {useSections ? (
        <>
          {sections.map((section, si) => (
            <div key={section.title} className="mb-12 lg:mb-16">
              <p className={sectionTitleClass}>{section.title}</p>
              {section.blocks.map((block, bi) => (
                <Fragment key={`${si}-${bi}`}>
                  {block.subheading ? (
                    <p className={subheadingClass}>{block.subheading}</p>
                  ) : null}
                  <p className="mb-7">
                    {renderProse(
                      block.tokens,
                      `s${si}b${bi}`,
                      openKey,
                      toggle,
                      expansions,
                      !section.static,
                    )}
                  </p>
                </Fragment>
              ))}
            </div>
          ))}
          {/* The sections layout dropped the old "moments" block, so this pill is
              the only way into the .img gallery now that the view toggle is gone. */}
          {exploreText ? (
            <p className="mb-12 lg:mb-16">
              <NavPillButton onClick={onExplore}>{exploreText}</NavPillButton>
            </p>
          ) : null}
          <p>
            <PopupTrigger onClick={openContactDrawer}>{contactText}</PopupTrigger>
          </p>
        </>
      ) : (
        <>
          <p className="mb-12 lg:mb-16">
            {renderProse(intro, 'intro', openKey, toggle, expansions, true)}
          </p>

          <div className="mb-12 lg:mb-16">
            <p className={sectionTitleClass}>{momentsHeading}</p>
            <p className="mb-2">
              {renderProse(lead, 'lead', openKey, toggle, expansions, true)}
            </p>
            {exploreText ? (
              <p>
                <NavPillButton onClick={onExplore}>{exploreText}</NavPillButton>
              </p>
            ) : null}
          </div>

          <div className="mb-12 lg:mb-16">
            <p className="mb-2">
              {renderProse(closing, 'closing', openKey, toggle, expansions, true)}
            </p>
            <p>
              <PopupTrigger onClick={openContactDrawer}>{contactText}</PopupTrigger>
            </p>
          </div>

          <TestimonialsFooterLink
            testimonials={testimonials}
            section="Leadership"
          />
        </>
      )}
    </section>
  )
}
