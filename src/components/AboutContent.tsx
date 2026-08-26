'use client'

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  CYCLE_CHIP,
  EXTERNAL_LINK,
  ExternalArrow,
  normalizeHref,
  NavPill,
  POPUP_LINK,
  expandPillClass,
} from '@/components/InlineToken'
import TestimonialsModal from '@/components/TestimonialsModal'
import PasswordGate from '@/components/PasswordGate'
import { useAccessGate } from '@/hooks/useAccessGate'
import type { AboutLink } from '@/lib/aboutFromSanity'
import type { AboutToken, Testimonial } from '@/lib/content'
import { aboutLogos } from '@/lib/content'
import { hiResUrl } from '@/sanity/image'
import { textAfterExpandedKey } from '@/lib/aboutExpansionNormalize'

const TESTIMONIAL_KEY = 'what people are saying'
const TESTIMONIAL_LINK =
  'cursor-pointer text-accent text-shadow-token transition-opacity duration-200 hover:opacity-70'

// --- Inline-expansion accordion ---------------------------------------------
// Gray keywords expand inline, and some expansions contain nested gray keywords.
// We allow only one expansion open per level: opening a keyword collapses its
// siblings but keeps its ancestor chain open (so nested keywords stay visible).

// keyword -> gray keywords nested directly inside its expansion. Derived from
// Sanity expansions, so nesting rules follow Studio content at runtime.
type KeywordTree = Record<string, string[]>

function keywordTree(expansions: Record<string, AboutToken[]>): KeywordTree {
  return Object.fromEntries(
    Object.entries(expansions).map(([k, toks]) => [
      k,
      toks.flatMap(t => (t.t === 'key' ? [t.text] : [])),
    ]),
  )
}

function descendantsOf(
  tree: KeywordTree,
  key: string,
  acc = new Set<string>(),
): Set<string> {
  for (const child of tree[key] ?? []) {
    if (!acc.has(child)) {
      acc.add(child)
      descendantsOf(tree, child, acc)
    }
  }
  return acc
}

function ancestorsOf(
  tree: KeywordTree,
  key: string,
  seen = new Set<string>(),
): Set<string> {
  const result = new Set<string>()
  for (const [parent, children] of Object.entries(tree)) {
    if (children.includes(key) && !seen.has(parent)) {
      seen.add(parent)
      result.add(parent)
      for (const a of ancestorsOf(tree, parent, seen)) result.add(a)
    }
  }
  return result
}

// Red-keyword boxed panels used to load body from lib/content aboutPanels.
// No in-code seed — return null until panels are modeled in Sanity.
// Testimonials still use TestimonialsModal separately.
function AboutPanel(_props: { keyword: string; onClose: () => void }) {
  return null
}

function LogoChip({ svg }: { svg: string }) {
  const [hot, setHot] = useState(false)
  return (
    <span
      data-cursor="hover"
      data-hot={hot ? '' : undefined}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className="logo-chip relative z-0 mx-1 inline-flex h-6 translate-y-[-0.1em] items-center justify-center overflow-visible align-middle hover:z-40"
    >
      <span
        className="inline-flex h-full items-center [&>svg]:h-full [&>svg]:w-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span
        aria-hidden
        className="logo-chip-preview [&>svg]:h-auto [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </span>
  )
}

// Inline personal photo — small rounded thumbnail that pops up on hover.
function PhotoChip({ src, alt }: { src: string; alt: string }) {
  const imgSrc = hiResUrl(src, 1200) ?? src

  return (
    <span
      data-cursor="hover"
      className="group relative mx-1 inline-block h-[1.25em] w-[1.4em] translate-y-[-0.3em] overflow-hidden rounded-md align-middle shadow-[0_1px_9px_2px_rgba(0,0,0,0.25)] transition-transform duration-200 ease-out will-change-transform hover:z-30 hover:scale-[4]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- small static photo */}
      <img src={imgSrc} alt={alt} className="h-full w-full object-cover" />
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
    // Inline + box-decoration-clone so a long value wraps into SEPARATE black
    // boxes (one per line) — e.g. ">/~ Enterprise Securities" / "& Analytics" —
    // instead of two cramped lines inside one box (Israel 06/26). A span (not a
    // <button>) is required: a button is an atomic inline box and can't break
    // across lines. The line-height supplies the gap between the wrapped boxes.
    <span
      role="button"
      tabIndex={0}
      data-cursor="hover"
      onClick={() => setIdx(i => (i + 1) % words.length)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIdx(i => (i + 1) % words.length)
        }
      }}
      className={CYCLE_CHIP}
      aria-label={`${shown}. Click to cycle.`}
    >
      <span className="mr-[0.3em]">{'>/~'}</span>
      {shown}
      <span className="ml-0.5 inline-block h-[0.95em] w-px translate-y-[0.12em] animate-[caret-blink_1s_steps(1,end)_infinite] bg-bg" />
    </span>
  )
}

