'use client'

import { Fragment, useEffect, useState } from 'react'
import { PopupTrigger, STATIC_PILL, expandPillClass, onActivateKey } from '@/components/InlineToken'
import { openContactDrawer } from '@/lib/contactDrawer'
import type { LeadershipSection, LeadershipToken } from '@/lib/leadershipFromSanity'

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
  tokens: LeadershipToken[],
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
            className={STATIC_PILL}
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
    if (tok.t === 'contact') {
      return (
        <PopupTrigger key={key} onClick={openContactDrawer}>
          {tok.text}
        </PopupTrigger>
      )
    }
    if (tok.t === 'text') return <Fragment key={key}>{tok.text}</Fragment>
    return null
  })
}

const sectionTitleClass = 'page-body-kicker mb-5 capitalize text-black'

const subheadingClass = 'page-body-subkicker mb-3 font-normal text-black'

export default function LeadershipContent({
  className = '',
  sections = [],
  expansions = {},
}: {
  className?: string
  sections?: LeadershipSection[]
  expansions?: Record<string, string>
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

  return (
    <section
      className={`page-body-prose text-black ${className}`}
    >
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
    </section>
  )
}
