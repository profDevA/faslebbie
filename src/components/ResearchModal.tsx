"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  researchBreadcrumbRoot,
  researchSectionLabel,
  researchSectionOrder,
  researchSections,
  type FieldNotesContent,
  type ManifestoContent,
  type ModalitiesContent,
  type ParadigmsContent,
  type PrinciplesContent,
  type ResearchSectionContent,
  type ResearchSectionId,
} from "@/lib/research";

// Paged modal (Figma 1-40135 → 1-40813). One panel, five slides
// (paradigms → principles → modalities → manifesto → field notes) with a
// shared breadcrumb, a scrollable body, and a Previous / dots / Next pager.

function NumberedList({
  items,
}: {
  items: { n: string; title: string; body: string }[];
}) {
  return (
    <div>
      {items.map((it) => (
        <div
          key={it.n}
          className="mt-8 grid grid-cols-[40px_minmax(0,1fr)] gap-x-3 border-t border-black pt-8 first:mt-0 first:border-t-0 first:pt-0"
        >
          <span className="font-grotesk text-[22px] leading-[1.2] text-black">
            {it.n}
          </span>
          <div>
            <h4 className="font-grotesk text-[24px] font-medium leading-[1.28] text-black">
              {it.title}
            </h4>
            <p className="mt-3 font-grotesk text-[16px] font-light leading-[1.6] text-black/85">
              {it.body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ParadigmsView({ c }: { c: ParadigmsContent }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
      <div>
        <div className="mx-auto aspect-square w-[232px] max-w-full bg-white lg:sticky lg:top-0 lg:mx-0 lg:w-[200px]" />
      </div>
      <div>
        <p className="font-grotesk text-[20px] font-medium text-black">
          {c.label}
        </p>
        <p className="mt-2 max-w-[640px] font-grotesk text-[28px] font-medium leading-[1.35] text-black text-shadow-token">
          {c.intro}
        </p>
        <div className="mt-10">
          <NumberedList items={c.items} />
        </div>
      </div>
    </div>
  );
}

function PrinciplesView({ c }: { c: PrinciplesContent }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
      <div>
        <div className="mx-auto aspect-square w-[232px] max-w-full bg-white lg:sticky lg:top-0 lg:mx-0 lg:w-[200px]" />
      </div>
      <div>
        <p className="font-grotesk text-[20px] font-medium text-black">
          {c.label}
        </p>
        <p className="mt-2 max-w-[640px] font-grotesk text-[26px] font-medium leading-[1.35] text-black text-shadow-token">
          {c.intro}
        </p>
        <div className="mt-10">
          <NumberedList items={c.items} />
        </div>
        <div className="mt-12 max-w-[660px] border-t border-black pt-8">
          <p className="font-grotesk text-[18px] font-medium text-black">
            {c.conclusion.kicker}
          </p>
          <p className="mt-3 font-grotesk text-[24px] font-medium leading-[1.4] text-black text-shadow-token">
            {c.conclusion.body}
          </p>
        </div>
      </div>
    </div>
  );
}

// Organic "pebble" positions for the two channel clusters (Figma 1-40666).
// Percentages inside a fixed-height relative stage; blobs overlap loosely so
// they read as a spread-out, centred cluster rather than a stacked list.
const NODE_LAYOUT: { top: string; left: string }[][] = [
  [
    { top: "30%", left: "1%" }, // semi-structured interviews
    { top: "0%", left: "26%" }, // elder oral history
    { top: "30%", left: "48%" }, // participant observation
    { top: "60%", left: "6%" }, // community mapping
    { top: "58%", left: "42%" }, // co-design sessions
  ],
  [
    { top: "4%", left: "14%" }, // archival research
    { top: "26%", left: "52%" }, // field photography
    { top: "42%", left: "4%" }, // autoethnographic journaling
    { top: "64%", left: "44%" }, // q-methodology
  ],
];

// A few organic border-radius presets so the blobs don't look identical.
const NODE_RADII = [
  "46% 54% 62% 38% / 55% 42% 58% 45%",
  "58% 42% 45% 55% / 48% 58% 42% 52%",
  "40% 60% 52% 48% / 60% 45% 55% 40%",
  "55% 45% 60% 40% / 42% 55% 45% 58%",
  "48% 52% 40% 60% / 55% 48% 52% 45%",
];

function NodeCluster({
  items,
  groupIndex,
}: {
  items: string[];
  groupIndex: number;
}) {
  const layout = groupIndex === 1 ? NODE_LAYOUT[1] : NODE_LAYOUT[0];
  return (
    <>
      {/* Desktop: loosely-placed organic pebbles. */}
      <div className="relative mx-auto hidden h-[340px] w-full max-w-[380px] sm:block">
        {items.map((label, i) => (
          <div
            key={label}
            style={{
              top: layout[i]?.top ?? "0%",
              left: layout[i]?.left ?? "0%",
              borderRadius: NODE_RADII[i % NODE_RADII.length],
            }}
            className="absolute flex h-[132px] w-[152px] items-center justify-center border border-black px-4 text-center font-grotesk text-[15px] leading-[1.3] text-black"
          >
            {label}
          </div>
        ))}
      </div>
      {/* Mobile: pebbles wrap instead of overlapping. */}
      <div className="flex flex-wrap justify-center gap-3 sm:hidden">
        {items.map((label, i) => (
          <div
            key={label}
            style={{ borderRadius: NODE_RADII[i % NODE_RADII.length] }}
            className="flex h-[112px] w-[132px] items-center justify-center border border-black px-3 text-center font-grotesk text-[14px] leading-[1.3] text-black"
          >
            {label}
          </div>
        ))}
      </div>
    </>
  );
}

function ModalitiesView({ c }: { c: ModalitiesContent }) {
  return (
    <div>
      <div className="mx-auto mb-8 aspect-square w-[232px] max-w-full bg-white lg:hidden" />
      <div className="border-b border-black pb-10">
        <p className="font-grotesk text-[20px] font-medium text-black text-shadow-token">
          {c.kicker}
        </p>
        <p className="mt-8 font-grotesk text-[34px] font-medium leading-[1.35] text-balance text-black text-shadow-token">
          {c.statement}
        </p>
      </div>
      {/* Figma indents the numbered channels to the right of the panel. */}
      <div className="ml-auto mt-4 max-w-[640px]">
        {c.items.map((it) => (
          <div
            key={it.n}
            className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 border-b border-black py-5"
          >
            <span className="font-grotesk text-[22px] text-black">{it.n}</span>
            <span className="font-grotesk text-[26px] font-medium leading-[1.28] text-black">
              {it.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2">
        {c.groups.map((g, gi) => (
          <div key={g.title} className="flex flex-col">
            <p className="mx-auto mb-6 inline-block font-grotesk text-[24px] font-medium capitalize text-black underline underline-offset-4 text-shadow-token">
              {g.title}
            </p>
            <NodeCluster items={g.items} groupIndex={gi} />
          </div>
        ))}
      </div>
      <p className="mt-4 text-center font-grotesk text-[16px] text-black/70">
        {c.footnote}
      </p>
    </div>
  );
}

function ManifestoView({ c }: { c: ManifestoContent }) {
  return (
    <div className="mx-auto max-w-[900px]">
      {c.paragraphs.map((runs, i) => (
        <p
          key={i}
          className={`mb-8 max-w-[680px] font-grotesk text-[28px] font-medium leading-[1.35] text-black text-shadow-token ${
            i % 2 === 1 ? "lg:ml-0" : "lg:ml-auto"
          }`}
        >
          {runs.map((run, j) =>
            run.bold ? (
              <span key={j} className="font-black">
                {run.text}
              </span>
            ) : (
              <span key={j}>{run.text}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}

function FieldNotesView({ c }: { c: FieldNotesContent }) {
  const note = c.notes[0];
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_441px]">
      <div className="flex items-center">
        {note.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- static design asset
          <img
            src={note.image}
            alt={note.place}
            className="h-auto w-full object-cover"
          />
        ) : (
          <div className="aspect-4/3 w-full bg-white" />
        )}
      </div>
      <div className="flex flex-col">
        <div className="border-b border-black pb-4">
          <p className="font-grotesk text-[18px] text-black">
            Field Notes {note.n}
          </p>
          <p className="mt-1 font-grotesk text-[24px] font-medium text-black">
            {note.place}
          </p>
          <p className="mt-3 font-grotesk text-[18px] font-light italic leading-[1.6] text-black">
            {note.quote}
          </p>
        </div>
        <div className="border-b border-black py-4">
          <p className="font-grotesk text-[18px] font-medium text-black">
            Methodology
          </p>
          <p className="mt-2 font-grotesk text-[18px] font-light text-black">
            {note.methodology}
          </p>
        </div>
        <div className="border-b border-black py-4">
          <p className="font-grotesk text-[18px] font-medium text-black">
            Research Themes
          </p>
          <p className="mt-2 font-grotesk text-[18px] font-light text-black">
            {note.themes}
          </p>
        </div>
        <div className="border-b border-black py-4">
          <p className="font-grotesk text-[18px] font-medium text-black">
            Research Insight
          </p>
          <p className="mt-2 font-grotesk text-[18px] font-light leading-[1.6] text-black">
            {note.insight}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionView({ content }: { content: ResearchSectionContent }) {
  switch (content.kind) {
    case "paradigms":
      return <ParadigmsView c={content} />;
    case "principles":
      return <PrinciplesView c={content} />;
    case "modalities":
      return <ModalitiesView c={content} />;
    case "manifesto":
      return <ManifestoView c={content} />;
    case "field-notes":
      return <FieldNotesView c={content} />;
  }
}

export default function ResearchModal({
  openId,
  onNavigate,
  onClose,
  sections = researchSections,
}: {
  openId: ResearchSectionId | null;
  onNavigate: (id: ResearchSectionId) => void;
  onClose: () => void;
  sections?: Record<ResearchSectionId, ResearchSectionContent>;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const index = openId ? researchSectionOrder.indexOf(openId) : -1;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index < 0) return;
      const n = researchSectionOrder.length;
      onNavigate(researchSectionOrder[(index + dir + n) % n]);
    },
    [index, onNavigate],
  );

  // Lock page scroll + wire keyboard while open.
  useEffect(() => {
    if (!openId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId, go, onClose]);

  if (!mounted || !openId) return null;

  return createPortal(
    // Mobile: a contained popup that sits BELOW the sticky nav (nav stays
    // visible) with a margin on all sides. Desktop: full-screen centered card.
    <div
      data-research-modal
      className="fixed inset-0 z-100 flex flex-col px-3 pb-3 pt-16 sm:flex-row sm:items-center sm:justify-center sm:px-8 sm:pb-8 sm:pt-8"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-x-0 bottom-0 top-13 cursor-pointer bg-black/30 sm:inset-0"
      />
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#d7d7d0] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:h-[min(880px,92vh)] sm:min-h-0 sm:w-[min(1100px,96vw)] sm:flex-none">
        {/* Header */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-black bg-white px-6 sm:px-8">
          <div className="flex min-w-0 items-center gap-1.5 font-grotesk text-[15px] font-light text-black sm:text-[18px]">
            <span className="hidden sm:inline">Research</span>
            <span className="hidden sm:inline">/</span>
            <span className="truncate">{researchBreadcrumbRoot}</span>
            <span>/</span>
            <span className="shrink-0 underline underline-offset-2">
              {researchSectionLabel[openId]}
            </span>
          </div>
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

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
          <SectionView content={sections[openId]} />
        </div>

        {/* Footer / pager */}
        <div className="flex h-[72px] shrink-0 items-center justify-center border-t border-black border-b-[6px] bg-white px-6">
          <div className="flex w-full max-w-[560px] items-center justify-between">
            <button
              type="button"
              onClick={() => go(-1)}
              data-cursor="hover"
              className="font-grotesk text-[20px] font-medium text-accent transition-opacity hover:opacity-70"
            >
              {"< Previous"}
            </button>
            <div className="flex items-center gap-2.5">
              {researchSectionOrder.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  aria-label={researchSectionLabel[id]}
                  onClick={() => onNavigate(id)}
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
              className="font-grotesk text-[20px] font-medium text-accent transition-opacity hover:opacity-70"
            >
              {"Next >"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
