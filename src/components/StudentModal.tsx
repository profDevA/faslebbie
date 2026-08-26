"use client";

import { useCallback, useEffect, useState } from "react";
import PopupShell from "@/components/PopupShell";
import type { StudentProject } from "@/lib/teaching";

function Slide({ project, index }: { project: StudentProject; index: number }) {
  const src = project.images?.[index] ?? (index === 0 ? project.cover : undefined);
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- carousel image
      <img
        src={src}
        alt={project.headline || project.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  return (
    <div
      style={{ backgroundColor: project.tint, filter: `brightness(${1 - index * 0.06})` }}
      className="absolute inset-0 flex items-center justify-center"
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goSlide(1);
      else if (e.key === "ArrowLeft") goSlide(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goSlide]);

  return (
    <>
      {/* Figma 2971:218674 mobile: ~538px image below meta. Desktop 3060:7200: left column. */}
      <div className="relative order-2 h-[538px] shrink-0 overflow-hidden bg-[#e5eff1] lg:order-1 lg:h-auto lg:min-h-0">
        <Slide project={project} index={slide} />
        {slideCount > 1 && (
          <div className="absolute inset-x-0 bottom-0 flex h-[54px] items-center justify-center gap-9 bg-gradient-to-t from-black/55 to-transparent lg:h-[74px] lg:gap-10">
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goSlide(-1)}
              data-cursor="hover"
              className="font-grotesk text-[16px] font-medium tracking-[0.32px] text-white transition-opacity hover:opacity-70 lg:text-[22px] lg:tracking-[0.45px]"
            >
              {"<"}
            </button>
            <div className="flex items-center gap-[5px]">
              {Array.from({ length: slideCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Image ${i + 1}`}
                  aria-current={i === slide || undefined}
                  onClick={() => setSlide(i)}
                  data-cursor="hover"
                  className={`size-2 rounded-full transition-colors ${
                    i === slide ? "bg-accent" : "bg-white/80 hover:bg-white"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goSlide(1)}
              data-cursor="hover"
              className="font-grotesk text-[16px] font-medium tracking-[0.32px] text-white transition-opacity hover:opacity-70 lg:text-[22px] lg:tracking-[0.45px]"
            >
              {">"}
            </button>
          </div>
        )}
      </div>

      <div className="order-1 flex h-[538px] shrink-0 flex-col items-center justify-center gap-2.5 bg-[#1a1a1a] px-8 py-10 text-center capitalize text-[#e0e0d7] lg:order-2 lg:h-auto lg:min-h-0 lg:overflow-y-auto lg:gap-3.5 lg:px-20 lg:py-12">
        <p className="font-grotesk text-[12px] font-light tracking-[-0.08px] lg:text-[11px] lg:tracking-[-0.11px]">
          Student Works
        </p>
        <h2 className="font-grotesk text-[36px] font-normal leading-[1.1] tracking-[-0.4px] lg:text-[50px] lg:leading-[1.09] lg:tracking-[-0.55px]">
          {project.title}:
        </h2>
        {project.headline ? (
          <p className="max-w-[282px] font-grotesk text-[14px] font-bold leading-4 tracking-[0.72px] lg:max-w-[406px] lg:leading-[17px] lg:tracking-[1px]">
            {project.headline}
          </p>
        ) : null}
        {project.description ? (
          <p className="max-w-[282px] font-grotesk text-[14px] font-light leading-4 tracking-[0.72px] lg:max-w-[406px] lg:leading-[17px] lg:tracking-[1px]">
            {project.description}
          </p>
        ) : null}
      </div>
    </>
  );
}

/** Student work detail popup — desktop 3060:7200, mobile 2971:218674. */
export default function StudentModal({
  projects,
  openId,
  onClose,
}: {
  projects: StudentProject[];
  openId: string | null;
  onClose: () => void;
}) {
  const project = openId ? projects.find((p) => p.id === openId) : null;
  if (!project) return null;

  return (
    <PopupShell
      onClose={onClose}
      label={`Student Works: ${project.title}`}
      crumbs={[
        { label: "Teaching", href: "/teaching", hideOnMobile: true },
        { label: "Student Works", href: "/teaching?view=works" },
        { label: project.title },
      ]}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
    >
      <Carousel key={project.id} project={project} />
    </PopupShell>
  );
}
