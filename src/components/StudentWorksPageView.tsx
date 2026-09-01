"use client";

import { useCallback, useEffect, useState } from "react";
import Nav from "@/components/Nav";
import StudentWorksMarquee from "@/components/StudentWorksMarquee";
import { NavPill } from "@/components/InlineToken";
import type { StudentProject } from "@/lib/teaching";

function Slide({ project, index }: { project: StudentProject; index: number }) {
  const src = project.images?.[index];
  if (src)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={project.headline}
        className="h-full w-full object-cover"
      />
    );
  return (
    <div
      style={{
        backgroundColor: project.tint,
        filter: `brightness(${1 - index * 0.06})`,
      }}
      className="flex h-full w-full items-center justify-center"
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

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={`size-6 ${dir === "left" ? "rotate-180" : ""}`}
    >
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Autoplaying image slider — chevrons only, matching the live slick config. */
function ProjectCarousel({
  project,
  className = "",
}: {
  project: StudentProject;
  className?: string;
}) {
  const count = project.images?.length ?? 0;
  const [slide, setSlide] = useState(0);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count <= 1) return;
      setSlide((s) => (s + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % count), 4000);
    return () => window.clearInterval(id);
  }, [count, slide]);

  return (
    <div
      className={`group relative aspect-4/3 w-full overflow-hidden bg-black sm:aspect-video lg:aspect-16/10 ${className}`}
    >
      <Slide project={project} index={slide} />
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            data-cursor="hover"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 transition-opacity hover:opacity-60 lg:left-4"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            data-cursor="hover"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 transition-opacity hover:opacity-60 lg:right-4"
          >
            <Chevron dir="right" />
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Live recent-work page — left project list that expands in place, right
 * carousel. One page (not a modal); /teaching/students/[slug] deep-links into
 * it and clicking a title rewrites the URL without navigating.
 */
export default function StudentWorksPageView({
  students,
  activeId,
  studentsWorkIntro,
}: {
  students: StudentProject[];
  activeId?: string;
  studentsWorkIntro?: string;
}) {
  const [openId, setOpenId] = useState(activeId ?? students[0]?.id);

  const active = students.find((s) => s.id === openId);

  const open = useCallback((id: string) => {
    setOpenId(id);
    window.history.replaceState(null, "", `/teaching/students/${id}`);
  }, []);

  if (!active) return null;

  return (
    <>
      <Nav dark />
      <main className="relative z-10 mx-auto min-h-dvh w-full max-w-[1440px] px-6 pb-20 pt-8 lg:px-12 lg:pt-12">
        <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <StudentWorksMarquee students={students} />

          <div className="max-w-[560px]">
            <h1 className="font-grotesk text-[32px] font-medium leading-tight text-black md:text-[42px] lg:text-[48px]">
              Student&apos;s Work
            </h1>

            {studentsWorkIntro ? (
              <p className="mt-8 font-grotesk text-[16px] font-light leading-[1.75] text-black/85 md:text-[18px]">
                {studentsWorkIntro}
              </p>
            ) : null}

            <p className="mt-10 font-grotesk text-[18px] leading-none">
              <NavPill href="/teaching/exhibition">Recent Work</NavPill>
            </p>
          </div>
        </section>

        <h2 className="mt-20 font-grotesk text-[24px] font-medium tracking-[0.5px] text-black md:text-[28px]">
          Student Projects
        </h2>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,460px)_1fr] lg:items-start lg:gap-16">
          <ul className="flex flex-col border-t border-black/10">
            {students.map((s) => {
              const isOpen = s.id === active.id;
              return (
                <li key={s.id} className="border-b border-black/10">
                  <button
                    type="button"
                    onClick={() => open(s.id)}
                    aria-expanded={isOpen}
                    data-cursor="hover"
                    className={`flex w-full items-start gap-3 py-4 text-left font-grotesk text-[16px] leading-snug transition-colors md:text-[18px] ${
                      isOpen
                        ? "font-medium text-accent"
                        : "text-black hover:text-accent"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-[0.45em] size-2 shrink-0 rounded-full transition-colors ${
                        isOpen ? "bg-accent" : "bg-black/25"
                      }`}
                    />
                    <span>
                      {s.title}: {s.headline}
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-6 pl-5">
                        <ProjectCarousel
                          project={s}
                          className="mb-5 lg:hidden"
                        />
                        <p className="font-grotesk text-[16px] font-light leading-[1.75] text-black/85 md:text-[17px]">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden min-w-0 lg:sticky lg:top-[120px] lg:block">
            <ProjectCarousel key={active.id} project={active} />
          </div>
        </div>
      </main>
    </>
  );
}
