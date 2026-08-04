'use client'

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ArrowTrigger,
  CYCLE_CHIP,
  ExternalTextLink,
  NavPill,
  POPUP_LINK,
  expandPillClass,
} from '@/components/InlineToken'
import TestimonialsModal from '@/components/TestimonialsModal'
import type { AboutToken, Testimonial } from '@/lib/content'
import {
  aboutExpansions,
  aboutLinks,
  aboutLogos,
  aboutPanels,
  aboutParagraphs,
  testimonials as fallbackTestimonials,
} from '@/lib/content'

const TESTIMONIAL_KEY = 'what people are saying'

// --- Inline-expansion accordion ---------------------------------------------
// Gray keywords expand inline, and some expansions contain nested gray keywords.
// We allow only one expansion open per level: opening a keyword collapses its
// siblings but keeps its ancestor chain open (so nested keywords stay visible).

// keyword -> gray keywords nested directly inside its expansion. Derived from
// whichever expansion set is in play (Sanity's, or the in-code fallback), so
// the nesting rules follow the content rather than being fixed at build time.
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
          className="absolute right-3 top-2 z-10 font-grotesk text-[30px] leading-none text-black/70 transition-colors hover:text-black"
        >
          ×
        </button>
        <p className="pr-6 font-grotesk text-[20px] font-bold lowercase leading-[1.35] tracking-wider">
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
            className="font-grotesk text-[16px] font-medium leading-[1.35] tracking-[0.06em]"
          >
            {b}
          </p>
        ))}
        {panel.awards && (
          <div className="flex flex-wrap items-center gap-x-[19px] gap-y-3 pt-1">
            <span className="font-grotesk text-[16px] font-medium tracking-[0.06em]">
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
          <NavPill href={panel.cta.href} className="font-grotesk text-[16px] font-medium">
            {panel.cta.label}
          </NavPill>
        )}
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
  const onClick = () => {
    if (opensPanel) ctx.setActivePanel(panelOpen ? null : tok.text)
    else ctx.toggleInline(tok.text)
  }
  // Appearance follows the shared vocabulary (see InlineToken): a pill reveals
  // narrative in place, while the underline means a popup opens.
  const className = isPill
    ? expandPillClass(isActive)
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
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
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
    if (tok.t === 'text')
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
            <span className="animate-[panel-in_0.35s_ease-out]">
              {renderTokens(expansion, { ...ctx, expanded: true }, key)}
            </span>
          </>
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
                      <span className="animate-[panel-in_0.35s_ease-out]">
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

export default function AboutContent({
  className = '',
  logoSvgs,
  testimonials = fallbackTestimonials,
  paragraphs = aboutParagraphs,
  expansions = aboutExpansions,
  links = aboutLinks.map(l => ({ label: l.label, href: l.href })),
}: {
  className?: string
  logoSvgs: Record<keyof typeof aboutLogos, string>
  testimonials?: Testimonial[]
  // Content comes from Sanity (see lib/aboutFromSanity). The in-code copy is
  // the default so the page still renders if the dataset is empty.
  paragraphs?: AboutToken[][]
  expansions?: Record<string, AboutToken[]>
  links?: { label: string; href: string }[]
}) {
  const [open, setOpen] = useState<Set<string>>(() => new Set())
  const [activePanel, setActivePanel] = useState<string | null>(null)

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
    expansions,
  }

  return (
    <section
      id="about"
      className={`font-grotesk text-[28px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
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

      {/* Footer row (Figma 807:19215–19234): Testimonials + CV / Resume /
          LinkedIn / Email. Fas 07/30 — always expose Testimonials here (same
          style as the other links) so readers don't have to find the in-bio
          "what people are saying" keyword. Opens the same modal.

          Figma fits four links on one line at body size; the fifth (and the ↗
          arrows) no longer fit, so from `sm` up the row is held on one line and
          sized off the column width instead — the five labels plus their gaps
          measure ~25em (more at `md`, where the tracking is wider), so 3.7% of
          the column holds them inside it at every width, capped at 36px. Phones
          keep body size and wrap, as the mobile frame (455:1897) does. */}
      <div className="@container/about-links mt-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-inherit sm:flex-nowrap sm:gap-[0.4em] sm:text-[min(3.7cqw,36px)]">
          {testimonials.length > 0 && (
            <ArrowTrigger
              data-about-key
              onClick={() => openPanel(TESTIMONIAL_KEY)}
              className="shrink-0"
            >
              Testimonials
            </ArrowTrigger>
          )}
          {links.map(link => (
            <ExternalTextLink
              key={link.label}
              href={link.href}
              className="shrink-0"
            >
              {link.label}
            </ExternalTextLink>
          ))}
        </div>
      </div>
    </section>
  )
}