type RenderCtx = {
  open: Set<string> // gray keywords expanded inline
  toggleInline: (key: string) => void
  activePanel: string | null // red keyword whose boxed panel is open
  setActivePanel: (key: string | null) => void
  logoSvgs: Record<keyof typeof aboutLogos, string> // inline SVG markup per logo
  expansions: Record<string, AboutToken[]> // keyword -> reveal copy
  expanded?: boolean // true while rendering an inline gray-keyword expansion
}

// Renders a single keyword pill. `displayText` may be a slice of the token's
// text — used when a wrapping pill is split around an inline panel (e.g.
// "Carnegie Mellon" / "University") — while identity + active state still come
// from `tok.text`.
// Behaviour vs appearance are independent. `tone` drives appearance (grey pill
// vs red text); `opens` drives behaviour (inline expansion vs boxed panel).
// Default: grey → inline, red → panel — so existing tokens are unchanged.
function keyOpensPanel(tok: Extract<AboutToken, { t: 'key' }>) {
  return tok.opens ? tok.opens === 'panel' : tok.tone !== 'gray'
}

function renderKeyPill(
  tok: Extract<AboutToken, { t: 'key' }>,
  ctx: RenderCtx,
  displayText: string,
  key: string,
) {
  // A grey pill reveals narrative; red text on a pill is reserved for
  // navigation, which a keyword never does, so `gray-red` renders as a plain
  // grey pill too.
  const isPill = tok.tone === 'gray' || tok.tone === 'gray-red'
  const opensPanel = keyOpensPanel(tok) // behaviour
  const inlineOpen = ctx.open.has(tok.text)
  const panelOpen = ctx.activePanel === tok.text
  const isActive = opensPanel ? panelOpen : inlineOpen
  const onClick = (el?: HTMLElement | null) => {
    const opening = !inlineOpen
    if (opensPanel) ctx.setActivePanel(panelOpen ? null : tok.text)
    else ctx.toggleInline(tok.text)
    if (
      opening &&
      !opensPanel &&
      el &&
      typeof window !== 'undefined' &&
      window.innerWidth < 1024
    ) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      })
    }
  }
  // Appearance follows the shared vocabulary (see InlineToken): a pill reveals
  // narrative in place, while the underline means a popup opens.
  const className = isPill
    ? expandPillClass(isActive)
    : tok.text === TESTIMONIAL_KEY
      ? `box-decoration-clone ${TESTIMONIAL_LINK}`
      : `box-decoration-clone ${POPUP_LINK}`
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
      onClick={e => onClick(e.currentTarget)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(e.currentTarget)
        }
      }}
      className={className}
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
    if (tok.t === "text")
      return (
        <span key={key} className={ctx.expanded ? 'font-normal' : undefined}>
          {tok.text}
        </span>
      )
    if (tok.t === 'typer') return <TypingTag key={key} words={tok.words} />
    // Gray rounded pill, red text — navigates to an internal page (Figma
    // "Component Interaction" 823:70182). box-decoration-clone keeps the rounded
    // pill intact if it wraps across lines.
    if (tok.t === 'link')
      return (
        <NavPill key={key} href={tok.href}>
          {tok.text}
        </NavPill>
      )
    if (tok.t === 'logo')
      return <LogoChip key={key} svg={ctx.logoSvgs[tok.name]} />
    if (tok.t === 'photo')
      return <PhotoChip key={key} src={tok.src} alt={tok.alt} />
    // The black >/~ chip means "click me to cycle" — a static term isn't
    // interactive, so it reads as plain copy rather than borrowing the chip.
    if (tok.t === 'term') return <span key={key}>{tok.text}</span>

    const inlineOpen = ctx.open.has(tok.text)
    const expansion = ctx.expansions[tok.text]

    return (
      <Fragment key={key}>
        {renderKeyPill(tok, ctx, tok.text, `${key}-pill`)}
        {/* inline-expansion keyword: continuation in black/normal (nested keys
            ok). Panel-opening keys (even grey ones) render their box instead. */}
        {!keyOpensPanel(tok) && inlineOpen && expansion && (
          <>
            {' '}
            {/* Fade/"load" the continuation in rather than snapping it open
                (Israel 06/25: "it shouldn't just drop down… it loads, then
                comes clear"). */}
            <span
              data-about-expansion
              className="animate-[panel-in_0.35s_ease-out]"
            >
              {renderTokens(expansion, { ...ctx, expanded: true }, key)}
            </span>
          </>
        )}
      </Fragment>
    )
  }
}

