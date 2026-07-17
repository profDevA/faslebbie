"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BuildProject } from "@/lib/build";

// Stylised placeholder for a concept mockup (real screenshots pending). A light
// "browser" frame with a tinted canvas + the project name.
function ConceptFrame({
  project,
  className = "",
}: {
  project: BuildProject;
  className?: string;
}) {
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
        style={{ backgroundColor: project.tint }}
        className="flex aspect-16/10 items-center justify-center"
      >
        <span
          className={`font-logo text-[clamp(24px,3vw,40px)] font-semibold tracking-tight ${
            project.lightArt ? "text-black/25" : "text-white/90"
          }`}
        >
          {project.title}
        </span>
      </div>
    </div>
  );
}

// Full-screen "Concept Preview" (Figma 16-2613 / 16-3697) — opened from the
// modal's "View The Concept" link. Shows the concept large with its own
// breadcrumb + close.
function ConceptPreview({
  project,
  onClose,
}: {
  project: BuildProject;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-close">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/15 bg-white px-5 sm:px-8">
        <span className="font-grotesk text-[14px] font-light text-black sm:text-[16px]">
          Build <span className="text-black/40">/</span> {project.title}{" "}
          <span className="text-black/40">/</span>{" "}
          <span className="underline underline-offset-2">Concept Preview</span>
        </span>
        <button
          type="button"
          aria-label="Close preview"
          onClick={onClose}
          data-cursor="hover"
          className="text-[22px] leading-none text-black transition-opacity hover:opacity-60"
        >
          ✕
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6 sm:p-12">
        <ConceptFrame project={project} className="max-w-[900px]" />
      </div>
    </div>
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
  const scrollRef = useRef<HTMLDivElement>(null);
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
    scrollRef.current?.scrollTo({ top: 0 });
  }, [openId]);

  // Body scroll lock + keyboard nav (Esc closes the concept preview first,
  // then the modal; arrows page between projects).
  useEffect(() => {
    if (!openId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Close the concept overlay first, otherwise the whole modal.
        if (showConceptRef.current) setShowConcept(false);
        else onClose();
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId, go, onClose]);

  if (!mounted || index < 0) return null;
  const project = projects[index];

  return createPortal(
    <div className="fixed inset-0 z-100 flex flex-col px-0 pt-13 sm:items-center sm:justify-center sm:p-6 sm:pt-6">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 hidden cursor-pointer bg-[rgba(226,226,218,0.82)] sm:block"
      />
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-close shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:h-[min(880px,92vh)] sm:min-h-0 sm:w-[min(1120px,96vw)] sm:flex-none">
        {/* Header / breadcrumb */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-black/15 bg-white px-5 sm:h-16 sm:px-8">
          <span className="font-grotesk text-[14px] font-light text-black sm:text-[16px]">
            Build <span className="text-black/40">/</span>{" "}
            <span className="underline underline-offset-2">{project.title}</span>
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            data-cursor="hover"
            className="text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content: hero (media + meta) then the detail body */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Media panel (teal) with the concept + "View The Concept" */}
            <div className="order-2 flex flex-col justify-center gap-8 bg-[#16302b] px-6 py-10 lg:order-1 lg:px-10 lg:py-14">
              <ConceptFrame project={project} className="mx-auto max-w-[440px]" />
              <button
                type="button"
                onClick={() => setShowConcept(true)}
                data-cursor="hover"
                className="mx-auto font-grotesk text-[15px] font-medium text-white underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                View The Concept
              </button>
            </div>

            {/* Meta panel (near-black) */}
            <div className="order-1 flex flex-col items-center justify-center gap-5 bg-[#1c1c1c] px-6 py-12 text-center lg:order-2 lg:px-14 lg:py-14">
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
          </div>

          {/* Detail body */}
          <div className="mx-auto w-full max-w-[760px] px-6 py-12 lg:px-0 lg:py-16">
            <p className="font-grotesk text-[16px] leading-[1.7] text-black/80">
              {project.description}
            </p>

            <p className="mt-10 font-grotesk text-[18px] font-bold text-black">
              How it Works
            </p>
            <ol className="mt-4 list-decimal space-y-3 pl-6 font-grotesk text-[16px] leading-[1.6] text-black/80">
              {project.howItWorks.map((step, i) => (
                <li key={i} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>

            {project.note && (
              <p className="mt-8 font-grotesk text-[16px] leading-[1.7] text-black/80">
                {project.note}
              </p>
            )}

            {/* Body image placeholder */}
            <div className="mt-10 aspect-video w-full bg-white" />

            <p className="mt-8 font-grotesk text-[16px] font-bold italic text-black">
              Supported tools
            </p>
            <p className="mt-1 font-grotesk text-[16px] text-black/70">
              {project.supportedTools.join(" · ")}
            </p>
          </div>
        </div>

        {/* Footer / pager */}
        <div className="flex h-16 shrink-0 items-center justify-center border-t border-black border-b-[6px] bg-white px-6">
          <div className="flex w-full max-w-[620px] items-center justify-between">
            <button
              type="button"
              onClick={() => go(-1)}
              data-cursor="hover"
              className="font-grotesk text-[16px] font-bold text-accent transition-opacity hover:opacity-70 lg:text-[18px]"
            >
              {"< Previous"}
            </button>
            <div className="hidden items-center gap-2.5 sm:flex">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={p.title}
                  onClick={() => onNavigate(p.id)}
                  data-cursor="hover"
                  className={`size-2 rounded-full transition-colors ${
                    i === index ? "bg-accent" : "bg-black/25 hover:bg-black/40"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              data-cursor="hover"
              className="font-grotesk text-[16px] font-bold text-accent transition-opacity hover:opacity-70 lg:text-[18px]"
            >
              {"Next >"}
            </button>
          </div>
        </div>

        {showConcept && (
          <ConceptPreview project={project} onClose={() => setShowConcept(false)} />
        )}
      </div>
    </div>,
    document.body,
  );
}
