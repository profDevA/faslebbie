'use client'

import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import PopupShell from '@/components/PopupShell'
import { ExternalArrow } from '@/components/InlineToken'
import type { PortableTextBlock } from '@portabletext/types'

import type {
  AccordionEntry,
  Appearance,
  DeviceTab,
  GalleryImage,
  MediaItem,
  MotionRow,
  SanityColor,
  Section,
  StatItem,
  Study,
  StudyCard,
  HighlightCell,
  CoreExperienceScreen,
} from '@/sanity/types'
import {
  REFLECTION_DEFAULTS,
  OVERVIEW_BAND_BACKGROUND,
  OVERVIEW_COLUMN_GAP,
  CORE_EXPERIENCE_POPUP_DEFAULTS,
  CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS,
  CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS,
  HIGHLIGHT_REEL_GRID_DEFAULTS,
  HIGHLIGHT_REEL_SINGLE_DEFAULTS,
  HIGHLIGHT_REEL_COMPOSITE_DEFAULTS,
  MOTION_FEATURED_BAND_DEFAULTS,
  MOTION_ROW_DEFAULTS,
  MOTION_SHOWCASE_BAND_DEFAULTS,
  SHOWCASE_ARTIFACT_DEFAULTS,
  STATS_BAND_DEFAULTS,
} from '@/lib/caseStudyDefaults'
import {
  gapDefault,
  padDefaults,
  PAGE_PROSE_PAD,
  proseGroupPadStyle,
  sectionGapStyle,
  sectionHorizontalPadStyle,
  sectionInnerGapStyle,
  sectionPadStyle,
  overviewCopyPadStyle,
  overviewMediaPadStyle,
  resolveSpacingPx,
} from '@/lib/appearanceSpacing'

/**
 * Sanity-driven case-study renderer. Iterates `project.sections` (a page
 * builder) and renders each block, honoring the shared `appearance` controls
 * (background / text colour, padding, alignment, width). Visual language
 * (labels, accordions, count-up stats, cover-flow slider, device tabs,
 * load-more grids, "Next up" band) is carried over from the previous
 * hard-coded template.
 */

const RED = '#e06164'
const SAGE = '#99B29D66'
const TEAL = '#52747e'
const TILE = '#4f6b76'

// ── appearance helpers ───────────────────────────────────────────────────────
function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  const full =
    h.length === 3
      ? h
          .split('')
          .map(c => c + c)
          .join('')
      : h
  const int = parseInt(full.slice(0, 6), 16)
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function colorToCss(c?: SanityColor): string | undefined {
  if (!c?.hex) return undefined
  const a = c.alpha ?? 1
  if (a >= 1) return c.hex
  const { r, g, b } = hexToRgb(c.hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const MAXW = {
  narrow: 'max-w-160',
  default: 'max-w-285',
  wide: 'max-w-[1440px]',
  full: 'max-w-none',
}
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }

type CsVariant = 'page' | 'overlay'
const CsVariantContext = createContext<CsVariant>('overlay')
function useCsVariant() {
  return useContext(CsVariantContext)
}

/** Full-page desktop: one band = scrollport + bleed (see `--cs-band-bleed` in globals). */
function pageScreenBandClass(page: boolean) {
  return page
    ? 'lg:h-[calc(100cqh+var(--cs-band-bleed))] lg:min-h-[calc(100cqh+var(--cs-band-bleed))] lg:flex lg:flex-col lg:justify-center'
    : ''
}
function pageBandHeightClass(page: boolean) {
  return page
    ? 'lg:h-[calc(100cqh+var(--cs-band-bleed))] lg:max-h-[calc(100cqh+var(--cs-band-bleed))]'
    : ''
}
function pageScreenBandInnerClass(page: boolean) {
  return page ? 'flex w-full flex-1 flex-col justify-center' : ''
}

/** Full-page shell (Fas Aug 2026) — wide + responsive; overlay keeps popup widths. */
function csShell(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `mx-auto w-full max-w-[min(1400px,calc(100%-2.5rem))] px-5 sm:px-8 lg:px-12 ${extra}`
  }
  return `mx-auto w-full max-w-285 px-6 sm:px-10 xl:px-[3.5vw] ${extra}`
}

function csProseInner(
  v: CsVariant,
  align: 'left' | 'center' | 'right',
  widthKey: keyof typeof MAXW,
) {
  if (v === 'page') {
    if (widthKey === 'wide') return 'mx-auto w-full max-w-[min(1280px,100%)]'
    if (widthKey === 'full') return 'mx-auto w-full max-w-none'
    if (align === 'center') return 'mx-auto w-full max-w-[min(1000px,100%)]'
    return 'mx-auto w-full max-w-[min(1000px,100%)]'
  }
  return `mx-auto ${align === 'center' ? 'lg:max-w-[60%]' : MAXW[widthKey]}`
}

function csBodyText(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `text-[17px] font-normal leading-[1.65] lg:text-[18px] ${extra}`
  }
  return `text-[18px] font-normal leading-[1.6] xl:text-[1.25vw] ${extra}`
}

function csSectionTitle(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `font-normal capitalize leading-tight text-[20px] lg:text-[24px] ${extra}`
  }
  return `font-normal capitalize leading-tight text-[24px] xl:text-[1.5vw] ${extra}`
}

/** Impact / stats band heading — Israel QA: slightly bolder than other section titles. */
function csImpactTitle(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `font-medium capitalize leading-tight text-[20px] lg:text-[24px] ${extra}`
  }
  return `font-medium capitalize leading-tight text-[24px] xl:text-[1.5vw] ${extra}`
}

function csBandGutter(v: CsVariant, extra = '') {
  if (v === 'page') return `px-5 sm:px-8 lg:px-12 ${extra}`
  return `px-6 sm:px-10 xl:px-[3.5vw] ${extra}`
}

function csPagerShell(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `flex w-full items-center justify-between ${extra}`
  }
  return `mx-auto flex w-full max-w-225 items-center justify-between px-6 ${extra}`
}

/** Figma 2110:41713 — Reflection band defaults live in caseStudyDefaults.ts */
function csReflectionTitle(v: CsVariant) {
  if (v === 'page') {
    return 'font-grotesk text-[20px] font-normal capitalize leading-tight lg:text-[24px]'
  }
  return 'font-grotesk text-[24px] font-normal capitalize leading-tight xl:text-[1.5vw]'
}

function csReflectionBody(v: CsVariant) {
  if (v === 'page') {
    return 'font-grotesk text-[17px] font-light leading-[1.6] lg:text-[18px]'
  }
  return 'font-grotesk text-[18px] font-light leading-[1.6] xl:text-[1.25vw]'
}

function bandStyle(a?: Appearance, defaultBg?: string, defaultLight?: boolean) {
  const style: React.CSSProperties = {}
  const bg = colorToCss(a?.backgroundColor) ?? defaultBg
  if (bg) style.backgroundColor = bg
  const tc = colorToCss(a?.textColor) ?? (defaultLight ? '#ffffff' : undefined)
  if (tc) style.color = tc
  return style
}

function sectionStyle(
  a: Appearance | undefined,
  page: boolean,
  padLevel: 'md' | 'lg',
  defaultBg?: string,
  defaultLight?: boolean,
) {
  return {
    ...bandStyle(a, defaultBg, defaultLight),
    ...sectionPadStyle(a, padDefaults(padLevel, page), page),
  }
}

function flexSectionStyle(
  a: Appearance | undefined,
  page: boolean,
  padLevel: 'md' | 'lg',
  defaultBg?: string,
  defaultLight?: boolean,
) {
  return {
    ...sectionStyle(a, page, padLevel, defaultBg, defaultLight),
    ...sectionGapStyle(a, gapDefault(padLevel, page), page),
  }
}

/** True when a band should treat its text as light (for default label colour). */
function isLight(a?: Appearance, defaultLight?: boolean) {
  if (a?.textColor?.hex) {
    const { r, g, b } = hexToRgb(a.textColor.hex)
    return (r * 299 + g * 587 + b * 114) / 1000 > 180
  }
  const bg = a?.backgroundColor
  if (bg?.hex && (bg.alpha ?? 1) > 0.5) {
    const { r, g, b } = hexToRgb(bg.hex)
    return (r * 299 + g * 587 + b * 114) / 1000 < 140
  }
  return !!defaultLight
}

/** Render light/white copy — respects explicit textColor and dark band backgrounds. */
function bandUsesLightText(a?: Appearance, defaultLight?: boolean) {
  if (a?.textColor?.hex) {
    const { r, g, b } = hexToRgb(a.textColor.hex)
    return (r * 299 + g * 587 + b * 114) / 1000 > 180
  }
  return isLight(a, defaultLight)
}

/** Figma featured-band caption inset — Census mobile 2229:30254, desktop 2229:30434. */
function featuredCaptionInset(side: 'left' | 'right') {
  return side === 'right'
    ? { marginLeft: 'auto' as const, maxWidth: 'min(445px, 42%)' }
    : { marginLeft: 'max(24px, calc(50% - 220px))' as const, maxWidth: 'min(445px, 90%)' }
}

// ── Portable Text ────────────────────────────────────────────────────────────
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

function Prose({
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

// ── main component ────────────────────────────────────────────────────────────
export default function CaseStudyView({
  project: p,
  prev,
  next,
  variant,
  onClose,
  onNavigate,
}: {
  project: Study
  prev: StudyCard
  next: StudyCard
  variant: 'page' | 'overlay'
  onClose?: () => void
  onNavigate?: (slug: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // In overlay mode the scroller lives inside PopupShell's portal, which only
  // mounts on a later render — track the node in state so the effects below
  // re-run once it exists.
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const setScrollNode = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el
    setScroller(el)
  }, [])
  const overlay = variant === 'overlay'

  useEffect(() => {
    if (!overlay) return
    scroller?.scrollTo({ top: 0 })
  }, [overlay, scroller, p.slug])

  // Scroll-reveal: tag each <section> once it enters view.
  useEffect(() => {
    const root = scroller
    if (!root) return
    const sections = Array.from(root.querySelectorAll(':scope > section'))
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach(s => s.classList.add('cs-active'))
      return
    }
    const pageInternal =
      !overlay && window.matchMedia('(min-width: 1024px)').matches
    const useRoot = overlay || pageInternal
    const reveal = (s: Element) => s.classList.add('cs-active')
    const io = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target)
            io.unobserve(entry.target)
          }
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -10% 0px',
        root: useRoot ? root : null,
      },
    )
    sections.forEach(s => io.observe(s))

    const target: HTMLElement | Window = useRoot ? root : window
    const onScroll = () => {
      const vh = useRoot ? root.clientHeight : window.innerHeight
      const rootTop = useRoot ? root.getBoundingClientRect().top : 0
      for (const s of sections) {
        if (s.classList.contains('cs-active')) continue
        const top = s.getBoundingClientRect().top - rootTop
        if (top < vh * 0.9) reveal(s)
      }
    }
    target.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      io.disconnect()
      target.removeEventListener('scroll', onScroll)
    }
  }, [p.slug, overlay, scroller])

  const goTo = (slug: string) => (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(slug)
    }
  }

  // Previous / Next pager — the shared popup footer in overlay mode, a sticky
  // bar of its own on the standalone route.
  const pager = (
    <div
      className={`${csPagerShell(variant)} reckless-prose font-normal ${variant === 'page' ? 'text-[15px]' : 'text-[16px] lg:text-[17px]'}`}
      style={{ color: RED }}
    >
      <Link
        href={`/casestudies/${prev.slug}`}
        onClick={goTo(prev.slug)}
        data-cursor="hover"
        className="transition-opacity hover:opacity-70"
      >
        &lt; Previous
      </Link>
      <Link
        href={`/casestudies/${next.slug}`}
        onClick={goTo(next.slug)}
        data-cursor="hover"
        className="transition-opacity hover:opacity-70"
      >
        Next &gt;
      </Link>
    </div>
  )

  const bands = (
    <>
      {groupSections(p.sections ?? []).map(group =>
        group.length > 1 ? (
          <ProseGroupBlock
            key={group[0]._key}
            sections={group as (Of<'proseSection'> | Of<'bulletSection'>)[]}
          />
        ) : (
          <SectionBlock
            key={group[0]._key}
            section={group[0]}
            project={p}
            scrollRoot={scrollRef}
          />
        ),
      )}

      {p.fullCaseStudyPdfUrl &&
      !(p.sections ?? []).some(s => s._type === 'reflectionSection') ? (
        <FullCaseStudyPdfLink
          url={p.fullCaseStudyPdfUrl}
          label={p.fullCaseStudyLabel?.trim() || 'Full Case Study'}
          intro={p.fullCaseStudyIntro?.trim()}
        />
      ) : null}
    </>
  )

  const inner = (
    <CsVariantContext.Provider value={variant}>
      <>
      {/* Overlay mode gets the shared popup header instead. */}
      {!overlay && (
        <div className="sticky top-0 z-50 shrink-0 border-b border-black/15 bg-white reckless-prose lg:static">
          <div className="flex h-14 w-full shrink-0 items-center justify-between gap-4 px-5 sm:h-16 sm:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2 text-[15px] font-normal lg:text-[16px]"
          >
            <Link
              href="/casestudies"
              data-cursor="hover"
              className="text-black/55 transition-colors hover:text-black"
            >
              Case Studies
            </Link>
            <span aria-hidden className="text-black/35">
              /
            </span>
            <span aria-current="page" className="underline underline-offset-4">
              {p.name}
            </span>
          </nav>
          <Link
            href="/casestudies"
            aria-label="Close"
            data-cursor="hover"
            className="shrink-0 text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ×
          </Link>
          </div>
        </div>
      )}

      {overlay ? (
        bands
      ) : (
        <div ref={setScrollNode} className="cs-page-bands">
          {bands}
        </div>
      )}

      {!overlay && (
        <div className="sticky bottom-0 z-50 flex h-12 shrink-0 items-center border-t border-black/10 bg-white lg:static">
          <div className={`w-full ${csShell(variant)}`}>{pager}</div>
        </div>
      )}
      </>
    </CsVariantContext.Provider>
  )

  if (overlay) {
    return (
      <PopupShell
        onClose={onClose ?? (() => {})}
        label={p.name}
        crumbs={[{ label: 'Case Studies', href: '/casestudies', hideOnMobile: true }, { label: p.name }]}
        bodyRef={setScrollNode}
        bodyClassName="cs-root cs-fullheight relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-white reckless-prose text-black"
        footer={pager}
      >
        {inner}
      </PopupShell>
    )
  }

  return (
    <div className="cs-root cs-page min-h-screen bg-white reckless-prose text-black lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden">
      {inner}
    </div>
  )
}

