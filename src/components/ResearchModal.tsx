"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import {
  researchBreadcrumbRoot,
  researchPagerIds,
  researchSectionLabel,
  type FieldNotesContent,
  type ManifestoContent,
  type ModalitiesContent,
  type ParadigmsContent,
  type PrinciplesContent,
  type ResearchSectionContent,
  type ResearchSectionId,
} from "@/lib/research";

// Research section popups (Figma 2854:1464–1925 desktop, 2869:* mobile).
// Paradigms / Principles / Modalities / Manifesto share a 4-dot pager.
// Field Notes pages its own notes.

function SquarePlaceholder({ className = "" }: { className?: string }) {
  return <div className={`aspect-square bg-white ${className}`} />;
}

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
          className="border-t border-black py-6 first:border-t-0 first:pt-0 lg:mt-8 lg:grid lg:grid-cols-[48px_minmax(0,1fr)] lg:gap-x-3 lg:py-8 lg:first:mt-0"
        >
          <span className="mb-6 block font-grotesk text-[36px] leading-[1.2] text-black lg:mb-0 lg:text-[27px]">
            {it.n}
          </span>
          <div>
            <h4 className="font-grotesk text-[28px] font-medium leading-[1.28] text-black lg:text-[32px]">
              {it.title}
            </h4>
            <p className="mt-3 font-grotesk text-[18px] font-light leading-[1.6] text-black">
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[207px_minmax(0,1fr)] lg:gap-12">
      <div>
        <SquarePlaceholder className="mx-auto w-[232px] max-w-full lg:sticky lg:top-0 lg:mx-0 lg:w-[207px]" />
      </div>
      <div>
          <p className="font-grotesk text-[20px] font-medium text-black text-shadow-token lg:text-[24px]">
            {c.label}
          </p>
          <p className="mt-2 max-w-[688px] font-grotesk text-[24px] font-medium leading-[1.6] text-black text-shadow-token lg:text-[42px] lg:leading-[1.6]">
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[207px_minmax(0,1fr)] lg:gap-12">
      <div>
        <SquarePlaceholder className="mx-auto w-[232px] max-w-full lg:sticky lg:top-0 lg:mx-0 lg:w-[207px]" />
      </div>
      <div>
          <p className="font-grotesk text-[20px] font-medium text-black text-shadow-token lg:text-[24px]">
            {c.label}
          </p>
          <p className="mt-2 max-w-[688px] font-grotesk text-[24px] font-medium leading-[1.35] text-black text-shadow-token lg:text-[42px]">
            {c.intro}
          </p>
          <div className="mt-10">
            <NumberedList items={c.items} />
          </div>
          <div className="mt-12 max-w-[688px] pt-8">
            <p className="font-grotesk text-[18px] font-medium text-black text-shadow-token">
              {c.conclusion.kicker}
            </p>
            <p className="mt-3 font-grotesk text-[24px] font-medium leading-[1.6] text-black text-shadow-token lg:text-[32px]">
              {c.conclusion.body}
            </p>
          </div>
      </div>
    </div>
  );
}

