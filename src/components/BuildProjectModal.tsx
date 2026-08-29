'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from '@/components/PopupShell'
import type { BuildCaseStudyDetail, BuildProject } from '@/lib/build'

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
}: {
  detail: BuildCaseStudyDetail
  outputSrc?: string
}) {
  return (
    <div className="flex w-full flex-col gap-[27px] bg-close px-4 py-8 lg:px-0 lg:py-12">
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
    </div>
  )
}

function BuildProjectDetailBody({ project }: { project: BuildProject }) {
  const cover = project.images?.[0]
  const secondary = project.images?.[1]

  return (
    <>
      {/* Teal mockup — desktop + phone when both assets exist (Figma Leoney). */}
      <div className="order-2 flex h-[538px] shrink-0 flex-col items-center justify-center overflow-hidden bg-[#133034] px-6 pt-12 lg:order-1 lg:h-full lg:min-h-0 lg:px-10 lg:py-14">
        {cover ? (
          secondary ? (
            <div className="flex w-full max-w-[520px] items-end justify-center gap-3 lg:max-w-[560px] lg:gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN */}
              <img
                src={cover}
                alt={project.title}
                className="h-[168px] w-auto max-w-[58%] object-contain object-bottom lg:h-[min(42vh,320px)] lg:max-w-none lg:flex-1"
              />
              {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN */}
              <img
                src={secondary}
                alt=""
                className="h-[200px] w-auto max-w-[38%] object-contain object-bottom lg:h-[min(48vh,380px)] lg:max-w-none lg:w-[34%] lg:shrink-0"
              />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
            <img
              src={cover}
              alt={project.title}
              className="h-[231px] w-[133%] max-w-none shrink-0 object-contain lg:h-auto lg:w-full lg:max-w-[440px]"
            />
          )
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
      </div>

      {/* Hero then article. Mobile: title slide first (Figma 16:3649). Desktop: hero fills right pane, article scrolls below (2971:219110). */}
      <div className="contents lg:order-2 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto">
        <div className="order-1 flex shrink-0 flex-col items-center justify-center gap-[14px] bg-[#1a1a1a] px-[39px] py-12 text-center max-lg:h-[calc(100dvh-11rem)] lg:min-h-full lg:px-20 lg:py-14">
          <p className="font-grotesk text-[12px] font-light capitalize tracking-[-0.08px] text-[#e0e0d7] lg:text-[14px]">
            {project.kicker}
          </p>
          <h2 className="max-w-[330px] font-grotesk text-[36px] font-normal leading-[1.1] tracking-[-0.4px] text-[#e0e0d7] lg:text-[50px] lg:leading-[1.09] lg:tracking-[-0.55px]">
            {project.title}
          </h2>
          <p className="max-w-[282px] font-grotesk text-[14px] font-light leading-4 tracking-[0.72px] text-[#e0e0d7] lg:max-w-[330px] lg:leading-[1.13] lg:tracking-[-0.13px]">
            {project.subtitle}
          </p>
        </div>

        <div className="order-3 w-full shrink-0 bg-close px-4 pb-8 lg:px-12 lg:pb-16 xl:px-14">
          {project.caseStudyDetail ? (
            <CaseStudyArticle
              detail={project.caseStudyDetail}
              outputSrc={project.outputVisual}
            />
          ) : null}
        </div>
      </div>
    </>
  )
}

/** Build detail popup. Mobile: 16:3649 title → teal mockup → 16:3707 scroll. */
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
  const shellScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => setMounted(true), [])

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
    if (shellScrollRef.current) shellScrollRef.current.scrollTop = 0
  }, [openId])

  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, go])

  if (!mounted || index < 0) return null
  const project = projects[index]

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
      <BuildProjectDetailBody project={project} />
    </PopupShell>
  )
}