// ── per-section dispatch ──────────────────────────────────────────────────────
/** Figma 2110:41725 — Thin Italic lead; 41728 Roman Italic red link inside [ ↗ ]. */
const FULL_CASE_STUDY_INTRO_DEFAULT =
  'This case study is intentionally condensed for a quick overview. Explore the complete research, process and outcomes in the'

function FullCaseStudyPdfFooter({
  url,
  label,
  intro,
}: {
  url: string
  label: string
  intro?: string
}) {
  const v = useCsVariant()
  const lead = intro || FULL_CASE_STUDY_INTRO_DEFAULT
  const size = v === 'page' ? 'text-[17px] lg:text-[18px]' : 'text-[18px] xl:text-[1.25vw]'
  return (
    <p
      className={`mx-auto text-center font-grotesk font-light italic leading-[1.6] text-white ${size} ${v === 'page' ? 'max-w-none' : 'max-w-[606px]'}`}
    >
      {lead}{' '}
      <span className="whitespace-nowrap">
        {'['}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="group mx-[0.15em] inline-flex items-baseline font-normal italic text-accent transition-opacity hover:opacity-80"
        >
          {label}
          <ExternalArrow shadow={false} className="ml-[0.15em] h-[11px] w-[11px] shrink-0" />
        </a>
        {']'}
      </span>
      .
    </p>
  )
}

/** Standalone band when a study has a PDF but no reflectionSection. */
function FullCaseStudyPdfLink({
  url,
  label,
  intro,
}: {
  url: string
  label: string
  intro?: string
}) {
  const v = useCsVariant()
  const page = v === 'page'
  return (
    <section
      className="text-white"
      style={{
        ...bandStyle(undefined, REFLECTION_DEFAULTS.backgroundColor, true),
        ...sectionPadStyle(
          undefined,
          {
            paddingTop: REFLECTION_DEFAULTS.paddingTop,
            paddingBottom: REFLECTION_DEFAULTS.paddingBottom,
          },
          page,
        ),
      }}
    >
      <div className={csShell(v)}>
        <div className="mx-auto flex min-h-[132px] max-w-[923px] items-center justify-center border-t border-[#323232] pt-8">
          <FullCaseStudyPdfFooter url={url} label={label} intro={intro} />
        </div>
      </div>
    </section>
  )
}

function SectionBlock({
  section,
  project,
  scrollRoot,
}: {
  section: Section
  project: Study
  scrollRoot?: React.RefObject<HTMLDivElement | null>
}) {
  switch (section._type) {
    case 'heroSection':
      return <HeroBlock section={section} project={project} />
    case 'overviewSection':
      return <OverviewBlock section={section} />
    case 'accordionSection':
      return <AccordionBlock section={section} />
    case 'proseSection':
      return <ProseBlock section={section} />
    case 'problemContextSection':
      return <ProblemContextBlock section={section} />
    case 'reflectionSection':
      return (
        <ReflectionBlock
          section={section}
          fullCaseStudy={
            project.fullCaseStudyPdfUrl
              ? {
                  url: project.fullCaseStudyPdfUrl,
                  label: project.fullCaseStudyLabel?.trim() || 'Full Case Study',
                  intro: project.fullCaseStudyIntro?.trim(),
                }
              : undefined
          }
        />
      )
    case 'coreExperience':
      return (
        <CoreExperienceBlock section={section} projectName={project.name} />
      )
    case 'mediaSection':
      return <MediaBlock section={section} />
    case 'desktopMotionShowcase':
      return <DesktopMotionShowcaseBlock section={section} />
    case 'gallerySection':
      return <GalleryBlock section={section} />
    case 'showcaseGallery':
      return <ShowcaseBlock section={section} scrollRoot={scrollRoot} />
    case 'motionShowcase':
      return <MotionShowcaseBlock section={section} />
    case 'highlightReel':
      return <HighlightReelBlock section={section} />
    case 'statsSection':
      return <StatsBlock section={section} />
    case 'bulletSection':
      return <BulletBlock section={section} />
    default:
      return null
  }
}

type Of<T extends Section['_type']> = Extract<Section, { _type: T }>

/**
 * Coalesce consecutive text bands that share the same background into a single
 * group. In the modal every section is forced to its own full-height screen
 * (`.cs-fullheight`), so separate bands land on separate screens. Figma shows
 * Figma shows "Problem Context" + "What I Brought" (600:12516) and "Reflections" +
 * "Next Steps" (600:14126) each together on one band. Problem Context / What I
 * Brought should be authored as `problemContextSection` in Sanity; legacy paired
 * `proseSection`s are still coalesced here until patched. Reflection / Next Steps
 * should use `reflectionSection`; legacy prose + bullet pairs still coalesce.
 *
 * `proseSection`s group on matching background (incl. none). A `bulletSection`
 * (Next Steps) joins a run only when it shares an *explicit* background with it
 * — scoping the merge to Coral's black Reflection band without pulling in other
 * studies' background-less Next Steps. A lone section is untouched.
 */
function groupSections(sections: Section[]): Section[][] {
  const groups: Section[][] = []
  const groupable = (t: Section['_type']) =>
    t === 'proseSection' || t === 'bulletSection'
  const bgOf = (s: Section) =>
    colorToCss((s as { appearance?: Appearance }).appearance?.backgroundColor)
  for (const s of sections) {
    const prev = groups[groups.length - 1]
    const prevSec = prev?.[prev.length - 1]
    const withBullet =
      s._type === 'bulletSection' || prevSec?._type === 'bulletSection'
    const bg = bgOf(s)
    const sameBand =
      !!prevSec &&
      groupable(s._type) &&
      groupable(prevSec._type) &&
      bg === bgOf(prevSec) &&
      (!withBullet || !!bg)
    if (sameBand) prev.push(s)
    else groups.push([s])
  }
  return groups
}