// Organic "pebble" positions for the two channel clusters (Figma 2854:1809).
type Blob = { top: string; left: string; r: string };
const NODE_LAYOUT: Blob[][] = [
  [
    { top: "0%", left: "27%", r: "52% 48% 46% 54% / 54% 46% 52% 48%" },
    { top: "33%", left: "0%", r: "48% 52% 55% 45% / 45% 56% 44% 52%" },
    { top: "38%", left: "43%", r: "55% 45% 47% 53% / 52% 48% 53% 47%" },
    { top: "66%", left: "7%", r: "47% 53% 52% 48% / 50% 50% 46% 54%" },
    { top: "68%", left: "40%", r: "54% 46% 50% 50% / 48% 52% 45% 55%" },
  ],
  [
    { top: "2%", left: "22%", r: "52% 48% 48% 52% / 53% 47% 51% 49%" },
    { top: "26%", left: "52%", r: "48% 52% 54% 46% / 46% 55% 45% 53%" },
    { top: "45%", left: "4%", r: "55% 45% 46% 54% / 51% 49% 54% 46%" },
    { top: "66%", left: "46%", r: "50% 50% 52% 48% / 49% 51% 46% 54%" },
  ],
];

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
      <div className="relative mx-auto hidden h-[360px] w-full max-w-[400px] sm:block">
        {items.map((label, i) => (
          <div
            key={label}
            style={{
              top: layout[i]?.top ?? "0%",
              left: layout[i]?.left ?? "0%",
              borderRadius: layout[i]?.r,
            }}
            className="absolute flex h-[146px] w-[152px] items-center justify-center border border-black px-4 text-center font-grotesk text-[15px] lowercase text-black"
          >
            <PebbleLabel label={label} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3 sm:hidden">
        {items.map((label, i) => (
          <div
            key={label}
            style={{ borderRadius: layout[i]?.r }}
            className="flex h-[116px] w-[136px] items-center justify-center border border-black px-3 text-center font-grotesk text-[14px] lowercase text-black"
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
      <SquarePlaceholder className="mx-auto mb-10 w-[224px] max-w-full lg:hidden" />
      <div className="border-b border-black pb-10">
        <p className="font-grotesk text-[18px] font-medium text-black text-shadow-token lg:text-[24px]">
          {c.kicker}
        </p>
        <p className="mt-6 font-grotesk text-[24px] font-medium leading-[1.35] text-balance text-black text-shadow-token lg:text-[42px]">
          {c.statement}
        </p>
      </div>
      <div className="mx-auto mt-2 max-w-[687px]">
        {c.items.map((it) => (
          <div
            key={it.n}
            className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-x-4 border-b border-black py-4 first:border-t-0 lg:py-5"
          >
            <span className="font-grotesk text-[18px] text-black lg:text-[24px]">
              {it.n}
            </span>
            <span className="font-grotesk text-[22px] font-medium lowercase leading-[1.28] text-black lg:text-[32px]">
              {it.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {c.groups.map((g, gi) => (
          <div key={g.title} className="flex flex-col">
            <p className="mx-auto mb-4 inline-block font-grotesk text-[22px] font-bold lowercase text-black underline underline-offset-4 text-shadow-token lg:text-[32px]">
              {g.title}
            </p>
            <NodeCluster items={g.items} groupIndex={gi} />
          </div>
        ))}
      </div>
      <p className="-mt-2 text-center font-grotesk text-[15px] text-black/70 lg:text-[18px]">
        {c.footnote}
      </p>
    </div>
  );
}

function ManifestoView({ c }: { c: ManifestoContent }) {
  return (
    <div className="mx-auto max-w-[900px]">
      {c.paragraphs.map((runs, i) => (
        <div
          key={i}
          className={`mb-10 max-w-[704px] ${
            i % 2 === 0 ? "lg:ml-auto" : "lg:ml-0"
          }`}
        >
          {i === 0 && (
            <p className="mb-3 font-grotesk text-[20px] font-medium text-black text-shadow-token lg:text-[24px]">
              Manifesto
            </p>
          )}
          <p className="font-grotesk text-[28px] font-medium leading-[1.35] text-black text-shadow-token lg:text-[32px]">
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
        </div>
      ))}
    </div>
  );
}

function FieldNotesView({
  c,
  index,
}: {
  c: FieldNotesContent;
  index: number;
}) {
  const n = c.notes.length;
  const note = c.notes[Math.min(index, n - 1)];
  const images = note.images?.length
    ? note.images
    : note.image
      ? [note.image]
      : [];
  const [slide, setSlide] = useState(0);
  useEffect(() => setSlide(0), [index]);

  const goImage = useCallback(
    (d: 1 | -1) => {
      if (images.length <= 1) return;
      setSlide((p) => (p + d + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goImage(1);
      else if (e.key === "ArrowLeft") goImage(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goImage]);

  const src = images[Math.min(slide, Math.max(images.length - 1, 0))];

  const imageEl = (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#d9d5ed]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- static design asset
        <img
          src={src}
          alt={note.place}
          className="h-full w-full object-cover object-bottom"
        />
      ) : (
        <div className="h-full min-h-[280px] w-full bg-white lg:min-h-0" />
      )}
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => goImage(-1)}
            data-cursor="hover"
            className="absolute left-3 top-1/2 -translate-y-1/2 font-grotesk text-[28px] font-bold text-white/90 transition-opacity hover:opacity-70 lg:left-6"
          >
            {"<"}
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => goImage(1)}
            data-cursor="hover"
            className="absolute right-3 top-1/2 -translate-y-1/2 font-grotesk text-[28px] font-bold text-white/90 transition-opacity hover:opacity-70 lg:right-6"
          >
            {">"}
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden min-h-0 lg:contents">
        <div className="min-h-0 overflow-hidden">{imageEl}</div>
        <div className="flex min-h-0 flex-col items-center justify-center bg-[#1a1a1a] px-10 text-center text-[#e0e0d7]">
          <p className="font-grotesk text-[11px] font-light tracking-wide capitalize">
            {note.place}
          </p>
          <p className="mt-2 max-w-[389px] font-grotesk text-[36px] font-normal leading-[1.1] tracking-tight xl:text-[50px] xl:leading-[1.09]">
            {note.quote}
          </p>
          <p className="mt-4 max-w-[329px] font-grotesk text-[14px] font-light leading-[1.2] tracking-[1px]">
            {note.insight}
          </p>
          <p className="mt-4 font-grotesk text-[14px] font-light italic tracking-[1px]">
            {note.themes}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:hidden">
        <div className="flex h-[538px] shrink-0 flex-col items-center justify-center bg-[#1a1a1a] px-8 text-center text-[#e0e0d7]">
          <p className="font-grotesk text-[12px] font-light tracking-tight">
            {note.place}
          </p>
          <p className="mt-2.5 max-w-[282px] font-grotesk text-[36px] font-normal leading-[1.1] tracking-tight">
            {note.quote}
          </p>
          <p className="mt-2.5 max-w-[282px] font-grotesk text-[14px] font-thin leading-4 tracking-[0.72px]">
            {note.insight}
          </p>
          <p className="mt-2.5 max-w-[282px] font-grotesk text-[14px] font-thin italic leading-4 tracking-[0.72px]">
            {note.themes}
          </p>
        </div>
        <div className="h-[538px] shrink-0 overflow-hidden">{imageEl}</div>
      </div>
    </>
  );
}

function SectionView({
  content,
  noteIndex,
}: {
  content: ResearchSectionContent;
  noteIndex: number;
}) {
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
      return <FieldNotesView c={content} index={noteIndex} />;
  }
}

export default function ResearchModal({
  openId,
  onNavigate,
  onClose,
  sections = {},
}: {
  openId: ResearchSectionId | null;
  onNavigate: (id: ResearchSectionId) => void;
  onClose: () => void;
  sections?: Partial<Record<ResearchSectionId, ResearchSectionContent>>;
}) {
  const [noteIndex, setNoteIndex] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pagerIds = useMemo(
    () => researchPagerIds.filter((id) => sections[id]),
    [sections],
  );
  const pagerIndex = openId ? pagerIds.indexOf(openId) : -1;
  const inSectionPager = pagerIndex >= 0;
  const fieldNotes = sections["field-notes"];
  const noteCount =
    fieldNotes?.kind === "field-notes" ? fieldNotes.notes.length : 0;
  const pagingNotes = openId === "field-notes" && noteCount > 1;

  useEffect(() => setNoteIndex(0), [openId]);
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
  }, [openId, noteIndex]);

  useEffect(() => {
    if (!inSectionPager || pagingNotes) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const d = e.key === "ArrowRight" ? 1 : -1;
      const next =
        pagerIds[(pagerIndex + d + pagerIds.length) % pagerIds.length];
      onNavigate(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inSectionPager, pagingNotes, pagerIds, pagerIndex, onNavigate]);

  if (!openId) return null;

  const content = sections[openId];
  if (!content) return null;
  const isFieldNotes = content.kind === "field-notes";
  const notes = isFieldNotes ? content.notes : [];
  const goNote = (d: 1 | -1) =>
    setNoteIndex((p) => (p + d + notes.length) % notes.length);

  const goSection = (d: 1 | -1) => {
    if (!inSectionPager) return;
    const next = pagerIds[(pagerIndex + d + pagerIds.length) % pagerIds.length];
    onNavigate(next);
  };

  const pagerRow = (
    count: number,
    active: number,
    onPrev: () => void,
    onNext: () => void,
    onSelect: (i: number) => void,
    labelFor: (i: number) => string,
  ) => (
    <div className="flex w-full max-w-[620px] items-center justify-between gap-2">
      <PopupPagerButton
        className="shrink-0 whitespace-nowrap text-[16px] lg:text-[21px]"
        onClick={onPrev}
      >
        {"< Previous"}
      </PopupPagerButton>
      <PopupDots
        className="flex min-w-0 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        count={count}
        active={active}
        onSelect={onSelect}
        labelFor={labelFor}
      />
      <PopupPagerButton
        className="shrink-0 whitespace-nowrap text-[16px] lg:text-[21px]"
        onClick={onNext}
      >
        {"Next >"}
      </PopupPagerButton>
    </div>
  );

  const sectionFooter = pagingNotes
    ? pagerRow(
        notes.length,
        noteIndex,
        () => goNote(-1),
        () => goNote(1),
        setNoteIndex,
        (i) => `Field note ${notes[i].n}`,
      )
    : inSectionPager
      ? pagerRow(
          pagerIds.length,
          pagerIndex,
          () => goSection(-1),
          () => goSection(1),
          (i) => onNavigate(pagerIds[i]),
          (i) => researchSectionLabel[pagerIds[i]],
        )
      : undefined;

  return (
    <PopupShell
      onClose={onClose}
      bodyRef={bodyRef}
      label={researchSectionLabel[openId]}
      overlayProps={{ "data-research-modal": "" }}
      crumbs={[
        { label: "Research", hideOnMobile: true },
        { label: researchBreadcrumbRoot },
        { label: researchSectionLabel[openId] },
      ]}
      bodyClassName={
        isFieldNotes
          ? "grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
          : "min-h-0 flex-1 overflow-y-auto bg-bg px-6 py-10 sm:px-10 lg:px-14 lg:py-14"
      }
      footer={sectionFooter}
    >
      <SectionView content={content} noteIndex={noteIndex} />
    </PopupShell>
  );
}
