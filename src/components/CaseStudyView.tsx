'use client'

import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
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
  PaddingToken,
  SanityColor,
  Section,
  StatItem,
  Study,
  StudyCard,
} from '@/sanity/types'

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

const PAD_T: Record<PaddingToken, string> = {
  none: 'pt-0',
  sm: 'pt-8',
  md: 'pt-[60px] xl:pt-[5vw]',
  lg: 'pt-24 xl:pt-[7vw]',
  xl: 'pt-32 xl:pt-[9vw]',
}
const PAD_B: Record<PaddingToken, string> = {
  none: 'pb-0',
  sm: 'pb-8',
  md: 'pb-[60px] xl:pb-[5vw]',
  lg: 'pb-24 xl:pb-[7vw]',
  xl: 'pb-32 xl:pb-[9vw]',
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
    if (align === 'center') return 'mx-auto w-full max-w-[min(920px,100%)]'
    return 'mx-auto w-full max-w-[min(920px,100%)]'
  }
  return `mx-auto ${align === 'center' ? 'lg:max-w-[60%]' : MAXW[widthKey]}`
}

function csBodyText(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `text-[18px] font-light leading-[1.65] tracking-[0.01em] lg:text-[19px] ${extra}`
  }
  return `text-[18px] font-light leading-[1.6] tracking-[0.382px] xl:text-[1.25vw] ${extra}`
}

function csSectionTitle(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `font-normal capitalize leading-tight text-[22px] lg:text-[26px] ${extra}`
  }
  return `font-medium capitalize leading-tight text-[24px] xl:text-[1.5vw] ${extra}`
}

function csBandGutter(v: CsVariant, extra = '') {
  if (v === 'page') return `px-5 sm:px-8 lg:px-12 ${extra}`
  return `px-6 sm:px-10 xl:px-[3.5vw] ${extra}`
}

function csPagerShell(v: CsVariant, extra = '') {
  if (v === 'page') {
    return `flex w-full items-center justify-between px-6 sm:px-10 ${extra}`
  }
  return `mx-auto flex w-full max-w-225 items-center justify-between px-6 ${extra}`
}

function bandStyle(a?: Appearance, defaultBg?: string, defaultLight?: boolean) {
  const style: React.CSSProperties = {}
  const bg = colorToCss(a?.backgroundColor) ?? defaultBg
  if (bg) style.backgroundColor = bg
  const tc = colorToCss(a?.textColor) ?? (defaultLight ? '#ffffff' : undefined)
  if (tc) style.color = tc
  return style
}

function padClasses(a?: Appearance, natural: PaddingToken = 'md') {
  return `${PAD_T[a?.paddingTop ?? natural]} ${PAD_B[a?.paddingBottom ?? natural]}`
}

/** Grouped prose bands: top pad from first block, bottom from last (Coral PC + WIB). */
function proseGroupPad(
  sections: (Of<'proseSection'> | Of<'bulletSection'>)[],
  page: boolean,
) {
  const first = sections[0]
  const last = sections[sections.length - 1]
  const top = first.appearance?.paddingTop ?? 'md'
  const bottom =
    last.appearance?.paddingBottom ??
    first.appearance?.paddingBottom ??
    'md'
  if (page) {
    // Full page — fixed rem rhythm; no popup vw padding or one-screen centering.
    const PAGE_PAD_T: Record<PaddingToken, string> = {
      none: 'pt-0',
      sm: 'pt-10',
      md: 'pt-12 lg:pt-14',
      lg: 'pt-16 lg:pt-20',
      xl: 'pt-20 lg:pt-24',
    }
    const PAGE_PAD_B: Record<PaddingToken, string> = {
      none: 'pb-0',
      sm: 'pb-10',
      md: 'pb-12 lg:pb-14',
      lg: 'pb-16 lg:pb-20',
      xl: 'pb-20 lg:pb-24',
    }
    return `${PAGE_PAD_T[top]} ${PAGE_PAD_B[bottom]}`
  }
  return `${PAD_T[top]} ${PAD_B[bottom]}`
}

