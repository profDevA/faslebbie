"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import type { BuildProject } from "@/lib/build";

// Concept mockup frame. Shows the first Sanity image when present; otherwise a
// tinted title placeholder (same look the .img cards use).
function ConceptFrame({
  project,
  className = "",
  src,
}: {
  project: BuildProject;
  className?: string;
  /** Override which image to show (defaults to images[0]). */
  src?: string;
}) {
  const image = src ?? project.images?.[0];
  return (
    <div
      className={`w-full overflow-hidden rounded-lg bg-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="flex h-7 items-center gap-1.5 border-b border-black/10 px-3">
        <span className="size-2 rounded-full bg-black/15" />
        <span className="size-2 rounded-full bg-black/15" />
        <span className="size-2 rounded-full bg-black/15" />
      </div>
      <div
        style={image ? undefined : { backgroundColor: project.tint }}
        className="relative flex aspect-16/10 items-center justify-center overflow-hidden"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
          <img
            src={image}
            alt={project.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span
            className={`font-logo text-[clamp(24px,3vw,40px)] font-semibold tracking-tight ${
              project.lightArt ? "text-black/25" : "text-white/90"
            }`}
          >
            {project.title}
          </span>
        )}
      </div>
    </div>
  );
}

// "Concept Preview" (Figma 16-2613 / 16-3697) — opened from the modal's "View
// The Concept" link. Same popup shell, one crumb deeper.
function ConceptPreview({
  project,
  onClose,
}: {
  project: BuildProject;
  onClose: () => void;
}) {
  return (
    <PopupShell
      onClose={onClose}
      label={`${project.title} concept preview`}
      crumbs={[
        { label: "Build", hideOnMobile: true },
        { label: project.title, hideOnMobile: true },
        { label: "Concept Preview" },
      ]}
    >
      <div className="flex flex-col items-center gap-8 p-6 sm:p-12">
        {(project.images?.length ? project.images : [undefined]).map(
          (src, i) => (
            <ConceptFrame
              key={src ?? i}
              project={project}
              src={src}
              className="max-w-[900px]"
            />
          ),
        )}
      </div>
    </PopupShell>
  );
}

export default function BuildProjectModal({
  projects,
  openId,
  onNavigate,
  onClose,
}: {
  projects: BuildProject[];
  openId: string | null;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const shellScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  // Mirror `showConcept` in a ref so the keydown handler reads the latest value
  // without re-subscribing on every toggle (and without calling the parent's
  // close from inside a state updater — which triggers a setState-in-render).
  const showConceptRef = useRef(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    showConceptRef.current = showConcept;
  }, [showConcept]);

  const index = openId ? projects.findIndex((p) => p.id === openId) : -1;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index < 0) return;
      const n = projects.length;
      onNavigate(projects[(index + dir + n) % n].id);
    },
    [index, projects, onNavigate],
  );

  // Reset the concept overlay + scroll position whenever the project changes.
  useEffect(() => {
    setShowConcept(false);
    if (shellScrollRef.current) shellScrollRef.current.scrollTop = 0;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
  }, [openId]);

  // Arrows page between projects. (Escape / scroll lock live in the shared
  // shell; when the concept preview is open it owns Escape.)
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (showConceptRef.current) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, go]);

  if (!mounted || index < 0) return null;
  const project = projects[index];

  if (showConcept)
    return (
      <ConceptPreview project={project} onClose={() => setShowConcept(false)} />
    );

  // Figma 16:3059 desktop / mobile stack like 16:997. Shared PopupShell.
  // Desktop: left media sticky, right (meta + article) scrolls.
  // Mobile: meta → media → article (single body scroll).
  return (
    <PopupShell
      onClose={onClose}
      label={project.title}
      crumbs={[{ label: "Build", hideOnMobile: true }, { label: project.title }]}
      bodyRef={shellScrollRef}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between">
          <PopupPagerButton onClick={() => go(-1)}>
            {"< Previous"}
          </PopupPagerButton>
          <PopupDots
            count={projects.length}
            active={index}
            onSelect={(i) => onNavigate(projects[i].id)}
            labelFor={(i) => projects[i].title}
          />
          <PopupPagerButton onClick={() => go(1)}>{"Next >"}</PopupPagerButton>
        </div>
      }
    >
      {/* Media — 2nd on mobile, left sticky on desktop. */}
      <div className="order-2 flex min-h-[280px] flex-col justify-center gap-8 bg-[#16302b] px-6 py-10 sm:min-h-[360px] lg:order-1 lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-10 lg:py-14">
        <ConceptFrame project={project} className="mx-auto max-w-[440px]" />
        <button
          type="button"
          onClick={() => setShowConcept(true)}
          data-cursor="hover"
          className="mx-auto font-grotesk text-[15px] font-medium capitalize text-white underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          View The Concept
        </button>
      </div>

      {/* Meta + article — flatten on mobile so media sits between them. */}
      <div
        ref={rightScrollRef}
        className="contents lg:order-2 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:bg-close"
      >
        <div className="order-1 flex flex-col items-center justify-center gap-5 bg-[#1c1c1c] px-6 py-12 text-center lg:order-none lg:min-h-full lg:px-14 lg:py-14">
          <p className="font-grotesk text-[14px] font-light tracking-[0.14em] text-white/70">
            {project.kicker}
          </p>
          <h2 className="font-serif text-[40px] font-medium leading-[1.05] text-white lg:text-[52px]">
            {project.title}
          </h2>
          <p className="max-w-[420px] font-grotesk text-[15px] font-light leading-[1.6] text-white/70 lg:text-[16px]">
            {project.subtitle}
          </p>
        </div>

        <div className="order-3 mx-auto w-full max-w-[420px] bg-close px-6 py-12 lg:order-none lg:max-w-[440px] lg:px-0 lg:py-16">
          <p className="font-grotesk text-[16px] font-light leading-[1.7] text-black/80">
            {project.description}
          </p>

          <p className="mt-10 font-grotesk text-[16px] font-bold text-black">
            How it Works
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-6 font-grotesk text-[16px] font-light leading-[1.6] text-black/80">
            {project.howItWorks.map((step, i) => (
              <li key={i} className="pl-1">
                {step}
              </li>
            ))}
          </ol>

          {project.note && (
            <p className="mt-8 font-grotesk text-[16px] font-light leading-[1.7] text-black/80">
              {project.note}
            </p>
          )}

          {project.images?.[1] ? (
            // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
            <img
              src={project.images[1]}
              alt=""
              className="mt-10 aspect-454/376 w-full object-cover"
            />
          ) : null}

          <p className="mt-8 font-grotesk text-[16px] font-bold italic text-black">
            Supported tools
          </p>
          <p className="mt-1 font-grotesk text-[16px] font-light text-black/70">
            {project.supportedTools.join(" · ")}
          </p>
        </div>
      </div>
    </PopupShell>
  );
}
