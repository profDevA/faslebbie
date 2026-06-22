'use client'

import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import type { AboutToken } from '@/lib/content'
import {
  leadershipClosing,
  leadershipIntro,
  leadershipLead,
  leadershipMoments,
  leadershipPanels,
} from '@/lib/content'

// Static gray highlight pill (Figma 354:747). Unlike About, Leadership's gray
// keywords are emphasis only — no inline expansion copy was designed — so they
// render as non-interactive highlights.
function GrayPill({ text }: { text: string }) {
  return (
    <span className="mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-black">
      {text}
    </span>
  )
}

function renderProse(tokens: AboutToken[], prefix: string) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`
    if (tok.t === 'key' && tok.tone === 'gray')
      return <GrayPill key={key} text={tok.text} />
    if (tok.t === 'text') return <Fragment key={key}>{tok.text}</Fragment>
    return null
  })
}

// Red boxed panel (same chrome as the About panels): fade-in, red left border,
// title, body, CTA, × close. Renders inline below the red trigger line.
function LeadPanel({
  title,
  onClose,
}: {
  title: string
  onClose: () => void
}) {
  const panel = leadershipPanels[title]
  if (!panel) return null
  return (
    <div
      data-lead-panel
      className="block animate-[panel-in_0.25s_ease-out] py-5 text-left"
    >
      <div className="relative flex w-full max-w-204.25 flex-col gap-3.25 border-l-4 border-accent bg-panel px-4.25 py-3.5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-3 top-2 z-10 font-serif text-[30px] leading-none text-black/70 transition-colors hover:text-black"
        >
          ×
        </button>
        <p className="pr-6 font-serif text-[20px] font-bold leading-[1.35] tracking-wider">
          {title}
        </p>
        {panel.body.map((b, i) => (
          <p
            key={i}
            className="font-serif text-[16px] font-medium leading-[1.35] tracking-[0.06em]"
          >
            {b}
          </p>
        ))}
        {panel.placeholder && (
          <p className="text-[12px] uppercase tracking-wider text-black/40">
            placeholder — final copy pending
          </p>
        )}
        {panel.cta && (
          <Link
            href={panel.cta.href}
            data-cursor="hover"
            className="font-serif text-[16px] font-medium text-accent underline underline-offset-2"
          >
            {panel.cta.label} →
          </Link>
        )}
      </div>
    </div>
  )
}

// A clickable red trigger line ("View portfolio" / "Get in touch") that toggles
// its boxed panel below.
function PanelTrigger({
  label,
  arrow,
  open,
  onToggle,
}: {
  label: string
  arrow?: boolean
  open: boolean
  onToggle: () => void
}) {
  return (
    <p className="mb-7">
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
        className="cursor-pointer text-accent"
      >
        {label}
        {arrow ? ' →' : ''}
      </span>
    </p>
  )
}

// One row in the "Leadership Moments" list. Rows with `detail` expand inline
// (accordion); the rest are static rows. Logo is a self-contained brand chip
// (inline SVG, no <img>).
function MomentRow({
  moment,
  svg,
  open,
  onToggle,
}: {
  moment: (typeof leadershipMoments)[number]
  svg?: string
  open: boolean
  onToggle: () => void
}) {
  const expandable = !!moment.detail
  return (
    <div className="border-t border-black pt-6">
      <div className="flex flex-col gap-3">
        {svg && (
          <span
            aria-hidden
            className="inline-flex h-[42px] w-fit items-center [&>svg]:h-full [&>svg]:w-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
        <p className="font-serif text-[22px] font-medium leading-[1.6] tracking-[0.5px] text-black lg:text-[36px]">
          {moment.meta}
        </p>
        <button
          type="button"
          onClick={expandable ? onToggle : undefined}
          aria-expanded={expandable ? open : undefined}
          data-cursor={expandable ? 'hover' : undefined}
          className={`text-left font-serif text-[28px] font-bold leading-[1.4] tracking-[0.5px] text-black lg:text-[42px] lg:leading-[1.6] ${
            expandable ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          {moment.title}{' '}
          <span className="text-accent">{open ? '↓' : '→'}</span>
        </button>
        {moment.sub && (
          <p className="font-serif text-[18px] font-normal leading-[1.6] tracking-[0.5px] text-black lg:text-[32px]">
            {moment.sub}
          </p>
        )}
        {expandable && open && (
          <div className="flex flex-col gap-5 pt-2">
            {moment.detail!.map((d, i) => (
              <p
                key={i}
                className="font-serif text-[24px] font-normal leading-[1.4] tracking-[0.5px] text-black lg:text-[42px] lg:leading-[1.6]"
              >
                {d}
              </p>
            ))}
            {moment.links && (
              <div className="flex flex-col gap-2 pt-1">
                {moment.links.map(l => (
                  <Link
                    key={l.label}
                    href={l.href}
                    data-cursor="hover"
                    className="font-serif text-[24px] font-normal text-accent lg:text-[42px]"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function LeadershipContent({
  className = '',
  logoSvgs,
}: {
  className?: string
  logoSvgs: Record<string, string>
}) {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [openMoment, setOpenMoment] = useState<number | null>(null)

  // Click outside / Escape closes the open boxed panel.
  useEffect(() => {
    if (!activePanel) return
    const close = () => setActivePanel(null)
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null
      if (t?.closest?.('[data-lead-key], [data-lead-panel]')) return
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
  }, [activePanel])

  const toggle = (key: string) =>
    setActivePanel(prev => (prev === key ? null : key))

  return (
    <section
      className={`font-serif text-[28px] font-bold leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-normal lg:tracking-[0.5px] ${className}`}
    >
      <p className="mb-7">{renderProse(leadershipIntro, 'intro')}</p>

      <PanelTrigger
        label="View portfolio"
        open={activePanel === 'View portfolio'}
        onToggle={() => toggle('View portfolio')}
      />
      {activePanel === 'View portfolio' && (
        <LeadPanel title="View portfolio" onClose={() => setActivePanel(null)} />
      )}

      <p className="mb-7">{renderProse(leadershipLead, 'lead')}</p>

      {/* Leadership Moments */}
      <p className="mb-7 font-serif text-[20px] font-bold capitalize leading-[1.6] tracking-[0.5px] text-black lg:text-[24px]">
        Leadership Moments
      </p>
      <div className="mb-12 flex flex-col gap-[60px]">
        {leadershipMoments.map((m, i) => (
          <MomentRow
            key={m.meta}
            moment={m}
            svg={logoSvgs[m.logo]}
            open={openMoment === i}
            onToggle={() => setOpenMoment(prev => (prev === i ? null : i))}
          />
        ))}
      </div>

      {/* What People Say */}
      <p className="mb-2 font-serif font-bold capitalize text-accent">
        What People Say
      </p>
      <p className="mb-7">{renderProse(leadershipClosing, 'closing')}</p>

      <PanelTrigger
        label="Get in touch"
        arrow
        open={activePanel === 'Get in touch'}
        onToggle={() => toggle('Get in touch')}
      />
      {activePanel === 'Get in touch' && (
        <LeadPanel title="Get in touch" onClose={() => setActivePanel(null)} />
      )}
    </section>
  )
}