/** True when a band should treat its text as light (for default label colour). */
function isLight(a?: Appearance, defaultLight?: boolean) {
  if (a?.textColor?.hex) return hexToRgb(a.textColor.hex).r < 140
  const bg = a?.backgroundColor
  if (bg?.hex && (bg.alpha ?? 1) > 0.5) {
    const { r, g, b } = hexToRgb(bg.hex)
    return (r * 299 + g * 587 + b * 114) / 1000 < 140
  }
  return !!defaultLight
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
    const root = overlay ? scroller : scrollRef.current
    if (!root) return
    const sections = Array.from(root.querySelectorAll('section'))
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach(s => s.classList.add('cs-active'))
      return
    }
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
        root: overlay ? root : null,
      },
    )
    sections.forEach(s => io.observe(s))

    const target: HTMLElement | Window = overlay ? root : window
    const onScroll = () => {
      const vh = overlay ? root.clientHeight : window.innerHeight
      const rootTop = overlay ? root.getBoundingClientRect().top : 0
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
      className={`${csPagerShell(variant)} font-grotesk font-medium text-[16px] lg:text-[17px]`}
      style={{ color: RED }}
    >
      <Link
        href={`/work/${prev.slug}`}
        onClick={goTo(prev.slug)}
        data-cursor="hover"
        className="transition-opacity hover:opacity-70"
      >
        &lt; Previous
      </Link>
      <Link
        href={`/work/${next.slug}`}
        onClick={goTo(next.slug)}
        data-cursor="hover"
        className="transition-opacity hover:opacity-70"
      >
        Next &gt;
      </Link>
    </div>
  )

  const inner = (
    <CsVariantContext.Provider value={variant}>
      <>
      {/* Overlay mode gets the shared popup header instead. */}
      {!overlay && (
        <div className="sticky top-0 z-50 border-b border-black/15 bg-white">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:py-4">
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-2 font-grotesk text-[15px] font-light lg:text-[16px]"
          >
            <Link
              href="/work"
              data-cursor="hover"
              className="text-black/55 transition-colors hover:text-black"
            >
              Work
            </Link>
            <span aria-hidden className="text-black/35">
              /
            </span>
            <span aria-current="page" className="underline underline-offset-4">
              {p.name}
            </span>
          </nav>
          <Link
            href="/work"
            aria-label="Close"
            data-cursor="hover"
            className="font-grotesk text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ×
          </Link>
          </div>
        </div>
      )}

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
            scrollRoot={overlay ? scrollRef : undefined}
          />
        ),
      )}

      {p.fullCaseStudyPdfUrl ? (
        <FullCaseStudyPdfLink
          url={p.fullCaseStudyPdfUrl}
          label={p.fullCaseStudyLabel?.trim() || 'Read the Full Case Study'}
        />
      ) : null}

      {!overlay && (
        <div className="sticky bottom-0 z-50 border-t border-black/10 bg-white py-3 lg:py-3.5">
          {pager}
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
        crumbs={[{ label: 'Work', href: '/work', hideOnMobile: true }, { label: p.name }]}
        bodyRef={setScrollNode}
        bodyClassName="cs-root cs-fullheight relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-white font-grotesk text-black"
        footer={pager}
      >
        {inner}
      </PopupShell>
    )
  }

  return (
    <div
      ref={setScrollNode}
      className="cs-root cs-page min-h-screen bg-white font-grotesk text-black"
    >
      {inner}
    </div>
  )
}

