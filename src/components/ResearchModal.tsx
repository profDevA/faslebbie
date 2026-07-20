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
// Percentages inside a fixed-height relative stage; blobs sit close so their
// borders overlap and read as one connected, organic cluster (not a list).
// Each preset carries its own lopsided border-radius so no two blobs match.
type Blob = { top: string; left: string; r: string };
const NODE_LAYOUT: Blob[][] = [
  // human & oral (5)
  [
    { top: "0%", left: "27%", r: "52% 48% 46% 54% / 54% 46% 52% 48%" }, // elder oral / history
    { top: "33%", left: "0%", r: "48% 52% 55% 45% / 45% 56% 44% 52%" }, // semi-structured / interviews
    { top: "38%", left: "43%", r: "55% 45% 47% 53% / 52% 48% 53% 47%" }, // participant / observation
    { top: "66%", left: "7%", r: "47% 53% 52% 48% / 50% 50% 46% 54%" }, // community / mapping
    { top: "68%", left: "40%", r: "54% 46% 50% 50% / 48% 52% 45% 55%" }, // co-design / sessions
  ],
  // documentary & recorded (4)
  [
    { top: "2%", left: "22%", r: "52% 48% 48% 52% / 53% 47% 51% 49%" }, // archival / research
    { top: "26%", left: "52%", r: "48% 52% 54% 46% / 46% 55% 45% 53%" }, // field / photography
    { top: "45%", left: "4%", r: "55% 45% 46% 54% / 51% 49% 54% 46%" }, // autoethnographic / journaling
    { top: "66%", left: "46%", r: "50% 50% 52% 48% / 49% 51% 46% 54%" }, // q-methodology
  ],
];

// Figma splits each channel into a bold head + a lighter tail on a second line
// (the last word is the descriptor). Single-word labels stay on one bold line.
function PebbleLabel({ label }: { label: string }) {
  const i = label.lastIndexOf(" ");
  if (i === -1) return <span className="font-bold">{label}</span>;
  return (
    <span className="leading-tight">
      <span className="font-bold">{label.slice(0, i)}</span>
      <br />
      <span className="font-light">{label.slice(i + 1)}</span>
    </span>
  );
}

function NodeCluster({
  items,
  groupIndex,
}: {
  items: string[];
  groupIndex: number;
}) {
  const layout = NODE_LAYOUT[groupIndex] ?? NODE_LAYOUT[0];
  return (
    <>
      {/* Desktop: organic pebbles whose borders overlap into one cluster. */}
      <div className="relative mx-auto hidden h-[360px] w-full max-w-[400px] sm:block">
        {items.map((label, i) => (
          <div
            key={label}
            style={{
              top: layout[i]?.top ?? "0%",
              left: layout[i]?.left ?? "0%",
              borderRadius: layout[i]?.r,
            }}
            className="absolute flex h-[146px] w-[152px] items-center justify-center border border-black px-4 text-center font-grotesk text-[15px] text-black"
          >
            <PebbleLabel label={label} />
          </div>
        ))}
      </div>
      {/* Mobile: pebbles wrap instead of overlapping. */}
      <div className="flex flex-wrap justify-center gap-3 sm:hidden">
        {items.map((label, i) => (
          <div
            key={label}
            style={{ borderRadius: layout[i]?.r }}
            className="flex h-[116px] w-[136px] items-center justify-center border border-black px-3 text-center font-grotesk text-[14px] text-black"
          >
            <PebbleLabel label={label} />
          </div>
        ))}
      </div>
    </>
  );
}

function ModalitiesView({ c }: { c: ModalitiesContent }) {
  return (
    <div>
      <div className="border-b border-black pb-10">
        <p className="font-grotesk text-[18px] font-bold text-black text-shadow-token">
          {c.kicker}
        </p>
        <p className="mt-6 font-grotesk text-[30px] font-bold leading-[1.3] text-balance text-black text-shadow-token lg:text-[34px]">
          {c.statement}
        </p>
      </div>
      {/* Numbered channels — a single centred column (Figma 1-40666): small
          light numbers, bold labels, thin rules. */}
      <div className="mx-auto mt-2 max-w-[520px]">
        {c.items.map((it) => (
          <div
            key={it.n}
            className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-4 border-b border-black py-4"
          >
            <span className="font-grotesk text-[15px] text-black/55">{it.n}</span>
            <span className="font-grotesk text-[18px] font-bold leading-[1.3] text-black">
              {it.label}
            </span>
          </div>
        ))}
      </div>
      {/* Two labelled channel clusters. */}
      <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {c.groups.map((g, gi) => (
          <div key={g.title} className="flex flex-col">
            <p className="mx-auto mb-4 inline-block font-grotesk text-[22px] font-bold lowercase text-black underline underline-offset-4 text-shadow-token">
              {g.title}
            </p>
            <NodeCluster items={g.items} groupIndex={gi} />
          </div>
        ))}
      </div>
      <p className="-mt-2 text-center font-grotesk text-[15px] text-black/70">
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
  const [i, setI] = useState(0);
  const n = c.notes.length;
  const note = c.notes[Math.min(i, n - 1)];
  const go = (d: 1 | -1) => setI((p) => (p + d + n) % n);
  return (
    <div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_441px]">
      {/* Image + left/right arrows to move between field notes (Israel 07/17:
          "on the left you have arrows to change the image"). */}
      <div className="relative flex items-center">
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
        {n > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous field note"
              onClick={() => go(-1)}
              data-cursor="hover"
              className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-white/85 text-[18px] leading-none text-black transition-opacity hover:opacity-70"
            >
              {"\u2039"}
            </button>
            <button
              type="button"
              aria-label="Next field note"
              onClick={() => go(1)}
              data-cursor="hover"
              className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center bg-white/85 text-[18px] leading-none text-black transition-opacity hover:opacity-70"
            >
              {"\u203a"}
            </button>
          </>
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

      {/* Previous / dots / Next between field notes (testimonial-style pager). */}
      {n > 1 && (
        <div className="mt-10 flex items-center justify-between border-t border-black pt-6">
          <button
            type="button"
            onClick={() => go(-1)}
            data-cursor="hover"
            className="font-grotesk text-[18px] font-medium text-accent transition-opacity hover:opacity-70"
          >
            {"< Previous"}
          </button>
          <div className="flex items-center gap-2.5">
            {c.notes.map((nt, k) => (
              <button
                key={nt.n}
                type="button"
                aria-label={`Field note ${nt.n}`}
                onClick={() => setI(k)}
                data-cursor="hover"
                className={`size-2 rounded-full transition-colors ${
                  k === i ? "bg-accent" : "bg-black/25 hover:bg-black/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            data-cursor="hover"
            className="font-grotesk text-[18px] font-medium text-accent transition-opacity hover:opacity-70"
          >
            {"Next >"}
          </button>
        </div>
      )}
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
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden border-b-[6px] border-black bg-[#d7d7d0] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:h-[min(880px,92vh)] sm:min-h-0 sm:w-[min(1100px,96vw)] sm:flex-none">
        {/* Header */}
        <div className="flex h-[64px] shrink-0 items-center justify-between gap-3 border-b border-black bg-white px-5 sm:h-[72px] sm:px-8">
          <div className="flex min-w-0 items-center gap-1.5 font-grotesk text-[12px] font-light text-black sm:text-[18px]">
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
      </div>
    </div>,
    document.body,
  );
}