/** Renders a run of text bands as one full-height band (Figma ~46px gap). */
function ProseGroupBlock({
  sections,
}: {
  sections: (Of<'proseSection'> | Of<'bulletSection'>)[]
}) {
  const v = useCsVariant()
  const page = v === 'page'
  const first = sections[0]
  const light = isLight(first.appearance)
  const align = first.appearance?.contentAlignment ?? 'center'
  const width = first.appearance?.maxWidth ?? 'default'
  const body = csBodyText(v)
  const allProse = sections.every(s => s._type === 'proseSection')
  const pageProse = page && allProse
  const last = sections[sections.length - 1]
  const padStyle = proseGroupPadStyle(
    first.appearance,
    last.appearance,
    page,
    pageProse ? PAGE_PROSE_PAD : undefined,
  )
  const gapLevel = pageProse ? 'md' : 'lg'
  return (
    <section
      className={`${ALIGN[align]} ${pageScreenBandClass(pageProse)}`}
      style={{ ...bandStyle(first.appearance), ...padStyle }}
    >
      <div className={`${csShell(v)} ${pageScreenBandInnerClass(pageProse)}`}>
        <div
          className={`flex flex-col ${csProseInner(v, align, width)}`}
          style={sectionGapStyle(
            first.appearance,
            gapDefault(gapLevel, pageProse),
            pageProse,
          )}
        >
          {sections.map(s => (
            <div key={s._key}>
              {s.sectionTitle && (
                <h2
                  className={`mb-5 ${csSectionTitle(v)} ${light ? 'text-white' : ''} ${align === 'center' ? 'text-center' : ''}`}
                >
                  {s.sectionTitle}
                </h2>
              )}
              {s._type === 'bulletSection' ? (
                // Figma 600:14134 renders Next Steps as centered flowing copy
                // (no disc markers) — each seeded step is its own line.
                <ul className={body}>
                  {(s.items ?? []).map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              ) : (
                <Prose value={s.body} className={body} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HeroBlock({
  section: s,
  project: p,
}: {
  section: Of<'heroSection'>
  project: Study
}) {
  const v = useCsVariant()
  const page = v === 'page'
  if (!s.image && !s.imageMobile) return null
  const title = s.headingOverride ?? p.name
  const capSize = page
    ? 'text-[16px] leading-[1.6] lg:text-[17px]'
    : 'text-[16px] leading-[1.6] xl:text-[1.3vw]'
  const caption = (
    <>
      <p className={capSize}>
        <strong className="font-bold">{title}</strong> · {s.caption ?? p.tagline}
      </p>
      {/* Fas 08/05: the project's before/after framing belongs here, under the
         hero title line — not in the Overview metadata column where Israel's
         annotation panel first placed it. Upright and in the band's own colour,
         per 2110:39398; the labels carry a single weight step rather than the
         accent red, which the site reserves for interactive tokens. */}
      {(p.from || p.to) && (
        <p className={`mt-0.5 flex flex-wrap gap-x-14 ${capSize}`}>
          <span>
            <span className="font-medium">From:</span> {p.from}
          </span>
          <span>
            <span className="font-medium">To:</span> {p.to}
          </span>
        </p>
      )}
    </>
  )
  const mobileArt = s.imageMobile?.trim() || s.image
  // Full-page studies share Coral's stacked mobile hero (Figma 2079:26236).
  // The black overlay crop (344:19457) is only for the Work popup when no
  // mobile art is authored.
  const stackedMobile = page || !!s.imageMobile
  return (
    <section data-cs-hero className="relative">
      {stackedMobile ? (
        /* Mobile hero art + caption below (Figma 2079:26236). */
        <div className="flex flex-col gap-2.5 bg-white px-12 lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
          <img
            src={mobileArt}
            alt={p.name}
            className="aspect-[333/432] w-full bg-[#ededed] object-cover object-top"
          />
          <div className="pb-4 pt-1 text-black">
            <p className="text-[18px] font-bold leading-[1.35] tracking-normal">
              <span className="underline decoration-from-font underline-offset-[6px]">
                {title}
              </span>
            </p>
            {(p.from || p.to) && (
              <p className="mt-2 flex justify-between gap-4 text-[18px] leading-[1.35] tracking-normal">
                {p.from && (
                  <span>
                    <span className="font-normal italic">From</span>
                    <span>: {p.from}</span>
                  </span>
                )}
                {p.to && (
                  <span className="text-right">
                    <span className="font-normal italic">To</span>
                    <span>: {p.to}</span>
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Legacy mobile — desktop art cropped in black frame (Figma 344:19457). */
        <div className="relative aspect-[360/791] overflow-hidden bg-black lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
          <img
            src={s.image}
            alt={p.name}
            className="absolute inset-x-0 bottom-0 h-[73.5%] w-full object-cover object-[82%_30%]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0)_20%,rgba(0,0,0,0)_72%,rgba(0,0,0,0.4)_100%)]" />
          <div className="absolute left-4.5 top-[10%] max-w-[92%] p-2.5 text-white">{caption}</div>
        </div>
      )}
      <div className="relative hidden lg:absolute lg:inset-0 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={s.image}
          alt={p.name}
          className="block h-full w-full object-cover object-left"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />
        <div className="absolute bottom-4 left-7.5 p-2.5 text-white">{caption}</div>
      </div>
    </section>
  )
}

function OverviewBlock({ section: s }: { section: Of<'overviewSection'> }) {
  const v = useCsVariant()
  const page = v === 'page'
  const light = isLight(s.appearance)
  const dark = light ? 'text-white' : ''
  const contain = s.sideImageFit === 'contain'
  const cta = s.ctaLabel ?? 'Visit Site'
  const gutter = csBandGutter(v)
  const body = csBodyText(v, dark)
  const metaSm = page
    ? 'text-[14px] font-normal leading-[1.6]'
    : 'text-[14px] font-normal leading-[1.6] xl:text-[0.95vw]'
  const metaXs = page
    ? 'text-[12px] font-normal italic leading-4.25'
    : 'text-[12px] font-normal italic leading-4.25 xl:text-[0.82vw]'
  const sideBg = colorToCss(s.sideImageBackgroundColor) ?? TEAL
  const hasVideo = !!s.sideVideo
  const mediaFirst = s.mediaPosition === 'left'
  const copyOrder = mediaFirst ? 'lg:order-2' : 'lg:order-1'
  const mediaOrder = mediaFirst ? 'lg:order-1' : 'lg:order-2'
  const copyPad = overviewCopyPadStyle(s, page)
  const mediaPad = overviewMediaPadStyle(s, page)
  const mediaPadMobile = overviewMediaPadStyle(s, page, true)
  const colGap =
    typeof s.columnGap === "number" && s.columnGap >= 0
      ? s.columnGap
      : OVERVIEW_COLUMN_GAP
  const desktopMediaClass = page
    ? contain
      ? 'relative hidden min-h-0 overflow-hidden lg:flex lg:h-full lg:max-h-full lg:items-center lg:justify-center'
      : 'relative hidden min-h-0 overflow-hidden lg:flex lg:h-full lg:max-h-full'
    : hasVideo
      ? 'relative hidden items-center justify-center lg:flex lg:min-h-full lg:p-12 xl:p-[3vw]'
      : 'relative hidden lg:flex lg:min-h-full'
  const desktopMediaSizeClass = page
    ? contain
      ? 'max-h-full max-w-full object-contain object-center'
      : 'absolute inset-0 h-full w-full object-cover object-center'
    : hasVideo
      ? 'h-auto max-h-full w-full max-w-90 object-contain xl:max-w-[24vw]'
      : contain
        ? 'absolute inset-0 h-full w-full object-contain object-center'
        : 'absolute inset-0 h-full w-full object-cover object-center'
  const mobileMediaSizeClass =
    page && !contain
      ? 'absolute inset-0 h-full w-full object-cover object-center'
      : 'max-h-full max-w-full object-contain'
  return (
    <section
      data-cs-stretch
      className={`grid min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-2 lg:items-stretch ${
        pageBandHeightClass(page)
      }`}
      style={{
        ...bandStyle(s.appearance, OVERVIEW_BAND_BACKGROUND),
        ...(page ? {} : { columnGap: colGap }),
      }}
    >
      <div
        className={`flex min-h-0 flex-col ${copyOrder} ${
          page ? 'justify-start lg:h-full lg:justify-between' : `justify-between ${gutter}`
        }`}
        style={{ ...copyPad, ...sectionGapStyle(s.appearance, gapDefault('md', page), page) }}
      >
        <div className={page ? 'max-w-[min(580px,100%)]' : undefined}>
          <h2 className={`${csSectionTitle(v)} ${dark}`}>
            {s.sectionTitle ?? 'Overview'}
          </h2>
          <Prose value={s.body} className={`mt-[1em] ${body}`} />
          {s.ctaUrl && (
            // Mobile Figma uses "Visit SITE"; desktop stays sentence case.
            <a
              href={s.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className={`mt-6 inline-block text-[18px] font-normal underline underline-offset-4 transition-colors hover:text-accent ${dark} max-lg:uppercase lg:capitalize ${page ? '' : 'xl:text-[1.15vw]'}`}
            >
              {cta}
            </a>
          )}
        </div>
        <div className={`flex flex-col gap-5 ${page ? 'max-w-[min(580px,100%)]' : ''}`}>
          {(s.serviceCategoryLabel || s.serviceList) && (
            <div className="max-w-85">
              {/* Figma 600:12513 — Neue Haas 45 Light 18px, capitalize. */}
              <h3
                className={`text-[18px] font-normal capitalize leading-tight ${dark} ${page ? '' : 'xl:text-[1.15vw]'}`}
              >
                {s.serviceCategoryLabel ?? 'Research & Design'}
              </h3>
              {s.serviceList && (
                <p className={`mt-2 ${metaSm} ${dark}`}>
                  {s.serviceList}
                </p>
              )}
            </div>
          )}
          {/* Figma 600:12514 — 45 Light 14px, labels 55 Roman. */}
          <div className={`max-w-85 space-y-1 ${metaSm} ${dark}`}>
            {s.duration && (
              <p>
                <span className="font-normal">Duration</span>: {s.duration}
              </p>
            )}
            {s.team && (
              <p>
                <span className="font-normal">Team</span>: {s.team}
              </p>
            )}
          </div>
          {/* Figma 600:12515 — 36 Thin Italic 12px / +1px tracking. */}
          {s.confidentialityNote && (
            <p className={`mt-4 max-w-100 ${metaXs} ${light ? 'text-white/70' : 'text-black/70'}`}>
              {s.confidentialityNote}
            </p>
          )}
        </div>
      </div>
      {/* One media slot: video if authored, otherwise the still. */}
      <div
        className={`relative flex aspect-[360/552] lg:hidden ${mediaOrder} ${
          page && !contain ? 'overflow-hidden' : 'items-center justify-center'
        }`}
        style={{ backgroundColor: sideBg, ...mediaPadMobile }}
      >
        {hasVideo ? (
          <video
            src={s.sideVideo}
            autoPlay
            loop
            muted
            playsInline
            className={mobileMediaSizeClass}
          />
        ) : (
          s.sideImage && (
            // eslint-disable-next-line @next/next/no-img-element -- case-study art
            <img
              src={s.sideImage}
              alt=""
              className={mobileMediaSizeClass}
            />
          )
        )}
      </div>
      {(hasVideo || s.sideImage) && (
        <div
          className={`${desktopMediaClass} ${mediaOrder}`}
          style={{
            backgroundColor: sideBg,
            ...mediaPad,
          }}
        >
          {hasVideo ? (
            <video
              src={s.sideVideo}
              autoPlay
              loop
              muted
              playsInline
              className={desktopMediaSizeClass}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- case-study art
            <img
              src={s.sideImage}
              alt=""
              className={desktopMediaSizeClass}
            />
          )}
        </div>
      )}
    </section>
  )
}

function AccordionBlock({ section: s }: { section: Of<'accordionSection'> }) {
  const v = useCsVariant()
  const light = bandUsesLightText(s.appearance)
  const items = s.items ?? []
  const page = v === 'page'
  if (s.variant === 'split') {
    return (
      <section
        data-cs-stretch
        style={sectionStyle(s.appearance, page, 'md', SAGE)}
      >
        <div
          className={`grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 lg:grid-rows-[1fr] ${
            page ? csShell(v, 'max-lg:!max-w-none') : csBandGutter(v)
          }`}
        >
        <div className="order-2 flex flex-col justify-end lg:order-1">
          <div className={page ? 'max-w-[min(560px,100%)]' : 'max-w-111.25'}>
            <h2
              className={`mb-4 ${csSectionTitle(v, 'text-[18px] lg:text-[20px]')} ${light ? 'text-white' : ''}`}
            >
              {s.sideTitle ?? 'My Approach'}
            </h2>
            <Prose value={s.sideBody} className={`mt-3 ${csBodyText(v)}`} />
          </div>
        </div>
        <div
          className="order-1 self-stretch px-5 py-8 lg:order-2 lg:p-[10vw_5vw] xl:p-[2vw]"
          style={{ backgroundColor: colorToCss(s.accordionBackgroundColor) }}
        >
          {/* Figma "Design Process": Neue Haas 20px / 500 / lh 14.64px / capitalize / centered */}
          {s.sectionTitle && (
            <h2 className={`mb-5 text-center ${csSectionTitle(v, 'text-[20px] lg:text-[22px]')} text-black`}>
              {s.sectionTitle}
            </h2>
          )}
          <div className="mt-4">
            <Accordion items={items} variant="process" />
          </div>
        </div>
        </div>
      </section>
    )
  }
  const pageInner = v === 'page'
  return (
    <section style={sectionStyle(s.appearance, pageInner, 'md', SAGE)}>
      <div className={csShell(v)}>
        <div className={`mx-auto ${pageInner ? 'max-w-[min(720px,100%)]' : 'max-w-120'}`}>
          {s.sectionTitle && (
            <Label center light={light}>
              {s.sectionTitle}
            </Label>
          )}
          <div className="mt-6">
            <Accordion items={items} variant="brought" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProseBlock({ section: s }: { section: Of<'proseSection'> }) {
  const v = useCsVariant()
  const page = v === 'page'
  const light = isLight(s.appearance)
  const align = s.appearance?.contentAlignment ?? 'center'
  const width = s.appearance?.maxWidth ?? 'default'
  return (
    <section
      className={ALIGN[align]}
      style={{
        ...bandStyle(s.appearance),
        ...sectionPadStyle(s.appearance, padDefaults('md', page), page),
      }}
    >
      <div className={csShell(v)}>
        <div className={csProseInner(v, align, width)}>
          {s.sectionTitle && (
            <h2
              className={`mb-5 ${csSectionTitle(v)} ${light ? 'text-white' : ''} ${align === 'center' ? 'text-center' : ''}`}
            >
              {s.sectionTitle}
            </h2>
          )}
          <Prose value={s.body} className={`mt-5 ${csBodyText(v)}`} />
        </div>
      </div>
    </section>
  )
}

/** Figma 03 — Problem Context / What I Brought (600:12516): one centred band. */
function ProblemContextBlock({ section: s }: { section: Of<'problemContextSection'> }) {
  const v = useCsVariant()
  const light = isLight(s.appearance)
  const align = s.appearance?.contentAlignment ?? 'center'
  const width = s.appearance?.maxWidth ?? 'default'
  const body = csBodyText(v)
  const titleClass = `${csSectionTitle(v)} ${light ? 'text-white' : ''} ${align === 'center' ? 'text-center' : ''}`
  const page = v === 'page'
  const padStyle = page
    ? sectionPadStyle(s.appearance, PAGE_PROSE_PAD, true)
    : sectionPadStyle(s.appearance, padDefaults('md', false), false)
  return (
    <section
      className={`${ALIGN[align]} ${pageScreenBandClass(page)}`}
      style={{ ...bandStyle(s.appearance), ...padStyle }}
    >
      <div className={`${csShell(v)} ${pageScreenBandInnerClass(page)}`}>
        <div
          className={`flex flex-col ${csProseInner(v, align, width)}`}
          style={sectionGapStyle(
            s.appearance,
            gapDefault('md', page),
            page,
          )}
        >
          <div>
            {s.problemHeading && (
              <h2 className={`mb-5 ${titleClass}`}>{s.problemHeading}</h2>
            )}
            <Prose value={s.problemBody} className={body} />
          </div>
          <div>
            {s.broughtHeading && (
              <h2 className={`mb-5 ${titleClass}`}>{s.broughtHeading}</h2>
            )}
            <Prose value={s.broughtBody} className={body} />
          </div>
          {s.supportingCopy?.length ? (
            <Prose value={s.supportingCopy} className={body} />
          ) : null}
        </div>
      </div>
    </section>
  )
}

/** Figma 2110:41713 — Reflection + Next Steps + PDF CTA on one #171717 band. */
function ReflectionBlock({
  section: s,
  fullCaseStudy,
}: {
  section: Of<'reflectionSection'>
  fullCaseStudy?: { url: string; label: string; intro?: string }
}) {
  const v = useCsVariant()
  const align = s.appearance?.contentAlignment ?? 'center'
  const width = s.appearance?.maxWidth ?? 'default'
  const body = csReflectionBody(v)
  const titleClass = `${csReflectionTitle(v)} text-white ${align === 'center' ? 'text-center' : ''}`
  const steps = s.nextStepsItems ?? []
  const hasReflection = !!s.reflectionBody?.length
  if (!hasReflection && !steps.length && !fullCaseStudy?.url) return null
  const page = v === 'page'
  const padStyle = sectionPadStyle(
    s.appearance,
    page
      ? {
          paddingTop: REFLECTION_DEFAULTS.paddingTop,
          paddingBottom: REFLECTION_DEFAULTS.paddingBottom,
        }
      : padDefaults('md', false),
    page,
  )
  const column = page
    ? csProseInner(v, align, width)
    : align === 'center'
      ? 'mx-auto w-full max-w-[693px] text-center'
      : csProseInner(v, align, width)
  return (
    <section
      className={`${ALIGN[align]} text-white`}
      style={{
        ...bandStyle(s.appearance, REFLECTION_DEFAULTS.backgroundColor, true),
        ...padStyle,
      }}
    >
      <div className={csShell(v)}>
        <div
          className={`flex flex-col ${page ? column : 'mx-auto w-full max-w-[1016px] items-center'}`}
          style={sectionGapStyle(
            s.appearance,
            REFLECTION_DEFAULTS.contentGap,
            page,
          )}
        >
          {hasReflection && (
            <div
              className={`flex w-full flex-col ${page ? '' : `items-center ${column}`}`}
              style={sectionInnerGapStyle(
                s.appearance,
                REFLECTION_DEFAULTS.contentGapInner,
                page,
              )}
            >
              {s.reflectionHeading && (
                <h2 className={titleClass}>{s.reflectionHeading}</h2>
              )}
              <Prose
                value={s.reflectionBody}
                className={`${body} ${page ? '' : 'max-w-[683px]'}`}
              />
            </div>
          )}
          {steps.length > 0 && (
            <div
              className={`flex w-full flex-col ${page ? '' : `items-center ${column}`}`}
              style={sectionInnerGapStyle(
                s.appearance,
                REFLECTION_DEFAULTS.contentGapInner,
                page,
              )}
            >
              {s.nextStepsHeading && (
                <h2 className={titleClass}>{s.nextStepsHeading}</h2>
              )}
              <div className={body}>
                {steps.map((it, i) => (
                  <p key={i}>{it}</p>
                ))}
              </div>
            </div>
          )}
          {fullCaseStudy?.url ? (
            <div
              className={`flex w-full items-center justify-center border-t border-[#323232] pt-8 min-h-[132px] ${page ? '' : 'max-w-[923px]'}`}
            >
              <FullCaseStudyPdfFooter
                url={fullCaseStudy.url}
                label={fullCaseStudy.label}
                intro={fullCaseStudy.intro}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

// Core Experience Flow (Figma 2110:39499 mobile row / 2271:58148 desktop grid).
// → PopupShell popup (3670:21768): intro + device tabs + Load More grid.
function coreExperienceCardBg(
  screen: CoreExperienceScreen,
  bandApp?: Appearance,
): string {
  return (
    colorToCss(screen.appearance?.tileBackgroundColor) ??
    colorToCss(bandApp?.tileBackgroundColor) ??
    CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.cardBackground
  )
}

function coreExperienceSharedAspect(
  screens: CoreExperienceScreen[],
): { w: number; h: number } | null {
  const pairs = screens
    .filter(s => s.imageWidth && s.imageHeight)
    .map(s => ({ w: s.imageWidth as number, h: s.imageHeight as number }))
  if (!pairs.length) return null
  const sorted = [...pairs].sort((a, b) => a.w / a.h - b.w / b.h)
  return sorted[Math.floor(sorted.length / 2)]
}

function coreExperienceImageBoxStyle(
  screen: CoreExperienceScreen,
  layout: 'mobileRow' | 'desktopGrid',
  shared?: { w: number; h: number } | null,
): CSSProperties {
  if (shared) {
    return { aspectRatio: `${shared.w}/${shared.h}` }
  }
  if (screen.imageWidth && screen.imageHeight) {
    return { aspectRatio: `${screen.imageWidth}/${screen.imageHeight}` }
  }
  const d =
    layout === 'desktopGrid'
      ? CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS
      : CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS
  return { aspectRatio: `${d.imageAspectWidth}/${d.imageAspectHeight}` }
}

function CoreExperienceScreenCard({
  screen,
  layout,
  tone,
  size,
  bandApp,
  sharedAspect,
}: {
  screen: CoreExperienceScreen
  layout: 'mobileRow' | 'desktopGrid'
  tone: 'onDark' | 'onLight'
  size: 'preview' | 'popup'
  bandApp?: Appearance
  sharedAspect?: { w: number; h: number } | null
}) {
  if (!screen.image) return null
  const desktop = layout === 'desktopGrid'
  const onDark = tone === 'onDark'
  const caption = onDark ? 'text-[#fafafa]' : 'text-black'
  const cardBg = coreExperienceCardBg(screen, bandApp)
  const bandPreview = size === 'preview'
  const bandCaptionClass = desktop
    ? `mt-3 text-left text-[13px] leading-[1.35] sm:text-[14px] lg:mt-4 ${caption}`
    : `mt-3 text-left text-[11px] leading-[1.5] sm:text-[12px] lg:mt-4 ${caption}`

  if (bandPreview) {
    const desktopBand = desktop
    return (
      <figure className={desktopBand ? 'min-w-0 flex-1' : 'shrink-0 w-[140px] sm:w-[160px] lg:w-[210px]'}>
        <div
          className="overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.22)]"
          style={{
            backgroundColor: cardBg,
            ...coreExperienceImageBoxStyle(screen, layout, sharedAspect),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
          <img
            src={screen.image}
            alt={screen.label ?? screen.description ?? 'Product screen'}
            className="h-full w-full object-cover object-top"
          />
        </div>
        {(screen.label || screen.description) && (
          <figcaption className={bandCaptionClass}>
            {screen.label && <span className="font-medium">{screen.label} </span>}
            {screen.description && (
              <span className={onDark ? 'font-normal opacity-95' : 'font-normal'}>
                {screen.description}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    )
  }

  const popupCaptionClass = desktop
    ? `mt-3 text-left text-[13px] leading-[1.35] sm:text-[14px] lg:mt-4 ${caption}`
    : `mt-3 text-left text-[11px] leading-[1.5] sm:text-[12px] lg:mt-4 ${caption}`

  const previewW = desktop
    ? 'w-[220px] sm:w-[260px] lg:w-[300px]'
    : 'w-[140px] sm:w-[160px] lg:w-[210px]'
  const popupW = desktop
    ? 'w-[min(360px,78vw)] sm:w-[400px] lg:w-[480px]'
    : 'w-[min(200px,44vw)] sm:w-[240px] lg:w-[280px]'
  const width = size === 'popup' ? popupW : previewW
  return (
    <figure className={`shrink-0 ${width}`}>
      <div
        className="overflow-hidden rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
        style={{
          backgroundColor: cardBg,
          ...coreExperienceImageBoxStyle(screen, layout),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={screen.image}
          alt={screen.label ?? screen.description ?? 'Product screen'}
          className={`h-full w-full ${desktop ? 'object-contain object-top' : 'object-cover object-top'}`}
        />
      </div>
      {(screen.label || screen.description) && (
        <figcaption className={popupCaptionClass}>
          {screen.label && <span className="font-medium">{screen.label} </span>}
          {screen.description && (
            <span className={onDark ? 'font-normal opacity-95' : 'font-normal'}>
              {screen.description}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}

function chunkScreens<T>(items: T[], size: number): T[][] {
  const rows: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

function CoreExperienceBandPreview({
  screens,
  layout,
  previewAppearance,
  previewColumns,
  previewRowStagger,
  tone,
}: {
  screens: CoreExperienceScreen[]
  layout: 'mobileRow' | 'desktopGrid'
  previewAppearance?: Appearance
  previewColumns?: number
  previewRowStagger?: number
  tone: 'onDark' | 'onLight'
}) {
  const bandApp = previewAppearance
  const sharedAspect = coreExperienceSharedAspect(screens)
  const colGap = resolveSpacingPx(
    bandApp?.contentGap,
    { none: 0, sm: 16, md: 24, lg: 32, xl: 40 },
    layout === 'desktopGrid'
      ? CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.columnGap
      : CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS.columnGap,
  )
  const rowGap = resolveSpacingPx(
    bandApp?.contentGapInner,
    { none: 0, sm: 24, md: 32, lg: 40, xl: 48 },
    CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.rowGap,
  )
  const horizontalPad = sectionHorizontalPadStyle(
    bandApp,
    { paddingLeft: 0, paddingRight: 0 },
    false,
  )
  const containerMax =
    typeof bandApp?.containerMaxWidth === 'number' && bandApp.containerMaxWidth >= 320
      ? bandApp.containerMaxWidth
      : undefined

  if (layout === 'desktopGrid') {
    const perRow = Math.min(
      Math.max(previewColumns ?? CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.columns, 1),
      4,
    )
    const stagger =
      typeof previewRowStagger === 'number' && previewRowStagger >= 0
        ? previewRowStagger
        : CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.rowStagger
    const rows = chunkScreens(screens, perRow)

    return (
      <div
        className="w-full max-w-full overflow-x-hidden"
        style={{
          ...horizontalPad,
          ...(containerMax ? { maxWidth: containerMax, marginInline: 'auto' } : undefined),
        }}
      >
        <div className="flex w-full max-w-full flex-col" style={{ gap: rowGap }}>
          {rows.map((row, rowIdx) => {
            const topRow = rowIdx % 2 === 0
            const rowWidth =
              stagger > 0 ? `calc(100% - ${stagger}px)` : '100%'
            return (
              <div
                key={rowIdx}
                className="flex min-w-0 max-w-full"
                style={{
                  gap: colGap,
                  width: rowWidth,
                  marginLeft: topRow ? 0 : stagger,
                }}
              >
                {row.map(sc => (
                  <CoreExperienceScreenCard
                    key={sc._key}
                    screen={sc}
                    layout={layout}
                    tone={tone}
                    size="preview"
                    bandApp={bandApp}
                    sharedAspect={sharedAspect}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-x-visible">
      <div
        className="mx-auto flex w-max items-start justify-center px-2 sm:w-full sm:max-w-[min(1100px,100%)]"
        style={{ gap: colGap, ...horizontalPad }}
      >
        {screens.map(sc => (
          <CoreExperienceScreenCard
            key={sc._key}
            screen={sc}
            layout={layout}
            tone={tone}
            size="preview"
            bandApp={bandApp}
            sharedAspect={sharedAspect}
          />
        ))}
      </div>
    </div>
  )
}

function CoreExperienceLegacyBand({ section: s }: { section: Of<'coreExperience'> }) {
  const v = useCsVariant()
  const page = v === 'page'
  const light = isLight(s.appearance)
  return (
    <section
      data-cs-stretch
      className="flex flex-col justify-center"
      style={flexSectionStyle(s.appearance, page, 'md')}
    >
      {(s.sectionTitle || s.body) && (
        <div className={`${csShell(v)} text-center`}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <Prose
            value={s.body}
            className={`mx-auto mt-3 max-w-[70ch] ${csBodyText(v)}`}
          />
        </div>
      )}
      <div
        className={`${s.imageMobile ? undefined : 'overflow-x-auto sm:overflow-x-visible'} ${page ? '' : 'flex justify-center px-6'}`}
      >
        <picture>
          {s.imageMobile && (
            <source media="(max-width: 640px)" srcSet={s.imageMobile} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
          <img
            src={s.image}
            alt={s.sectionTitle ?? 'Core experience screens'}
            className={`block h-auto ${
              s.imageMobile
                ? 'w-full'
                : page
                  ? 'w-208 max-w-none sm:w-full sm:max-w-full'
                  : 'w-full max-w-[min(380px,88%)]'
            }`}
          />
        </picture>
      </div>
    </section>
  )
}

function CoreExperienceBlock({
  section: s,
  projectName,
}: {
  section: Of<'coreExperience'>
  projectName: string
}) {
  const [popupOpen, setPopupOpen] = useState(false)
  const v = useCsVariant()
  const light = bandUsesLightText(s.appearance)
  const layout = s.layoutVariant ?? 'mobileRow'
  const preview = (s.previewScreens ?? []).filter(sc => sc.image)
  const popupTabs = s.popupTabs ?? []
  const title = s.sectionTitle?.trim() || 'Core Experience Flow'
  const popupTitle = s.popupTitle?.trim() || title
  const popupKicker = s.popupKicker?.trim()
  const viewMore = s.viewMoreLabel?.trim() || 'View More'
  const popupInitial = s.popupItemsBeforeViewMore ?? 6
  const popupLoadMore = s.popupLoadMoreLabel?.trim() || 'Load More'
  const popupApp = s.popupAppearance
  const popupAlign = popupApp?.contentAlignment ?? CORE_EXPERIENCE_POPUP_DEFAULTS.contentAlignment
  const popupBg = colorToCss(popupApp?.backgroundColor)
  const popupText = colorToCss(popupApp?.textColor)
  const popupTileBg =
    colorToCss(popupApp?.tileBackgroundColor) ??
    CORE_EXPERIENCE_POPUP_DEFAULTS.tileBackgroundColor
  const popupLight = isLight(popupApp, false)
  const popupPad = sectionPadStyle(
    popupApp,
    {
      paddingTop: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingTop,
      paddingBottom: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingBottom,
    },
    false,
  )
  const popupIntroGap = sectionInnerGapStyle(
    popupApp,
    CORE_EXPERIENCE_POPUP_DEFAULTS.contentGapInner,
    false,
  )
  const popupSectionGap = sectionGapStyle(
    popupApp,
    CORE_EXPERIENCE_POPUP_DEFAULTS.contentGap,
    false,
  )
  const popupIntroMax =
    typeof popupApp?.introMaxWidth === 'number' && popupApp.introMaxWidth >= 200
      ? popupApp.introMaxWidth
      : CORE_EXPERIENCE_POPUP_DEFAULTS.introMaxWidth
  const popupContainerMax =
    typeof popupApp?.containerMaxWidth === 'number' &&
    popupApp.containerMaxWidth >= 320
      ? popupApp.containerMaxWidth
      : undefined
  const popupHorizontalPad = sectionHorizontalPadStyle(
    popupApp,
    {
      paddingLeft: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingLeft,
      paddingRight: CORE_EXPERIENCE_POPUP_DEFAULTS.paddingRight,
    },
    false,
  )
  const popupGridColumnGap = resolveSpacingPx(
    popupApp?.contentGap,
    { none: 0, sm: 12, md: 16, lg: 24, xl: 32 },
    CORE_EXPERIENCE_POPUP_DEFAULTS.gridColumnGap,
  )
  const popupGridRowGap = resolveSpacingPx(
    popupApp?.contentGapInner,
    { none: 0, sm: 16, md: 24, lg: 32, xl: 40 },
    CORE_EXPERIENCE_POPUP_DEFAULTS.gridRowGap,
  )

  if (!preview.length) {
    if (!s.image) return null
    return <CoreExperienceLegacyBand section={s} />
  }

  const onDark = light ? 'text-white' : ''
  // View More only when Studio has popup tabs/body. Experian stays hidden
  // until Israel supplies the modal; Coral already has tabs so it still shows.
  const hasPopup =
    popupTabs.some(t => (t.items?.length ?? 0) > 0) || Boolean(s.popupBody?.length)

  return (
    <>
      <section
        data-cs-stretch
        className="flex flex-col items-center"
        style={sectionStyle(s.appearance, v === 'page', 'md')}
      >
        <div
          className={`${csShell(v)} flex w-full flex-col items-center text-center`}
          style={sectionGapStyle(s.appearance, gapDefault('md', v === 'page'), v === 'page')}
        >
          <h2 className={`${csSectionTitle(v)} ${onDark}`}>{title}</h2>
          {s.body?.length ? (
            <Prose
              value={s.body}
              className={`mx-auto max-w-[70ch] ${csBodyText(v, onDark)}`}
            />
          ) : null}
          <CoreExperienceBandPreview
            screens={preview}
            layout={layout}
            previewAppearance={s.previewAppearance}
            previewColumns={s.previewColumns}
            previewRowStagger={s.previewRowStagger}
            tone={light ? 'onDark' : 'onLight'}
          />
          {hasPopup && (
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setPopupOpen(true)}
              className={`font-grotesk shrink-0 text-[16px] uppercase leading-none underline underline-offset-4 transition-opacity hover:opacity-80 xl:text-[1vw] ${light ? 'text-white' : ''}`}
            >
              {viewMore}
            </button>
          )}
        </div>
      </section>

      <PopupShell
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        label={popupTitle}
        crumbs={[
          { label: 'Case Studies', href: '/casestudies', hideOnMobile: true },
          { label: projectName, hideOnMobile: true },
          { label: popupTitle },
        ]}
        cardClassName="bg-white"
        bodyClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain reckless-prose"
      >
        <div
          className={`min-h-full ${popupBg ? '' : 'bg-close'} ${popupLight ? 'text-white' : 'text-black'}`}
          style={{
            ...popupPad,
            ...(popupBg ? { backgroundColor: popupBg } : undefined),
            ...(popupText ? { color: popupText } : undefined),
          }}
        >
          <div
            className="flex w-full flex-col"
            style={{
              ...popupSectionGap,
              ...popupHorizontalPad,
              ...(popupContainerMax ? { maxWidth: popupContainerMax, marginInline: 'auto' } : undefined),
            }}
          >
            <div
              className={`flex w-full flex-col ${ALIGN[popupAlign]} items-start`}
              style={{ ...popupIntroGap, maxWidth: popupIntroMax }}
            >
              {popupKicker ? (
                <p className="font-grotesk mb-1 text-[11px] font-normal uppercase  sm:text-[12px] lg:mb-2">
                  {popupKicker}
                </p>
              ) : null}
              <h2 className={`${csSectionTitle(v)} w-full ${ALIGN[popupAlign]}`}>
                {popupTitle}
              </h2>
              {s.popupBody?.length ? (
                <Prose
                  value={s.popupBody}
                  className={`w-full ${csBodyText(v)} ${ALIGN[popupAlign]}`}
                />
              ) : null}
            </div>
            <DeviceGallery
              tabs={popupTabs.filter(t => (t.items?.length ?? 0) > 0)}
              initial={popupInitial}
              loadMore={popupLoadMore}
              tileBg={popupTileBg}
              light={popupLight}
              gridSize="popup"
              gridColumnGap={popupGridColumnGap}
              gridRowGap={popupGridRowGap}
            />
          </div>
        </div>
      </PopupShell>
    </>
  )
}

// 08 — Desktop Motion Showcase (Figma 2110:40096 / Census 2229:30432): band colour
// from Sanity appearance, centred desktop mockup, title + body bottom-right.
function DesktopMotionShowcaseBlock({
  section: s,
}: {
  section: Of<'desktopMotionShowcase'>
}) {
  const v = useCsVariant()
  const page = v === 'page'
  const overlay = v === 'overlay'
  const hasVideo = !!(s.videoFile || s.videoUrl)
  const hasStaticImage = !!s.posterImage && !hasVideo
  const hasMedia = hasVideo || hasStaticImage
  const copyTitle = s.sectionTitle?.trim()
  const hasCopy = !!(copyTitle || s.body?.length || s.caption)
  const lightText = bandUsesLightText(s.appearance)
  const copyClass = lightText ? 'text-white' : 'text-black'
  return (
    <section
      data-cs-stretch={page ? undefined : true}
      className={`relative flex flex-col ${
        page ? csBandGutter(v) : csBandGutter(v)
      } ${overlay ? 'min-h-[min(847px,88vh)]' : ''}`}
      style={flexSectionStyle(s.appearance, page, 'md', undefined, lightText)}
    >
      {hasMedia && (
        <div
          className={`flex justify-center ${
            page ? csShell(v, '!px-0 max-lg:!px-0') : 'px-6 sm:px-10 xl:px-[3.5vw]'
          } pt-12 max-lg:pt-8 lg:pt-14`}
        >
          <div
            className={`w-full overflow-hidden rounded-[20px] bg-white drop-shadow-[0_10px_16px_rgba(0,0,0,0.25)] max-lg:rounded-[6px] max-lg:border-[5px] max-lg:border-[#f3efe8] max-lg:drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] ${
              page ? 'max-w-[762px]' : 'max-w-[min(728px,66%)]'
            }`}
          >
            {hasVideo ? (
              s.videoUrl ? (
                <div className="aspect-[762/467] w-full">
                  <iframe
                    src={s.videoUrl}
                    title={copyTitle || 'Desktop animation'}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  className="block h-auto w-full"
                  src={s.videoFile}
                  poster={s.posterImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- case-study art
              <img
                src={s.posterImage}
                alt={copyTitle || 'Desktop showcase'}
                className="block h-auto w-full"
              />
            )}
          </div>
        </div>
      )}
      {hasCopy &&
        (overlay ? (
          <div
            className={`absolute bottom-[min(103px,12%)] right-[max(24px,6%)] max-w-[min(445px,42%)] text-left  ${copyClass}`}
          >
            {copyTitle && (
              <h2 className="text-[18px] font-normal capitalize leading-[1.6] ">
                {copyTitle}
              </h2>
            )}
            {s.body?.length ? (
              <Prose
                value={s.body}
                className={`${copyTitle ? 'mt-2.5' : ''} text-[14px] font-normal leading-[1.6] `}
              />
            ) : s.caption ? (
              <p
                className={`${copyTitle ? 'mt-2.5' : ''} text-[14px] font-normal leading-[1.6] `}
              >
                {s.caption}
              </p>
            ) : null}
          </div>
        ) : (
          <div
            className={`w-full pb-[min(103px,12%)] pt-6  ${copyClass} ${csShell(v, '!px-0')}`}
          >
            <div className="text-left max-lg:!max-w-none lg:ml-auto lg:max-w-[min(445px,42%)]">
              {copyTitle && (
                <h2 className="text-[18px] font-normal capitalize leading-[1.6] max-lg:!text-[11px] max-lg:!uppercase max-lg:!leading-[1.2]">
                  {copyTitle}
                </h2>
              )}
              {s.body?.length ? (
                <Prose
                  value={s.body}
                  className={`${copyTitle ? 'mt-2.5' : ''} text-[14px] font-normal leading-[1.6] max-lg:!mt-1.5 max-lg:!text-[12px] max-lg:!leading-[1.4]`}
                />
              ) : s.caption ? (
                <p
                  className={`${copyTitle ? 'mt-2.5' : ''} text-[14px] font-normal leading-[1.6] max-lg:!mt-1.5 max-lg:!text-[12px] max-lg:!leading-[1.4]`}
                >
                  {s.caption}
                </p>
              ) : null}
            </div>
          </div>
        ))}
    </section>
  )
}

function MediaBlock({ section: s }: { section: Of<'mediaSection'> }) {
  const v = useCsVariant()
  const light = isLight(s.appearance)
  const items = s.items ?? []
  const multi = items.length > 1
  const page = v === 'page'
  return (
    <section
      data-cs-stretch
      className="flex flex-col justify-center"
      style={flexSectionStyle(s.appearance, page, 'md')}
    >
      {items.length > 0 && (
        <div
          className={
            multi
              ? `${csShell(v)} grid w-full gap-6 sm:grid-cols-2`
              : page
                ? csShell(v)
                : 'mx-auto w-full max-w-225 px-6 sm:px-10 xl:px-[3.5vw]'
          }
        >
          {items.map((m, i) => (
            <MediaUnit key={m._key ?? `media-${i}`} item={m} />
          ))}
        </div>
      )}
      {(s.sectionTitle || s.body) && (
        <div className={`${csShell(v)} ml-auto max-w-[min(440px,100%)]`}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <Prose
            value={s.body}
            className="mt-3 text-[12px] leading-[1.45] xl:text-[0.85vw]"
          />
        </div>
      )}
    </section>
  )
}

function MediaUnit({ item }: { item: MediaItem }) {
  if (item.mediaType === 'prototype' && item.embedUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-black/10">
        <iframe
          src={item.embedUrl}
          title={item.caption || 'Prototype'}
          className="h-full w-full"
          allowFullScreen
        />
      </div>
    )
  }
  if (item.mediaType === 'video') {
    if (item.videoUrl) {
      return (
        <div className="aspect-video w-full overflow-hidden bg-black/10">
          <iframe
            src={item.videoUrl}
            title={item.caption || 'Video'}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }
    if (item.videoFile) {
      return (
        <video
          className="block h-auto w-full"
          src={item.videoFile}
          poster={item.posterImage}
          autoPlay
          loop
          muted
          playsInline
        />
      )
    }
  }
  if (item.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- case-study art
      <img
        src={item.image}
        alt={item.caption || ''}
        className="block h-auto w-full"
      />
    )
  }
  return null
}

function GalleryBlock({ section: s }: { section: Of<'gallerySection'> }) {
  const v = useCsVariant()
  const page = v === 'page'
  const light = isLight(s.appearance)
  const initial = s.itemsBeforeViewMore ?? 6
  const tan = colorToCss(s.appearance?.backgroundColor)
  const tile = !!s.useDeviceTabs // device-tab flows use the framed tile style
  return (
    <section
      className={csBandGutter(v)}
      style={{
        ...bandStyle(s.appearance),
        ...sectionPadStyle(s.appearance, padDefaults('md', page), page),
      }}
    >
      {(s.sectionTitle || s.body) && (
        <div className={`mb-2 ${v === 'page' ? csShell(v, '!px-0') : ''}`}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <Prose value={s.body} className={`max-w-[70ch] ${csBodyText(v)}`} />
        </div>
      )}
      {s.useDeviceTabs && s.tabs?.length ? (
        <DeviceGallery
          tabs={s.tabs}
          initial={initial}
          loadMore={s.loadMoreLabel}
        />
      ) : (
        <ImageGrid
          images={imgUrls(s.items)}
          captions={s.showCaptions ? capList(s.items) : undefined}
          initial={initial}
          loadMore={s.loadMoreLabel}
          tile={tile}
          light={light || !!tan}
        />
      )}
    </section>
  )
}

function ShowcaseBlock({
  section: s,
  scrollRoot,
}: {
  section: Of<'showcaseGallery'>
  scrollRoot?: React.RefObject<HTMLDivElement | null>
}) {
  const v = useCsVariant()
  const page = v === 'page'
  const items = s.items ?? []
  const images = imgUrls(items)
  const light = isLight(s.appearance, true)
  // Lightbox art defaults to the slide art when no hi-res variant is authored.
  const expandImages = s.expandable
    ? items.map(i => i.expandImage ?? i.image).filter((u): u is string => !!u)
    : undefined

  // Redesigned Research Artifacts (Figma 600:12544): 3-up landscape slider on
  // top, title + body BELOW it (left-aligned). Only the expandable variant.
  if (s.expandable) {
    const artifactGap =
      typeof s.sliderGap === 'number' && s.sliderGap >= 0
        ? s.sliderGap
        : SHOWCASE_ARTIFACT_DEFAULTS.sliderGap
    return (
      <section
        data-cs-stretch
        className="flex flex-col justify-center"
        style={{
          ...sectionStyle(s.appearance, page, 'md', '#000000', true),
          ...sectionGapStyle(s.appearance, gapDefault('lg', page), page),
        }}
      >
        <div
          className="relative flex w-full flex-col px-12 sm:px-16 max-lg:!gap-5 lg:px-6 xl:px-[3.5vw]"
          style={sectionGapStyle(s.appearance, gapDefault('lg', page), page)}
        >
          {(s.sectionTitle || s.introBody) && (
            <div
              className="order-1 w-full lg:order-2 lg:max-w-[calc((100%-2*var(--cs-artifact-gap))/3)]"
              style={{ ['--cs-artifact-gap' as string]: `${artifactGap}px` }}
            >
              {s.sectionTitle && (
                <h2
                  className={`text-center font-normal uppercase leading-tight lg:text-left lg:normal-case lg:capitalize ${
                    page
                      ? 'text-[14px] lg:text-[24px]'
                      : 'text-[14px] lg:text-[24px] xl:text-[1.5vw]'
                  } ${light ? 'text-white' : ''}`}
                >
                  {s.sectionTitle}
                </h2>
              )}
              {s.introBody?.length ? (
                <Prose
                  value={s.introBody}
                  className={`mt-4 hidden lg:block ${csBodyText(v, 'text-[16px] lg:text-[17px]')}`}
                />
              ) : null}
            </div>
          )}
          {images.length > 0 && (
            <div className="order-2 lg:order-1">
              <ArtifactSlider
                images={expandImages ?? images}
                scrollRoot={scrollRoot}
                gutter={false}
                gap={artifactGap}
              />
            </div>
          )}
        </div>
      </section>
    )
  }

  // Galderma coverflow (unchanged): title above, 5-up center slider below.
  return (
    <section
      data-cs-stretch
      className="flex flex-col justify-center"
      style={flexSectionStyle(s.appearance, page, 'md', '#000000', true)}
    >
      {(s.sectionTitle || s.introBody) && (
        <div className={csShell(v)}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <Prose
            value={s.introBody}
            className={`mt-3 ${csBodyText(v, 'text-[15px] lg:text-[16px]')}`}
          />
        </div>
      )}
      {images.length > 0 && (
        <CenterSlider images={images} expandImages={expandImages} />
      )}
    </section>
  )
}

// Motion Showcase ("Key Product Experiences"): stacked labelled device rows (Coral)
// or featured centred device band (Census mobile — Figma 2229:30253).
const MOTION_BG = '#52747e'
function MotionShowcaseBlock({
  section: s,
}: {
  section: Of<'motionShowcase'>
}) {
  const layout = s.layoutVariant ?? 'stacked'
  if (layout === 'featured') {
    return <MotionShowcaseFeaturedBand section={s} />
  }
  return <MotionShowcaseStackedBand section={s} />
}

function MotionShowcaseFeaturedBand({
  section: s,
}: {
  section: Of<'motionShowcase'>
}) {
  const v = useCsVariant()
  const page = v === 'page'
  const overlay = v === 'overlay'
  const [lg, setLg] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setLg(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const row = s.rows?.[0]
  if (!row) return null
  const items = row.items ?? []
  const captionAlign = row.captionAlign ?? 'left'
  const rowWidthDefault = overlay
    ? MOTION_ROW_DEFAULTS.rowWidthPercentOverlayFeaturedMobile
    : 34
  const rowWidth =
    typeof row.rowWidthPercent === 'number' && row.rowWidthPercent > 0
      ? row.rowWidthPercent
      : rowWidthDefault
  const titleMb =
    typeof s.titleMarginBottom === 'number' && s.titleMarginBottom >= 0
      ? s.titleMarginBottom
      : MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottom
  return (
    <section
      data-cs-stretch={page ? undefined : true}
      className={`relative flex flex-col ${page ? csBandGutter(v) : csBandGutter(v)} ${
        overlay ? 'min-h-[min(847px,88vh)]' : ''
      }`}
      style={flexSectionStyle(
        s.appearance,
        page,
        'lg',
        MOTION_FEATURED_BAND_DEFAULTS.backgroundColor,
      )}
    >
      {s.sectionTitle && (
        <h2
          className={`text-center ${csSectionTitle(v)} text-black`}
          style={{ marginBottom: lg ? titleMb : titleMb }}
        >
          {s.sectionTitle}
        </h2>
      )}
      {items.length > 0 && (
        <div className="flex justify-center pt-2 pb-0">
          <div
            className="drop-shadow-[0_4px_26px_rgba(0,0,0,0.25)]"
            style={{ width: `${rowWidth}%`, maxWidth: '245px' }}
          >
            {items.map((it, itemIndex) => (
              <FeaturedDeviceMedia
                key={it._key ?? `featured-${itemIndex}`}
                item={it}
                poster={row.posterImage}
              />
            ))}
          </div>
        </div>
      )}
      {(row.label || row.caption) &&
        (overlay ? (
          <div
            className="absolute bottom-[min(51px,8%)] left-0 w-full px-6  text-black sm:px-10 xl:px-[3.5vw]"
          >
            <div
              className="text-left"
              style={
                captionAlign === 'right'
                  ? featuredCaptionInset('right')
                  : featuredCaptionInset('left')
              }
            >
              {row.label && (
                <p className="text-[18px] font-normal capitalize leading-[1.6] xl:text-[1.15vw]">
                  {row.label}
                </p>
              )}
              {row.caption && (
                <p className="mt-2.5 max-w-[353px] text-[14px] font-normal leading-[1.6] xl:text-[0.95vw]">
                  {row.caption}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`w-full pb-[min(51px,8%)] pt-8  text-black ${csShell(v, '!px-0')}`}
          >
            <div
              className="text-left"
              style={
                captionAlign === 'right'
                  ? featuredCaptionInset('right')
                  : featuredCaptionInset('left')
              }
            >
              {row.label && (
                <p className="text-[18px] font-normal capitalize leading-[1.6] xl:text-[1.15vw]">
                  {row.label}
                </p>
              )}
              {row.caption && (
                <p className="mt-2.5 max-w-[353px] text-[14px] font-normal leading-[1.6] xl:text-[0.95vw]">
                  {row.caption}
                </p>
              )}
            </div>
          </div>
        ))}
    </section>
  )
}

function FeaturedDeviceMedia({
  item,
  poster,
}: {
  item: MediaItem
  poster?: string
}) {
  const videoPoster = item.posterImage || poster
  const videoSrc =
    typeof item.videoFile === 'string'
      ? item.videoFile
      : item.mediaType === 'video' && item.videoFile
        ? String(item.videoFile)
        : undefined
  if (videoSrc) {
    return (
      <video
        className="block h-auto w-full rounded-[24px]"
        src={videoSrc}
        poster={videoPoster}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }
  if (item.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- case-study art
      <img
        src={item.image}
        alt={item.caption || ''}
        className="block h-auto w-full rounded-[24px]"
      />
    )
  }
  return null
}

function MotionShowcaseStackedBand({
  section: s,
}: {
  section: Of<'motionShowcase'>
}) {
  const v = useCsVariant()
  const page = v === 'page'
  const rows = s.rows ?? []
  const light = isLight(s.appearance)
  const onDark = light ? 'text-[#e3e3db]' : ''
  const titleMb =
    typeof s.titleMarginBottom === 'number' && s.titleMarginBottom >= 0
      ? s.titleMarginBottom
      : MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottom
  const titleMbLg =
    typeof s.titleMarginBottomDesktop === 'number' &&
    s.titleMarginBottomDesktop >= 0
      ? s.titleMarginBottomDesktop
      : MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottomDesktop
  const introMb =
    typeof s.introMarginBottom === 'number' && s.introMarginBottom >= 0
      ? s.introMarginBottom
      : MOTION_SHOWCASE_BAND_DEFAULTS.introMarginBottom
  const [lg, setLg] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setLg(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const titleMargin = lg ? titleMbLg : titleMb
  if (!rows.length) return null
  return (
    <section
      className={csBandGutter(v)}
      style={sectionStyle(s.appearance, page, 'lg', MOTION_BG)}
    >
      {s.sectionTitle && (
        <h2
          className={`text-center ${csSectionTitle(v)} max-lg:!text-[11px] max-lg:!uppercase max-lg:!leading-[1.2] ${light ? onDark : ''}`}
          style={{ marginBottom: titleMargin }}
        >
          {s.sectionTitle}
        </h2>
      )}
      {s.intro && (
        <div
          className={`mx-auto max-w-[min(720px,100%)] text-center ${csShell(v, '!px-0')} ${onDark}`}
          style={{ marginBottom: introMb }}
        >
          <Prose value={s.intro} className={csBodyText(v, 'text-[15px] lg:text-[16px]')} />
        </div>
      )}
      <div
        className={`mx-auto flex max-w-[min(1280px,100%)] flex-col max-lg:!max-w-full ${csShell(v, '!px-0')}`}
        style={sectionGapStyle(s.appearance, gapDefault('lg', page), page)}
      >
        {rows.map((row, i) => (
          <MotionRowView
            key={row._key ?? `motion-row-${i}`}
            row={row}
            alignRight={rows.length === 1 ? false : i % 2 === 1}
            centerRow={rows.length === 1}
            light={light}
            inheritTextColor={!!s.appearance?.textColor?.hex}
          />
        ))}
      </div>
    </section>
  )
}

function MotionRowView({
  row,
  alignRight,
  centerRow = false,
  light,
  inheritTextColor,
}: {
  row: MotionRow
  alignRight: boolean
  centerRow?: boolean
  light: boolean
  inheritTextColor: boolean
}) {
  const v = useCsVariant()
  const overlay = v === 'overlay'
  const items = row.items ?? []
  const device = row.device ?? 'mobile'
  const aspect =
    device === 'mobile'
      ? 'aspect-[170/367]'
      : device === 'tablet'
        ? 'aspect-[3/4]'
        : 'aspect-[7/5]'
  const radius =
    device === 'mobile'
      ? 'rounded-[14px] max-lg:!rounded-[4px]'
      : device === 'tablet'
        ? 'rounded-[12px] max-lg:!rounded-[4px]'
        : 'rounded-[10px] max-lg:!rounded-[4px]'
  const captionColor = inheritTextColor ? '' : light ? 'text-[#e3e3db]' : 'text-black'
  const rowWidthDefault =
    overlay && device === 'mobile'
      ? 34
      : overlay && device === 'tablet'
        ? 42
        : overlay && device === 'desktop'
          ? MOTION_ROW_DEFAULTS.rowWidthPercentOverlayDesktop
          : MOTION_ROW_DEFAULTS.rowWidthPercent
  const rowWidth =
    typeof row.rowWidthPercent === 'number' && row.rowWidthPercent > 0
      ? overlay && device !== 'desktop'
        ? Math.min(row.rowWidthPercent, rowWidthDefault)
        : row.rowWidthPercent
      : rowWidthDefault
  const itemGap =
    typeof row.itemGapPercent === 'number' && row.itemGapPercent >= 0
      ? row.itemGapPercent
      : MOTION_ROW_DEFAULTS.itemGapPercent
  const captionMt =
    typeof row.captionMarginTop === 'number' && row.captionMarginTop >= 0
      ? row.captionMarginTop
      : MOTION_ROW_DEFAULTS.captionMarginTop
  const tileBg =
    colorToCss(row.tileBackgroundColor) ?? MOTION_ROW_DEFAULTS.tileBackgroundColor
  return (
    <div
      className={`flex max-lg:justify-center ${centerRow ? 'justify-center' : alignRight ? 'lg:justify-end' : 'lg:justify-start'}`}
    >
      <div
        className="w-full lg:max-w-[var(--cs-motion-row)]"
        style={{ ['--cs-motion-row' as string]: `${rowWidth}%` }}
      >
        <div
          className={`flex drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] lg:drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)] max-lg:!gap-2.5 ${
            device === 'mobile'
              ? 'max-lg:mx-auto max-lg:w-[68%]'
              : device === 'tablet'
                ? 'max-lg:mx-auto max-lg:w-[76%]'
                : ''
          }`}
          style={{ gap: `${itemGap}%` }}
        >
          {items.map((it, itemIndex) => (
            <div
              key={it._key ?? `motion-${itemIndex}`}
              className={`flex-1 ${aspect} overflow-hidden ${radius} border border-black/5`}
              style={{ backgroundColor: tileBg }}
            >
              <DeviceMedia item={it} poster={row.posterImage} device={device} />
            </div>
          ))}
        </div>
        {(row.label || row.caption) && (
          <div
            className={`w-full text-left lg:max-w-[min(325px,100%)] ${captionColor}`}
            style={{ marginTop: captionMt }}
          >
            {row.label && (
              <p className="text-[18px] font-normal capitalize leading-[1.6] max-lg:!text-[11px] max-lg:!uppercase max-lg:!leading-[1.2] xl:text-[1.15vw]">
                {row.label}
              </p>
            )}
            {row.caption && (
              <p className="mt-2.5 text-[14px] font-normal leading-[1.6] max-lg:!mt-1.5 max-lg:!text-[12px] max-lg:!leading-[1.3] xl:text-[0.95vw]">
                {row.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DeviceMedia({
  item,
  poster,
  device = 'mobile',
}: {
  item: MediaItem
  poster?: string
  device?: 'mobile' | 'tablet' | 'desktop'
}) {
  const imageFit = device === 'desktop' ? 'object-contain' : 'object-cover'
  const videoPoster = item.posterImage || poster
  const videoSrc =
    typeof item.videoFile === 'string'
      ? item.videoFile
      : item.mediaType === 'video' && item.videoFile
        ? String(item.videoFile)
        : undefined
  if (videoSrc) {
    return (
      <video
        className="h-full w-full object-cover"
        src={videoSrc}
        poster={videoPoster}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  }
  if (item.mediaType === 'video' && item.videoUrl) {
    return (
      <iframe
        src={item.videoUrl}
        title={item.caption || 'Animation'}
        className="h-full w-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    )
  }
  if (item.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- case-study art
      <img
        src={item.image}
        alt={item.caption || ''}
        className={`h-full w-full ${imageFit}`}
      />
    )
  }
  return null
}

// Project Highlights: 3×2 grid (Coral), one static board (Experian Boost
// Figma 3778:130432), or one rotating card (Memory Tubes Figma 600:32123).
function highlightFrameUrls(cell: HighlightCell): string[] {
  if (cell.frames?.length) return cell.frames
  if (cell.posterImage) return [cell.posterImage]
  return []
}

function HighlightReelBlock({ section: s }: { section: Of<'highlightReel'> }) {
  const v = useCsVariant()
  const page = v === 'page'
  const layout = s.layout ?? 'grid'
  const cells = s.cells ?? []
  const composite = layout === 'composite'
  if (composite) {
    if (!s.compositeImage) return null
  } else if (!cells.length) {
    return null
  }
  const single = layout === 'single'
  const gridGap =
    typeof s.gridGap === 'number' && s.gridGap >= 0
      ? s.gridGap
      : HIGHLIGHT_REEL_GRID_DEFAULTS.gridGap
  const gridMatte =
    colorToCss(s.gridCellMatteColor) ?? HIGHLIGHT_REEL_GRID_DEFAULTS.cellMatteColor
  const insetV =
    typeof s.gridCellInsetVerticalPercent === 'number'
      ? s.gridCellInsetVerticalPercent
      : HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetVerticalPercent
  const insetH =
    typeof s.gridCellInsetHorizontalPercent === 'number'
      ? s.gridCellInsetHorizontalPercent
      : HIGHLIGHT_REEL_GRID_DEFAULTS.cellInsetHorizontalPercent
  const singleMatte =
    colorToCss(s.singleCardMatteColor) ?? HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardMatteColor
  const singlePad =
    typeof s.singleCardPadding === 'number' && s.singleCardPadding >= 0
      ? s.singleCardPadding
      : HIGHLIGHT_REEL_SINGLE_DEFAULTS.cardPadding
  const compositeMaxW =
    typeof s.compositeMaxWidth === 'number' && s.compositeMaxWidth >= 320
      ? s.compositeMaxWidth
      : HIGHLIGHT_REEL_COMPOSITE_DEFAULTS.maxWidth
  return (
    <section
      className={csBandGutter(v)}
      style={sectionStyle(s.appearance, page, 'lg')}
    >
      {s.sectionTitle && (
        <h2
          className={`mb-12 text-left max-lg:text-[11px]! max-lg:uppercase! lg:mb-16 lg:text-center ${csSectionTitle(v)}`}
        >
          {s.sectionTitle}
        </h2>
      )}
      {composite ? (
        <HighlightCompositeView src={s.compositeImage!} maxWidth={compositeMaxW} />
      ) : single ? (
        <HighlightCardView
          frames={cells.flatMap(highlightFrameUrls)}
          matteColor={singleMatte}
          mattePadding={singlePad}
        />
      ) : (
        <div
          className="mx-auto grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:gap-[1vw]"
          style={{ gap: gridGap }}
        >
          {cells.map((c, i) => (
            <HighlightCellView
              key={c._key ?? `highlight-${i}`}
              cell={c}
              delay={i * 900}
              matteColor={gridMatte}
              insetVertical={insetV}
              insetHorizontal={insetH}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// Composite layout (Experian Boost Figma 3778:130432): one static board image.
function HighlightCompositeView({ src, maxWidth }: { src: string; maxWidth: number }) {
  return (
    <div className="mx-auto w-full" style={{ maxWidth }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- highlight art */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-auto w-full object-contain"
      />
    </div>
  )
}

// Single-card layout (Figma 600:32123): one 887×503 card, thin white matte,
// centred on the band, cycling through every frame.
function HighlightCardView({
  frames,
  matteColor,
  mattePadding,
}: {
  frames: string[]
  matteColor: string
  mattePadding: number
}) {
  const i = useFrameCycle(frames.length, 0)
  if (!frames.length) return null
  return (
    <div
      className="mx-auto w-full max-w-222 rounded-lg shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
      style={{ backgroundColor: matteColor, padding: mattePadding }}
    >
      <div className="relative aspect-887/503 overflow-hidden rounded-[5px]">
        {frames.map((src, idx) => (
          // eslint-disable-next-line @next/next/no-img-element -- highlight art
          <img
            key={idx}
            src={src}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-900 ease-in-out"
            style={{ opacity: idx === i ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  )
}

// Cross-fade index for a frame set: holds on frame 0 for `delay` ms so grid
// cells stagger, then advances every 3.6s. Static when reduced motion is on.
function useFrameCycle(count: number, delay: number) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (count < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let id = 0
    const start = window.setTimeout(() => {
      id = window.setInterval(() => setI(v => (v + 1) % count), 3600)
    }, delay)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(id)
    }
  }, [count, delay])
  return i
}

function HighlightCellView({
  cell,
  delay,
  matteColor,
  insetVertical,
  insetHorizontal,
}: {
  cell: HighlightCell
  delay: number
  matteColor: string
  insetVertical: number
  insetHorizontal: number
}) {
  const frames = cell.frames ?? []
  const videoSrc = cell.videoFile || cell.videoUrl
  const i = useFrameCycle(frames.length, delay)
  if (!videoSrc && !frames.length) return null

  const captionClass =
    'mt-2.5 max-w-64 text-center text-[17px] font-normal leading-[1.245] lg:text-[18px]'

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative aspect-303/203 w-full rounded-md"
        style={{ backgroundColor: matteColor }}
      >
        <div
          className="absolute overflow-hidden rounded-[3px]"
          style={{
            top: `${insetVertical}%`,
            bottom: `${insetVertical}%`,
            left: `${insetHorizontal}%`,
            right: `${insetHorizontal}%`,
          }}
        >
          {videoSrc ? (
            cell.videoUrl && !cell.videoFile ? (
              <iframe
                src={cell.videoUrl}
                title={cell.caption || 'Highlight animation'}
                className="h-full w-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                className="h-full w-full object-cover"
                src={videoSrc}
                poster={cell.posterImage}
                autoPlay
                loop
                muted
                playsInline
              />
            )
          ) : (
            frames.map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element -- highlight art
              <img
                key={idx}
                src={src}
                alt={cell.caption || ''}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-900 ease-in-out"
                style={{ opacity: idx === i ? 1 : 0 }}
              />
            ))
          )}
        </div>
      </div>
      {cell.caption && <p className={captionClass}>{cell.caption}</p>}
    </div>
  )
}

function StatsBlock({ section: s }: { section: Of<'statsSection'> }) {
  const v = useCsVariant()
  const page = v === 'page'
  const items = s.items ?? []
  const [lg, setLg] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setLg(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  if (!items.length) return null
  const metricGap = lg
    ? typeof s.metricGridGapDesktop === 'number' && s.metricGridGapDesktop >= 0
      ? s.metricGridGapDesktop
      : STATS_BAND_DEFAULTS.metricGridGapDesktop
    : typeof s.metricGridGap === 'number' && s.metricGridGap >= 0
      ? s.metricGridGap
      : STATS_BAND_DEFAULTS.metricGridGap
  const titleMb = lg
    ? typeof s.titleMarginBottomDesktop === 'number' &&
      s.titleMarginBottomDesktop >= 0
      ? s.titleMarginBottomDesktop
      : STATS_BAND_DEFAULTS.titleMarginBottomDesktop
    : typeof s.titleMarginBottom === 'number' && s.titleMarginBottom >= 0
      ? s.titleMarginBottom
      : STATS_BAND_DEFAULTS.titleMarginBottom
  const bodyMb =
    typeof s.bodyMarginBottom === 'number' && s.bodyMarginBottom >= 0
      ? s.bodyMarginBottom
      : STATS_BAND_DEFAULTS.bodyMarginBottom
  return (
    <section
      className={`${csBandGutter(v)} text-center`}
      style={sectionStyle(s.appearance, page, 'lg')}
    >
      {s.sectionTitle && (
        <h2 className={csImpactTitle(v)} style={{ marginBottom: titleMb }}>
          {s.sectionTitle}
        </h2>
      )}
      {s.body?.length ? (
        <div className="mx-auto max-w-[min(720px,100%)]" style={{ marginBottom: bodyMb }}>
          <Prose value={s.body} className={csBodyText(v)} />
        </div>
      ) : null}
      <div
        className="mx-auto grid w-full max-w-[min(1100px,100%)] grid-cols-1 sm:grid-cols-3"
        style={{ gap: metricGap }}
      >
        {items.map((st, i) => (
          <Stat key={st._key ?? `stat-${i}`} stat={st} />
        ))}
      </div>
    </section>
  )
}

function BulletBlock({ section: s }: { section: Of<'bulletSection'> }) {
  const v = useCsVariant()
  const page = v === 'page'
  const items = s.items ?? []
  if (!items.length) return null
  return (
    <section
      style={sectionStyle(s.appearance, page, 'md')}
    >
      <div className={csShell(v)}>
        <div className={`mx-auto ${v === 'page' ? 'max-w-[min(720px,100%)]' : 'max-w-160'}`}>
          <Label light={isLight(s.appearance)}>
            {s.sectionTitle ?? 'Next Steps'}
          </Label>
          <ul className={`mt-5 list-disc space-y-3 pl-5 ${csBodyText(v)}`}>
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

// ── shared bits ───────────────────────────────────────────────────────────────
function imgUrls(items?: GalleryImage[]): string[] {
  return (items ?? []).map(i => i.image).filter((u): u is string => !!u)
}
function capList(items?: GalleryImage[]): (string | undefined)[] {
  return (items ?? []).map(i => i.caption)
}

function Label({
  children,
  center,
  light,
}: {
  children: React.ReactNode
  center?: boolean
  light?: boolean
}) {
  const page = useCsVariant() === 'page'
  return (
    <h2
      className={`mb-5 capitalize leading-tight ${page ? 'text-[20px] font-normal lg:text-[24px]' : 'text-[20px] font-normal xl:mb-[0.5vw] xl:text-[1vw]'} ${light ? 'text-white' : ''} ${center ? 'text-center' : ''}`}
    >
      {children}
    </h2>
  )
}

function Accordion({
  items,
  variant = 'process',
}: {
  items: AccordionEntry[]
  variant?: 'brought' | 'process'
}) {
  const initial = Math.max(
    0,
    items.findIndex(i => i.defaultOpen),
  )
  const [open, setOpen] = useState(initial === -1 ? 0 : initial)
  const page = useCsVariant() === 'page'
  const headSize = page
    ? variant === 'brought'
      ? 'text-[18px] lg:text-[19px]'
      : 'text-[17px] lg:text-[18px]'
    : variant === 'brought'
      ? 'text-[18px] xl:text-[1.4vw]'
      : 'text-[18px] xl:text-[1.05vw]'
  const bodySize = page
    ? 'text-[16px] lg:text-[17px]'
    : variant === 'brought'
      ? 'text-[16px] xl:text-[1.25vw]'
      : 'text-[16px] xl:text-[0.9vw]'
  return (
    <div>
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it._key ?? `acc-${i}`} className="border-b-[0.4px] border-current">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              data-cursor="hover"
              className={`flex w-full items-center justify-between gap-6 text-left font-normal ${page ? 'py-5' : 'py-6.25 xl:py-[0.9vw]'} ${headSize}`}
            >
              <span>{it.title}</span>
              {/* Thin hairline +/− per Figma (stroke 0.7625 on a 12u grid). */}
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                fill="none"
                className="shrink-0 w-4 xl:w-[1.15vw]"
                style={{ height: 'auto' }}
              >
                <path
                  d={
                    isOpen
                      ? 'M11.0563 5.71876H0.381348'
                      : 'M5.71885 11.0563V0.381256M11.0563 5.71876H0.381348'
                  }
                  stroke="currentColor"
                  strokeWidth="0.7625"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {isOpen && it.body && (
              <Prose
                value={it.body}
                className={`pb-6 font-normal leading-normal ${bodySize}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Research-Artifacts slider (Coral redesign — Figma 600:12544): 3-up equal
 *  landscape cards on black, arrows top-right, infinite loop, tap-to-expand.
 *  No coverflow scaling/dimming — every card is shown at full opacity/size. */
function ArtifactSlider({
  images,
  scrollRoot,
  gap = SHOWCASE_ARTIFACT_DEFAULTS.sliderGap,
  gutter = true,
}: {
  images: string[]
  scrollRoot?: React.RefObject<HTMLDivElement | null>
  gap?: number
  /** Outer inset. False when the parent already provides the same gutter. */
  gutter?: boolean
}) {
  const n = images.length
  const [visible, setVisible] = useState(3)
  const [index, setIndex] = useState(n) // start in the middle copy
  const [noAnim, setNoAnim] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const locked = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportW, setViewportW] = useState(0)
  const GAP = gap

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setVisible(w < 640 ? 1 : w < 1024 ? 2 : 3)
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!viewportRef.current) return
    const ro = new ResizeObserver(() => {
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth)
    })
    ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [])

  const go = (dir: 1 | -1) => {
    if (locked.current || n <= visible) return
    locked.current = true
    setIndex(i => i + dir)
    window.setTimeout(() => {
      locked.current = false
    }, 620)
  }

  // Snap back into the middle copy once a transition lands in an edge copy.
  useEffect(() => {
    if (n < 1) return
    if (index >= 2 * n || index < n) {
      const t = window.setTimeout(() => {
        setNoAnim(true)
        setIndex(i => (i >= 2 * n ? i - n : i + n))
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setNoAnim(false)),
        )
      }, 600)
      return () => window.clearTimeout(t)
    }
  }, [index, n])

  const loop = n > 0 ? [...images, ...images, ...images] : []
  const itemW = viewportW > 0 ? (viewportW - (visible - 1) * GAP) / visible : 0
  const step = itemW + GAP
  const translateX = -index * step
  const fallbackW = `calc((100% - ${(visible - 1) * GAP}px) / ${visible})`
  const canPage = n > visible

  return (
    <div className={`relative w-full ${gutter ? 'px-6 sm:px-10 xl:px-[3.5vw]' : ''}`}>
      {/* Mobile — Figma 344:19555: stacked list, no carousel. */}
      <div className="flex flex-col items-center gap-9 lg:hidden">
        {images.map((src, i) => (
          <button
            key={`artifact-stack-${i}`}
            type="button"
            aria-label={`Expand artifact ${i + 1}`}
            onClick={() => setLightbox(i)}
            data-cursor="hover"
            className="w-full overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
          >
            <div className="aspect-1800/1098 w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            </div>
          </button>
        ))}
      </div>

      <div className="hidden lg:block">
        {canPage && (
          // Figma 600:12626: text chevrons, Neue Haas 21px / 500 / +0.44px, 29px gap.
          <div className="mb-5 flex items-center justify-end gap-7.25 text-[21px] font-medium leading-none  text-white xl:text-[1.35vw]">
            <button
              type="button"
              aria-label="Previous slide"
              data-cursor="hover"
              onClick={() => go(-1)}
              className="bg-transparent transition-opacity hover:opacity-70"
            >
              &lt;
            </button>
            <button
              type="button"
              aria-label="Next slide"
              data-cursor="hover"
              onClick={() => go(1)}
              className="bg-transparent transition-opacity hover:opacity-70"
            >
              &gt;
            </button>
          </div>
        )}
        <div ref={viewportRef} className="overflow-hidden">
          <div
            className="flex"
            style={{
              gap: GAP,
              transform: `translateX(${translateX}px)`,
              transition: noAnim ? 'none' : 'transform 600ms ease',
              willChange: 'transform',
            }}
          >
            {loop.map((src, i) => {
              const real = ((i % n) + n) % n
              return (
                <button
                  key={`artifact-${real}-${i}`}
                  type="button"
                  aria-label={`Expand artifact ${real + 1}`}
                  onClick={() => setLightbox(real)}
                  data-cursor="hover"
                  className="group shrink-0 overflow-hidden bg-white shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
                  style={{ width: itemW > 0 ? `${itemW}px` : fallbackW }}
                >
                  <div className="aspect-1800/1098 w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      {lightbox !== null && (
        <ArtifactLightbox
          images={images}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
          container={scrollRoot?.current ?? null}
        />
      )}
    </div>
  )
}

/** Cover-flow slider (Galderma showcase): 5-up centered carousel, autoplay,
 *  infinite loop, white prev/next arrows. */
function CenterSlider({
  images,
  expandImages,
}: {
  images: string[]
  expandImages?: string[]
}) {
  const n = images.length
  const [visible, setVisible] = useState(5)
  const [index, setIndex] = useState(() => Math.max(n, 0))
  const [noAnim, setNoAnim] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const locked = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportW, setViewportW] = useState(0)
  const expandable = !!expandImages?.length

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setVisible(w < 575 ? 1 : w < 992 ? 3 : 5)
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (!viewportRef.current) return
    setViewportW(viewportRef.current.clientWidth)
    const ro = new ResizeObserver(() => {
      if (viewportRef.current) setViewportW(viewportRef.current.clientWidth)
    })
    ro.observe(viewportRef.current)
    return () => ro.disconnect()
  }, [])

  const go = (dir: 1 | -1) => {
    if (locked.current || n < 2) return
    locked.current = true
    setIndex(i => i + dir)
    window.setTimeout(() => {
      locked.current = false
    }, 820)
  }

  useEffect(() => {
    if (n < 1) return
    if (index >= 2 * n || index < n) {
      const t = window.setTimeout(() => {
        setNoAnim(true)
        setIndex(i => (i >= 2 * n ? i - n : i < n ? i + n : i))
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setNoAnim(false))
        })
      }, 800)
      return () => window.clearTimeout(t)
    }
  }, [index, n])

  useEffect(() => {
    if (n < 2) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      if (locked.current) return
      locked.current = true
      setIndex(i => i + 1)
      window.setTimeout(() => {
        locked.current = false
      }, 820)
    }, 6000)
    return () => window.clearInterval(id)
  }, [n])

  const loop = n > 0 ? [...images, ...images, ...images] : []
  const gapPx = viewportW > 0 ? viewportW * 0.015 : 0
  const slideW = viewportW > 0 ? viewportW / visible : 0
  const translateX = viewportW > 0 ? viewportW / 2 - (index + 0.5) * slideW : 0
  const realIdx = n > 0 ? ((index % n) + n) % n : 0

  return (
    <div className="cs-center-slider relative w-full pt-[3.5vw] pb-[3vw]">
      <div className="pointer-events-none absolute top-0 right-[3vw] z-10 flex items-center gap-[1.5vw]">
        <button
          type="button"
          aria-label="Previous slide"
          data-cursor="hover"
          onClick={() => go(-1)}
          className="pointer-events-auto bg-transparent p-1 opacity-90 transition-opacity hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- theme arrow */}
          <img
            src="/work/slider-arrows.svg"
            alt=""
            className="h-[0.85vw] min-h-2 w-[2vw] min-w-4.75 -scale-x-100 brightness-0 invert"
          />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          data-cursor="hover"
          onClick={() => go(1)}
          className="pointer-events-auto bg-transparent p-1 opacity-90 transition-opacity hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- theme arrow */}
          <img
            src="/work/slider-arrows.svg"
            alt=""
            className="h-[0.85vw] min-h-2 w-[2vw] min-w-4.75 brightness-0 invert"
          />
        </button>
      </div>
      <div
        ref={viewportRef}
        className="overflow-x-hidden overflow-y-visible py-[2vw]"
      >
        <div
          className="flex items-center"
          style={{
            transform: `translateX(${translateX}px)`,
            transition: noAnim ? 'none' : 'transform 800ms ease-in-out',
            willChange: 'transform',
          }}
        >
          {loop.map((src, i) => {
            const isCtr = i === index
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                aria-label={`Slide ${(i % n) + 1}`}
                aria-current={isCtr ? 'true' : undefined}
                onClick={() => {
                  // Clicking the centered artifact opens the full-screen
                  // lightbox; clicking a side slide just centers it.
                  if (i === index) {
                    if (expandable) setLightbox(realIdx)
                    return
                  }
                  if (locked.current || n < 1) return
                  const target = Math.floor(index / n) * n + (i % n)
                  locked.current = true
                  setIndex(target)
                  window.setTimeout(() => {
                    locked.current = false
                  }, 820)
                }}
                data-cursor="hover"
                className="relative shrink-0 overflow-visible bg-transparent p-0"
                style={{
                  width: slideW > 0 ? `${slideW}px` : `${100 / visible}%`,
                  paddingLeft: gapPx,
                  paddingRight: gapPx,
                  zIndex: isCtr ? 2 : 1,
                }}
              >
                <div
                  className="relative w-full overflow-hidden pt-[150%] transition-transform duration-800 ease-in-out"
                  style={{ transform: isCtr ? 'scale(1.15)' : 'scale(1)' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img
                    key={isCtr ? `c-${realIdx}` : `s-${i}`}
                    src={src}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover object-top ${isCtr ? 'cs-center-pan' : ''}`}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-black transition-opacity duration-500"
                    style={{ opacity: isCtr ? 0 : 0.85 }}
                    aria-hidden
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
      {expandable && lightbox !== null && expandImages && (
        <ArtifactLightbox
          images={expandImages}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

/** Artifact viewer (Fas 07/23 — "when you tap on it… it expands").
 *  In the case-study modal it's scoped INSIDE the modal (Figma 359:13865): black
 *  fills the modal's content area and the card is smaller than the modal. On the
 *  standalone page it falls back to a full-screen overlay. ←/→ move, Esc/✕ close. */
function ArtifactLightbox({
  images,
  index,
  onIndex,
  onClose,
  container,
}: {
  images: string[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  container?: HTMLElement | null
}) {
  const n = images.length
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onIndex((index + 1) % n)
      else if (e.key === 'ArrowLeft') onIndex((index - 1 + n) % n)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, n, onIndex, onClose])

  // While open, block wheel/touch scroll on the host so the scoped (absolute)
  // overlay stays pinned over the modal's visible area.
  useEffect(() => {
    const el = container
    if (!el) return
    const block = (e: Event) => e.preventDefault()
    el.addEventListener('wheel', block, { passive: false })
    el.addEventListener('touchmove', block, { passive: false })
    return () => {
      el.removeEventListener('wheel', block)
      el.removeEventListener('touchmove', block)
    }
  }, [container])

  if (typeof document === 'undefined') return null
  const scoped = !!container
  const target = container ?? document.body
  // Cover the modal's *visible* area (it's a scroll container); scroll is frozen above.
  const scopedStyle = scoped
    ? {
        position: 'absolute' as const,
        top: container!.scrollTop,
        left: 0,
        right: 0,
        height: container!.clientHeight,
      }
    : undefined
  // Definite width so every artifact renders at the SAME display size — even the
  // low-res one (it upscales) — instead of shrinking to its natural width.
  const cardW = scoped ? 'w-[90%]' : 'w-[90vw] max-w-[1100px]'

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Research artifact"
      onClick={onClose}
      style={scopedStyle}
      className={`${scoped ? 'absolute z-40' : 'fixed inset-0 z-120'} flex items-center justify-center bg-black px-4 py-10 animate-[panel-in_0.2s_ease-out]`}
    >
      {/* Card + close ✕ move together; ✕ sits on the card's top-right (Figma 359:13865). */}
      <div
        className={`relative ${cardW}`}
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-3 top-3 z-10 text-black transition-transform hover:scale-110"
        >
          {/* Figma close glyph: plain ✕, 19u grid, stroke 2.46 rounded (rendered smaller). */}
          <svg width="13" height="13" viewBox="0 0 19 19" fill="none" aria-hidden>
            <path
              d="M1.23071 17.2308L9.23071 9.23077L17.2307 1.23077M9.23071 9.23077L1.23071 1.23077L17.2307 17.2308"
              stroke="currentColor"
              strokeWidth="2.46154"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- artifact art */}
        <img
          src={images[index]}
          alt=""
          className="block h-auto w-full max-h-[82vh] bg-white object-contain"
        />
      </div>
    </div>,
    target,
  )
}

function DeviceGallery({
  tabs,
  initial,
  loadMore,
  tileBg,
  light,
  gridSize = 'default',
  gridColumnGap,
  gridRowGap,
}: {
  tabs: DeviceTab[]
  initial: number
  loadMore?: string
  tileBg?: string
  light?: boolean
  gridSize?: 'default' | 'popup'
  gridColumnGap?: number
  gridRowGap?: number
}) {
  const [active, setActive] = useState(0)
  const tab = tabs[active]
  return (
    <div className={gridSize === 'popup' ? 'w-full' : 'mt-8'}>
      <div className="mx-auto flex w-full flex-nowrap justify-center gap-x-3 sm:flex-wrap sm:gap-8 xl:gap-[6vw]">
        {tabs.map((v, i) => (
          <button
            key={v._key}
            type="button"
            onClick={() => setActive(i)}
            data-cursor="hover"
            className="shrink-0 text-[12px] uppercase leading-none sm:text-[16px] xl:text-[1vw]"
          >
            <span
              className={`relative inline-block whitespace-nowrap pb-1 after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:transition-all after:duration-300 ${
                active === i ? 'after:w-full' : 'after:w-0 hover:after:w-full'
              }`}
            >
              {v.label}
            </span>
          </button>
        ))}
      </div>
      <ImageGrid
        key={tab?._key}
        images={imgUrls(tab?.items)}
        initial={initial}
        loadMore={loadMore}
        tile
        tileBg={tileBg}
        light={light}
        size={gridSize}
        gridColumnGap={gridColumnGap}
        gridRowGap={gridRowGap}
      />
    </div>
  )
}

function ImageGrid({
  images,
  captions,
  initial = 6,
  loadMore = 'Load More',
  tile,
  tileBg,
  light,
  size = 'default',
  gridColumnGap,
  gridRowGap,
}: {
  images: string[]
  captions?: (string | undefined)[]
  initial?: number
  loadMore?: string
  tile?: boolean
  tileBg?: string
  light?: boolean
  size?: 'default' | 'popup'
  gridColumnGap?: number
  gridRowGap?: number
}) {
  const STEP = 4
  const [shown, setShown] = useState(initial)
  const visible = images.slice(0, shown)
  const tileFill = tileBg ?? TILE
  const popup = size === 'popup'
  const colGap = gridColumnGap ?? (popup ? 16 : undefined)
  const rowGap = gridRowGap ?? (popup ? 24 : undefined)
  return (
    <>
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          popup ? 'mt-5' : 'mt-8 gap-y-10'
        }`}
        style={{
          columnGap: colGap ?? '5vw',
          rowGap: rowGap ?? (popup ? 24 : 40),
        }}
      >
        {visible.map((src, i) =>
          tile ? (
            <div
              key={i}
              className={`flex items-center justify-center shadow-[0_0.5vw_0.8vw_rgba(0,0,0,0.4)] ${
                popup ? 'p-3 sm:min-h-[min(42vh,520px)]' : ''
              }`}
              style={{ backgroundColor: tileFill }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className={
                  popup
                    ? 'w-full object-contain sm:max-h-[min(42vh,540px)]'
                    : 'h-[40vw] w-full object-contain xl:h-[20vw]'
                }
              />
            </div>
          ) : (
            <figure key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="block h-auto w-full object-cover"
              />
              {captions?.[i] && (
                <figcaption className="mt-2 text-[13px] opacity-70">
                  {captions[i]}
                </figcaption>
              )}
            </figure>
          ),
        )}
      </div>
      {shown < images.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown(n => n + STEP)}
            data-cursor="hover"
            className={`relative pb-1 text-[16px] uppercase leading-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current xl:text-[1vw] ${light ? 'text-white' : ''}`}
          >
            {loadMore}
          </button>
        </div>
      )}
    </>
  )
}

function Stat({ stat }: { stat: StatItem }) {
  const ref = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)
  const page = useCsVariant() === 'page'
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const io = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const dur = 1500
        const tick = (t: number) => {
          const k = Math.min(1, (t - start) / dur)
          setN(Math.floor(k * stat.value))
          if (k < 1) raf = requestAnimationFrame(tick)
          else setN(stat.value)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [stat.value])
  return (
    <div ref={ref} className="mx-auto flex max-w-73 flex-col items-center text-center ">
      {/* Impact stat — inherits Reckless Regular from `.cs-root`. */}
      <p className={`font-normal leading-none ${page ? 'text-[64px] sm:text-[80px] lg:text-[96px]' : 'text-[64px] font-normal leading-none sm:text-[80px] xl:text-[5vw]'}`}>
        {stat.prefix}
        {n}
        {stat.suffix}
      </p>
      <p className={`mt-5 font-normal leading-[1.245] ${page ? 'text-[17px] lg:text-[18px]' : 'text-[18px] xl:text-[1.15vw]'}`}>
        {stat.label}
      </p>
      {stat.note && (
        <p className={`mt-2.5 max-w-64 font-normal leading-[1.245] ${page ? 'text-[17px] lg:text-[18px]' : 'text-[18px] xl:text-[1.15vw]'}`}>
          {stat.note}
        </p>
      )}
    </div>
  )
}

