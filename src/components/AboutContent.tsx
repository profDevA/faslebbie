'use client'

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { AboutToken } from '@/lib/content'
import {
  aboutExpansions,
  aboutLogos,
  aboutPanels,
  aboutParagraphs,
  testimonials,
} from '@/lib/content'

const TESTIMONIAL_KEY = 'what people are saying'

// --- Inline-expansion accordion ---------------------------------------------
// Gray keywords expand inline, and some expansions contain nested gray keywords.
// We allow only one expansion open per level: opening a keyword collapses its
// siblings but keeps its ancestor chain open (so nested keywords stay visible).

// keyword -> gray keywords nested directly inside its expansion.
const keywordChildren: Record<string, string[]> = Object.fromEntries(
  Object.entries(aboutExpansions).map(([k, toks]) => [
    k,
    toks.flatMap(t => (t.t === 'key' ? [t.text] : [])),
  ]),
)

function descendantsOf(key: string, acc = new Set<string>()): Set<string> {
  for (const child of keywordChildren[key] ?? []) {
    if (!acc.has(child)) {
      acc.add(child)
      descendantsOf(child, acc)
    }
  }
  return acc
}

function ancestorsOf(key: string, seen = new Set<string>()): Set<string> {
  const result = new Set<string>()
  for (const [parent, children] of Object.entries(keywordChildren)) {
    if (children.includes(key) && !seen.has(parent)) {
      seen.add(parent)
      result.add(parent)
      for (const a of ancestorsOf(parent, seen)) result.add(a)
    }
  }
  return result
}

