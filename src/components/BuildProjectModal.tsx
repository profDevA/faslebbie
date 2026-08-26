'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from '@/components/PopupShell'
import type { BuildProject } from '@/lib/build'
import {
  BUILD_PROJECT_DETAILS,
  type BuildCaseStudyDetail,
} from '@/lib/buildProjectDetails'

function CheckIcon({ done }: { done: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-0.5 size-4 shrink-0"
      fill="none"
    >
      <rect x="1.5" y="1.5" width="13" height="13" stroke="black" />
      {done && (
        <path d="M4 8.2 6.6 10.8 12 5.2" stroke="black" strokeWidth="1.25" />
      )}
    </svg>
  )
}

function ArticleBlock({
  title,
  children,
  italic,
}: {
  title: string
  children: string
  italic?: boolean
}) {
  return (
    <div className="flex flex-col gap-[15px]">
      <p className="font-grotesk text-[16px] font-bold leading-[1.12] text-black">
        {title}
      </p>
      <p
        className={`font-grotesk text-[16px] font-light leading-[21px] text-black ${
          italic ? 'italic' : ''
        }`}
      >
        {children}
      </p>
    </div>
  )
}

function CaseStudyArticle({
  detail,
  outputSrc,
  onViewConcept,
}: {
  detail: BuildCaseStudyDetail
  outputSrc?: string
  onViewConcept: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-[328px] flex-col gap-[27px] bg-close px-4 py-8 lg:max-w-[440px] lg:px-0 lg:py-16">
      <p className="font-grotesk text-[14px] font-normal leading-[21px] text-black">
        {detail.statusLabel}
      </p>
      <ArticleBlock title="Trigger">{detail.trigger}</ArticleBlock>
      <ArticleBlock title="Observation">{detail.observation}</ArticleBlock>
      <ArticleBlock title="Hypothesis" italic>
        {detail.hypothesis}
      </ArticleBlock>
      {detail.value ? (
        <ArticleBlock title="Value">{detail.value}</ArticleBlock>
      ) : null}
      <ArticleBlock title="Experiment">{detail.experiment}</ArticleBlock>
      <ArticleBlock title="Status">{detail.statusBody}</ArticleBlock>

      <div className="flex flex-col gap-[15px]">
        <p className="font-grotesk text-[16px] font-bold leading-[1.12] text-black">
          Checklist
        </p>
        <ul className="flex flex-col gap-3">
          {detail.checklist.map(item => (
            <li key={item.text} className="flex items-start gap-[5px]">
              <CheckIcon done={item.done} />
              <span className="font-grotesk text-[16px] font-light leading-[21px] text-black">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ArticleBlock title="Who it's for">{detail.whoFor}</ArticleBlock>

      <div className="flex flex-col gap-[15px]">
        <p className="font-grotesk text-[16px] font-bold leading-[1.12] text-black">
          How it works
        </p>
        <ol className="list-decimal space-y-1 pl-6 font-grotesk text-[16px] font-light leading-[21px] text-black">
          {detail.howItWorks.map(step => (
            <li key={step} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-[27px]">
        <p className="font-grotesk text-[16px] font-bold leading-[1.12] text-black">
          Output visuals
        </p>
        {outputSrc ? (
          // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
          <img
            src={outputSrc}
            alt=""
            className="w-full h-auto"
          />
        ) : (
          <div className="aspect-454/376 w-full bg-white" />
        )}
      </div>

      <div className="flex flex-col gap-[15px]">
        <p className="font-grotesk text-[16px] font-bold leading-[1.12] text-black">
          Insight grid
        </p>
        <ul className="list-disc space-y-1 pl-6 font-grotesk text-[16px] font-light leading-[21px] text-black">
          {detail.insights.map(line => (
            <li key={line} className="pl-1">
              {line}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-grotesk text-[16px] font-bold leading-[1.12] text-[#212529]">
          Live CTA
        </p>
        <button
          type="button"
          onClick={onViewConcept}
          data-cursor="hover"
          className="w-fit font-grotesk text-[16px] font-light text-accent underline decoration-from-font underline-offset-2"
        >
          View the Concept
        </button>
      </div>
    </div>
  )
}

function BuildProjectDetailBody({
  project,
  onViewConcept,
}: {
  project: BuildProject
  onViewConcept: () => void
}) {
  const cover = project.images?.[0]

  return (
    <>
      {/* Teal mockup — 538px band, 150px pad, 231px image (Figma 16:3649). */}
      <div className="order-2 flex h-[538px] shrink-0 flex-col items-center overflow-hidden bg-[#133034] pt-[150px] lg:order-1 lg:h-full lg:min-h-0 lg:justify-center lg:px-10 lg:py-14 lg:pt-14">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
          <img
            src={cover}
            alt={project.title}
            className="h-[231px] w-[133%] max-w-none shrink-0 object-contain lg:h-auto lg:w-full lg:max-w-[440px]"
          />
        ) : (
          <div
            style={{ backgroundColor: project.tint }}
            className="flex h-[231px] w-[80%] items-center justify-center lg:aspect-16/10 lg:h-auto lg:w-full lg:max-w-[440px]"
          >
            <span
              className={`font-logo text-[clamp(24px,3vw,40px)] font-semibold tracking-tight ${
                project.lightArt ? "text-black/25" : "text-white/90"
              }`}
            >
              {project.title}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onViewConcept}
          data-cursor="hover"
          className="mt-3 font-grotesk text-[14px] font-light capitalize text-[#e0e0d7] underline decoration-from-font underline-offset-2 transition-opacity hover:opacity-70"
        >
          View the Concept
        </button>
      </div>

      {/* Hero then article. First fold on mobile is the title slide (Figma 16:3649). */}
      <div className="contents lg:order-2 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:bg-close">
        <div className="order-1 flex flex-col items-center justify-center gap-2.5 bg-[#1a1a1a] px-[39px] py-12 text-center max-lg:h-[calc(100dvh-11rem)] lg:order-none lg:min-h-[45vh] lg:gap-5 lg:px-14 lg:py-14">
          <p className="font-grotesk text-[12px] font-light tracking-[-0.08px] text-[#e0e0d7] lg:text-[14px] lg:tracking-[0.14em] lg:text-white/70">
            {project.kicker}
          </p>
          <h2 className="font-grotesk text-[36px] font-normal leading-[1.1] tracking-[-0.4px] text-[#e0e0d7] lg:font-serif lg:text-[52px] lg:font-medium lg:text-white">
            {project.title}
          </h2>
          <p className="max-w-[282px] font-grotesk text-[14px] font-light leading-4 tracking-[0.72px] text-[#e0e0d7] lg:max-w-[420px] lg:text-[16px] lg:leading-[1.6] lg:tracking-normal lg:text-white/70">
            {project.subtitle}
          </p>
        </div>

        <div className="order-3 lg:order-none lg:px-14">
          {BUILD_PROJECT_DETAILS[project.id] ? (
            <CaseStudyArticle
              detail={BUILD_PROJECT_DETAILS[project.id]}
              outputSrc={project.outputVisual}
              onViewConcept={onViewConcept}
            />
          ) : null}
        </div>
      </div>
    </>
  )
}

function ConceptPreview({
  project,
  onClose,
}: {
  project: BuildProject
  onClose: () => void
}) {
  const [desktopCrumbs, setDesktopCrumbs] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setDesktopCrumbs(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const shot =
    project.conceptPreview ?? project.outputVisual ?? project.images?.[0]
  const crumbs = desktopCrumbs
    ? [
        { label: 'Build', href: '/build?view=img' },
        { label: project.title },
        { label: 'Concept Preview' },
      ]
    : [
        { label: 'Build', href: '/build?view=img' },
        { label: 'Concept Preview' },
        { label: project.title },
      ]

  return (
    <PopupShell
      onClose={onClose}
      label={`${project.title} concept preview`}
      crumbs={crumbs}
      cardClassName="bg-[#d7d7d0]"
      bodyClassName="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-[#d7d7d0] px-[9px] py-16 max-lg:py-[159px] lg:px-14 lg:py-14"
    >
      {shot ? (
        // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
        <img
          src={shot}
          alt={project.title}
          className="block h-[248px] w-full max-w-[344px] object-contain object-top lg:h-auto lg:max-h-[min(561px,calc(100%-2rem))] lg:w-full lg:max-w-[779px] lg:object-contain"
        />
      ) : (
        <div
          style={{ backgroundColor: project.tint }}
          className="flex h-[248px] w-full max-w-[344px] items-center justify-center lg:aspect-[778/561] lg:h-auto lg:max-h-[561px] lg:max-w-[779px]"
        >
          <span
            className={`font-logo text-[clamp(24px,3vw,40px)] font-semibold tracking-tight ${
              project.lightArt ? 'text-black/25' : 'text-white/90'
            }`}
          >
            {project.title}
          </span>
        </div>
      )}
    </PopupShell>
  )
}

/** Build detail popup. Mobile: 16:3649 title → teal mockup → 16:3707 scroll. Concept: 16:2613 desktop / 16:3697 mobile. */
export default function BuildProjectModal({
  projects,
  openId,
  onNavigate,
  onClose,
}: {
  projects: BuildProject[]
  openId: string | null
  onNavigate: (id: string) => void
  onClose: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [showConcept, setShowConcept] = useState(false)
  const shellScrollRef = useRef<HTMLDivElement>(null)
  const showConceptRef = useRef(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    showConceptRef.current = showConcept
  }, [showConcept])

  const index = openId ? projects.findIndex(p => p.id === openId) : -1

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index < 0) return
      const n = projects.length
      onNavigate(projects[(index + dir + n) % n].id)
    },
    [index, projects, onNavigate],
  )

  useEffect(() => {
    setShowConcept(false)
    if (shellScrollRef.current) shellScrollRef.current.scrollTop = 0
  }, [openId])

  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => {
      if (showConceptRef.current) return
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, go])

  if (!mounted || index < 0) return null
  const project = projects[index]

  if (showConcept) {
    return (
      <ConceptPreview project={project} onClose={() => setShowConcept(false)} />
    )
  }

  return (
    <PopupShell
      open={Boolean(openId)}
      onClose={onClose}
      label={project.title}
      crumbs={[{ label: 'Build', href: '/build?view=img' }, { label: project.title }]}
      bodyRef={shellScrollRef}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between">
          <PopupPagerButton onClick={() => go(-1)}>
            {'< Previous'}
          </PopupPagerButton>
          <PopupDots
            count={projects.length}
            active={index}
            onSelect={i => onNavigate(projects[i].id)}
            labelFor={i => projects[i].title}
            className="flex"
          />
          <PopupPagerButton onClick={() => go(1)}>{'Next >'}</PopupPagerButton>
        </div>
      }
    >
      <BuildProjectDetailBody
        project={project}
        onViewConcept={() => setShowConcept(true)}
      />
    </PopupShell>
  )
}
