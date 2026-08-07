"use client";

import { useCallback, useEffect, useState } from "react";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import {
  researchBreadcrumbRoot,
  researchSectionLabel,
  researchSections,
  type FieldNotesContent,
  type ManifestoContent,
  type ModalitiesContent,
  type ParadigmsContent,
  type PrinciplesContent,
  type ResearchSectionContent,
  type ResearchSectionId,
} from "@/lib/research";

// Section modal (Figma 1-40135 → 1-40813). One panel per section
// (paradigms / principles / modalities / manifesto / field notes) with a shared
// breadcrumb and a scrollable body. Only Field Notes carries a pager.

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

function FieldNotesView({
  c,
  index,
}: {
  c: FieldNotesContent;
  /** Which field note to show — the shell's footer pager owns this. */
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
  // A different note starts on its own first image.
  useEffect(() => setSlide(0), [index]);

  const goImage = useCallback(
    (d: 1 | -1) => {
      if (images.length <= 1) return;
      setSlide((p) => (p + d + images.length) % images.length);
    },
    [images.length],
  );

  // Keyboard arrows page images only (footer Previous/Next pages notes) —
  // same split as Student Works.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goImage(1);
      else if (e.key === "ArrowLeft") goImage(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goImage]);

  const src = images[Math.min(slide, Math.max(images.length - 1, 0))];
  return (
    <>
      {/* Image carousel — arrows change images only. */}
      <div className="relative order-2 h-[320px] min-h-0 overflow-hidden bg-black sm:h-[420px] lg:order-1 lg:h-auto">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- static design asset
          <img
            src={src}
            alt={note.place}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-white" />
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
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {images.map((img, k) => (
                <button
                  key={img}
                  type="button"
                  aria-label={`Image ${k + 1}`}
                  onClick={() => setSlide(k)}
                  data-cursor="hover"
                  className={`size-2 rounded-full transition-colors ${
                    k === slide ? "bg-accent" : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Meta panel — Student Works / Testimonials pattern. */}
      <div className="order-1 flex flex-col justify-center gap-0 bg-[#1c1c1c] px-6 py-10 text-white lg:order-2 lg:overflow-y-auto lg:px-12 lg:py-14">
        <div className="border-b border-white/25 pb-4">
          <p className="font-grotesk text-[14px] tracking-wider text-white/70">
            Field Notes {note.n}
          </p>
          <p className="mt-1 font-grotesk text-[24px] font-medium text-white lg:text-[28px]">
            {note.place}
          </p>
          <p className="mt-3 font-grotesk text-[15px] font-light italic leading-[1.6] text-white/80 lg:text-[16px]">
            {note.quote}
          </p>
        </div>
        <div className="border-b border-white/25 py-4">
          <p className="font-grotesk text-[15px] font-medium text-white">
            Methodology
          </p>
          <p className="mt-2 font-grotesk text-[15px] font-light text-white/75">
            {note.methodology}
          </p>
        </div>
        <div className="border-b border-white/25 py-4">
          <p className="font-grotesk text-[15px] font-medium text-white">
            Research Themes
          </p>
          <p className="mt-2 font-grotesk text-[15px] font-light text-white/75">
            {note.themes}
          </p>
        </div>
        <div className="border-b border-white/25 py-4">
          <p className="font-grotesk text-[15px] font-medium text-white">
            Research Insight
          </p>
          <p className="mt-2 font-grotesk text-[15px] font-light leading-[1.6] text-white/75">
            {note.insight}
          </p>
        </div>
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
  onClose,
  sections = researchSections,
}: {
  openId: ResearchSectionId | null;
  onClose: () => void;
  sections?: Record<ResearchSectionId, ResearchSectionContent>;
}) {
  // Which field note is showing. Only Field Notes pages (Fas 07/30) — every
  // other section opens as standalone content with no pager at all.
  const [noteIndex, setNoteIndex] = useState(0);
  useEffect(() => setNoteIndex(0), [openId]);

  if (!openId) return null;

  const content = sections[openId];
  const isFieldNotes = content.kind === "field-notes";
  const notes = isFieldNotes ? content.notes : [];
  const goNote = (d: 1 | -1) =>
    setNoteIndex((p) => (p + d + notes.length) % notes.length);

  // Field Notes uses the Student Works 50/50 shell; other sections are
  // standalone scroll content with no Prev/Next (QA / Fas 07/30).
  return (
    <PopupShell
      onClose={onClose}
      label={researchSectionLabel[openId]}
      overlayProps={{ "data-research-modal": "" }}
      crumbs={[
        { label: "Research", hideOnMobile: true },
        { label: researchBreadcrumbRoot, hideOnMobile: true },
        { label: researchSectionLabel[openId] },
      ]}
      bodyClassName={
        isFieldNotes
          ? "grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
          : "min-h-0 flex-1 overflow-y-auto px-6 py-10 sm:px-10 lg:px-14 lg:py-14"
      }
      footer={
        notes.length > 1 ? (
          <div className="flex w-full max-w-[620px] items-center justify-between">
            <PopupPagerButton onClick={() => goNote(-1)}>
              {"< Previous"}
            </PopupPagerButton>
            <PopupDots
              count={notes.length}
              active={noteIndex}
              onSelect={setNoteIndex}
              labelFor={(i) => `Field note ${notes[i].n}`}
            />
            <PopupPagerButton onClick={() => goNote(1)}>
              {"Next >"}
            </PopupPagerButton>
          </div>
        ) : undefined
      }
    >
      <SectionView content={content} noteIndex={noteIndex} />
    </PopupShell>
  );
}
