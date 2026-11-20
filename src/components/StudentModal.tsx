"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import { SliderControls } from "@/components/PagerDots";
import type { StudentProject } from "@/lib/teaching";

function Slide({ project, index }: { project: StudentProject; index: number }) {
  // All of the project's images are mounted at once (stacked) and only the
  // current one is visible, so they download when the popup opens and Previous
  // / Next switch instantly — swapping one <img> src waited ~1 s per click for
  // the next file (Xian, Nov 20: "works very very slow").
  const srcs = project.images?.length
    ? project.images
    : project.cover
      ? [project.cover]
      : [];
  if (srcs[index])
    return (
      <>
        {srcs.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- carousel image
          <img
            key={`${i}-${src}`}
            src={src}
            alt={i === index ? project.headline || project.title : ""}
            aria-hidden={i !== index}
            className={`absolute inset-0 h-full w-full object-cover ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />
        ))}
      </>
    );
  return (
    <div
      style={{ backgroundColor: project.tint, filter: `brightness(${1 - index * 0.06})` }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <span
        className={`px-6 text-center text-[clamp(24px,3vw,40px)] font-semibold tracking-tight ${
          project.lightArt ? "text-black/25" : "text-white/85"
        }`}
      >
        {project.title}
      </span>
    </div>
  );
}

function Carousel({ project }: { project: StudentProject }) {
  const [slide, setSlide] = useState(0);
  const slideCount = Math.max(
    project.images?.length ?? 0,
    project.cover ? 1 : 0,
  );

  const goSlide = useCallback(
    (dir: 1 | -1) => {
      if (slideCount <= 1) return;
      setSlide((s) => (s + dir + slideCount) % slideCount);
    },
    [slideCount],
  );

  useEffect(() => {
    setSlide(0);
  }, [project.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goSlide(1);
      else if (e.key === "ArrowLeft") goSlide(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goSlide]);

  return (
    <>
      {/* Mobile Figma 2971:218674 — copy first, then image (scroll in shell body). */}
      <div className="order-1 flex shrink-0 flex-col items-center justify-center gap-2 bg-[#1a1a1a] px-6 py-8 text-center capitalize text-[#e0e0d7] max-lg:gap-2.5 lg:order-2 lg:h-auto lg:min-h-0 lg:gap-3.5 lg:overflow-y-auto lg:px-20 lg:py-12">
        {/* The kicker Fas meant by "this is too tiny" (Nov 19 call, 34:52 — his
            cursor on it): was 12 / 11 px; now the Build popup's kicker, 14 / 18
            (Fas, Nov 17: "the product text is way too small"). */}
        <p className="font-grotesk text-[14px] font-light tracking-[-0.08px] lg:text-[18px]">
          Student Projects
        </p>
        <h2 className="font-grotesk text-[28px] font-normal leading-[1.12] tracking-[-0.35px] lg:text-[50px] lg:leading-[1.09] lg:tracking-[-0.55px]">
          {project.title}:
        </h2>
        {project.headline ? (
          <p className="max-w-[282px] font-grotesk text-[15px] font-semibold leading-snug tracking-[0.5px] lg:max-w-[406px] lg:text-[16px] lg:font-bold lg:leading-[1.2] lg:tracking-[1px]">
            {project.headline}
          </p>
        ) : null}
        {/* Popup text: line height 1.6, no extra tracking, desktop 16px (headline
            above too) — same as field notes (Nov 19). */}
        {project.description ? (
          <p className="max-w-[282px] font-grotesk text-[14px] font-normal leading-[1.6] lg:max-w-[406px] lg:text-[16px] lg:font-light">
            {project.description}
          </p>
        ) : null}
        {slideCount > 1 ? (
          <p className="mt-1 font-grotesk text-[11px] font-light normal-case tracking-wide text-[#e0e0d7]/70 lg:hidden">
            {slideCount} documentation images — use arrows below
          </p>
        ) : null}
      </div>

      <div className="relative order-2 h-[min(52vh,440px)] min-h-[220px] shrink-0 overflow-hidden bg-[#e5eff1] max-lg:w-full lg:order-1 lg:h-auto lg:min-h-[480px]">
        <Slide project={project} index={slide} />
        {slideCount > 1 && (
          // Shared slide control (Nov 20: one pager style site-wide).
          <div className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-center bg-black/65 backdrop-blur-[2px] lg:h-[74px] lg:bg-gradient-to-t lg:from-black/55 lg:to-transparent lg:backdrop-blur-none">
            <SliderControls
              tone="light"
              count={slideCount}
              active={slide}
              onPrev={() => goSlide(-1)}
              onNext={() => goSlide(1)}
              onSelect={setSlide}
              labels={Array.from({ length: slideCount }, (_, i) => `Image ${i + 1} of ${slideCount}`)}
            />
          </div>
        )}
      </div>
    </>
  );
}

/** Student work detail popup — desktop 3060:7200, mobile 2971:218674. */
export default function StudentModal({
  projects,
  openId,
  onNavigate,
  onClose,
}: {
  projects: StudentProject[];
  openId: string | null;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const index = openId ? projects.findIndex((p) => p.id === openId) : -1;
  const project = index >= 0 ? projects[index] : null;

  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
  }, [openId]);

  const goStudent = (d: 1 | -1) => {
    if (index < 0 || projects.length <= 1) return;
    const next = projects[(index + d + projects.length) % projects.length];
    onNavigate(next.id);
  };

  if (!project) return null;

  return (
    <PopupShell
      onClose={onClose}
      bodyRef={bodyRef}
      label={`Student Projects: ${project.title}`}
      crumbs={[
        { label: "Teaching", href: "/teaching", hideOnMobile: true },
        { label: "Student Projects", href: "/teaching/student-projects" },
        { label: project.title },
      ]}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto max-lg:!px-0 lg:grid-cols-2 lg:overflow-hidden"
      footer={
        projects.length > 1 ? (
          <div className="flex w-full max-w-[620px] items-center justify-between gap-2">
            <PopupPagerButton
              onClick={() => goStudent(-1)}
            >
              {"< Previous"}
            </PopupPagerButton>
            <PopupDots
              className="flex min-w-0 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              count={projects.length}
              active={index}
              onSelect={(i) => onNavigate(projects[i].id)}
              labelFor={(i) => projects[i].title}
            />
            <PopupPagerButton
              onClick={() => goStudent(1)}
            >
              {"Next >"}
            </PopupPagerButton>
          </div>
        ) : undefined
      }
    >
      <Carousel key={project.id} project={project} />
    </PopupShell>
  );
}