// Shared chrome for every boxed panel (Figma 187:2356 etc.): fade-in wrapper,
// red left border, lowercase title, and a × close button. Renders below the
// paragraph; `contentClassName` lets callers tweak the inner box (e.g. clip the
// slider's peeking card).
function PanelShell({
  title,
  onClose,
  children,
  contentClassName = '',
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  contentClassName?: string
}) {
  return (
    <div className="block animate-[panel-in_0.25s_ease-out] py-5 text-left">
      <div
        className={`relative flex w-full flex-col gap-3.25 border-l-4 border-accent bg-panel px-4.25 py-3.5 ${contentClassName}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-3 top-2 z-10 font-serif text-[30px] leading-none text-black/70 transition-colors hover:text-black"
        >
          ×
        </button>
        <p className="pr-6 font-serif text-[20px] font-bold lowercase leading-[1.35] tracking-wider">
          {title}
        </p>
        {children}
      </div>
    </div>
  )
}

// Boxed panel for a RED keyword (Figma 187:2356 teach / 1913 recognized / 2107
// monthly) — title, body, CTA, × close; renders below the paragraph.
function AboutPanel({
  keyword,
  onClose,
}: {
  keyword: string
  onClose: () => void
}) {
  const panel = aboutPanels[keyword]
  if (!panel) return null
  return (
    <PanelShell title={keyword} onClose={onClose} contentClassName="max-w-204.25">
      {panel.body.map((b, i) => (
          <p
            key={i}
            className="font-serif text-[16px] font-medium leading-[1.35] tracking-[0.06em]"
          >
            {b}
          </p>
        ))}
        {panel.awards && (
          <div className="flex flex-wrap items-center gap-x-[19px] gap-y-3 pt-1">
            <span className="font-serif text-[16px] font-medium tracking-[0.06em]">
              Awards:
            </span>
            <div className="flex flex-wrap items-center gap-[18px]">
              {panel.awards.map(a => (
                // eslint-disable-next-line @next/next/no-img-element -- static award mark
                <img
                  key={a.src}
                  src={a.src}
                  alt={a.alt}
                  style={{ height: `${a.h}px` }}
                  className="w-auto"
                />
              ))}
            </div>
          </div>
        )}
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
    </PanelShell>
  )
}

// A single testimonial card in the slider (Figma 187:1800): quote mark, then
// avatar + name + role, then the quote body. Off-screen cards stay laid out
// (the track measures/translates by width) but are hidden from assistive tech
// and taken out of the tab order.
function TestimonialCard({
  t,
  inactive,
}: {
  t: (typeof testimonials)[number]
  inactive: boolean
}) {
  return (
    <article
      aria-hidden={inactive}
      inert={inactive || undefined}
      className="flex w-full shrink-0 flex-col gap-4 border border-hairline bg-bg px-6 py-6 lg:w-[clamp(260px,64%,539px)] lg:px-8 lg:py-7"
    >
      {/* Sharp blocky quote mark (Figma 187:1825) — replaces the rounded serif “ */}
      <svg
        aria-hidden
        viewBox="0 0 25.4908 19.075"
        className="h-[26px] w-auto shrink-0 self-start lg:h-[32px]"
        fill="#2C2B2B"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10.0868 8.83804H6.47909C5.89008 5.0673 9.57138 3.97735 11.4857 3.90372L10.6021 0.000409149C2.35603 -0.0585084 0.098168 6.2604 0 9.42721V19.075H10.0868V8.83804Z" />
        <path d="M24.0919 8.83805H20.4842C19.8952 5.06731 23.5765 3.97736 25.4908 3.90373L24.6072 0.00041858C16.3611 -0.0584989 14.1033 6.2604 14.0051 9.42722V19.075H24.0919V8.83805Z" />
      </svg>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={t.avatar}
          alt=""
          className="size-[59px] shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="font-serif text-[20px] font-bold leading-tight tracking-wider text-black">
            {t.name}
          </p>
          <p className="font-serif text-[20px] leading-tight tracking-wider text-black">
            {t.role}
          </p>
        </div>
      </div>
      <p className="font-serif text-[16px] font-normal leading-[1.19] tracking-wider text-black">
        “{t.quote}”
      </p>
    </article>
  )
}

// "What people are saying" — an inline boxed panel (same chrome as AboutPanel)
// holding a horizontal testimonial slider you click Prev/Next through
// (Fas 06/15; Figma 187:1713 / 187:1800).
function TestimonialsPanel({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const max = testimonials.length - 1

  // Slide distance = card width + flex gap; measured so the peek/translate stays
  // correct as the panel (and card clamp) resizes.
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const first = track.firstElementChild as HTMLElement | null
      if (!first) return
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      setStep(first.offsetWidth + gap)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const go = (d: number) => setI(c => Math.min(max, Math.max(0, c + d)))

  return (
    <PanelShell
      title="what people are saying"
      onClose={onClose}
      contentClassName="overflow-hidden"
    >
      {/* slider viewport */}
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6 transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${-i * step}px)` }}
        >
          {testimonials.map((t, idx) => (
            <TestimonialCard key={idx} t={t} inactive={idx !== i} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-6 pt-1">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={i === 0}
          data-cursor="hover"
          className="font-serif text-[16px] font-medium text-accent underline underline-offset-2 transition-opacity disabled:opacity-35"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={i === max}
          data-cursor="hover"
          className="font-serif text-[16px] font-medium text-accent underline underline-offset-2 transition-opacity disabled:opacity-35"
        >
          Next →
        </button>
      </div>
    </PanelShell>
  )
}

// Inline brand logo chip. The SVG is a self-contained chip (background + logo
// baked in), rendered inline — no <img>, no wrapper background. Sized by height;
// width:auto on the inner <svg> preserves its native aspect ratio. On hover it
// pops up ~4x and wobbles (Emily-Campbell-style image pop-up).
function LogoChip({ svg }: { svg: string }) {
  return (
    <span
      data-cursor="hover"
      className="group relative mx-1 inline-flex h-[1.15em] translate-y-[-0.2em] items-center justify-center align-middle transition-transform duration-200 ease-out will-change-transform [&>svg]:h-full [&>svg]:w-auto hover:z-30 hover:scale-[1.5] group-hover:[&>svg]:animate-[logo-wobble_0.5s_ease-in-out_infinite]"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

// Inline personal photo — small rounded thumbnail that pops up on hover.
function PhotoChip({ src, alt }: { src: string; alt: string }) {
  return (
    <span
      data-cursor="hover"
      className="group relative mx-1 inline-block h-[1.25em] w-[1.4em] translate-y-[-0.3em] overflow-hidden rounded-md align-middle shadow-[0_1px_9px_2px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out will-change-transform hover:z-30 hover:scale-[4]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small static photo */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </span>
  )
}

// System 1: a black >/~ tag that retype-cycles through its own word list on
// click (typewriter). Used twice in the first sentence — once for the role
// (designer/researcher/educator), once for the credential (the three degrees).
// The two tags cycle independently.
function TypingTag({ words }: { words: readonly string[] }) {
  const [idx, setIdx] = useState(0)
  const [shown, setShown] = useState(words[0])
  // Mirror the live text in a ref so the typewriter effect can read the current
  // word without listing `shown` as a dep (which would restart it every
  // keystroke). Updated in an effect — never during render.
  const shownRef = useRef(shown)
  useEffect(() => {
    shownRef.current = shown
  })

  useEffect(() => {
    const target = words[idx]
    const from = shownRef.current
    if (from === target) return // nothing to do (initial render / no change)
    let cancelled = false
    const timers: number[] = []
    let t = 0
    // backspace `from` (quick), then type `target` at a slow, deliberate pace
    for (let i = from.length - 1; i >= 0; i--) {
      const n = i
      timers.push(
        window.setTimeout(() => !cancelled && setShown(from.slice(0, n)), t),
      )
      t += 45
    }
    for (let i = 1; i <= target.length; i++) {
      const n = i
      timers.push(
        window.setTimeout(() => !cancelled && setShown(target.slice(0, n)), t),
      )
      t += 95
    }
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [idx, words])

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={() => setIdx(i => (i + 1) % words.length)}
      className="mx-1 my-[0.4em] inline-flex translate-y-[-0.3em] items-center bg-[#141414] px-[0.4em] py-[0.1em] text-left align-middle text-[1em] leading-none text-bg lg:my-0"
      aria-label={`${shown}. Click to cycle.`}
    >
      <span className="mr-[0.3em]">{'>/~'}</span>
      {shown}
      <span className="ml-0.5 inline-block w-px animate-pulse self-stretch bg-bg" />
    </button>
  )
}

type RenderCtx = {
  open: Set<string> // gray keywords expanded inline
  toggleInline: (key: string) => void
  activePanel: string | null // red keyword whose boxed panel is open
  setActivePanel: (key: string | null) => void
  logoSvgs: Record<keyof typeof aboutLogos, string> // inline SVG markup per logo
  expanded?: boolean // true while rendering an inline gray-keyword expansion
}

// Renders a single keyword pill. `displayText` may be a slice of the token's
// text — used when a wrapping pill is split around an inline panel (e.g.
// "Carnegie Mellon" / "University") — while identity + active state still come
// from `tok.text`.
function renderKeyPill(
  tok: Extract<AboutToken, { t: 'key' }>,
  ctx: RenderCtx,
  displayText: string,
  key: string,
) {
  const isGray = tok.tone === 'gray'
  const inlineOpen = ctx.open.has(tok.text)
  const panelOpen = ctx.activePanel === tok.text
  const isActive = isGray ? inlineOpen : panelOpen
  const onClick = () => {
    if (isGray) ctx.toggleInline(tok.text)
    else ctx.setActivePanel(panelOpen ? null : tok.text)
  }
  return (
    // Span (not <button>): a <button> is an atomic inline box and won't break
    // across lines, so a long pill couldn't wrap. A span + box-decoration-clone
    // wraps into rounded parts while keeping button semantics.
    <span
      key={key}
      role="button"
      tabIndex={0}
      data-about-key
      data-cursor="hover"
      aria-expanded={isActive}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      className={`mx-[0.05em] box-decoration-clone cursor-pointer rounded-full px-[0.3em] py-[0.095em] leading-none transition-colors duration-200 ${
        isActive
          ? 'bg-black text-white'
          : `bg-pill hover:bg-black hover:text-white ${
              isGray ? 'text-black' : 'text-accent'
            }`
      }`}
    >
      {displayText}
    </span>
  )
}

// Recursively render a token stream. Keys come in two flavors:
//  • gray keyword → inline expansion in black, normal weight (may contain
//    nested keys)
//  • red keyword → toggles a boxed panel below the line ("what people are
//    saying" is a red keyword whose panel holds the testimonial slider)
function renderToken(tok: AboutToken, ctx: RenderCtx, key: string) {
  {
    if (tok.t === 'text')
      return (
        <span key={key} className={ctx.expanded ? 'font-normal' : undefined}>
          {tok.text}
        </span>
      )
    if (tok.t === 'typer') return <TypingTag key={key} words={tok.words} />
    if (tok.t === 'logo')
      return <LogoChip key={key} svg={ctx.logoSvgs[tok.name]} />
    if (tok.t === 'photo')
      return <PhotoChip key={key} src={tok.src} alt={tok.alt} />
    if (tok.t === 'term')
      return (
        <span
          key={key}
          className="mx-1 my-[0.4em] inline-flex translate-y-[-0.3em] items-center bg-[#141414] px-[0.4em] py-[0.1em] align-middle font-grotesk text-[1em] leading-none text-bg lg:my-0"
        >
          <span className="mr-[0.3em]">{'>/~'}</span>
          {tok.text}
        </span>
      )

    const isGray = tok.tone === 'gray'
    const inlineOpen = ctx.open.has(tok.text)
    const expansion = aboutExpansions[tok.text]

    return (
      <Fragment key={key}>
        {renderKeyPill(tok, ctx, tok.text, `${key}-pill`)}
        {/* gray keyword: inline expansion in black/normal (nested keys ok) */}
        {isGray && inlineOpen && expansion && (
          <> {renderTokens(expansion, { ...ctx, expanded: true }, key)}</>
        )}
      </Fragment>
    )
  }
}

function renderTokens(tokens: AboutToken[], ctx: RenderCtx, prefix: string) {
  return tokens.map((tok, j) => renderToken(tok, ctx, `${prefix}-${j}`))
}

// Where the boxed panel lands within the keyword's paragraph:
//  • after  — the panel goes after token `index` (it sits at the end of a line)
//  • split  — token `index` is a pill/text that wraps across the keyword's line;
//             the panel goes at its wrap point (char `at`), splitting it in two.
type PanelPlacement =
  | { kind: 'after'; index: number }
  | { kind: 'split'; index: number; at: number }

// Given an element that starts on the keyword's line but wraps below it, find
// the character offset of the first word that falls on the next line (so we can
// split the wrapping pill exactly where Figma puts the box).
function wrapCharOffset(el: HTMLElement, lineTop: number, tol: number): number {
  const target = el.querySelector('[data-about-key]') ?? el
  const node = document
    .createTreeWalker(target, NodeFilter.SHOW_TEXT)
    .nextNode() as Text | null
  if (!node) return -1
  const text = node.textContent ?? ''
  const range = document.createRange()
  let cursor = 0
  for (const part of text.split(/(\s+)/)) {
    if (part.trim()) {
      range.setStart(node, cursor)
      range.setEnd(node, cursor + part.length)
      if (range.getBoundingClientRect().top - lineTop > tol) return cursor
    }
    cursor += part.length
  }
  return -1
}

// A paragraph that contains an open RED keyword panel. Mirrors the homepage:
// each top-level token gets a ref and the boxed panel opens inline on the
// keyword's visual line (not at the bottom of the paragraph). If a pill wraps
// across that line (e.g. "Carnegie Mellon University"), the panel is inserted at
// the wrap, splitting the pill in two as in Figma 187:2356.
function MeasuredParagraph({
  para,
  ctx,
  prefix,
  activeKeyword,
  panel,
}: {
  para: AboutToken[]
  ctx: RenderCtx
  prefix: string
  activeKeyword: string
  panel: React.ReactNode
}) {
  const refs = useRef<(HTMLElement | null)[]>([])
  const [placement, setPlacement] = useState<PanelPlacement | null>(null)

  const keywordIndex = para.findIndex(
    t => t.t === 'key' && t.text === activeKeyword,
  )

  useLayoutEffect(() => {
    if (keywordIndex < 0 || placement !== null) return
    const kEl = refs.current[keywordIndex]
    if (!kEl) return
    // Reference the keyword's LAST visual line: when the keyword itself wraps
    // (e.g. on mobile), trailing punctuation sits on that last line and must
    // stay attached — otherwise it's orphaned below the panel.
    const kLines = kEl.getClientRects()
    const kLine = kLines[kLines.length - 1] ?? kEl.getBoundingClientRect()
    const lineTop = kLine.top
    const tol = kLine.height / 2
    let last = keywordIndex
    for (let i = keywordIndex + 1; i < para.length; i++) {
      const el = refs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (r.top - lineTop >= tol) break // first element on the next line
      last = i
      const tok = para[i]
      // Element starts on the line but wraps below it → split it at the wrap.
      if (
        r.bottom - lineTop > kLine.height * 1.5 &&
        (tok.t === 'text' || tok.t === 'key')
      ) {
        const at = wrapCharOffset(el, lineTop, tol)
        if (at > 0) {
          setPlacement({ kind: 'split', index: i, at })
          return
        }
      }
    }
    setPlacement({ kind: 'after', index: last })
  }, [keywordIndex, placement, para])

  // Line breaks shift on resize — re-measure while the panel is open.
  useEffect(() => {
    const onResize = () => setPlacement(null)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className="mb-7">
      {para.map((tok, j) => {
        if (placement?.kind === 'split' && placement.index === j) {
          if (tok.t === 'key') {
            const part1 = tok.text.slice(0, placement.at).trim()
            const part2 = tok.text.slice(placement.at).trim()
            const expansion = aboutExpansions[tok.text]
            return (
              <Fragment key={j}>
                {renderKeyPill(tok, ctx, part1, `${prefix}-${j}-a`)}
                {panel}
                {renderKeyPill(tok, ctx, part2, `${prefix}-${j}-b`)}
                {tok.tone === 'gray' &&
                  ctx.open.has(tok.text) &&
                  expansion && (
                    <>
                      {' '}
                      {renderTokens(
                        expansion,
                        { ...ctx, expanded: true },
                        `${prefix}-${j}`,
                      )}
                    </>
                  )}
              </Fragment>
            )
          }
          if (tok.t === 'text') {
            const cls = ctx.expanded ? 'font-normal' : undefined
            return (
              <Fragment key={j}>
                <span className={cls}>{tok.text.slice(0, placement.at)}</span>
                {panel}
                <span className={cls}>{tok.text.slice(placement.at)}</span>
              </Fragment>
            )
          }
        }
        return (
          <Fragment key={j}>
            <span
              ref={el => {
                refs.current[j] = el
              }}
            >
              {renderToken(tok, ctx, `${prefix}-${j}`)}
            </span>
            {placement?.kind === 'after' && placement.index === j && panel}
          </Fragment>
        )
      })}
    </div>
  )
}

export default function AboutContent({
  className = '',
  logoSvgs,
}: {
  className?: string
  logoSvgs: Record<keyof typeof aboutLogos, string>
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [activePanel, setActivePanel] = useState<string | null>(null)

  // Accordion: clicking an open keyword collapses it (and its descendants);
  // clicking a closed one opens it and keeps only its ancestor chain, so any
  // sibling expansion at the same level disappears (Israel 06/17). Opening a
  // gray expansion also closes any open red box — only one thing open at a time.
  const toggleInline = (key: string) => {
    setActivePanel(null)
    setOpen(prev => {
      if (prev.has(key)) {
        const next = new Set(prev)
        next.delete(key)
        for (const d of descendantsOf(key)) next.delete(d)
        return next
      }
      const next = ancestorsOf(key)
      next.add(key)
      return next
    })
  }

  // Opening (or closing) a red box closes every open gray expansion, so a click
  // on any keyword leaves only the newly opened box/expansion showing.
  const openPanel = (key: string | null) => {
    setOpen(new Set())
    setActivePanel(key)
  }

  // A click outside any keyword/panel — or pressing Escape — closes all open
  // expansions + the box.
  useEffect(() => {
    if (open.size === 0 && !activePanel) return
    const closeAll = () => {
      setOpen(new Set())
      setActivePanel(null)
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (target?.closest?.('[data-about-key], [data-about-panel]')) return
      closeAll()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, activePanel])

  const ctx: RenderCtx = {
    open,
    toggleInline,
    activePanel,
    setActivePanel: openPanel,
    logoSvgs,
  }

  return (
    <section
      id="about"
      className={`font-serif text-[28px] font-bold leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-normal lg:tracking-[0.5px] ${className}`}
    >
      {aboutParagraphs.map((para, i) => {
        // A red keyword in this paragraph whose boxed panel is open.
        const panelKey =
          activePanel &&
          para.some(
            t =>
              t.t === 'key' && t.text === activePanel && t.tone !== 'gray',
          )
            ? activePanel
            : null
        if (panelKey)
          return (
            <MeasuredParagraph
              key={`${i}-${panelKey}`}
              para={para}
              ctx={ctx}
              prefix={`p${i}`}
              activeKeyword={panelKey}
              panel={
                <div data-about-panel>
                  {panelKey === TESTIMONIAL_KEY ? (
                    <TestimonialsPanel onClose={() => setActivePanel(null)} />
                  ) : (
                    <AboutPanel
                      keyword={panelKey}
                      onClose={() => setActivePanel(null)}
                    />
                  )}
                </div>
              }
            />
          )
        return (
          <p key={i} className="mb-7">
            {renderTokens(para, ctx, `p${i}`)}
          </p>
        )
      })}
    </section>
  )
}