// ── per-section dispatch ──────────────────────────────────────────────────────
/** Figma 2110:41721 — centered red “Read the Full Case Study ↗” on black band. */
function FullCaseStudyPdfLink({ url, label }: { url: string; label: string }) {
  const v = useCsVariant()
  return (
    <section className="bg-black py-12 text-center text-white lg:py-16">
      <div className={csShell(v)}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="group inline-flex items-center gap-0 font-grotesk text-[20px] font-normal leading-snug text-accent lg:text-[24px]"
        >
          <span className="underline decoration-from-font underline-offset-[6px] transition-opacity group-hover:opacity-80">
            {label}
          </span>
          <ExternalArrow />
        </a>
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
    case 'coreExperience':
      return <CoreExperienceBlock section={section} />
    case 'mediaSection':
      return <MediaBlock section={section} />
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
 * `proseSection`s are still coalesced here until patched.
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
  const pad =
    page && allProse
      ? 'pt-24 pb-24 lg:pt-36 lg:pb-36'
      : proseGroupPad(sections, page)
  return (
    <section
      className={`${pad} ${ALIGN[align]}`}
      style={bandStyle(first.appearance)}
    >
      <div className={csShell(v)}>
        <div className={`flex flex-col ${page && allProse ? 'gap-24' : 'gap-12'} ${csProseInner(v, align, width)}`}>
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
  if (!s.image && !s.imageMobile) return null
  const title = s.headingOverride ?? p.name
  const caption = (
    <>
      <p className="text-[16px] leading-[1.6] xl:text-[1.3vw]">
        <strong className="font-bold">{title}</strong> · {s.caption ?? p.tagline}
      </p>
      {/* Fas 08/05: the project's before/after framing belongs here, under the
         hero title line — not in the Overview metadata column where Israel's
         annotation panel first placed it. Upright and in the band's own colour,
         per 2110:39398; the labels carry a single weight step rather than the
         accent red, which the site reserves for interactive tokens. */}
      {(p.from || p.to) && (
        <p className="mt-0.5 flex flex-wrap gap-x-14 text-[16px] leading-[1.6] xl:text-[1.3vw]">
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
  return (
    <section className="relative">
      {s.imageMobile ? (
        /* Mobile hero art + caption below (Figma 2079:26236). */
        <div className="flex flex-col gap-2.5 bg-white lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
          <img
            src={mobileArt}
            alt={p.name}
            className="block h-auto w-full bg-[#ededed] object-cover object-center"
          />
          <div className="px-5 pb-4 pt-1 text-black">
            <p className="text-[18px] font-bold leading-[1.35] tracking-[0.09em]">
              <span className="underline decoration-from-font underline-offset-[6px]">
                {title}
              </span>
            </p>
            {(p.from || p.to) && (
              <p className="mt-2 text-[18px] leading-[1.35] tracking-[0.09em]">
                {p.from && (
                  <>
                    <span className="font-medium italic">From</span>
                    <span>: {p.from}</span>
                    <span aria-hidden className="inline-block w-6" />
                  </>
                )}
                {p.to && (
                  <>
                    <span className="font-medium italic">To</span>
                    <span>: {p.to}</span>
                  </>
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
      <div className="relative hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={s.image}
          alt={p.name}
          className="block h-auto w-full object-cover object-left"
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
    ? 'text-[14px] font-light leading-[1.6]'
    : 'text-[14px] font-light leading-[1.6] xl:text-[0.95vw]'
  const metaXs = page
    ? 'text-[12px] font-light italic leading-4.25 tracking-[1px]'
    : 'text-[12px] font-light italic leading-4.25 tracking-[1px] xl:text-[0.82vw]'
  const sideBg = colorToCss(s.sideImageBackgroundColor) ?? TEAL
  return (
    <section
      data-cs-stretch={page ? undefined : true}
      className={`grid min-h-0 grid-cols-1 overflow-hidden lg:grid-cols-2 ${page ? 'lg:items-stretch' : ''}`}
      style={bandStyle(s.appearance)}
    >
      <div
        className={`flex min-h-0 flex-col gap-10 ${
          page
            ? 'justify-start px-5 py-12 sm:px-8 lg:pl-12 lg:pr-16 lg:pt-14 lg:pb-20 xl:pl-16 xl:pr-20 xl:pb-24'
            : `justify-between py-12 lg:py-14 xl:py-[3.8rem] ${gutter}`
        }`}
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
              className={`mt-6 inline-block text-[18px] font-normal underline underline-offset-4 transition-colors hover:text-accent ${dark} max-lg:uppercase max-lg:tracking-[0.04em] lg:capitalize ${page ? '' : 'xl:text-[1.15vw]'}`}
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
                className={`text-[18px] font-light capitalize leading-tight ${dark} ${page ? '' : 'xl:text-[1.15vw]'}`}
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
      {/* Mobile: still preferred over video (Figma overview mockups).
          Band ~360×552; media contained + centred (phone, laptop, or collage). */}
      <div
        className="relative flex aspect-[360/552] items-center justify-center px-[10%] py-[10%] lg:hidden"
        style={{ backgroundColor: sideBg }}
      >
        {s.sideImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- case-study art
          <img
            src={s.sideImage}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          s.sideVideo && (
            <video
              src={s.sideVideo}
              autoPlay
              loop
              muted
              playsInline
              className="max-h-full max-w-full object-contain"
            />
          )
        )}
      </div>
      {/* Desktop: video if set, else image fill / contain (Figma 600:12450). */}
      {s.sideVideo ? (
        <div
          className={
            page
              ? 'relative hidden min-h-0 items-center justify-center px-5 py-12 sm:px-8 lg:flex lg:px-10 lg:py-14'
              : 'relative hidden items-center justify-center lg:flex lg:min-h-full lg:p-12 xl:p-[3vw]'
          }
          style={{
            backgroundColor: colorToCss(s.sideImageBackgroundColor) ?? '#fff',
          }}
        >
          <video
            src={s.sideVideo}
            autoPlay
            loop
            muted
            playsInline
            className={
              page
                ? 'h-auto max-h-[min(560px,72vh)] w-full max-w-[min(420px,100%)] object-contain'
                : 'h-auto max-h-full w-full max-w-90 object-contain xl:max-w-[24vw]'
            }
          />
        </div>
      ) : (
        <div
          className={
            page
              ? 'relative hidden min-h-0 items-center justify-center px-5 py-12 sm:px-8 lg:flex lg:px-10 lg:py-14'
              : 'relative hidden lg:block lg:min-h-full'
          }
          style={{ backgroundColor: sideBg }}
        >
          {s.sideImage && (
            // eslint-disable-next-line @next/next/no-img-element -- case-study art
            <img
              src={s.sideImage}
              alt=""
              className={
                page
                  ? 'h-auto max-h-[min(560px,72vh)] w-full max-w-[min(420px,100%)] object-contain'
                  : contain
                    ? 'absolute inset-0 h-full w-full object-contain object-center'
                    : 'absolute inset-0 h-full w-full object-cover object-center'
              }
            />
          )}
        </div>
      )}
    </section>
  )
}

function AccordionBlock({ section: s }: { section: Of<'accordionSection'> }) {
  const v = useCsVariant()
  const light = isLight(s.appearance)
  const items = s.items ?? []
  const page = v === 'page'
  if (s.variant === 'split') {
    return (
      <section
        data-cs-stretch
        className={padClasses(s.appearance, 'md')}
        style={bandStyle(s.appearance, SAGE)}
      >
        <div
          className={`grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 lg:grid-rows-[1fr] ${page ? csShell(v) : csBandGutter(v)}`}
        >
        <div className="flex flex-col justify-end">
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
          className="self-stretch p-[10vw_5vw] xl:p-[2vw]"
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
    <section
      className={padClasses(s.appearance, 'md')}
      style={bandStyle(s.appearance, SAGE)}
    >
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
  const light = isLight(s.appearance)
  const align = s.appearance?.contentAlignment ?? 'center'
  const width = s.appearance?.maxWidth ?? 'default'
  return (
    <section
      className={`${padClasses(s.appearance, 'md')} ${ALIGN[align]}`}
      style={bandStyle(s.appearance)}
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
  const pad =
    v === 'page'
      ? 'pt-24 pb-24 lg:pt-36 lg:pb-36'
      : padClasses(s.appearance, 'md')
  return (
    <section
      className={`${pad} ${ALIGN[align]}`}
      style={bandStyle(s.appearance)}
    >
      <div className={csShell(v)}>
        <div className={`flex flex-col ${v === 'page' ? 'gap-24' : 'gap-12'} ${csProseInner(v, align, width)}`}>
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

// Core Experience Showcase (Fas 08/05): the band between What I Brought and
// Design Process. One exported artwork of the product's key screens, edge to
// edge on the band colour — deliberately a single image rather than authored
// per screen, so Fas and Israel can iterate the composition in Figma.
function CoreExperienceBlock({ section: s }: { section: Of<'coreExperience'> }) {
  const v = useCsVariant()
  const light = isLight(s.appearance)
  if (!s.image) return null
  return (
    <section
      data-cs-stretch
      className={`flex flex-col justify-center gap-10 ${padClasses(s.appearance, 'md')}`}
      style={bandStyle(s.appearance)}
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
      {/* The wide artwork is a row of screens, so scaling it to a phone makes
          every caption unreadable. Without a narrow crop it keeps a legible
          width on small screens and the band scrolls sideways instead; upload an
          `imageMobile` and it goes back to fitting the viewport. */}
      <div className={s.imageMobile ? undefined : 'overflow-x-auto sm:overflow-x-visible'}>
        <picture>
          {s.imageMobile && (
            <source media="(max-width: 640px)" srcSet={s.imageMobile} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
          <img
            src={s.image}
            alt={s.sectionTitle ?? 'Core experience screens'}
            className={`block h-auto ${s.imageMobile ? 'w-full' : 'w-208 max-w-none sm:w-full sm:max-w-full'}`}
          />
        </picture>
      </div>
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
      className={`flex flex-col justify-center gap-10 ${padClasses(s.appearance, 'md')}`}
      style={bandStyle(s.appearance)}
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
          {items.map(m => (
            <MediaUnit key={m._key} item={m} />
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
  const light = isLight(s.appearance)
  const initial = s.itemsBeforeViewMore ?? 6
  const tan = colorToCss(s.appearance?.backgroundColor)
  const tile = !!s.useDeviceTabs // device-tab flows use the framed tile style
  return (
    <section
      className={`${csBandGutter(v)} ${padClasses(s.appearance, 'md')}`}
      style={bandStyle(s.appearance)}
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
    return (
      <section
        data-cs-stretch
        className={`flex flex-col justify-center gap-12 ${padClasses(s.appearance, 'md')}`}
        style={bandStyle(s.appearance, '#000000', true)}
      >
        {images.length > 0 && (
          <ArtifactSlider
            images={expandImages ?? images}
            scrollRoot={scrollRoot}
          />
        )}
        {(s.sectionTitle || s.introBody) && (
          <div className={csShell(v)}>
            {s.sectionTitle && (
              <h2 className={`${csSectionTitle(v)} ${light ? 'text-white' : ''}`}>
                {s.sectionTitle}
              </h2>
            )}
            <Prose
              value={s.introBody}
              className={`mt-4 ${csBodyText(v, 'text-[16px] lg:text-[17px]')}`}
            />
          </div>
        )}
      </section>
    )
  }

  // Galderma coverflow (unchanged): title above, 5-up center slider below.
  return (
    <section
      data-cs-stretch
      className={`flex flex-col justify-center gap-10 ${padClasses(s.appearance, 'md')}`}
      style={bandStyle(s.appearance, '#000000', true)}
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

// Motion Showcase ("Key Product Experiences"): stacked labelled device rows.
// Each frame is a looping video (Jitter export) or a static placeholder frame.
const MOTION_BG = '#a4856e'
function MotionShowcaseBlock({
  section: s,
}: {
  section: Of<'motionShowcase'>
}) {
  const v = useCsVariant()
  const rows = s.rows ?? []
  if (!rows.length) return null
  return (
    <section
      className={`${csBandGutter(v)} ${padClasses(s.appearance, 'lg')}`}
      style={bandStyle(s.appearance, MOTION_BG)}
    >
      {s.sectionTitle && (
        <h2 className={`mb-10 text-center lg:mb-14 ${csSectionTitle(v)}`}>
          {s.sectionTitle}
        </h2>
      )}
      {s.intro && (
        <div className={`mx-auto mb-10 max-w-[min(720px,100%)] text-center ${csShell(v, '!px-0')}`}>
          <Prose value={s.intro} className={csBodyText(v, 'text-[15px] lg:text-[16px]')} />
        </div>
      )}
      <div className={`mx-auto flex max-w-[min(1280px,100%)] flex-col gap-12 lg:gap-16 ${csShell(v, '!px-0')}`}>
        {rows.map((row, i) => (
          <MotionRowView
            key={row._key}
            row={row}
            alignRight={i % 2 === 1}
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
  // Bands that author a text colour (Experian's indigo) let the label inherit
  // it; Coral's brown band keeps the black default.
  inheritTextColor,
}: {
  row: MotionRow
  alignRight: boolean
  inheritTextColor: boolean
}) {
  const items = row.items ?? []
  const device = row.device ?? 'mobile'
  // Card aspect ≈ the Figma device slot (phones 170/367, iPads ~3/4, desktop
  // ~7/5). White card + object-cover: the Jitter exports are device mockups on
  // white, so the mockup's white margin blends into the card and the device
  // fills it — matching Figma's tall, framed devices.
  const aspect =
    device === 'mobile'
      ? 'aspect-[170/367]'
      : device === 'tablet'
        ? 'aspect-[3/4]'
        : 'aspect-[7/5]'
  const radius =
    device === 'mobile'
      ? 'rounded-[14px]'
      : device === 'tablet'
        ? 'rounded-[12px]'
        : 'rounded-[10px]'
  return (
    <div className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
      <div className="w-full max-w-full sm:max-w-[54%]">
        <div className="flex gap-[3%] drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)]">
          {items.map(it => (
            <div
              key={it._key}
              className={`flex-1 ${aspect} overflow-hidden ${radius} border border-black/5 bg-white`}
            >
              <DeviceMedia item={it} />
            </div>
          ))}
        </div>
        {(row.label || row.caption) && (
          <div
            className={`mt-7 max-w-111.25 text-left tracking-[0.382px] xl:mt-[2.2vw] ${inheritTextColor ? '' : 'text-black'}`}
          >
            {row.label && (
              <p className="text-[18px] font-light capitalize leading-[1.6] xl:text-[1.15vw]">
                {row.label}
              </p>
            )}
            {row.caption && (
              <p className="mt-2.5 text-[14px] font-thin leading-[1.6] xl:text-[0.95vw]">
                {row.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function DeviceMedia({ item }: { item: MediaItem }) {
  if (item.mediaType === 'video' && item.videoFile) {
    return (
      <video
        className="h-full w-full object-cover"
        src={item.videoFile}
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
        className="h-full w-full object-cover"
      />
    )
  }
  return null
}

// Project Highlights: either a 3×2 grid of mint-framed cells (Coral) or one
// large card (Experian Boost 600:32123, Memory Tubes) over a coloured band.
// Each cell cross-fades through its own frame set on a staggered loop; the
// single-card layout rotates every authored frame through the one card.
const REEL_BG = '#0f3b42'
function HighlightReelBlock({ section: s }: { section: Of<'highlightReel'> }) {
  const cells = s.cells ?? []
  if (!cells.length) return null
  const single = s.layout === 'single'
  return (
    <section
      className={`px-6 sm:px-10 xl:px-[3.5vw] ${padClasses(s.appearance, 'lg')}`}
      style={bandStyle(s.appearance, REEL_BG, true)}
    >
      {/* Figma 612:45542 — Neue Haas 45 Light 24px, capitalize, white on teal. */}
      {s.sectionTitle && (
        <h2 className="mb-12 text-center text-[24px] font-light capitalize leading-tight xl:mb-[3.5vw] xl:text-[1.5vw]">
          {s.sectionTitle}
        </h2>
      )}
      {single ? (
        <HighlightCardView frames={cells.flatMap(c => c.frames ?? [])} />
      ) : (
        <div className="mx-auto grid w-full max-w-234 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-[1vw]">
          {cells.map((c, i) => (
            <HighlightCellView
              key={c._key}
              frames={c.frames ?? []}
              delay={i * 900}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// Single-card layout (Figma 600:32123): one 887×503 card, thin white matte,
// centred on the band, cycling through every frame.
function HighlightCardView({ frames }: { frames: string[] }) {
  const i = useFrameCycle(frames.length, 0)
  if (!frames.length) return null
  return (
    <div className="mx-auto w-full max-w-222 rounded-lg bg-white p-1 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
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
  frames,
  delay,
}: {
  frames: string[]
  delay: number
}) {
  const i = useFrameCycle(frames.length, delay)
  if (!frames.length) return null
  // Figma 612:44828 — mint (Algae 300) matte frame with the graphic inset
  // ~10.5% × 14% (303×203 cell holding a 238×146 inner image). The inner frame
  // is absolutely inset (not h-full) so it resolves against the aspect-ratio box.
  return (
    <div className="relative aspect-303/203 w-full rounded-md bg-[#d4e9d7]">
      <div className="absolute inset-[14%_10.5%] overflow-hidden rounded-[3px]">
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

const IMPACT_BG = 'rgba(214,224,216,0.6)'
function StatsBlock({ section: s }: { section: Of<'statsSection'> }) {
  const v = useCsVariant()
  const items = s.items ?? []
  if (!items.length) return null
  return (
    <section
      className={`${csBandGutter(v)} text-center ${padClasses(s.appearance, 'lg')}`}
      style={bandStyle(s.appearance, IMPACT_BG)}
    >
      {s.sectionTitle && (
        <h2 className={`mb-12 lg:mb-16 ${csSectionTitle(v)}`}>
          {s.sectionTitle}
        </h2>
      )}
      <div className={`mx-auto grid w-full max-w-[min(1100px,100%)] grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-10 lg:gap-14`}>
        {items.map(st => (
          <Stat key={st._key} stat={st} />
        ))}
      </div>
    </section>
  )
}

function BulletBlock({ section: s }: { section: Of<'bulletSection'> }) {
  const v = useCsVariant()
  const items = s.items ?? []
  if (!items.length) return null
  return (
    <section
      className={padClasses(s.appearance, 'md')}
      style={bandStyle(s.appearance)}
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
      className={`mb-5 capitalize leading-tight ${page ? 'text-[22px] font-normal lg:text-[26px]' : 'text-[20px] font-normal xl:mb-[0.5vw] xl:text-[1vw]'} ${light ? 'text-white' : ''} ${center ? 'text-center' : ''}`}
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
          <div key={it._key} className="border-b-[0.4px] border-current">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              data-cursor="hover"
              className={`flex w-full items-center justify-between gap-6 py-6.25 text-left font-normal xl:py-[0.9vw] ${headSize}`}
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
                className={`pb-6 font-light leading-normal ${bodySize}`}
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
}: {
  images: string[]
  scrollRoot?: React.RefObject<HTMLDivElement | null>
}) {
  const n = images.length
  const [visible, setVisible] = useState(3)
  const [index, setIndex] = useState(n) // start in the middle copy
  const [noAnim, setNoAnim] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const locked = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportW, setViewportW] = useState(0)
  const GAP = 20

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
    <div className="relative w-full px-6 sm:px-10 xl:px-[3.5vw]">
      {canPage && (
        // Figma 600:12626: text chevrons, Neue Haas 21px / 500 / +0.44px, 29px gap.
        <div className="mb-5 flex items-center justify-end gap-7.25 text-[21px] font-medium leading-none tracking-[0.44px] text-white xl:text-[1.35vw]">
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
                key={`${src}-${i}`}
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
}: {
  tabs: DeviceTab[]
  initial: number
  loadMore?: string
}) {
  const [active, setActive] = useState(0)
  const tab = tabs[active]
  return (
    <div className="mt-8">
      <div className="mx-auto flex max-w-full flex-wrap justify-center gap-8 xl:gap-[6vw]">
        {tabs.map((v, i) => (
          <button
            key={v._key}
            type="button"
            onClick={() => setActive(i)}
            data-cursor="hover"
            className={`relative pb-1 text-[16px] uppercase leading-none after:absolute after:bottom-0 after:left-0 after:h-px after:bg-current after:transition-all after:duration-300 xl:text-[1vw] ${
              active === i ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <ImageGrid
        key={tab?._key}
        images={imgUrls(tab?.items)}
        initial={initial}
        loadMore={loadMore}
        tile
        light
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
  light,
}: {
  images: string[]
  captions?: (string | undefined)[]
  initial?: number
  loadMore?: string
  tile?: boolean
  light?: boolean
}) {
  const STEP = 4
  const [shown, setShown] = useState(initial)
  const visible = images.slice(0, shown)
  return (
    <>
      <div className="mt-8 grid grid-cols-1 gap-x-[5vw] gap-y-10 sm:grid-cols-2">
        {visible.map((src, i) =>
          tile ? (
            <div
              key={i}
              className="shadow-[0_0.5vw_0.8vw_rgba(0,0,0,0.4)]"
              style={{ backgroundColor: TILE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-[40vw] w-full object-contain xl:h-[20vw]"
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
    <div ref={ref} className="mx-auto flex max-w-73 flex-col items-center text-center tracking-[-0.214px]">
      {/* Figma 600:13130-13132 uses Neue Haas Grotesk *Display* Pro 55 Roman —
          that's our weight 400 (font-normal). font-medium (500) would load the
          Text-Pro cut, a different family. Note is 35 Thin in Figma; we only
          ship the Display 55 Roman, so it falls back to that weight. */}
      <p className="text-[64px] font-normal leading-none sm:text-[80px] xl:text-[5vw]">
        {n}
        {stat.suffix}
      </p>
      <p className="mt-5 text-[18px] font-normal leading-[1.245] xl:text-[1.15vw]">
        {stat.label}
      </p>
      {stat.note && (
        <p className="mt-2.5 max-w-64 text-[18px] font-light leading-[1.245] xl:text-[1.15vw]">
          {stat.note}
        </p>
      )}
    </div>
  )
}

