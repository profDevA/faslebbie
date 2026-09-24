'use client'

import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from 'react'
import { createPortal } from 'react-dom'
import PopupShell, { PopupDots, PopupPagerButton } from '@/components/PopupShell'
import { CaseStudyProse } from '@/components/caseStudyView/Prose'
import {
  bandStyle,
  cursorInvertAttrs,
  featuredCaptionInset,
  flexSectionStyle,
  isLight,
  bandUsesLightText,
  sectionStyle,
} from '@/components/caseStudyView/bandAppearance'
import {
  accordionPanelUsesLightText,
  colorToCss,
  sanityColorIsLight,
} from '@/components/caseStudyView/colors'
import {
  CS_RED,
  CS_SAGE,
  CS_TEAL,
  CS_TILE,
} from '@/components/caseStudyView/constants'
import {
  CS_TEXT_ALIGN,
  CS_WIDE_BAND_GUTTER,
  csBandGutter,
  csPagerShell,
  csProseInner,
  csShell,
  pageBandMinHeightClass,
  pageScreenBandClass,
  pageScreenBandInnerClass,
} from '@/components/caseStudyView/layoutClasses'
import {
  CS_CAPTION_LG,
  CS_CAPTION_SM,
  CS_KICKER,
  csBodySm,
  csBodyText,
  csHeroCap,
  csImpactTitle,
  csMetaSm,
  csMetaXs,
  csReflectionBody,
  csReflectionTitle,
  csSectionTitle,
  csUiText,
} from '@/components/caseStudyView/typography'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ExternalArrow } from '@/components/InlineToken'
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
import type { PortableTextBlock } from '@portabletext/types'
import {
  REFLECTION_DEFAULTS,
  OVERVIEW_BAND_BACKGROUND,
  CORE_EXPERIENCE_POPUP_DEFAULTS,
  CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS,
  CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS,
  CORE_EXPERIENCE_BAND_MOBILE_GRID_DEFAULTS,
  CORE_EXPERIENCE_DESKTOP_GRID_BAND_GAPS,
  HIGHLIGHT_REEL_GRID_DEFAULTS,
  HIGHLIGHT_REEL_SINGLE_DEFAULTS,
  HIGHLIGHT_REEL_COMPOSITE_DEFAULTS,
  MOTION_FEATURED_BAND_DEFAULTS,
  MOTION_FEATURED_MOBILE_DEFAULTS,
  MOTION_FEATURED_MOBILE_CENSUS_DEFAULTS,
  MOTION_ROW_DEFAULTS,
  MOTION_RADIUS_SCALE,
  MOTION_PHONE_ROW_DEFAULTS,
  MOTION_CROSS_FUNCTIONAL_DEFAULTS,
  MOTION_SHOWCASE_BAND_DEFAULTS,
  DESKTOP_MOTION_SHOWCASE_DEFAULTS,
  SHOWCASE_ARTIFACT_DEFAULTS,
  STATS_BAND_DEFAULTS,
} from '@/lib/caseStudyDefaults'
import { caseStudyHref, type WorkListingView } from '@/lib/caseStudyNav'
import {
  gapDefault,
  padDefaults,
  PAGE_PROSE_PAD,
  proseGroupPadStyle,
  sectionGapStyle,
  SECTION_GAP_CLASS,
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

// ── main component ────────────────────────────────────────────────────────────
export default function CaseStudyView({
  project: p,
  prev,
  next,
  listingView = null,
  listingHref = '/casestudies',
}: {
  project: Study
  prev: StudyCard
  next: StudyCard
  listingView?: WorkListingView | null
  listingHref?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const setScrollNode = useCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el
    setScroller(el)
  }, [])

  useEffect(() => {
    scroller?.scrollTo({ top: 0 })
  }, [scroller, p.slug])

  // Scroll-reveal: tag each <section> once it enters view.
  useEffect(() => {
    const root = scroller
    if (!root) return
    const sections = Array.from(root.querySelectorAll(':scope > section'))
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      sections.forEach(s => s.classList.add('cs-active'))
      return
    }
    const pageInternal = window.matchMedia('(min-width: 1024px)').matches
    const useRoot = pageInternal
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
  }, [p.slug, scroller])

  const pager = (
    <div
      className={`${csPagerShell()} reckless-prose font-normal ${csUiText()}`}
      style={{ color: CS_RED }}
    >
      <Link
        href={caseStudyHref(prev.slug, listingView)}
        data-cursor="hover"
        className="transition-opacity hover:opacity-70"
      >
        &lt; Previous
      </Link>
      <Link
        href={caseStudyHref(next.slug, listingView)}
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
            scrollContainer={scroller}
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

  return (
    <div className="cs-root cs-page min-h-screen bg-white reckless-prose text-black lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden">
      <div className="sticky top-0 z-50 shrink-0 border-b border-black/15 bg-white reckless-prose lg:static">
        <div className="flex h-14 w-full shrink-0 items-center justify-between gap-4 px-5 sm:h-16 sm:px-8 lg:px-12">
          <nav
            aria-label="Breadcrumb"
            className={`flex min-w-0 items-center gap-2 font-normal ${csUiText()}`}
          >
            <Link
              href={listingHref}
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
            href={listingHref}
            aria-label="Close"
            data-cursor="hover"
            className="shrink-0 text-[24px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ×
          </Link>
        </div>
      </div>

      <div ref={setScrollNode} className="cs-page-bands">
        {bands}
      </div>

      <div className="sticky bottom-0 z-50 flex h-12 shrink-0 items-center border-t border-black/10 bg-white lg:static">
        <div className={`w-full ${csShell()}`}>{pager}</div>
      </div>
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
  const lead = intro || FULL_CASE_STUDY_INTRO_DEFAULT
  const size = csBodyText()
  return (
    <p
      className={`mx-auto text-center font-grotesk font-light italic leading-[1.6] text-white ${size} ${'max-w-none'}`}
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
  return (
    <section
      className="text-white"
      data-cursor-invert
      style={{
        ...bandStyle(undefined, REFLECTION_DEFAULTS.backgroundColor, true),
        ...sectionPadStyle(
          undefined,
          {
            paddingTop: REFLECTION_DEFAULTS.paddingTop,
            paddingBottom: REFLECTION_DEFAULTS.paddingBottom,
          },
          true,
        ),
      }}
    >
      <div className={csShell()}>
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
  scrollContainer,
}: {
  section: Section
  project: Study
  scrollContainer?: HTMLDivElement | null
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
    case 'interventionCarousel':
      return <InterventionCarouselBlock section={section} />
    case 'interventionGrid':
      return <InterventionGridBlock section={section} />
    case 'gallerySection':
      return <GalleryBlock section={section} />
    case 'showcaseGallery':
      return <ShowcaseBlock section={section} scrollContainer={scrollContainer} />
    case 'motionShowcase':
      return (
        <MotionShowcaseBlock
          section={section}
          projectSlug={project.slug}
          projectName={project.name}
        />
      )
    case 'highlightReel':
      return <HighlightReelBlock section={section} />
    case 'statsSection':
      return <StatsBlock section={section} scrollContainer={scrollContainer} />
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
  const first = sections[0]
  const light = isLight(first.appearance)
  const align = first.appearance?.contentAlignment ?? 'center'
  const width = first.appearance?.maxWidth ?? 'default'
  const body = csBodyText()
  const allProse = sections.every(s => s._type === 'proseSection')
  const pageProse = allProse
  const last = sections[sections.length - 1]
  const padStyle = proseGroupPadStyle(
    first.appearance,
    last.appearance,
    true,
    pageProse ? PAGE_PROSE_PAD : undefined,
  )
  const gapLevel = pageProse ? 'md' : 'lg'
  return (
    <section
      className={`${CS_TEXT_ALIGN[align]} ${pageScreenBandClass(pageProse)}`}
      style={{ ...bandStyle(first.appearance), ...padStyle }}
    >
      <div className={`${csShell()} ${pageScreenBandInnerClass()}`}>
        <div
          className={`flex flex-col ${SECTION_GAP_CLASS} ${csProseInner( align, width)}`}
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
                  className={`mb-5 ${csSectionTitle()} ${light ? 'text-white' : ''} ${align === 'center' ? 'text-center' : ''}`}
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
                <CaseStudyProse value={s.body} className={body} />
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
  const capSize = csHeroCap()
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
  const mobileTagline = s.caption ?? p.tagline
  // Full-page mobile hero — Figma 3928:28893 / 4173:68708 (MV_Hero collage + overlay copy).
  return (
    <section data-cs-hero data-cs-media-natural className="relative">
      <div className="relative bg-[#171717] lg:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={mobileArt}
          alt=""
          className="block w-full h-auto"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(23,23,23,0)_45%,rgba(23,23,23,0.85)_100%)]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-20 text-white">
          <p className="text-[18px] font-bold uppercase leading-[1.15] tracking-normal">
            {title}
          </p>
          {mobileTagline ? (
            <p className="mt-2.5 text-[14px] font-medium leading-[1.15]">
              {mobileTagline}
            </p>
          ) : null}
          {(p.from || p.to) && (
            <p className="mt-2 flex flex-wrap items-baseline gap-x-8 text-[14px] leading-[1.6]">
              {p.from ? (
                <span>
                  <span className="font-medium">From:</span>{' '}
                  <span className="font-normal">{p.from}</span>
                </span>
              ) : null}
              {p.to ? (
                <span>
                  <span className="font-medium">To:</span>{' '}
                  <span className="font-normal">{p.to}</span>
                </span>
              ) : null}
            </p>
          )}
        </div>
      </div>
      <div className="relative hidden bg-[#171717] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={s.image}
          alt={p.name}
          className="block h-auto w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]" />
        <div className="cs-hero-caption absolute left-7.5 p-2.5 text-white">
          {caption}
        </div>
      </div>
    </section>
  )
}

/** Memory Tubes overview side — Figma LW_PO.Jpg plate proportions (834×458 + 769×435). */
function OverviewStackedSideMedia({
  videoSrc,
  imageSrc,
  fillColumn,
}: {
  videoSrc: string
  imageSrc: string
  /** Desktop media column: fill band height with proportional rows. */
  fillColumn: boolean
}) {
  const gridClass = fillColumn
    ? 'grid h-full min-h-0 w-full flex-1 grid-rows-[458fr_435fr]'
    : 'grid w-full grid-rows-[auto_auto]'
  const topSlotClass = fillColumn
    ? 'relative min-h-0 overflow-hidden'
    : 'relative aspect-[834/458] w-full overflow-hidden'
  const bottomSlotClass = fillColumn
    ? 'relative min-h-0 overflow-hidden'
    : 'relative aspect-[769/435] w-full overflow-hidden'
  const mediaClass = 'absolute inset-0 h-full w-full object-cover object-center'
  return (
    <div className={gridClass}>
      <div className={topSlotClass}>
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className={mediaClass}
        />
      </div>
      <div className={bottomSlotClass}>
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img src={imageSrc} alt="" className={mediaClass} />
      </div>
    </div>
  )
}

function OverviewBlock({ section: s }: { section: Of<'overviewSection'> }) {
  const light = bandUsesLightText(s.appearance)
  const textClass = light ? 'text-white' : 'text-black'
  const sideTextCss = colorToCss(s.appearance?.textColor)
  const cta = s.ctaLabel ?? 'Visit Site'
  const body = csBodyText(textClass)
  const metaSm = csMetaSm()
  const metaXs = csMetaXs()
  const sideBg = colorToCss(s.sideImageBackgroundColor) ?? CS_TEAL
  const hasVideo = !!s.sideVideo
  /** Both set → video over still (Memory Tubes overview only in practice). */
  const stackedSideMedia = hasVideo && !!s.sideImage
  const mediaFirst = s.mediaPosition === 'left'
  const copyOrder = mediaFirst ? 'lg:order-2' : 'lg:order-1'
  const mediaOrder = mediaFirst ? 'lg:order-1' : 'lg:order-2'
  const copyPad = overviewCopyPadStyle(s, true)
  const mediaPad = overviewMediaPadStyle(s, true)
  const mediaPadMobile = overviewMediaPadStyle(s, true, true)
  /** Desktop: row height follows the taller column (usually copy). Side art uses
   *  contain inside that column — full file visible, no inner scroll (Option C
   *  natural height only on Hero; Overview is contain-in-row). */
  const desktopMediaClass =
    'relative hidden min-h-0 w-full overflow-hidden lg:flex lg:h-full lg:max-h-full lg:items-center lg:justify-center'
  const desktopMediaSizeClass =
    'block max-h-full w-full object-contain object-center'
  const mobileMediaSizeClass = 'block h-auto w-full'
  return (
    <section
      data-cs-stretch
      className="grid grid-cols-1 overflow-hidden lg:grid-cols-2 lg:items-stretch"
      style={bandStyle(s.appearance, OVERVIEW_BAND_BACKGROUND)}
    >
      <div
        className={`flex min-h-0 flex-col ${SECTION_GAP_CLASS} ${copyOrder} justify-start lg:min-h-full lg:justify-between ${textClass}`}
        style={{
          ...copyPad,
          ...sectionGapStyle(s.appearance, gapDefault('md', true), true),
          ...(sideTextCss ? { color: sideTextCss } : undefined),
        }}
      >
        <div className={'max-w-[min(580px,100%)]'}>
          <h2 className={`${csSectionTitle()} ${textClass}`}>
            {s.sectionTitle ?? 'Overview'}
          </h2>
          <CaseStudyProse value={s.body} className={`mt-[1em] ${body}`} />
          {s.ctaUrl && (
            // Mobile Figma uses "Visit SITE"; desktop stays sentence case.
            <a
              href={s.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className={`mt-6 inline-block text-[20px] font-normal underline underline-offset-4 transition-colors hover:text-accent ${textClass} max-lg:uppercase lg:capitalize ${''}`}
            >
              {cta}
            </a>
          )}
        </div>
        <div className={`flex flex-col gap-5 ${'max-w-[min(580px,100%)]'}`}>
          {(s.serviceCategoryLabel || s.serviceList) && (
            <div className="max-w-85">
              {/* Figma 600:12513 — Neue Haas 45 Light 18px, capitalize. */}
              <h3
                className={`text-[20px] font-normal capitalize leading-tight ${textClass} ${''}`}
              >
                {s.serviceCategoryLabel ?? 'Research & Design'}
              </h3>
              {s.serviceList && (
                <p className={`mt-2 ${metaSm} ${textClass}`}>
                  {s.serviceList}
                </p>
              )}
            </div>
          )}
          {/* Figma 600:12514 — 45 Light 14px, labels 55 Roman. */}
          <div className={`max-w-85 space-y-1 ${metaSm} ${textClass}`}>
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
      {/* One media slot, or stacked video + still when both are authored. */}
      <div
        className={`relative w-full lg:hidden ${mediaOrder}`}
        style={{ backgroundColor: sideBg, ...mediaPadMobile }}
      >
        {stackedSideMedia ? (
          <OverviewStackedSideMedia
            videoSrc={s.sideVideo!}
            imageSrc={s.sideImage!}
            fillColumn={false}
          />
        ) : hasVideo ? (
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
          className={`${
            stackedSideMedia
              ? 'relative hidden min-h-0 w-full overflow-hidden lg:flex lg:h-full lg:min-h-full lg:flex-col'
              : desktopMediaClass
          } ${mediaOrder}`}
          style={{
            backgroundColor: sideBg,
            ...mediaPad,
          }}
        >
          {stackedSideMedia ? (
            <OverviewStackedSideMedia
              videoSrc={s.sideVideo!}
              imageSrc={s.sideImage!}
              fillColumn
            />
          ) : hasVideo ? (
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
  const light = bandUsesLightText(s.appearance)
  const sideTextCss = colorToCss(s.appearance?.textColor)
  const panelTextCss = colorToCss(s.accordionTextColor)
  const panelLight = panelTextCss
    ? sanityColorIsLight(s.accordionTextColor)
    : accordionPanelUsesLightText(s.accordionBackgroundColor)
  const panelTextClass = panelLight ? 'text-white' : 'text-black'
  const items = s.items ?? []
  if (s.variant === 'split') {
    return (
      <section
        data-cs-stretch
        style={sectionStyle(s.appearance, true, 'md', OVERVIEW_BAND_BACKGROUND)}
      >
        <div
          className={`mx-auto grid w-full grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:grid-rows-[1fr] ${CS_WIDE_BAND_GUTTER}`}
        >
        <div
          className={`order-2 flex flex-col justify-end lg:order-1 ${light ? 'text-white' : 'text-black'}`}
          style={sideTextCss ? { color: sideTextCss } : undefined}
        >
          <div className="w-full">
            <h2
              className={`mb-4 ${csSectionTitle('text-[20px] lg:text-[22px]')}`}
            >
              {s.sideTitle ?? 'My Approach'}
            </h2>
            <CaseStudyProse value={s.sideBody} className={`mt-3 ${csBodyText()}`} />
          </div>
        </div>
        <div
          className={`order-1 self-stretch px-5 py-8 lg:order-2 lg:p-[10vw_5vw] xl:p-[2vw] ${panelTextClass}`}
          style={{
            backgroundColor: colorToCss(s.accordionBackgroundColor),
            ...(panelTextCss ? { color: panelTextCss } : undefined),
          }}
        >
          {/* Figma "Design Process": Neue Haas 20px / 500 / lh 14.64px / capitalize / centered */}
          {s.sectionTitle && (
            <h2 className={`mb-5 text-center ${csSectionTitle('text-[22px] lg:text-[24px]')}`}>
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
  const pageInner = true
  return (
    <section style={sectionStyle(s.appearance, pageInner, 'md', CS_SAGE)}>
      <div className={csShell()}>
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
  const light = isLight(s.appearance)
  const align = s.appearance?.contentAlignment ?? 'center'
  const width = s.appearance?.maxWidth ?? 'default'
  return (
    <section
      className={CS_TEXT_ALIGN[align]}
      style={{
        ...bandStyle(s.appearance),
        ...sectionPadStyle(s.appearance, padDefaults('md', true), true),
      }}
    >
      <div className={csShell()}>
        <div className={csProseInner( align, width)}>
          {s.sectionTitle && (
            <h2
              className={`mb-5 ${csSectionTitle()} ${light ? 'text-white' : ''} ${align === 'center' ? 'text-center' : ''}`}
            >
              {s.sectionTitle}
            </h2>
          )}
          <CaseStudyProse value={s.body} className={`mt-5 ${csBodyText()}`} />
        </div>
      </div>
    </section>
  )
}

/** Figma 03 — Problem Context / What I Brought (600:12516): one centred band. */
function ProblemContextBlock({ section: s }: { section: Of<'problemContextSection'> }) {
  const light = isLight(s.appearance)
  const align = s.appearance?.contentAlignment ?? 'center'
  const width = s.appearance?.maxWidth ?? 'default'
  const body = csBodyText()
  const titleClass = `${csSectionTitle()} ${light ? 'text-white' : ''} ${align === 'center' ? 'text-center' : ''}`
  const padStyle = sectionPadStyle(s.appearance, PAGE_PROSE_PAD, true)
  return (
    <section
      className={`${CS_TEXT_ALIGN[align]} ${pageBandMinHeightClass()}`}
      {...cursorInvertAttrs(light)}
      style={{ ...bandStyle(s.appearance), ...padStyle }}
    >
      <div className={`${csShell()} ${pageScreenBandInnerClass()}`}>
        {/* Figma 3719:64934 / 4001:79393 — 60px desktop, ~32px mobile between blocks. */}
        <div
          className={`flex flex-col max-lg:gap-8 lg:gap-[60px] ${csProseInner( align, width)}`}
        >
          <div>
            {s.problemHeading && (
              <h2 className={`mb-5 ${titleClass}`}>{s.problemHeading}</h2>
            )}
            <CaseStudyProse value={s.problemBody} className={body} />
          </div>
          <div>
            {s.broughtHeading && (
              <h2 className={`mb-5 ${titleClass}`}>{s.broughtHeading}</h2>
            )}
            <CaseStudyProse value={s.broughtBody} className={body} />
          </div>
          {s.supportingCopy?.length ? (
            <CaseStudyProse value={s.supportingCopy} className={body} />
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
  const align = s.appearance?.contentAlignment ?? 'center'
  const width = s.appearance?.maxWidth ?? 'default'
  const body = csReflectionBody()
  const titleClass = `${csReflectionTitle()} text-white ${align === 'center' ? 'text-center' : ''}`
  const steps = s.nextStepsItems ?? []
  const hasReflection = !!s.reflectionBody?.length
  if (!hasReflection && !steps.length && !fullCaseStudy?.url) return null
  const padStyle = sectionPadStyle(
    s.appearance,
    {
      paddingTop: REFLECTION_DEFAULTS.paddingTop,
      paddingBottom: REFLECTION_DEFAULTS.paddingBottom,
    },
    true,
  )
  const column = csProseInner(align, width)
  return (
    <section
      className={`${CS_TEXT_ALIGN[align]} text-white`}
      data-cursor-invert
      style={{
        ...bandStyle(s.appearance, REFLECTION_DEFAULTS.backgroundColor, true),
        ...padStyle,
      }}
    >
      <div className={csShell()}>
        <div
          className={`flex flex-col ${SECTION_GAP_CLASS} ${column}`}
          style={sectionGapStyle(
            s.appearance,
            REFLECTION_DEFAULTS.contentGap,
            true,
          )}
        >
          {hasReflection && (
            <div
              className={`flex w-full flex-col ${''}`}
              style={sectionInnerGapStyle(
                s.appearance,
                REFLECTION_DEFAULTS.contentGapInner,
                true,
              )}
            >
              {s.reflectionHeading && (
                <h2 className={titleClass}>{s.reflectionHeading}</h2>
              )}
              <CaseStudyProse
                value={s.reflectionBody}
                className={`${body} ${''}`}
              />
            </div>
          )}
          {steps.length > 0 && (
            <div
              className={`flex w-full flex-col ${''}`}
              style={sectionInnerGapStyle(
                s.appearance,
                REFLECTION_DEFAULTS.contentGapInner,
                true,
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
              className={`flex w-full items-center justify-center border-t border-[#323232] pt-8 min-h-[132px] ${''}`}
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

// Core Experience Flow (Figma 2110:39499 mobile row / 2271:58148 desktop grid /
// Acme desktopGrid mobile stack 3928:7320).
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

function coreExperienceImageBoxStyle(
  screen: CoreExperienceScreen,
  layout: 'mobileRow' | 'desktopGrid',
): CSSProperties {
  if (screen.imageWidth && screen.imageHeight) {
    return { aspectRatio: `${screen.imageWidth}/${screen.imageHeight}` }
  }
  const d =
    layout === 'desktopGrid'
      ? CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS
      : CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS
  return { aspectRatio: `${d.imageAspectWidth}/${d.imageAspectHeight}` }
}

/** Band preview tile radius — Sanity previewAppearance.tileBorderRadius overrides layout defaults. */
function coreExperienceTileRadius(
  bandApp: Appearance | undefined,
  opts: {
    layout: 'mobileRow' | 'desktopGrid'
    bandMobileGrid: boolean
    stackTile: boolean
    desktopBandTile: boolean
  },
): number {
  if (
    typeof bandApp?.tileBorderRadius === 'number' &&
    bandApp.tileBorderRadius >= 0
  ) {
    return bandApp.tileBorderRadius
  }
  if (opts.bandMobileGrid) {
    return CORE_EXPERIENCE_BAND_MOBILE_GRID_DEFAULTS.tileBorderRadius
  }
  if (opts.stackTile) {
    return CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.mobileStackBorderRadius
  }
  if (opts.desktopBandTile) {
    return CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.cardBorderRadius
  }
  return CORE_EXPERIENCE_BAND_MOBILE_DEFAULTS.tileBorderRadius
}

function CoreExperienceScreenCard({
  screen,
  layout,
  tone,
  size,
  bandApp,
  bandStack = false,
  bandMobileGrid = false,
  className,
}: {
  screen: CoreExperienceScreen
  layout: 'mobileRow' | 'desktopGrid'
  tone: 'onDark' | 'onLight'
  size: 'preview' | 'popup'
  bandApp?: Appearance
  /** Mobile vertical stack for desktopGrid bands (Figma 3928:7320). */
  bandStack?: boolean
  /** Mobile 2-col band grid (Figma 3928:29088 / 3928:44401). */
  bandMobileGrid?: boolean
  className?: string
}) {
  if (!screen.image) return null
  const desktop = layout === 'desktopGrid'
  const onDark = tone === 'onDark'
  const caption = onDark ? 'text-[#fafafa]' : 'text-black'
  const cardBg = coreExperienceCardBg(screen, bandApp)
  const bandPreview = size === 'preview'
  const desktopBandTile =
    bandPreview && desktop
  const stackTile = desktopBandTile && bandStack
  const bandCaptionClass = bandMobileGrid
    ? `text-left leading-[1.5] ${CS_CAPTION_SM} ${caption}`
    : desktop
      ? `text-left leading-[1.35] ${CS_CAPTION_LG} ${caption} ${
          bandStack ? 'mt-5' : ''
        }`
      : `mt-3 text-left leading-[1.5] ${CS_CAPTION_SM} lg:mt-4 ${caption}`

  if (bandPreview) {
    const desktopBand = desktop
    const mobileGridTile = bandMobileGrid
    const figureClass = mobileGridTile
      ? 'block shrink-0'
      : stackTile
        ? 'mx-auto w-full max-w-[323px]'
        : desktopBand
          ? 'min-w-0 flex-1'
          : 'shrink-0 w-[140px] sm:w-[160px] lg:w-[210px]'
    const hasImageDims = Boolean(screen.imageWidth && screen.imageHeight)
    /** Full-frame uploads — no shared aspect box or object-cover crop. */
    const preserveFullFrame = mobileGridTile || stackTile || hasImageDims
    const studioRadius =
      typeof bandApp?.tileBorderRadius === 'number' &&
      bandApp.tileBorderRadius >= 0
        ? bandApp.tileBorderRadius
        : undefined
    const tileRadius =
      studioRadius !== undefined
        ? studioRadius
        : preserveFullFrame
          ? 0
          : coreExperienceTileRadius(bandApp, {
              layout,
              bandMobileGrid: mobileGridTile,
              stackTile,
              desktopBandTile,
            })
    const clipCorners = tileRadius > 0
    const tileRadiusStyle: CSSProperties | undefined = clipCorners
      ? { borderRadius: tileRadius }
      : undefined
    /** Full-frame PNGs include device chrome / shadow — wrapper drop-shadow reads as a mismatched box. */
    const tileShadowClass = preserveFullFrame
      ? ''
      : 'shadow-[0_2px_12px_rgba(0,0,0,0.22)]'
    const tileBoxStyle: CSSProperties = {
      /** Pre-rounded PNGs with alpha — no wrapper fill (white tile bg reads as corner fringe). */
      backgroundColor: preserveFullFrame ? 'transparent' : cardBg,
      ...tileRadiusStyle,
      ...(preserveFullFrame
        ? undefined
        : coreExperienceImageBoxStyle(screen, layout)),
    }
    const captionMargin = mobileGridTile
      ? { marginTop: CORE_EXPERIENCE_BAND_MOBILE_GRID_DEFAULTS.captionGap }
      : desktopBandTile && !bandStack
        ? { marginTop: CORE_EXPERIENCE_DESKTOP_GRID_BAND_GAPS.captionGap }
        : undefined
    const mobileTileWidth = CORE_EXPERIENCE_BAND_MOBILE_GRID_DEFAULTS.tileMaxWidth
    const figureStyle: CSSProperties | undefined = mobileGridTile
      ? {
          width: mobileTileWidth,
          maxWidth: '100%',
        }
      : undefined
    const captionStyle: CSSProperties | undefined = captionMargin
    return (
      <figure
        className={className ? `${figureClass} ${className}` : figureClass}
        style={figureStyle}
      >
        <div
          className={`${clipCorners || !preserveFullFrame ? 'overflow-hidden' : ''} ${tileShadowClass}`}
          style={tileBoxStyle}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
          <img
            src={screen.image}
            alt={screen.label ?? screen.description ?? 'Product screen'}
            className={`w-full ${
              preserveFullFrame
                ? 'block h-auto'
                : 'h-full object-contain object-top'
            }`}
            style={preserveFullFrame && !clipCorners ? undefined : tileRadiusStyle}
          />
        </div>
        {(screen.label || screen.description) && (
          <figcaption className={bandCaptionClass} style={captionStyle}>
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
    ? `mt-3 text-left leading-[1.35] ${CS_CAPTION_LG} lg:mt-4 ${caption}`
    : `mt-3 text-left leading-[1.5] ${CS_CAPTION_SM} lg:mt-4 ${caption}`

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
          className="h-full w-full object-cover object-top"
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
    const mobileStack = screens.filter(sc => sc.image)
    const mobileStackGap = CORE_EXPERIENCE_BAND_DESKTOP_DEFAULTS.mobileStackGap

    return (
      <div
        className="w-full max-w-full overflow-x-hidden"
        style={{
          ...horizontalPad,
          ...(containerMax ? { maxWidth: containerMax, marginInline: 'auto' } : undefined),
        }}
      >
        {/* Mobile — same previewScreens stacked (Figma 3928:7320 / Census 3999:54903). */}
        <div
          className="flex w-full flex-col lg:hidden"
          style={{ gap: mobileStackGap }}
        >
          {mobileStack.map(sc => (
            <CoreExperienceScreenCard
              key={sc._key}
              screen={sc}
              layout={layout}
              tone={tone}
              size="preview"
              bandApp={bandApp}
              bandStack
            />
          ))}
        </div>

        {/* Desktop — 2-col staggered grid (Figma 2271:58148). */}
        <div className="hidden w-full flex-col lg:flex" style={{ gap: rowGap }}>
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
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const mobileGrid = CORE_EXPERIENCE_BAND_MOBILE_GRID_DEFAULTS
  const mobileGridRows = chunkScreens(screens, mobileGrid.columns)

  return (
    <div
      className="w-full"
      style={{
        ...horizontalPad,
        ...(containerMax ? { maxWidth: containerMax, marginInline: 'auto' } : undefined),
      }}
    >
      {/* Mobile — 2-col row stack (Figma 3928:15359). */}
      <div
        className="mx-auto flex w-full flex-col overflow-x-hidden lg:hidden"
        style={{ maxWidth: mobileGrid.maxWidth, gap: mobileGrid.rowGap }}
      >
        {mobileGridRows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="flex items-start"
            style={{ gap: mobileGrid.columnGap }}
          >
            {row.map(sc => (
              <CoreExperienceScreenCard
                key={sc._key}
                screen={sc}
                layout={layout}
                tone={tone}
                size="preview"
                bandApp={bandApp}
                bandMobileGrid
              />
            ))}
          </div>
        ))}
      </div>

      {/* Desktop — horizontal phone strip (Figma 2110:39499). Full shell
          width + justify-between so ultrawide viewports gain space between
          fixed-width tiles (Israel QA) — min gap stays colGap. */}
      <div className="hidden w-full lg:block">
        <div
          className="flex w-full items-start justify-between max-xl:justify-center"
          style={{ gap: colGap }}
        >
          {screens.map(sc => (
            <CoreExperienceScreenCard
              key={sc._key}
              screen={sc}
              layout={layout}
              tone={tone}
              size="preview"
              bandApp={bandApp}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CoreExperienceLegacyBand({ section: s }: { section: Of<'coreExperience'> }) {
  const light = isLight(s.appearance)
  return (
    <section
      data-cs-stretch
      className={`flex flex-col justify-center ${SECTION_GAP_CLASS}`}
      style={flexSectionStyle(s.appearance, true, 'md')}
    >
      {(s.sectionTitle || s.body) && (
        <div className={`${csShell()} text-center`}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <CaseStudyProse
            value={s.body}
            className={`mx-auto mt-3 max-w-[70ch] ${csBodyText()}`}
          />
        </div>
      )}
      <div
        className={`${s.imageMobile ? undefined : 'overflow-x-auto sm:overflow-x-visible'} ${''}`}
      >
        <picture>
          {s.imageMobile && (
            <source media="(max-width: 640px)" srcSet={s.imageMobile} />
          )}
          <img
            src={s.image}
            alt={s.sectionTitle ?? 'Core experience screens'}
            className={`block h-auto ${
              s.imageMobile
                ? 'w-full'
                : 'w-208 max-w-none sm:w-full sm:max-w-full'
            }`}
          />
        </picture>
      </div>
    </section>
  )
}

/** Shared §04 Core Experience View More body — device tabs + Load More grid inside PopupShell. */
function DeviceTabsViewMorePopupBody({
  popupApp,
  popupKicker,
  popupHeadline,
  popupBody,
  popupTabs,
  popupInitial = 6,
  popupLoadMore = 'Load More',
  popupLoadLess = 'Show Less',
}: {
  popupApp?: Appearance
  popupKicker?: string
  popupHeadline?: string
  popupBody?: PortableTextBlock[]
  popupTabs: DeviceTab[]
  popupInitial?: number
  popupLoadMore?: string
  popupLoadLess?: string
}) {
  const popupAlign =
    popupApp?.contentAlignment ?? CORE_EXPERIENCE_POPUP_DEFAULTS.contentAlignment
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
    undefined,
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

  return (
    <div
      className={`min-h-full ${popupBg ? '' : 'bg-close'} ${popupLight ? 'text-white' : 'text-black'}`}
      style={{
        ...popupPad,
        ...(popupBg ? { backgroundColor: popupBg } : undefined),
        ...(popupText ? { color: popupText } : undefined),
      }}
    >
      <div
        className={`flex w-full flex-col ${SECTION_GAP_CLASS}`}
        style={{
          ...popupSectionGap,
          ...popupHorizontalPad,
          ...(popupContainerMax
            ? { maxWidth: popupContainerMax, marginInline: 'auto' }
            : undefined),
        }}
      >
        {(popupKicker || popupHeadline || popupBody?.length) ? (
          <div
            className={`flex w-full flex-col ${CS_TEXT_ALIGN[popupAlign]} items-start`}
            style={{ ...popupIntroGap, maxWidth: popupIntroMax }}
          >
            {popupKicker ? (
              <p
                className={`font-grotesk mb-1 font-normal uppercase ${CS_KICKER} lg:mb-2`}
              >
                {popupKicker}
              </p>
            ) : null}
            {popupHeadline ? (
              <h2
                className={`${csSectionTitle()} w-full ${CS_TEXT_ALIGN[popupAlign]}`}
              >
                {popupHeadline}
              </h2>
            ) : null}
            {popupBody?.length ? (
              <CaseStudyProse
                value={popupBody}
                className={`w-full ${csBodyText()} ${CS_TEXT_ALIGN[popupAlign]}`}
              />
            ) : null}
          </div>
        ) : null}
        <DeviceGallery
          tabs={popupTabs.filter(t => (t.items?.length ?? 0) > 0)}
          initial={popupInitial}
          loadMore={popupLoadMore}
          loadLess={popupLoadLess}
          tileBg={popupTileBg}
          light={popupLight}
          gridSize="popup"
          gridColumnGap={popupGridColumnGap}
          gridRowGap={popupGridRowGap}
        />
      </div>
    </div>
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
  const light = bandUsesLightText(s.appearance)
  const layout = s.layoutVariant ?? 'mobileRow'
  const preview = (s.previewScreens ?? []).filter(sc => sc.image)
  const popupTabs = s.popupTabs ?? []
  const title = s.sectionTitle?.trim() || 'Core Experience Flow'
  const popupTitleExplicit = s.popupTitle?.trim()
  const popupHeadline =
    popupTitleExplicit || (s.popupBody?.length ? title : undefined)
  const popupShellLabel = popupHeadline ?? title
  const popupKicker = s.popupKicker?.trim()
  const viewMore = s.viewMoreLabel?.trim() || 'View More'
  const popupInitial = s.popupItemsBeforeViewMore ?? 6
  const popupLoadMore = s.popupLoadMoreLabel?.trim() || 'Load More'
  const popupLoadLess = s.popupLoadLessLabel?.trim() || 'Show Less'
  const popupApp = s.popupAppearance

  if (!preview.length) {
    if (!s.image) return null
    return <CoreExperienceLegacyBand section={s} />
  }

  const onDark = light ? 'text-white' : ''
  // View More only when Studio has popup tabs/body. Experian stays hidden
  // until Israel supplies the modal; Coral already has tabs so it still shows.
  const hasPopup =
    popupTabs.some(t => (t.items?.length ?? 0) > 0) || Boolean(s.popupBody?.length)
  const desktopGridBand = layout === 'desktopGrid'
  const desktopGridGaps = desktopGridBand
    ? CORE_EXPERIENCE_DESKTOP_GRID_BAND_GAPS
    : null
  const bandSectionStyle: CSSProperties = {
    ...sectionStyle(s.appearance, true, 'md'),
    ...(desktopGridGaps
      ? {
          paddingTop: desktopGridGaps.paddingTop,
          paddingBottom: desktopGridGaps.paddingBottom,
        }
      : undefined),
  }

  return (
    <>
      <section
        data-cs-stretch
        className="flex flex-col items-center overflow-x-hidden"
        style={bandSectionStyle}
      >
        <div
          className={`${csShell()} flex w-full flex-col items-center text-center ${
            desktopGridGaps ? '' : SECTION_GAP_CLASS
          }`}
          style={
            desktopGridGaps
              ? undefined
              : sectionGapStyle(s.appearance, gapDefault('md', true), true)
          }
        >
          <h2
            className={`font-normal capitalize leading-tight max-lg:text-[14px] max-lg:leading-[19.2px] lg:text-[22px] lg:leading-tight xl:text-[26px] ${onDark}`}
          >
            {title}
          </h2>
          {s.body?.length ? (
            <CaseStudyProse
              value={s.body}
              className={`mx-auto max-w-[70ch] ${csBodyText(onDark)}`}
            />
          ) : null}
          <div
            className="w-full"
            style={
              desktopGridGaps
                ? { marginTop: desktopGridGaps.titleToPreview }
                : undefined
            }
          >
            <CoreExperienceBandPreview
              screens={preview}
              layout={layout}
              previewAppearance={s.previewAppearance}
              previewColumns={s.previewColumns}
              previewRowStagger={s.previewRowStagger}
              tone={light ? 'onDark' : 'onLight'}
            />
          </div>
          {hasPopup && (
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setPopupOpen(true)}
              className={`font-grotesk shrink-0 uppercase leading-none underline underline-offset-4 transition-opacity hover:opacity-80 ${csUiText()} xl:text-[1.1vw] ${light ? 'text-white' : ''}`}
              style={
                desktopGridGaps
                  ? { marginTop: desktopGridGaps.previewToViewMore }
                  : undefined
              }
            >
              {viewMore}
            </button>
          )}
        </div>
      </section>

      <PopupShell
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        label={popupShellLabel}
        crumbs={[
          { label: 'Case Studies', href: '/casestudies', hideOnMobile: true },
          { label: projectName, hideOnMobile: true },
          { label: popupShellLabel },
        ]}
        cardClassName="bg-white"
        bodyClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain reckless-prose"
      >
        <DeviceTabsViewMorePopupBody
          popupApp={popupApp}
          popupKicker={popupKicker}
          popupHeadline={popupHeadline}
          popupBody={s.popupBody}
          popupTabs={popupTabs}
          popupInitial={popupInitial}
          popupLoadMore={popupLoadMore}
          popupLoadLess={popupLoadLess}
        />
      </PopupShell>
    </>
  )
}

/** Keep PNG alpha. Sanity `auto=format` serves AVIF and fills transparent corners black. */
function motionSlideSrc(url: string) {
  if (!url.includes('cdn.sanity.io') || !/\.png(?:\?|$)/i.test(url)) return url
  try {
    const u = new URL(url)
    u.searchParams.delete('auto')
    u.searchParams.set('fm', 'png')
    return u.toString()
  } catch {
    return url
  }
}

/** §08 mockup wrapper — appearance.tileBorderRadius: 0 = square art (no device chrome). */
function desktopMotionMockupFrame(
  appearance: Appearance | undefined,
  wideMockup: boolean,
): { className: string; style?: CSSProperties } {
  const mockupShadow =
    'drop-shadow-[0_10px_16px_rgba(0,0,0,0.25)] max-lg:drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]'
  const explicitRadius =
    typeof appearance?.tileBorderRadius === 'number' &&
    appearance.tileBorderRadius >= 0
      ? appearance.tileBorderRadius
      : undefined

  if (wideMockup && explicitRadius === undefined) {
    return { className: '' }
  }
  if (explicitRadius === 0) {
    return wideMockup
      ? { className: '' }
      : { className: `overflow-hidden ${mockupShadow}` }
  }
  if (explicitRadius !== undefined) {
    return {
      className: `overflow-hidden bg-white ${mockupShadow} max-lg:border-[5px] max-lg:border-[#f3efe8]`,
      style: { borderRadius: explicitRadius },
    }
  }
  return {
    className:
      'overflow-hidden rounded-[20px] bg-white drop-shadow-[0_10px_16px_rgba(0,0,0,0.25)] max-lg:rounded-[6px] max-lg:border-[5px] max-lg:border-[#f3efe8] max-lg:drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]',
  }
}

// 08 — Desktop Motion Showcase (Figma 2110:40096 / Census 2229:30432): band colour
// from Sanity appearance, centred desktop mockup, title + body bottom-right.
// AR Handbook KPE bands 3/5/7 — slides[] carousel (Figma slider frames).
function DesktopMotionPosterCarousel({
  slides,
  fallbackAlt,
  mockupFrame,
  mockupMax,
  arrowClass,
  align = 'center',
}: {
  slides: NonNullable<Of<'desktopMotionShowcase'>['slides']>
  fallbackAlt: string
  mockupFrame: { className: string; style?: CSSProperties }
  mockupMax?: number
  arrowClass: string
  align?: 'center' | 'start' | 'end'
}) {
  const items = slides.filter(sl => sl.image)
  const n = items.length
  const [index, setIndex] = useState(0)
  const reduceMotion = usePrefersReducedMotion()
  const activeIndex = n > 0 ? Math.min(index, n - 1) : 0
  const [dragDx, setDragDx] = useState(0)
  const [slideWidth, setSlideWidth] = useState(0)
  const [motionEnabled, setMotionEnabled] = useState(true)
  const dragStartX = useRef<number | null>(null)
  const dragging = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const pagingLocked = useRef(false)
  const canPage = n > 1
  const dragThresholdPx = 40
  const transitionMs = DESKTOP_MOTION_SHOWCASE_DEFAULTS.slideTransitionMs
  const slideMotionMs = reduceMotion ? 0 : transitionMs
  const slideEase = DESKTOP_MOTION_SHOWCASE_DEFAULTS.slideTransitionEasing

  useLayoutEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const sync = () => setSlideWidth(el.clientWidth)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const trackOffsetPx = -activeIndex * slideWidth + dragDx
  const trackTransition =
    motionEnabled && !reduceMotion && slideWidth > 0
      ? `transform ${slideMotionMs}ms ${slideEase}`
      : 'none'

  const go = (dir: 1 | -1) => {
    if (!canPage || pagingLocked.current) return
    pagingLocked.current = true
    setMotionEnabled(true)
    setDragDx(0)
    setIndex(i => (i + dir + n) % n)
    window.setTimeout(() => {
      pagingLocked.current = false
    }, slideMotionMs + 40)
  }

  const finishDrag = (clientX: number, target: HTMLElement, pointerId: number) => {
    if (!dragging.current || dragStartX.current == null) return
    const dx = clientX - dragStartX.current
    dragging.current = false
    dragStartX.current = null
    try {
      target.releasePointerCapture(pointerId)
    } catch {
      /* already released */
    }
    setMotionEnabled(true)
    if (canPage && Math.abs(dx) >= dragThresholdPx) {
      setDragDx(0)
      go(dx > 0 ? -1 : 1)
      return
    }
    setDragDx(0)
  }

  if (!n) return null

  const alignClass =
    align === 'end' ? 'ml-auto' : align === 'start' ? 'mr-auto' : 'mx-auto'

  return (
    <div
      className={`${alignClass} w-full`}
      style={mockupMax ? { maxWidth: mockupMax } : undefined}
    >
      <div
        className={`w-full ${mockupFrame.className}`}
        style={mockupFrame.style}
      >
        <div
          ref={viewportRef}
          className={`w-full touch-pan-y overflow-hidden select-none ${
            canPage ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          onPointerDown={e => {
            if (!canPage || e.button !== 0) return
            dragging.current = true
            setMotionEnabled(false)
            dragStartX.current = e.clientX
            setDragDx(0)
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={e => {
            if (!dragging.current || dragStartX.current == null) return
            setDragDx(e.clientX - dragStartX.current)
          }}
          onPointerUp={e =>
            finishDrag(e.clientX, e.currentTarget, e.pointerId)
          }
          onPointerCancel={e =>
            finishDrag(e.clientX, e.currentTarget, e.pointerId)
          }
        >
          <div
            className="flex w-full will-change-transform"
            style={{
              transform: `translateX(${trackOffsetPx}px)`,
              transition: trackTransition,
            }}
          >
            {items.map((sl, i) =>
              sl.image ? (
                <div
                  key={sl._key ?? i}
                  className="w-full shrink-0"
                  aria-hidden={i !== activeIndex}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img
                    src={motionSlideSrc(sl.image)}
                    alt={sl.alt || fallbackAlt}
                    draggable={false}
                    className="block h-auto w-full max-w-full object-center"
                  />
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
      {canPage && (
        <div
          className={`mt-4 flex justify-end gap-7 text-[23px] font-medium leading-none lg:mt-5 ${arrowClass}`}
        >
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
    </div>
  )
}

function DesktopMotionStaggeredPair({
  section: s,
}: {
  section: Of<'desktopMotionShowcase'>
}) {
  const lightText = bandUsesLightText(s.appearance)
  const copyClass = lightText ? 'text-white' : 'text-black'
  const mockupFrame = desktopMotionMockupFrame(s.appearance, true)
  const title = s.sectionTitle?.trim()
  const pairs = s.carousels ?? []
  return (
    <section
      className={`relative flex flex-col ${SECTION_GAP_CLASS} px-5 sm:px-8 ${CS_WIDE_BAND_GUTTER}`}
      style={flexSectionStyle(s.appearance, true, 'md', undefined, lightText)}
    >
      {title ? (
        <h2 className={`text-center ${csSectionTitle()} ${copyClass}`}>
          {title}
        </h2>
      ) : null}
      <div className="flex w-full flex-col gap-12 lg:gap-[8.7rem]">
        {pairs.map((carousel, i) => {
          const slides = (carousel.slides ?? []).filter(sl => sl.image)
          const end = i % 2 === 1
          return (
            <div
              key={carousel._key ?? i}
              className={`w-full lg:w-[calc(50%-1.75rem)] ${end ? 'lg:self-end' : 'lg:self-start'}`}
            >
              <DesktopMotionPosterCarousel
                slides={slides}
                fallbackAlt={title || 'Key Product Experiences'}
                mockupFrame={mockupFrame}
                arrowClass={copyClass}
                align={end ? 'end' : 'start'}
              />
              {carousel.body?.length ? (
                <CaseStudyProse
                  value={carousel.body}
                  className={`mt-6 ${csBodyText()} ${copyClass}`}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DesktopMotionShowcaseBlock({
  section: s,
}: {
  section: Of<'desktopMotionShowcase'>
}) {
  if (s.layoutVariant === 'staggeredPair') {
    return <DesktopMotionStaggeredPair section={s} />
  }
  const carouselSlides = (s.slides ?? []).filter(sl => sl.image)
  const hasCarousel = carouselSlides.length > 0
  const hasVideo = !!(s.videoFile || s.videoUrl)
  const hasStaticImage = !!s.posterImage && !hasVideo && !hasCarousel
  const hasMedia = hasVideo || hasStaticImage || hasCarousel
  const copyTitle = s.sectionTitle?.trim()
  const hasCopy = !!(copyTitle || s.body?.length || s.caption)
  const lightText = bandUsesLightText(s.appearance)
  const copyClass = lightText ? 'text-white' : 'text-black'
  // `full` grows with the window (Circle Early prototyping). `wide` stays 873px.
  const fluidMockup = s.appearance?.maxWidth === 'full'
  const wideMockup = fluidMockup || s.appearance?.maxWidth === 'wide'
  const mockupMax = fluidMockup
    ? undefined
    : wideMockup
      ? DESKTOP_MOTION_SHOWCASE_DEFAULTS.mockupMaxWidthWide
      : DESKTOP_MOTION_SHOWCASE_DEFAULTS.mockupMaxWidth
  const fluidWrap =
    'mx-auto w-full lg:max-w-[min(100%,max(873px,60vw))]'
  const mockupFrame = desktopMotionMockupFrame(s.appearance, wideMockup)
  return (
    <section
      className={`relative flex flex-col ${SECTION_GAP_CLASS} ${csBandGutter()}`}
      style={flexSectionStyle(s.appearance, true, 'md', undefined, lightText)}
    >
      {hasMedia && (
        <div
          className={`flex justify-center pt-12 max-lg:pt-8 lg:pt-14 ${
            fluidMockup ? fluidWrap : csShell('!px-0 max-lg:!px-0')
          }`}
        >
          {hasCarousel ? (
            <DesktopMotionPosterCarousel
              slides={carouselSlides}
              fallbackAlt={copyTitle || 'Design Interventions'}
              mockupFrame={mockupFrame}
              mockupMax={mockupMax}
              arrowClass={copyClass}
            />
          ) : (
            <div
              className={`mx-auto w-full ${mockupFrame.className}`}
              style={{ maxWidth: mockupMax, ...mockupFrame.style }}
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
          )}
        </div>
      )}
      {hasCopy && (
          <div
            className={`w-full pb-[min(103px,12%)] pt-0 lg:pt-6 ${copyClass} ${
              fluidMockup ? fluidWrap : csShell('!px-0')
            }`}
          >
            <div
              className={`text-left max-lg:!max-w-none lg:ml-auto lg:max-w-[min(445px,42%)] ${
                fluidMockup ? 'lg:translate-x-[clamp(72px,8vw,160px)]' : ''
              }`}
            >
              {copyTitle && (
                <h2 className={csSectionTitle()}>
                  {copyTitle}
                </h2>
              )}
              {s.body?.length ? (
                <CaseStudyProse
                  value={s.body}
                  className={`${copyTitle ? 'mt-2.5' : ''} ${csBodyText()}`}
                />
              ) : s.caption ? (
                <p className={`${copyTitle ? 'mt-2.5' : ''} ${csBodyText()}`}>
                  {s.caption}
                </p>
              ) : null}
            </div>
          </div>
        )}
    </section>
  )
}

// Design Assist — poster carousel (desktop 3719:64984, mobile 3936:9564).
// Poster is a fixed 1032×630 slot; captions stack in one grid cell so the
// band sizes to the tallest slide without clipping shorter ones on page.
const INTERVENTION_CAROUSEL_POSTER_ASPECT = '1032 / 630'
const INTERVENTION_CAROUSEL_POSTER_SHADOW_CLASS =
  'shadow-[0_33px_27px_rgba(0,0,0,0.09),0_14px_11px_rgba(0,0,0,0.09),0_7px_6px_rgba(0,0,0,0.08),0_4px_3px_rgba(0,0,0,0.07),0_2px_2px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.04)] lg:shadow-[0_100px_80px_rgba(0,0,0,0.09),0_22px_18px_rgba(0,0,0,0.08),0_3px_3px_rgba(0,0,0,0.25)]'
const INTERVENTION_CAROUSEL_TRANSITION_MS = 500

function InterventionCarouselBlock({
  section: s,
}: {
  section: Of<'interventionCarousel'>
}) {
  const slides = (s.slides ?? []).filter(sl => sl.image)
  const n = slides.length
  const [index, setIndex] = useState(0)
  const reduceMotion = usePrefersReducedMotion()
  const touchStartX = useRef<number | null>(null)
  const pagingLocked = useRef(false)
  const kicker = s.sectionTitle?.trim() || 'Design Interventions'
  const canPage = n > 1
  const showCaption = !!(
    kicker ||
    slides.some(sl => sl.body?.length) ||
    s.introBody?.length
  )
  const slideMotionMs = reduceMotion ? 0 : INTERVENTION_CAROUSEL_TRANSITION_MS
  const slideMotionClass = reduceMotion
    ? ''
    : 'transition-opacity duration-500 ease-in-out'

  const go = (dir: 1 | -1) => {
    if (!canPage || pagingLocked.current) return
    pagingLocked.current = true
    setIndex(i => (i + dir + n) % n)
    window.setTimeout(() => {
      pagingLocked.current = false
    }, slideMotionMs + 40)
  }

  const onPosterTouchStart = (clientX: number) => {
    touchStartX.current = clientX
  }

  const onPosterTouchEnd = (clientX: number) => {
    if (touchStartX.current == null || !canPage) return
    const dx = clientX - touchStartX.current
    if (Math.abs(dx) >= 40) go(dx > 0 ? -1 : 1)
    touchStartX.current = null
  }

  return (
    <section
      data-cs-stretch
      className={`flex flex-col ${SECTION_GAP_CLASS} max-lg:!px-[25px] max-lg:!py-[88px] ${csBandGutter()}`}
      style={flexSectionStyle(s.appearance, true, 'md', '#e9eef7', false)}
    >
      <div className="mx-auto flex w-full max-w-[344px] flex-col gap-[57px] lg:max-w-[1032px] lg:gap-0 lg:pb-12">
        {slides.length > 0 && (
          <div className="w-full shrink-0 lg:pt-14">
            <div
              className={`grid w-full overflow-hidden bg-white ${INTERVENTION_CAROUSEL_POSTER_SHADOW_CLASS}`}
              style={{ aspectRatio: INTERVENTION_CAROUSEL_POSTER_ASPECT }}
              onTouchStart={e => onPosterTouchStart(e.touches[0]?.clientX ?? 0)}
              onTouchEnd={e => onPosterTouchEnd(e.changedTouches[0]?.clientX ?? 0)}
            >
              {slides.map((sl, i) =>
                sl.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- case-study art
                  <img
                    key={sl._key ?? i}
                    src={sl.image}
                    alt={sl.title || kicker}
                    aria-hidden={i !== index}
                    className={`col-start-1 row-start-1 size-full object-contain object-left-top ${slideMotionClass} ${
                      i === index
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0'
                    }`}
                  />
                ) : null,
              )}
            </div>
          </div>
        )}
        {(canPage || showCaption) && (
          <div className="shrink-0 lg:mt-[25px]">
            {canPage && (
              <div className="mb-4 hidden shrink-0 items-center justify-end gap-7 text-[#171717] lg:mb-[15px] lg:flex">
                <button
                  type="button"
                  aria-label="Previous slide"
                  data-cursor="hover"
                  onClick={() => go(-1)}
                  className="bg-transparent p-0.5 transition-opacity hover:opacity-70"
                >
                  <svg width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden>
                    <path
                      d="M12 2 2 12l10 10"
                      stroke="currentColor"
                      strokeWidth="2.75"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  data-cursor="hover"
                  onClick={() => go(1)}
                  className="bg-transparent p-0.5 transition-opacity hover:opacity-70"
                >
                  <svg width="14" height="24" viewBox="0 0 14 24" fill="none" aria-hidden>
                    <path
                      d="M2 2l10 10L2 22"
                      stroke="currentColor"
                      strokeWidth="2.75"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    />
                  </svg>
                </button>
              </div>
            )}
            {showCaption && (
              <div className="grid w-full text-left lg:ml-auto lg:max-w-[min(445px,42%)]">
                {slides.map((sl, i) => {
                  const body = sl.body?.length ? sl.body : s.introBody
                  if (!kicker && !body?.length) return null
                  return (
                    <div
                      key={sl._key ?? i}
                      className={`col-start-1 row-start-1 ${slideMotionClass} ${
                        i === index
                          ? 'pointer-events-auto opacity-100'
                          : 'pointer-events-none opacity-0'
                      }`}
                      aria-hidden={i !== index}
                    >
                      {kicker && (
                        <h2 className={csSectionTitle()}>{kicker}</h2>
                      )}
                      {body?.length ? (
                        <CaseStudyProse
                          value={body}
                          className={`${kicker ? 'mt-2.5' : ''} ${csBodyText()}`}
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// Design Assist — on-page intervention grid (Figma 3719:65044).
// Design Assist — intervention grid (desktop 3719:65044, mobile 3938:14511).
const INTERVENTION_GRID_CARD_SHADOW_CLASS =
  'max-lg:shadow-[0_4px_9.6px_rgba(0,0,0,0.25)] lg:shadow-[0_12px_40px_rgba(0,0,0,0.12)]'

function InterventionGridBlock({
  section: s,
}: {
  section: Of<'interventionGrid'>
}) {
  const items = s.items ?? []
  const initial =
    typeof s.initialVisibleCount === 'number' && s.initialVisibleCount >= 1
      ? s.initialVisibleCount
      : 6
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, initial)
  const hasMore = items.length > initial
  const readMore = s.readMoreLabel?.trim() || 'Load More'
  const loadMoreBtnClass =
    'relative pb-1 uppercase leading-[19.2px] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current text-[14px] font-normal tracking-wide text-[#171717] transition-opacity hover:opacity-70'

  return (
    <section
      data-cs-stretch
      className={`flex flex-col ${SECTION_GAP_CLASS} max-lg:!px-[25px] max-lg:!py-[88px] ${csBandGutter()}`}
      style={flexSectionStyle(s.appearance, true, 'md', '#d5cfdd', false)}
    >
      <div className="mx-auto flex w-full max-w-[344px] flex-col lg:max-w-[min(1400px,calc(100%-2.5rem))] lg:px-12">
        {(s.sectionTitle || s.introBody?.length) && (
          <div className="w-full max-w-[607px] text-left">
            {s.sectionTitle && (
              <h2 className={`${csSectionTitle()} uppercase`}>
                {s.sectionTitle}
              </h2>
            )}
            {s.introBody?.length ? (
              <CaseStudyProse
                value={s.introBody}
                className={`${s.sectionTitle ? 'mt-4' : ''} ${csBodyText()} text-left`}
              />
            ) : null}
          </div>
        )}
        {visible.length > 0 && (
          <div className="mt-[50px] grid grid-cols-1 gap-[50px] lg:mt-14 lg:grid-cols-2 lg:gap-x-[120px] lg:gap-y-[100px]">
            {visible.map(item =>
              item.image ? (
                <div
                  key={item._key}
                  className={`overflow-hidden bg-white ${INTERVENTION_GRID_CARD_SHADOW_CLASS}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
                  <img
                    src={item.image}
                    alt={item.caption || 'Design intervention'}
                    className="block h-auto w-full"
                  />
                </div>
              ) : null,
            )}
          </div>
        )}
        {hasMore && !expanded && (
          <div className="mt-[56px] flex justify-center lg:mt-14">
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setExpanded(true)}
              className={loadMoreBtnClass}
            >
              {readMore}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function MediaBlock({ section: s }: { section: Of<'mediaSection'> }) {
  const light = isLight(s.appearance)
  const items = s.items ?? []
  const multi = items.length > 1
  return (
    <section
      data-cs-stretch
      className={`flex flex-col justify-center ${SECTION_GAP_CLASS}`}
      style={flexSectionStyle(s.appearance, true, 'md')}
    >
      {items.length > 0 && (
        <div
          className={
            multi
              ? `${csShell()} grid w-full gap-6 sm:grid-cols-2`
              : csShell()
          }
        >
          {items.map((m, i) => (
            <MediaUnit key={m._key ?? `media-${i}`} item={m} />
          ))}
        </div>
      )}
      {(s.sectionTitle || s.body) && (
        <div className={`${csShell()} ml-auto max-w-[min(440px,100%)]`}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <CaseStudyProse
            value={s.body}
            className="mt-3 text-[14px] leading-[1.45] xl:text-[0.95vw]"
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
  const light = isLight(s.appearance)
  const initial = s.itemsBeforeViewMore ?? 6
  const tan = colorToCss(s.appearance?.backgroundColor)
  const tile = !!s.useDeviceTabs // device-tab flows use the framed tile style
  return (
    <section
      className={csBandGutter()}
      style={{
        ...bandStyle(s.appearance),
        ...sectionPadStyle(s.appearance, padDefaults('md', true), true),
      }}
    >
      {(s.sectionTitle || s.body) && (
        <div className={`mb-2 ${true ? csShell('!px-0') : ''}`}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <CaseStudyProse value={s.body} className={`max-w-[70ch] ${csBodyText()}`} />
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
  scrollContainer,
}: {
  section: Of<'showcaseGallery'>
  scrollContainer?: HTMLDivElement | null
}) {
  const items = s.items ?? []
  const images = imgUrls(items)
  const lightboxImages = lightboxUrls(items)
  const light = isLight(s.appearance, true)

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
        className={`flex flex-col justify-center ${SECTION_GAP_CLASS}`}
        {...cursorInvertAttrs(light)}
        style={{
          ...sectionStyle(s.appearance, true, 'md', '#000000', true),
          ...sectionGapStyle(s.appearance, gapDefault('lg', true), true),
        }}
      >
        <div
          className={`relative flex w-full flex-col ${SECTION_GAP_CLASS} px-12 sm:px-16 ${CS_WIDE_BAND_GUTTER}`}
          style={sectionGapStyle(s.appearance, gapDefault('lg', true), true)}
        >
          {(s.sectionTitle || s.introBody) && (
            <div
              className="order-1 w-full lg:order-2 lg:max-w-[calc((100%-2*var(--cs-artifact-gap))/3)]"
              style={{ ['--cs-artifact-gap' as string]: `${artifactGap}px` }}
            >
              {s.sectionTitle && (
                <h2
                  className={`text-center font-normal uppercase leading-tight lg:text-left lg:normal-case lg:capitalize text-[16px] lg:text-[26px] ${light ? 'text-white' : ''}`}
                >
                  {s.sectionTitle}
                </h2>
              )}
              {s.introBody?.length ? (
                <CaseStudyProse
                  value={s.introBody}
                  className={`mt-4 hidden lg:block ${csBodySm()}`}
                />
              ) : null}
            </div>
          )}
          {images.length > 0 && (
            <div className="order-2 lg:order-1">
              <ArtifactSlider
                images={lightboxImages.length ? lightboxImages : images}
                scrollContainer={scrollContainer}
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
      className={`flex flex-col justify-center ${SECTION_GAP_CLASS}`}
      {...cursorInvertAttrs(light)}
      style={flexSectionStyle(s.appearance, true, 'md', '#000000', true)}
    >
      {(s.sectionTitle || s.introBody) && (
        <div className={csShell()}>
          {s.sectionTitle && <Label light={light}>{s.sectionTitle}</Label>}
          <CaseStudyProse
            value={s.introBody}
            className={`mt-3 ${csBodySm()}`}
          />
        </div>
      )}
      {images.length > 0 && (
        <CenterSlider
          images={images}
          lightboxImages={lightboxImages.length ? lightboxImages : images}
          scrollContainer={scrollContainer}
        />
      )}
    </section>
  )
}

// Motion Showcase ("Key Product Experiences"): stacked labelled device rows (Coral),
// featured centred device band (Census — Figma 2229:30253), or cross-functional
// triptych (AR Handbook — Figma 4152:122925 / 4152:125655).
const MOTION_BG = '#52747e'

type ViewMorePopupPageContent = {
  _key?: string
  popupKicker?: string
  popupTitle?: string
  popupBody?: PortableTextBlock[]
  popupTabs?: DeviceTab[]
}

function ViewMoreDeviceTabsModal({
  open,
  onClose,
  projectName,
  fallbackLabel,
  pages,
  popupAppearance: popupApp,
  popupItemsBeforeViewMore = 6,
  popupLoadMoreLabel = 'Load More',
  popupLoadLessLabel = 'Show Less',
}: {
  open: boolean
  onClose: () => void
  projectName: string
  fallbackLabel: string
  pages: ViewMorePopupPageContent[]
  popupAppearance?: Appearance
  popupItemsBeforeViewMore?: number
  popupLoadMoreLabel?: string
  popupLoadLessLabel?: string
}) {
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    if (open) setPageIndex(0)
  }, [open])

  const activePages = pages.filter(
    p =>
      p.popupBody?.length ||
      (p.popupTabs ?? []).some(t => (t.items?.length ?? 0) > 0),
  )
  if (!activePages.length) return null

  const page = activePages[pageIndex] ?? activePages[0]
  const popupTabs = page.popupTabs ?? []
  const popupTitleExplicit = page.popupTitle?.trim()
  const popupHeadline =
    popupTitleExplicit ||
    (page.popupBody?.length ? fallbackLabel : undefined)
  const popupShellLabel = popupHeadline ?? fallbackLabel
  const popupKicker = page.popupKicker?.trim()

  const totalPages = activePages.length
  const prev = () =>
    setPageIndex(i => (i - 1 + totalPages) % totalPages)
  const next = () => setPageIndex(i => (i + 1) % totalPages)

  return (
    <PopupShell
      open={open}
      onClose={onClose}
      label={popupShellLabel}
      crumbs={[
        { label: 'Case Studies', href: '/casestudies', hideOnMobile: true },
        { label: projectName, hideOnMobile: true },
        { label: popupShellLabel },
      ]}
      cardClassName="bg-white"
      bodyClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain reckless-prose"
      footerClassName="reckless-prose"
      footer={
        totalPages > 1 ? (
          <div className="flex w-full max-w-[620px] items-center justify-between">
            <PopupPagerButton onClick={prev}>{'< Previous'}</PopupPagerButton>
            <PopupDots
              className="flex"
              count={totalPages}
              active={pageIndex}
              onSelect={setPageIndex}
              labelFor={i =>
                activePages[i]?.popupTitle?.trim() ||
                `${fallbackLabel} ${i + 1}`
              }
            />
            <PopupPagerButton onClick={next}>{'Next >'}</PopupPagerButton>
          </div>
        ) : undefined
      }
    >
      <DeviceTabsViewMorePopupBody
        popupApp={popupApp}
        popupKicker={popupKicker}
        popupHeadline={popupHeadline}
        popupBody={page.popupBody}
        popupTabs={popupTabs}
        popupInitial={popupItemsBeforeViewMore}
        popupLoadMore={popupLoadMoreLabel}
        popupLoadLess={popupLoadLessLabel}
      />
    </PopupShell>
  )
}

function MotionShowcaseBlock({
  section: s,
  projectSlug,
  projectName,
}: {
  section: Of<'motionShowcase'>
  projectSlug?: string
  projectName?: string
}) {
  const layout = s.layoutVariant ?? 'stacked'
  if (layout === 'phoneRow') {
    return <MotionShowcasePhoneRowBand section={s} />
  }
  if (layout === 'featured') {
    return (
      <MotionShowcaseFeaturedBand section={s} projectSlug={projectSlug} />
    )
  }
  if (layout === 'crossFunctional') {
    return (
      <MotionShowcaseCrossFunctionalBand
        section={s}
        projectName={projectName ?? 'Case Study'}
      />
    )
  }
  return <MotionShowcaseStackedBand section={s} />
}

/** §07 phoneRow — three full-frame phones + intro (Figma DVA 4001:76397 / 4001:79990). */
function MotionShowcasePhoneRowBand({
  section: s,
}: {
  section: Of<'motionShowcase'>
}) {
  const row = s.rows?.[0]
  const items = (row?.items ?? []).filter(
    it => it.image || it.videoFile || it.videoUrl,
  )
  const lightText = bandUsesLightText(s.appearance)
  const textClass = lightText ? 'text-white' : 'text-black'
  const titleMb =
    typeof s.titleMarginBottom === 'number' && s.titleMarginBottom >= 0
      ? s.titleMarginBottom
      : MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottom
  const titleMbLg =
    typeof s.titleMarginBottomDesktop === 'number' &&
    s.titleMarginBottomDesktop >= 0
      ? s.titleMarginBottomDesktop
      : MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottomDesktop
  const [lg, setLg] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setLg(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const titleMargin = lg ? titleMbLg : titleMb
  const d = MOTION_PHONE_ROW_DEFAULTS

  if (!items.length) return null

  return (
    <section
      className={csBandGutter()}
      style={{
        ...sectionStyle(s.appearance, true, 'lg', '#999999', lightText),
        justifyContent: 'flex-start',
      }}
    >
      {s.sectionTitle && (
        <h2
          className={`text-center ${csSectionTitle()} ${textClass}`}
          style={{ marginBottom: titleMargin }}
        >
          {s.sectionTitle}
        </h2>
      )}

      {/* Mobile — 2+1 grid (Figma 4001:79990). */}
      <div
        className="mx-auto grid w-full grid-cols-2 lg:hidden"
        style={{
          maxWidth: d.mobileMaxWidth,
          columnGap: d.mobileColumnGap,
          rowGap: d.mobileRowGap,
        }}
      >
        {items.map((it, itemIndex) => (
          <PhoneRowMedia
            key={it._key ?? `phone-row-m-${itemIndex}`}
            item={it}
            phoneHeight={d.phoneHeightMobile}
            className="min-w-0"
            appearance={s.appearance}
          />
        ))}
      </div>

      {/* Desktop — centred phone strip + intro under the right mockup
          (Figma 4002:86609 / 4001:76571). */}
      <div
        className="mx-auto hidden w-full overflow-visible lg:block"
        style={{ maxWidth: d.bandMaxWidth }}
      >
        <div
          className="flex items-stretch justify-center"
          style={{ gap: d.columnGap, height: d.phoneHeightDesktop }}
        >
          {items.map((it, itemIndex) => (
            <PhoneRowMedia
              key={it._key ?? `phone-row-d-${itemIndex}`}
              item={it}
              phoneHeight={d.phoneHeightDesktop}
              className="min-w-0 flex-1"
              appearance={s.appearance}
            />
          ))}
        </div>
        {s.intro?.length ? (
          <div
            className={`text-left ${textClass}`}
            style={{
              marginTop: d.introMarginTopDesktop,
              marginLeft: d.introOffsetLeft,
              width: d.introMaxWidth,
            }}
          >
            <CaseStudyProse value={s.intro} className={csBodySm()} />
          </div>
        ) : null}
      </div>

      {s.intro?.length ? (
        <div
          className={`mx-auto w-full text-left lg:hidden ${textClass}`}
          style={{
            marginTop: d.introMarginTopMobile,
            maxWidth: d.mobileMaxWidth,
          }}
        >
          <CaseStudyProse value={s.intro} className={csBodySm()} />
        </div>
      ) : null}
    </section>
  )
}

function PhoneRowMedia({
  item,
  phoneHeight,
  className = '',
  appearance,
}: {
  item: MediaItem
  phoneHeight: number
  className?: string
  appearance?: Appearance
}) {
  const videoPoster = item.posterImage
  const videoSrc =
    typeof item.videoFile === 'string'
      ? item.videoFile
      : item.mediaType === 'video' && item.videoFile
        ? String(item.videoFile)
        : undefined
  const frame = motionRadiusFrame(
    motionRadiusPair(appearance, MOTION_RADIUS_SCALE.stacked),
  )
  const frameClass = `flex min-h-0 justify-center ${className}`
  /** Fixed px height — shorter PNGs scale up; width follows aspect ratio. */
  const mediaStyle = {
    height: phoneHeight,
    width: 'auto' as const,
    ...frame.style,
  }
  const mediaClass = `block w-auto ${frame.className}`
  if (videoSrc) {
    return (
      <div className={frameClass}>
        <video
          className={mediaClass}
          style={mediaStyle}
          src={videoSrc}
          poster={videoPoster}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    )
  }
  if (item.image) {
    return (
      <div className={frameClass}>
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={item.image}
          alt={item.caption || ''}
          className={mediaClass}
          style={mediaStyle}
        />
      </div>
    )
  }
  return null
}

/** §07 crossFunctional — AR Handbook teal triptych (Figma 4152:122925 / 4152:125655). */
function MotionShowcaseCrossFunctionalBand({
  section: s,
  projectName,
}: {
  section: Of<'motionShowcase'>
  projectName: string
}) {
  const [popupOpen, setPopupOpen] = useState(false)
  const rows = (s.rows ?? []).slice(0, 3)
  const d = MOTION_CROSS_FUNCTIONAL_DEFAULTS
  const lightText = bandUsesLightText(s.appearance)
  const textClass = lightText ? 'text-white' : 'text-black'
  const viewMore = s.viewMoreLabel?.trim() || 'View More'
  const popupPages = s.viewMorePopups ?? []
  const hasPopup = popupPages.some(
    p =>
      p.popupBody?.length ||
      (p.popupTabs ?? []).some(t => (t.items?.length ?? 0) > 0),
  )
  const fallbackLabel =
    s.sectionTitle?.trim() || 'Cross Functional Experiences'
  const titleMbMobile =
    typeof s.titleMarginBottom === 'number' && s.titleMarginBottom >= 0
      ? s.titleMarginBottom
      : d.titleMarginBottomMobile
  const titleMbDesktop =
    typeof s.titleMarginBottomDesktop === 'number' &&
    s.titleMarginBottomDesktop >= 0
      ? s.titleMarginBottomDesktop
      : d.titleMarginBottomDesktop
  const [lg, setLg] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setLg(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const titleMargin = lg ? titleMbDesktop : titleMbMobile
  if (!rows.length) return null

  return (
    <>
      <section
        className="w-full max-w-full overflow-x-hidden"
        style={sectionStyle(s.appearance, true, 'lg', MOTION_BG, lightText)}
      >
      {s.sectionTitle && (
        <h2
          className={`text-center ${csSectionTitle()} ${csBandGutter()} max-lg:!text-[13px] max-lg:!uppercase max-lg:!leading-[1.2] ${textClass}`}
          style={{ marginBottom: titleMargin }}
        >
          {s.sectionTitle}
        </h2>
      )}

      {/* Mobile — Figma 4152:125655: centred phone, full-width tablet/RealWear + captions. */}
      <div
        className={`flex w-full flex-col lg:hidden ${csBandGutter()}`}
        style={{ gap: d.mobileStackGap }}
      >
        {rows.map((row, i) => (
          <CrossFunctionalRowStack
            key={row._key ?? `cross-functional-m-${i}`}
            row={row}
            textClass={textClass}
            captionGapPx={
              d.mobileCaptionGapPx[i] ??
              d.mobileCaptionGapPx[d.mobileCaptionGapPx.length - 1]
            }
            appearance={s.appearance}
          />
        ))}
      </div>

      {/* Desktop — Figma 4152:122925: full-bleed diagonal stagger (1440 canvas). */}
      <div className="relative hidden w-full max-w-none lg:block">
        <div
          className="relative w-full"
          style={{ aspectRatio: d.bandAspectRatio }}
        >
          {rows.map((row, i) => {
            const slot = d.slots[i] ?? d.slots[d.slots.length - 1]
            return (
              <div
                key={row._key ?? `cross-functional-d-${i}`}
                className="absolute flex flex-col"
                style={{
                  left: slot.left,
                  top: slot.top,
                  width: slot.width,
                  maxWidth: slot.width,
                  zIndex: slot.zIndex,
                }}
              >
                <CrossFunctionalDeviceMedia row={row} appearance={s.appearance} />
                {(row.label || row.caption) && (
                  <div
                    className={textClass}
                    style={{
                      maxWidth: slot.captionMaxWidth,
                      marginTop: `${slot.captionGapVw}vw`,
                    }}
                  >
                    {row.label && (
                      <p className="text-[16px] font-normal leading-[1.05]">
                        {row.label}
                      </p>
                    )}
                    {row.caption && (
                      <p className="mt-1 text-[16px] font-normal leading-[1.05]">
                        {row.caption}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

        {hasPopup ? (
          <div className={`${csBandGutter()} flex justify-center pb-12 pt-10 lg:pb-16 lg:pt-14`}>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setPopupOpen(true)}
              className={`font-grotesk shrink-0 capitalize leading-[1.6] tracking-[0.5px] underline underline-offset-4 transition-opacity hover:opacity-80 ${csUiText()} text-[20px] ${textClass}`}
            >
              {viewMore}
            </button>
          </div>
        ) : null}
      </section>

      {hasPopup ? (
        <ViewMoreDeviceTabsModal
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          projectName={projectName}
          fallbackLabel={fallbackLabel}
          pages={popupPages}
          popupAppearance={s.popupAppearance}
          popupItemsBeforeViewMore={s.popupItemsBeforeViewMore}
          popupLoadMoreLabel={s.popupLoadMoreLabel}
          popupLoadLessLabel={s.popupLoadLessLabel}
        />
      ) : null}
    </>
  )
}

function CrossFunctionalRowStack({
  row,
  textClass,
  captionGapPx,
  appearance,
}: {
  row: MotionRow
  textClass: string
  captionGapPx: number
  appearance?: Appearance
}) {
  return (
    <div className="flex w-full flex-col">
      <CrossFunctionalDeviceMedia row={row} mobile appearance={appearance} />
      {(row.label || row.caption) && (
        <div
          className={`w-full text-left ${textClass}`}
          style={{ marginTop: captionGapPx }}
        >
          {row.label && (
            <p className="text-[14px] font-normal leading-[1.2]">{row.label}</p>
          )}
          {row.caption && (
            <p className="mt-1 text-[14px] font-normal leading-[1.2]">
              {row.caption}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CrossFunctionalDeviceMedia({
  row,
  mobile = false,
  appearance,
}: {
  row: MotionRow
  mobile?: boolean
  appearance?: Appearance
}) {
  const item = (row.items ?? []).find(
    it => it.image || it.videoFile || it.videoUrl,
  )
  if (!item) return null
  const device = row.device ?? 'mobile'
  const phoneSlot = mobile && device === 'mobile'
  const phoneMax = MOTION_CROSS_FUNCTIONAL_DEFAULTS.mobilePhoneMaxWidth
  const frameClass = phoneSlot ? 'mx-auto w-full' : 'w-full'
  const frameStyle = phoneSlot ? { maxWidth: phoneMax } : undefined
  const shadowClass =
    'drop-shadow-[0_2px_17px_rgba(0,0,0,0.25)] lg:drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)]'
  const videoPoster = item.posterImage || row.posterImage
  const videoSrc =
    typeof item.videoFile === 'string'
      ? item.videoFile
      : item.mediaType === 'video' && item.videoFile
        ? String(item.videoFile)
        : undefined
  const radius = motionRadiusFrame(
    motionRadiusPair(appearance, MOTION_RADIUS_SCALE.stacked),
  )
  const mediaClass = `block h-auto w-full ${radius.className}`
  const mediaStyle = radius.style
  if (videoSrc) {
    return (
      <div
        className={`${frameClass} ${shadowClass}`}
        style={frameStyle}
      >
        <video
          className={mediaClass}
          style={mediaStyle}
          src={videoSrc}
          poster={videoPoster}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
    )
  }
  if (item.image) {
    return (
      <div
        className={`${frameClass} ${shadowClass}`}
        style={frameStyle}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={item.image}
          alt={row.label || row.caption || ''}
          className={mediaClass}
          style={mediaStyle}
        />
      </div>
    )
  }
  return null
}

function MotionShowcaseFeaturedBand({
  section: s,
  projectSlug,
}: {
  section: Of<'motionShowcase'>
  projectSlug?: string
}) {
  const row = s.rows?.[0]
  if (!row) return null
  const items = row.items ?? []
  const captionAlign = row.captionAlign ?? 'left'
  const rowWidthDefault = 34
  const rowWidth =
    typeof row.rowWidthPercent === 'number' && row.rowWidthPercent > 0
      ? row.rowWidthPercent
      : rowWidthDefault
  const titleMb =
    typeof s.titleMarginBottom === 'number' && s.titleMarginBottom >= 0
      ? s.titleMarginBottom
      : MOTION_SHOWCASE_BAND_DEFAULTS.titleMarginBottom
  const mobile =
    projectSlug === '2020-us-census-benefit-calculator'
      ? MOTION_FEATURED_MOBILE_CENSUS_DEFAULTS
      : MOTION_FEATURED_MOBILE_DEFAULTS
  const captionInset =
    captionAlign === 'right'
      ? featuredCaptionInset('right')
      : featuredCaptionInset('left')
  return (
    <section
      className={`relative flex flex-col ${SECTION_GAP_CLASS} ${csBandGutter()} max-lg:px-6`}
      style={flexSectionStyle(
        s.appearance,
        true,
        'lg',
        MOTION_FEATURED_BAND_DEFAULTS.backgroundColor,
      )}
    >
      {s.sectionTitle && (
        <h2
          className={`text-center ${csSectionTitle()} text-black`}
          style={{ marginBottom: titleMb }}
        >
          {s.sectionTitle}
        </h2>
      )}
      {/* Mobile — Figma 3928:49325 / 3999:55762: centred phone + full-width caption below */}
      <div
        className="mx-auto flex w-full flex-col items-center lg:hidden"
        style={{
          maxWidth: mobile.contentMaxWidth,
          gap: mobile.stackGap,
        }}
      >
        {items.length > 0 && (
          <div
            className="drop-shadow-[0_2.335px_17.101px_rgba(0,0,0,0.25)]"
            style={{ width: mobile.mockupWidth, maxWidth: mobile.mockupWidth }}
          >
            {items.map((it, itemIndex) => (
              <FeaturedDeviceMedia
                key={it._key ?? `featured-mobile-${itemIndex}`}
                item={it}
                poster={row.posterImage}
                appearance={s.appearance}
              />
            ))}
          </div>
        )}
        {(row.label || row.caption) && (
          <div className="w-full text-black">
            {row.label && (
              <p className="text-[14px] font-normal uppercase leading-[1.03]">
                {row.label}
              </p>
            )}
            {row.caption && (
              <p className="mt-[21px] text-[16px] font-normal leading-[1.05]">
                {row.caption}
              </p>
            )}
          </div>
        )}
      </div>
      {/* Desktop — Figma 2229:30253: centred phone + bottom inset caption */}
      <div className="hidden w-full lg:block">
        {items.length > 0 && (
          <div className="flex justify-center pt-2 pb-0">
            <div
              className="drop-shadow-[0_4px_26px_rgba(0,0,0,0.25)]"
              style={{ width: `${rowWidth}%`, maxWidth: '245px' }}
            >
              {items.map((it, itemIndex) => (
                <FeaturedDeviceMedia
                  key={it._key ?? `featured-desktop-${itemIndex}`}
                  item={it}
                  poster={row.posterImage}
                  appearance={s.appearance}
                />
              ))}
            </div>
          </div>
        )}
        {(row.label || row.caption) && (
          <div
            className={`w-full pb-[min(51px,8%)] pt-8 text-black ${csShell('!px-0')}`}
          >
            <div className="text-left" style={captionInset}>
              {row.label && (
                <p className="text-[20px] font-normal capitalize leading-[1.6]">
                  {row.label}
                </p>
              )}
              {row.caption && (
                <p className="mt-2.5 max-w-[353px] text-[16px] font-normal leading-[1.6]">
                  {row.caption}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturedDeviceMedia({
  item,
  poster,
  appearance,
}: {
  item: MediaItem
  poster?: string
  appearance?: Appearance
}) {
  const frame = motionRadiusFrame(
    motionRadiusPair(appearance, MOTION_RADIUS_SCALE.featured),
  )
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
        className={`block h-auto w-full ${frame.className}`}
        style={frame.style}
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
        className={`block h-auto w-full ${frame.className}`}
        style={frame.style}
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
      className={csBandGutter()}
      style={sectionStyle(s.appearance, true, 'lg', MOTION_BG)}
    >
      {s.sectionTitle && (
        <h2
          className={`text-center ${csSectionTitle()} max-lg:!text-[13px] max-lg:!uppercase max-lg:!leading-[1.2] ${light ? onDark : ''}`}
          style={{ marginBottom: titleMargin }}
        >
          {s.sectionTitle}
        </h2>
      )}
      {s.intro && (
        <div
          className={`mx-auto max-w-[min(720px,100%)] text-center ${csShell('!px-0')} ${onDark}`}
          style={{ marginBottom: introMb }}
        >
          <CaseStudyProse value={s.intro} className={csBodySm()} />
        </div>
      )}
      <div
        className={`mx-auto flex max-w-[min(1280px,100%)] flex-col max-lg:!max-w-full ${SECTION_GAP_CLASS} ${csShell('!px-0')}`}
        style={sectionGapStyle(s.appearance, gapDefault('lg', true), true)}
      >
        {rows.map((row, i) => (
          <MotionRowView
            key={row._key ?? `motion-row-${i}`}
            row={row}
            alignRight={rows.length === 1 ? false : i % 2 === 1}
            centerRow={rows.length === 1}
            light={light}
            inheritTextColor={!!s.appearance?.textColor?.hex}
            appearance={s.appearance}
          />
        ))}
      </div>
    </section>
  )
}

function isCssWhite(css?: string): boolean {
  if (!css) return false
  const h = css.replace('#', '').toLowerCase()
  return h === 'fff' || h === 'ffffff'
}

/** Pre-rounded PNGs — no white matte (same as CE full-frame). Band shows through alpha. */
function motionStackedFrameFill(rowTileBg?: SanityColor): string | undefined {
  const css = colorToCss(rowTileBg)
  if (!css || isCssWhite(css)) return undefined
  return css
}

/** Studio tileBorderRadius is desktop (lg+). Unset/0 = pre-rounded PNG, no CSS clip. */
function motionRadiusPair(
  appearance: Appearance | undefined,
  scale: { desktop: number; mobile: number },
): { desktop: number; mobile: number } {
  const explicit = appearance?.tileBorderRadius
  if (typeof explicit !== 'number' || explicit <= 0) {
    return { desktop: 0, mobile: 0 }
  }
  const scaled = Math.round(explicit * (scale.mobile / scale.desktop))
  return {
    desktop: explicit,
    mobile: Math.min(explicit, Math.max(scaled, 1)),
  }
}

function motionRadiusFrame(pair: { desktop: number; mobile: number }): {
  className: string
  style?: CSSProperties
} {
  if (pair.desktop <= 0 && pair.mobile <= 0) return { className: '' }
  return {
    className:
      'overflow-hidden rounded-[var(--cs-motion-r)] max-lg:!rounded-[var(--cs-motion-r-m)]',
    style: {
      ['--cs-motion-r' as string]: `${pair.desktop}px`,
      ['--cs-motion-r-m' as string]: `${pair.mobile}px`,
    },
  }
}

function MotionRowView({
  row,
  alignRight,
  centerRow = false,
  light,
  inheritTextColor,
  appearance,
}: {
  row: MotionRow
  alignRight: boolean
  centerRow?: boolean
  light: boolean
  inheritTextColor: boolean
  appearance?: Appearance
}) {
  const items = row.items ?? []
  const device = row.device ?? 'mobile'
  const frameRadius = motionRadiusFrame(
    motionRadiusPair(appearance, MOTION_RADIUS_SCALE.stacked),
  )
  const captionColor = inheritTextColor ? '' : light ? 'text-[#e3e3db]' : 'text-black'
  const rowWidthDefault = MOTION_ROW_DEFAULTS.rowWidthPercent
  const rowWidth =
    typeof row.rowWidthPercent === 'number' && row.rowWidthPercent > 0
      ? row.rowWidthPercent
      : rowWidthDefault
  const itemGap =
    typeof row.itemGapPercent === 'number' && row.itemGapPercent >= 0
      ? row.itemGapPercent
      : MOTION_ROW_DEFAULTS.itemGapPercent
  const captionMt =
    typeof row.captionMarginTop === 'number' && row.captionMarginTop >= 0
      ? row.captionMarginTop
      : MOTION_ROW_DEFAULTS.captionMarginTop
  const tileBg = motionStackedFrameFill(row.tileBackgroundColor)
  const frameMatte = Boolean(tileBg)
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
              className={`min-w-0 flex-1 ${frameRadius.className}${
                frameMatte ? ' border border-black/5' : ''
              }`}
              style={{
                backgroundColor: tileBg ?? 'transparent',
                ...frameRadius.style,
              }}
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
              <p className="text-[20px] font-normal capitalize leading-[1.6] max-lg:!text-[13px] max-lg:!uppercase max-lg:!leading-[1.2]">
                {row.label}
              </p>
            )}
            {row.caption && (
              <p className="mt-2.5 text-[16px] font-normal leading-[1.6] max-lg:!mt-1.5 max-lg:!text-[14px] max-lg:!leading-[1.3]">
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
}: {
  item: MediaItem
  poster?: string
  device?: 'mobile' | 'tablet' | 'desktop'
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
        className="block h-auto w-full"
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
        className="block aspect-video w-full"
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
        className="block h-auto w-full"
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
      className={csBandGutter()}
      style={sectionStyle(s.appearance, true, 'lg')}
    >
      {s.sectionTitle && (
        <h2 className={`mb-12 text-center lg:mb-16 ${csSectionTitle()}`}>
          {s.sectionTitle}
        </h2>
      )}
      {composite ? (
        <HighlightCompositeView
          desktopSrc={s.compositeImage!}
          mobileSrc={s.compositeImageMobile}
          maxWidth={compositeMaxW}
        />
      ) : single ? (
        <HighlightCardView
          frames={cells.flatMap(highlightFrameUrls)}
          matteColor={singleMatte}
          mattePadding={singlePad}
        />
      ) : (
        <div
          className="mx-auto grid w-full grid-cols-2 grid-flow-col grid-rows-3 lg:grid-cols-3 lg:grid-flow-row lg:grid-rows-2 xl:gap-[1vw]"
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

// Composite layout (Experian Boost Figma 3778:130432): static board image(s).
function HighlightCompositeView({
  desktopSrc,
  mobileSrc,
  maxWidth,
}: {
  desktopSrc: string
  mobileSrc?: string
  maxWidth: number
}) {
  const imgClass = "h-auto w-full object-contain"
  if (mobileSrc) {
    return (
      <>
        <div className="mx-auto w-full lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- highlight art */}
          <img src={mobileSrc} alt="" loading="lazy" className={imgClass} />
        </div>
        <div className="mx-auto hidden w-full lg:block" style={{ maxWidth }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- highlight art */}
          <img src={desktopSrc} alt="" loading="lazy" className={imgClass} />
        </div>
      </>
    )
  }
  return (
    <div className="mx-auto w-full" style={{ maxWidth }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- highlight art */}
      <img src={desktopSrc} alt="" loading="lazy" className={imgClass} />
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

  const captionClass = `mt-2.5 max-w-64 text-center font-normal leading-[1.245] ${csBodyText()}`

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

function StatsBlock({
  section: s,
  scrollContainer,
}: {
  section: Of<'statsSection'>
  scrollContainer?: HTMLDivElement | null
}) {
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
  const metricCols =
    items.length === 1 ? 1 : items.length === 2 ? 2 : 3
  const gridMaxWidth =
    metricCols === 2
      ? Math.min(880, STATS_BAND_DEFAULTS.gridMaxWidth)
      : STATS_BAND_DEFAULTS.gridMaxWidth
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
      className={`${csBandGutter()} text-center`}
      style={sectionStyle(s.appearance, true, 'lg')}
    >
      {s.sectionTitle && (
        <h2 className={csImpactTitle()} style={{ marginBottom: titleMb }}>
          {s.sectionTitle}
        </h2>
      )}
      {s.body?.length ? (
        <div className="mx-auto max-w-[min(720px,100%)]" style={{ marginBottom: bodyMb }}>
          <CaseStudyProse value={s.body} className={csBodyText()} />
        </div>
      ) : null}
      <div
        className={`mx-auto grid w-full grid-cols-1 ${
          metricCols === 1
            ? 'sm:grid-cols-1'
            : metricCols === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-3'
        }`}
        style={{
          gap: metricGap,
          maxWidth: `min(${gridMaxWidth}px, 100%)`,
        }}
      >
        {items.map((st, i) => (
          <Stat
            key={st._key ?? `stat-${i}`}
            stat={st}
            scrollContainer={scrollContainer}
          />
        ))}
      </div>
    </section>
  )
}

function BulletBlock({ section: s }: { section: Of<'bulletSection'> }) {
  const items = s.items ?? []
  if (!items.length) return null
  return (
    <section
      style={sectionStyle(s.appearance, true, 'md')}
    >
      <div className={csShell()}>
        <div className={`mx-auto ${true ? 'max-w-[min(720px,100%)]' : 'max-w-160'}`}>
          <Label light={isLight(s.appearance)}>
            {s.sectionTitle ?? 'Next Steps'}
          </Label>
          <ul className={`mt-5 list-disc space-y-3 pl-5 ${csBodyText()}`}>
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
function lightboxUrls(items?: GalleryImage[]): string[] {
  return (items ?? [])
    .map(i => i.expandImage ?? i.image)
    .filter((u): u is string => !!u)
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
  return (
    <h2
      className={`mb-5 ${csSectionTitle()} ${light ? 'text-white' : ''} ${center ? 'text-center' : ''}`}
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
  const headSize =
    variant === 'brought' ? 'text-[20px] lg:text-[21px]' : 'text-[19px] lg:text-[20px]'
  const bodySize =
    variant === 'brought' ? 'text-[18px] lg:text-[19px]' : 'text-[18px] lg:text-[19px]'
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
              className={`flex w-full items-center justify-between gap-6 text-left font-normal ${'py-5'} ${headSize}`}
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
              <CaseStudyProse
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
  scrollContainer,
  gap = SHOWCASE_ARTIFACT_DEFAULTS.sliderGap,
  gutter = true,
}: {
  images: string[]
  scrollContainer?: HTMLDivElement | null
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
          <div className="mb-5 flex items-center justify-end gap-7.25 text-[23px] font-medium leading-none text-white xl:text-[1.45vw]">
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
          scrollContainer={scrollContainer}
        />
      )}
    </div>
  )
}

/** Cover-flow slider (Galderma showcase): 5-up centered carousel, autoplay,
 *  infinite loop, white prev/next arrows. */
function CenterSlider({
  images,
  lightboxImages,
  scrollContainer,
}: {
  images: string[]
  lightboxImages: string[]
  scrollContainer?: HTMLDivElement | null
}) {
  const n = images.length
  const [visible, setVisible] = useState(5)
  const [index, setIndex] = useState(() => Math.max(n, 0))
  const [noAnim, setNoAnim] = useState(false)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const locked = useRef(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportW, setViewportW] = useState(0)
  const canExpand = lightboxImages.length > 0

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
                    if (canExpand) setLightbox(realIdx)
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
      {canExpand && lightbox !== null && (
        <ArtifactLightbox
          images={lightboxImages}
          index={lightbox}
          onIndex={setLightbox}
          onClose={() => setLightbox(null)}
          scrollContainer={scrollContainer}
        />
      )}
    </div>
  )
}

type ViewportRect = { top: number; left: number; width: number; height: number }

/** Desktop: clip lightbox to `.cs-page-bands` (internal scroll). Mobile: window scrolls — use full viewport. */
function measureScrollViewport(
  el: HTMLElement | null | undefined,
  useInternalScroll: boolean,
): ViewportRect | null {
  if (!useInternalScroll || !el) return null
  const r = el.getBoundingClientRect()
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

/** Research-artifact sub-modal (Figma 4152:125289): black backdrop, max-size image, ✕ close.
 *  Letterboxes on black when aspect ratio ≠ viewport. Breadcrumb + pager stay visible. */
function ArtifactLightbox({
  images,
  index,
  onIndex,
  onClose,
  scrollContainer,
}: {
  images: string[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  scrollContainer?: HTMLDivElement | null
}) {
  const n = images.length
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const [pageInternal, setPageInternal] = useState(false)
  const [frame, setFrame] = useState<ViewportRect | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setPageInternal(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useLayoutEffect(() => {
    const update = () =>
      setFrame(measureScrollViewport(scrollContainer, pageInternal))
    update()
    if (!pageInternal) return
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    scrollContainer?.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      scrollContainer?.removeEventListener('scroll', update)
    }
  }, [scrollContainer, pageInternal])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && n > 1) onIndex((index + 1) % n)
      else if (e.key === 'ArrowLeft' && n > 1) onIndex((index - 1 + n) % n)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [index, n, onIndex, onClose])

  useEffect(() => {
    if (pageInternal) {
      const block = (e: Event) => e.preventDefault()
      scrollContainer?.addEventListener('wheel', block, { passive: false })
      scrollContainer?.addEventListener('touchmove', block, { passive: false })
      return () => {
        scrollContainer?.removeEventListener('wheel', block)
        scrollContainer?.removeEventListener('touchmove', block)
      }
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [scrollContainer, pageInternal])

  if (!mounted || typeof document === 'undefined') return null

  const overlayStyle: CSSProperties = frame
    ? {
        position: 'fixed',
        top: frame.top,
        left: frame.left,
        width: frame.width,
        height: frame.height,
        zIndex: 60,
      }
    : { position: 'fixed', inset: 0, zIndex: 120 }

  const boxW = frame?.width ?? (typeof window !== 'undefined' ? window.innerWidth : 0)
  const boxH = frame?.height ?? (typeof window !== 'undefined' ? window.innerHeight : 0)
  const scale =
    natural && boxW > 0 && boxH > 0
      ? Math.min(boxW / natural.w, boxH / natural.h)
      : null
  const imgStyle: CSSProperties =
    scale != null && natural
      ? { width: natural.w * scale, height: natural.h * scale }
      : {
          maxHeight: boxH || '100%',
          maxWidth: boxW || '100%',
        }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Research artifact"
      data-cursor-invert
      style={overlayStyle}
      onClick={onClose}
      className="relative flex h-full w-full items-center justify-center bg-black animate-[panel-in_0.2s_ease-out]"
    >
      <div
        data-cursor-normal
        className="relative inline-flex leading-none"
        onClick={e => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- artifact art */}
        <img
          src={images[index]}
          alt=""
          className="block"
          style={imgStyle}
          onLoad={e => {
            const el = e.currentTarget
            if (el.naturalWidth && el.naturalHeight) {
              setNatural({ w: el.naturalWidth, h: el.naturalHeight })
            }
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-5 top-5 z-20 shrink-0 text-[24px] leading-none text-black transition-opacity hover:opacity-60"
        >
          ×
        </button>
      </div>
    </div>,
    document.body,
  )
}

function DeviceGallery({
  tabs,
  initial,
  loadMore,
  loadLess,
  tileBg,
  light,
  gridSize = 'default',
  gridColumnGap,
  gridRowGap,
}: {
  tabs: DeviceTab[]
  initial: number
  loadMore?: string
  loadLess?: string
  tileBg?: string
  light?: boolean
  gridSize?: 'default' | 'popup'
  gridColumnGap?: number
  gridRowGap?: number
}) {
  const [active, setActive] = useState(0)
  const tab = tabs[active]
  const showTabBar = tabs.length > 1
  const popupMode = gridSize === 'popup'
  return (
    <div className={popupMode ? 'w-full' : 'mt-8'}>
      {showTabBar ? (
        <div
          className={
            popupMode
              ? 'mx-auto flex w-full max-w-full flex-nowrap justify-start overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:justify-center'
              : 'mx-auto flex w-full flex-nowrap justify-center gap-x-3 sm:flex-wrap sm:gap-8 xl:gap-[6vw]'
          }
          style={popupMode ? { gap: CORE_EXPERIENCE_POPUP_DEFAULTS.tabGap } : undefined}
        >
          {tabs.map((v, i) => (
            <button
              key={v._key}
              type="button"
              onClick={() => setActive(i)}
              data-cursor="hover"
              className={`shrink-0 uppercase leading-[1.03] ${
                popupMode ? `text-[14px] ${CS_KICKER}` : `${CS_KICKER} sm:text-[18px] xl:text-[1.1vw]`
              }`}
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
      ) : null}
      <ImageGrid
        key={tab?._key}
        images={imgUrls(tab?.items)}
        initial={initial}
        loadMore={loadMore}
        loadLess={loadLess}
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
  loadLess = 'Show Less',
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
  loadLess?: string
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
  const tileFill = tileBg ?? CS_TILE
  const popup = size === 'popup'
  const colGap =
    gridColumnGap ??
    (popup ? CORE_EXPERIENCE_POPUP_DEFAULTS.gridColumnGap : undefined)
  const rowGap =
    gridRowGap ?? (popup ? CORE_EXPERIENCE_POPUP_DEFAULTS.gridRowGap : undefined)
  const popupMobileRowGap = CORE_EXPERIENCE_POPUP_DEFAULTS.gridRowGapMobile

  const renderTile = (
    src: string,
    i: number,
    key?: string | number,
    mobileStack = false,
  ) =>
    tile ? (
      <div
        key={key ?? i}
        className={`flex min-w-0 items-center justify-center ${
          popup || mobileStack
            ? ''
            : 'shadow-[0_0.5vw_0.8vw_rgba(0,0,0,0.4)]'
        } ${mobileStack ? 'w-full' : 'min-w-0 flex-1'}`}
        style={{ backgroundColor: tileFill }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={src}
          alt=""
          loading="lazy"
          className={
            popup || mobileStack
              ? 'block h-auto w-full object-contain'
              : 'h-[40vw] w-full object-contain xl:h-[20vw]'
          }
        />
      </div>
    ) : (
      <figure key={key ?? i}>
        {/* eslint-disable-next-line @next/next/no-img-element -- case-study art */}
        <img
          src={src}
          alt=""
          loading="lazy"
          className="block h-auto w-full object-cover"
        />
        {captions?.[i] && (
          <figcaption className="mt-2 text-[15px] opacity-70">
            {captions[i]}
          </figcaption>
        )}
      </figure>
    )

  const gridToggleButton = (() => {
    const btnClass = `relative pb-1 uppercase leading-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:bg-current ${csUiText()} xl:text-[1.1vw] ${light ? 'text-white' : ''}`

    if (shown < images.length) {
      return (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setShown(popup && tile ? images.length : (n) => n + STEP)
            }
            data-cursor="hover"
            className={btnClass}
          >
            {loadMore}
          </button>
        </div>
      )
    }

    if (shown > initial && images.length > initial) {
      return (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown(initial)}
            data-cursor="hover"
            className={btnClass}
          >
            {loadLess}
          </button>
        </div>
      )
    }

    return null
  })()

  if (popup && tile) {
    return (
      <>
        {/* Mobile — single column (Figma 3928:22975). */}
        <div
          className="mt-5 flex w-full flex-col lg:hidden"
          style={{ gap: popupMobileRowGap }}
        >
          {visible.map((src, i) => renderTile(src, i, undefined, true))}
        </div>
        {/* Desktop — 2-col grid; Sanity contentGap / contentGapInner. */}
        <div
          className="mt-5 hidden w-full grid-cols-2 lg:grid"
          style={{
            columnGap: colGap,
            rowGap: rowGap,
          }}
        >
          {visible.map((src, i) => renderTile(src, i))}
        </div>
        {gridToggleButton}
      </>
    )
  }

  const flatGrid = (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        popup ? 'mt-5' : 'mt-8 gap-y-10'
      }`}
      style={{
        columnGap: colGap ?? '5vw',
        rowGap: rowGap ?? (popup ? 24 : 40),
      }}
    >
      {visible.map((src, i) => renderTile(src, i))}
    </div>
  )

  return (
    <>
      {flatGrid}
      {gridToggleButton}
    </>
  )
}

function Stat({
  stat,
  scrollContainer,
}: {
  stat: StatItem
  scrollContainer?: HTMLDivElement | null
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [n, setN] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    let done = false
    const run = () => {
      if (done) return
      done = true
      const start = performance.now()
      const dur = 1500
      const tick = (t: number) => {
        const k = Math.min(1, (t - start) / dur)
        setN(Math.floor(k * stat.value))
        if (k < 1) raf = requestAnimationFrame(tick)
        else setN(stat.value)
      }
      raf = requestAnimationFrame(tick)
    }
    const pageInternal = window.matchMedia('(min-width: 1024px)').matches
    const root = pageInternal && scrollContainer ? scrollContainer : null
    const io = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        run()
      },
      { threshold: 0.5, root },
    )
    io.observe(el)
    const scrollTarget: HTMLElement | Window = root ?? window
    const onScroll = () => {
      if (done) return
      const vh = root ? root.clientHeight : window.innerHeight
      const rootTop = root ? root.getBoundingClientRect().top : 0
      const top = el.getBoundingClientRect().top - rootTop
      if (top < vh * 0.85) {
        io.disconnect()
        run()
      }
    }
    scrollTarget.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      io.disconnect()
      scrollTarget.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [stat.value, scrollContainer])
  return (
    <div ref={ref} className="mx-auto flex w-full max-w-[min(400px,100%)] flex-col items-center px-2 text-center sm:max-w-none sm:px-3">
      {/* Impact stat — live WP #user_impact .impact_count (8.5vw). */}
      <p
        className="font-normal leading-none"
        style={{ fontSize: STATS_BAND_DEFAULTS.valueFontSize }}
      >
        {stat.prefix}
        {n}
        {stat.suffix}
      </p>
      <p className={`mt-5 max-w-[min(360px,100%)] leading-[1.245] sm:max-w-none ${csBodyText('!font-bold')}`}>
        {stat.label}
      </p>
      {stat.note && (
        <p className={`mt-2.5 max-w-[min(360px,100%)] font-normal leading-[1.245] sm:max-w-none ${csBodyText()}`}>
          {stat.note}
        </p>
      )}
    </div>
  )
}

