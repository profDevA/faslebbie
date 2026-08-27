"use client";

import type { Publication, PublicationsData } from "@/lib/blogs";
import { hiResUrl } from "@/sanity/image";

function padIndex(n: number) {
  return String(n).padStart(2, "0");
}

function titleWithoutOrphan(title: string) {
  return title.replace(/\s+(\S{1,3})$/, "\u00A0$1");
}

// Figma 3393:3510 — inline cover after book title; About-style hover preview.
function BookCoverThumb({ src, alt }: { src: string; alt: string }) {
  const imgSrc = hiResUrl(src, 2400) ?? src;
  return (
    <span
      data-cursor="hover"
      className="logo-chip relative z-0 ml-2 inline-flex h-6 shrink-0 translate-y-[0.05em] items-center justify-center overflow-visible align-middle hover:z-40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN URL */}
      <img src={imgSrc} alt={alt} className="h-full w-auto object-contain" />
      <span aria-hidden className="logo-chip-preview">
        {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN URL */}
        <img src={imgSrc} alt="" className="h-auto w-full object-contain" />
      </span>
    </span>
  );
}

// Figma 3315:4149 — index · title (capped, not full-bleed) · year right.
const ROW_GRID =
  "grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-4 sm:gap-x-6 lg:grid-cols-[40px_minmax(0,680px)_1fr] lg:gap-x-6";

function PublicationRow({
  index,
  item,
}: {
  index: number;
  item: Publication;
}) {
  const tag = item.tag?.trim();

  const inner = (
    <>
      <div className={ROW_GRID}>
        <span className="text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black md:text-[20px]">
          {padIndex(index)}
        </span>
        <span className="min-w-0 text-[22px] font-normal leading-[1.28] tracking-[0.38px] text-black md:text-[28px]">
          <span className="inline">{titleWithoutOrphan(item.title)}</span>
          {item.cover ? (
            <BookCoverThumb src={item.cover} alt={item.title} />
          ) : null}
        </span>
        <span className="justify-self-end shrink-0 text-right text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black md:text-[20px]">
          {item.year}
        </span>
      </div>
      {tag ? (
        <div className={`mt-px ${ROW_GRID}`}>
          <span aria-hidden className="opacity-0">
            {padIndex(index)}
          </span>
          <p className="text-[18px] font-normal italic leading-[1.2] tracking-[1px] text-[#1a1a1a] md:text-[20px]">
            {tag}
          </p>
          <span aria-hidden className="hidden lg:block" />
        </div>
      ) : null}
    </>
  );

  const rowClass =
    "flex w-full flex-col border-b border-black pb-[22px] pt-[15px]";

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="hover"
        className={`group transition-opacity hover:opacity-80 ${rowClass}`}
      >
        {inner}
      </a>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}

function PublicationSection({
  title,
  items,
}: {
  title: string;
  items: Publication[];
}) {
  if (!items.length) return null;

  return (
    <section className="w-full">
      <h2 className="text-[20px] font-normal leading-[1.6] tracking-[0.5px] text-black md:text-[24px]">
        {title}
      </h2>
      <div className="mt-[22px] flex w-full flex-col">
        {items.map((item, i) => (
          <PublicationRow key={`${title}-${i}`} index={i + 1} item={item} />
        ))}
      </div>
    </section>
  );
}

/** Figma 3315:4124 — Current Projects, Books, Journals + tag lines. */
export default function WordsPublications({
  publications,
}: {
  publications: PublicationsData;
}) {
  const empty =
    !publications.currentProjects.length &&
    !publications.books.length &&
    !publications.journals.length;

  return (
    <div className="flex w-full max-w-[1129px] flex-col gap-14 pt-10 reckless-prose lg:gap-[57px] lg:pt-16">
      {empty ? (
        <p className="text-center text-[15px] font-normal leading-relaxed text-black/55">
          Words content will appear here once added in Studio → Blogs &amp; Media
          → Words.
        </p>
      ) : null}
      <PublicationSection
        title="Current Projects"
        items={publications.currentProjects}
      />
      <PublicationSection title="Books" items={publications.books} />
      <PublicationSection
        title="Journals + Articles"
        items={publications.journals}
      />
    </div>
  );
}
