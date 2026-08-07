"use client";

import { useCallback, useEffect, useState } from "react";
import PopupShell, { PopupPagerButton } from "@/components/PopupShell";
import type { StudentProject } from "@/lib/teaching";

// Placeholder image slide (real student photos pending) — a tinted block with
// the project title; the shade shifts per slide so the carousel reads as paging.
function Slide({ project, index }: { project: StudentProject; index: number }) {
  const src = project.images?.[index];
  if (src)
    // eslint-disable-next-line @next/next/no-img-element -- carousel image
    return <img src={src} alt={project.headline} className="h-full w-full object-cover" />;
  return (
    <div
      style={{ backgroundColor: project.tint, filter: `brightness(${1 - index * 0.06})` }}
      className="flex h-full w-full items-center justify-center"
    >
      <span
        className={`px-6 text-center font-logo text-[clamp(24px,3vw,40px)] font-semibold tracking-tight ${
          project.lightArt ? "text-black/25" : "text-white/85"
        }`}
      >
        {project.title}
      </span>
    </div>
  );
}

// Paged Student Works modal (Figma 158-10172 / 1-43869 desktop, 1-44911 mobile).
// Breadcrumb + close; a left image carousel (arrows + dots page the project's
// images) beside a dark meta panel; a "Previous / Next Project" footer pages
// between the 14 students. Mobile stacks: meta panel on top, image below.
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
  const [mounted, setMounted] = useState(false);
  const [slide, setSlide] = useState(0);
  useEffect(() => setMounted(true), []);

  const index = openId ? projects.findIndex((p) => p.id === openId) : -1;
  const project = index >= 0 ? projects[index] : null;
  const slideCount = project
    ? project.images?.length ?? project.slides ?? 3
    : 0;

  // Reset the carousel whenever the project changes.
  useEffect(() => {
    setSlide(0);
  }, [openId]);

  const goProject = useCallback(
    (dir: 1 | -1) => {
      if (index < 0) return;
      const n = projects.length;
      onNavigate(projects[(index + dir + n) % n].id);
    },
    [index, projects, onNavigate],
  );

  const goSlide = useCallback(
    (dir: 1 | -1) => {
      if (slideCount <= 0) return;
      setSlide((s) => (s + dir + slideCount) % slideCount);
    },
    [slideCount],
  );

  // Arrows page the image carousel — the prominent control on the frame.
  // (Escape / scroll lock live in the shared shell.)
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goSlide(1);
      else if (e.key === "ArrowLeft") goSlide(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, goSlide]);

  if (!mounted || !project) return null;

  return (
    <PopupShell
      onClose={onClose}
      label={`Student Works: ${project.title}`}
      crumbs={[
        { label: "Teaching", hideOnMobile: true },
        { label: "Student Works", hideOnMobile: true },
        { label: project.title },
      ]}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between">
          <PopupPagerButton onClick={() => goProject(-1)}>
            {"< Previous"}
          </PopupPagerButton>
          <PopupPagerButton onClick={() => goProject(1)}>
            {"Next >"}
          </PopupPagerButton>
        </div>
      }
    >
      {/* Image carousel */}
      <div className="relative order-2 h-[320px] min-h-0 overflow-hidden bg-black sm:h-[420px] lg:order-1 lg:h-auto">
        <Slide project={project} index={slide} />
        {slideCount > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goSlide(-1)}
              data-cursor="hover"
              className="absolute left-3 top-1/2 -translate-y-1/2 font-grotesk text-[28px] font-bold text-white/90 transition-opacity hover:opacity-70 lg:left-6"
            >
              {"<"}
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goSlide(1)}
              data-cursor="hover"
              className="absolute right-3 top-1/2 -translate-y-1/2 font-grotesk text-[28px] font-bold text-white/90 transition-opacity hover:opacity-70 lg:right-6"
            >
              {">"}
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {Array.from({ length: slideCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  onClick={() => setSlide(i)}
                  data-cursor="hover"
                  className={`size-2 rounded-full transition-colors ${
                    i === slide ? "bg-accent" : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Meta panel (near-black) */}
      <div className="order-1 flex flex-col items-center justify-center gap-5 bg-[#1c1c1c] px-6 py-12 text-center lg:order-2 lg:overflow-y-auto lg:px-12 lg:py-14">
        <p className="font-grotesk text-[13px] font-light tracking-[0.14em] text-white/70">
          Student Works
        </p>
        <h2 className="font-serif text-[36px] font-medium leading-[1.05] text-white lg:text-[48px]">
          {project.title}:
        </h2>
        <p className="max-w-[440px] font-grotesk text-[15px] font-light capitalize leading-[1.7] text-white/75 lg:text-[16px]">
          {project.description}
        </p>
      </div>
    </PopupShell>
  );
}