function renderTokens(tokens: AboutToken[], ctx: RenderCtx, prefix: string) {
  const out: ReactNode[] = []
  const textClass = ctx.expanded ? 'font-normal' : undefined
  for (let j = 0; j < tokens.length; j++) {
    const tok = tokens[j]
    const next = tokens[j + 1]
    if (tok.t === 'text' && next?.t === 'photo') {
      const m = tok.text.match(/^(.*?)(\S+)(\s*)$/)
      if (m) {
        const [, lead, word, sp] = m
        const after = tokens[j + 2]
        let punct = ''
        let rest = ''
        let skip = 1
        if (after?.t === 'text') {
          const pm = after.text.match(/^([.,;:!?]+)([\s\S]*)$/)
          if (pm) {
            punct = pm[1]
            rest = pm[2]
            skip = 2
          }
        }
        if (lead) {
          out.push(
            <span key={`${prefix}-${j}-lead`} className={textClass}>
              {lead}
            </span>,
          )
        }
        out.push(
          <span key={`${prefix}-${j}-photo`} className="whitespace-nowrap">
            {word}
            {sp}
            <PhotoChip src={next.src} alt={next.alt} />
            {punct}
          </span>,
        )
        if (rest) {
          out.push(
            <span key={`${prefix}-${j}-rest`} className={textClass}>
              {rest}
            </span>,
          )
        }
        j += skip
        continue
      }
    }
    if (tok.t === 'text' && j > 0) {
      const prev = tokens[j - 1]
      if (
        prev.t === 'key' &&
        ctx.open.has(prev.text) &&
        !keyOpensPanel(prev) &&
        ctx.expansions[prev.text]
      ) {
        const trimmed = textAfterExpandedKey(
          tok.text,
          ctx.expansions[prev.text],
        )
        if (trimmed === null) continue
        if (trimmed !== tok.text) {
          out.push(
            <span key={`${prefix}-${j}`} className={textClass}>
              {trimmed}
            </span>,
          )
          continue
        }
      }
    }
    out.push(renderToken(tok, ctx, `${prefix}-${j}`))
  }
  return out
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
            const expansion = ctx.expansions[tok.text]
            return (
              <Fragment key={j}>
                {renderKeyPill(tok, ctx, part1, `${prefix}-${j}-a`)}
                {panel}
                {renderKeyPill(tok, ctx, part2, `${prefix}-${j}-b`)}
                {!keyOpensPanel(tok) &&
                  ctx.open.has(tok.text) &&
                  expansion && (
                    <>
                      {' '}
                      <span
                        data-about-expansion
                        className="animate-[panel-in_0.35s_ease-out]"
                      >
                        {renderTokens(
                          expansion,
                          { ...ctx, expanded: true },
                          `${prefix}-${j}`,
                        )}
                      </span>
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

/** Figma 2562:36424 / 807:19218 — red ↗ row on #e3e3db pills. */
const ABOUT_FOOTER_PILL = `inline-flex h-[55px] shrink-0 items-center bg-[#e3e3db] px-4 sm:px-5 ${EXTERNAL_LINK}`

function AboutFooterPillLabel({ children }: { children: ReactNode }) {
  return (
    <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
      {children}
    </span>
  )
}

function AboutFooterLink({
  href,
  children,
  showArrow = true,
}: {
  href: string
  children: ReactNode
  showArrow?: boolean
}) {
  const resolved = normalizeHref(href)
  const sameTab =
    resolved.startsWith('mailto:') || resolved.startsWith('tel:')
  return (
    <a
      href={resolved}
      target={sameTab ? undefined : '_blank'}
      rel={sameTab ? undefined : 'noopener noreferrer'}
      data-cursor="hover"
      className={ABOUT_FOOTER_PILL}
    >
      <AboutFooterPillLabel>{children}</AboutFooterPillLabel>
      {showArrow ? <ExternalArrow /> : null}
    </a>
  )
}

function AboutFooterButton({
  children,
  onClick,
  showArrow = true,
}: {
  children: ReactNode
  onClick: () => void
  showArrow?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      className={ABOUT_FOOTER_PILL}
    >
      <AboutFooterPillLabel>{children}</AboutFooterPillLabel>
      {showArrow ? <ExternalArrow /> : null}
    </button>
  )
}

export default function AboutContent({
  className = '',
  logoSvgs,
  testimonials = [],
  headline = '',
  intro = [],
  paragraphs = [],
  expansions = {},
  links = [],
}: {
  className?: string
  logoSvgs: Record<keyof typeof aboutLogos, string>
  testimonials?: Testimonial[]
  headline?: string
  intro?: AboutToken[][]
  /** Bio / expansions / links from Sanity only. */
  paragraphs?: AboutToken[][]
  expansions?: Record<string, AboutToken[]>
  links?: AboutLink[]
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const { gateOpen, requestAccess, closeGate, onGateSuccess } = useAccessGate()

  const openProtectedHref = (href: string) => {
    let resolved = href.trim()
    if (
      !/^[a-z][a-z0-9+.-]*:/i.test(resolved) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolved)
    ) {
      resolved = `mailto:${resolved}`
    }
    const sameTab =
      resolved.startsWith('mailto:') || resolved.startsWith('tel:')
    if (sameTab) {
      window.location.href = resolved
      return
    }
    window.open(resolved, '_blank', 'noopener,noreferrer')
  }

  const tree = useMemo(() => keywordTree(expansions), [expansions])

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
        for (const d of descendantsOf(tree, key)) next.delete(d)
        return next
      }
      const next = ancestorsOf(tree, key)
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
  // expansions + the box. Use `click` (not pointerdown): on mobile a scroll
  // gesture starts with touch/pointerdown on the prose, which was collapsing
  // the expansion before the user could read it (Fas 08/12 / 08/13).
  useEffect(() => {
    if (open.size === 0 && !activePanel) return
    const closeAll = () => {
      setOpen(new Set())
      setActivePanel(null)
    }
    const onOutside = (e: MouseEvent) => {
      const target = e.target as Element | null
      if (
        target?.closest?.(
          '[data-about-key], [data-about-panel], [data-about-expansion]',
        )
      )
        return
      closeAll()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll()
    }
    document.addEventListener('click', onOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, activePanel])

  const ctx: RenderCtx = {
    open,
    toggleInline,
    activePanel,
    setActivePanel: openPanel,
    logoSvgs,
    expansions,
  }

  return (
    <section
      id="about"
      className={`font-grotesk text-[28px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[32px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
      {/* Headline 24px Medium + intro 32px Medium (Fas 08/25 — Emily Campbell). */}
      {(headline || intro.length > 0) && (
        <div className="mb-7">
          {headline ? (
            <h2 className="mb-0 font-grotesk text-[18px] font-medium leading-[1.6] tracking-[0.5px] md:text-[20px] lg:text-[24px]">
              {headline}
            </h2>
          ) : null}
          {intro.map((para, i) => (
            <p key={`intro-${i}`} className="mb-0">
              {renderTokens(para, ctx, `intro${i}`)}
            </p>
          ))}
        </div>
      )}
      {paragraphs.map((para, i) => {
        // A red keyword in this paragraph whose boxed panel expands inline.
        // "what people are saying" is excluded — it opens a centred modal
        // pop-up instead (rendered below), not an inline box (Israel 06/23).
        const panelKey =
          activePanel &&
          activePanel !== TESTIMONIAL_KEY &&
          para.some(
            t =>
              t.t === 'key' && t.text === activePanel && keyOpensPanel(t),
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
                  <AboutPanel
                    keyword={panelKey}
                    onClose={() => setActivePanel(null)}
                  />
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

      {/* "what people are saying" → centred modal pop-up (Israel 06/23). */}
      {activePanel === TESTIMONIAL_KEY && (
        <TestimonialsModal
          testimonials={testimonials}
          section="About"
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Footer row: CV / Resume / LinkedIn / Email.
          Fas 08/09 — drop the extra Testimonials↗ link; readers still open
          the modal via the in-bio “what people are saying” keyword. */}
      {/* Figma 2562:36424 — CV / Resume / LinkedIn / Email on #e3e3db pills. */}
      <div className="@container/about-links mt-8">
        <div className="flex flex-wrap items-center gap-2 text-inherit sm:gap-3 sm:text-[min(3.7cqw,32px)]">
          {links.map(link =>
            link.passwordProtected ? (
              <AboutFooterButton
                key={link.label}
                onClick={() =>
                  requestAccess(() => openProtectedHref(link.href))
                }
              >
                {link.label}
              </AboutFooterButton>
            ) : (
              <AboutFooterLink key={link.label} href={link.href}>
                {link.label}
              </AboutFooterLink>
            ),
          )}
        </div>
      </div>

      <PasswordGate
        open={gateOpen}
        message="Please enter your password."
        onClose={closeGate}
        onSuccess={onGateSuccess}
      />
    </section>
  )
}

