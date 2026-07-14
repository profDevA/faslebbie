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
      <div className="hidden lg:block">
        <div className="sticky top-0 aspect-square w-[200px] bg-white" />
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
      <div className="hidden lg:block">
        <div className="sticky top-0 aspect-square w-[200px] bg-white" />
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

function ModalitiesView({ c }: { c: ModalitiesContent }) {
  return (
    <div>
      <div className="border-b border-black pb-10">
        <p className="font-grotesk text-[20px] font-medium text-black text-shadow-token">
          {c.kicker}
        </p>
        <p className="mt-8 max-w-[900px] font-grotesk text-[34px] font-medium leading-[1.35] text-black text-shadow-token">
          {c.statement}
        </p>
      </div>
      <div className="mx-auto mt-4 max-w-[640px]">
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
      <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {c.groups.map((g) => (
          <div key={g.title}>
            <p className="mb-5 inline-block font-grotesk text-[24px] font-medium capitalize text-black underline underline-offset-4 text-shadow-token">
              {g.title}
            </p>
            <ul className="flex flex-col gap-3">
              {g.items.map((label) => (
                <li
                  key={label}
                  className="w-fit rounded-full bg-black/6 px-5 py-2 font-grotesk text-[16px] text-black"
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center font-grotesk text-[16px] text-black/70">
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

function SectionView({ id }: { id: ResearchSectionId }) {
  const content = researchSections[id];
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
}: {
  openId: ResearchSectionId | null;
  onNavigate: (id: ResearchSectionId) => void;
  onClose: () => void;
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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/30"
      />
      <div className="relative flex h-[min(880px,92vh)] w-[min(1100px,96vw)] flex-col overflow-hidden bg-[#d7d7d0] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        {/* Header */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-black bg-white px-6 sm:px-8">
          <div className="flex items-center gap-1.5 font-grotesk text-[15px] font-light text-black sm:text-[18px]">
            <span>Research</span>
            <span>/</span>
            <span className="hidden sm:inline">{researchBreadcrumbRoot}</span>
            <span className="hidden sm:inline">/</span>
            <span className="underline underline-offset-2">
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
          <SectionView id={openId} />
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
