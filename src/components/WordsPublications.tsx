"use client";

import type { Publication, PublicationsData } from "@/lib/blogs";
import { hiResUrl } from "@/sanity/image";

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

// Figma 3315:4149 — title (capped, not full-bleed) · year right. The 01, 02…
// index column is gone (Fas, Nov 16 evening: "remove all the numbers").
// Phones: one column, year under the title (mobile Figma 2930:210803) — a long
// status like "In Development" squeezed the title (mobile QA M17, Nov 23).
const ROW_GRID =
  "grid w-full max-w-[min(100%,680px)] grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 max-md:grid-cols-1 sm:gap-x-6 lg:max-w-none lg:grid-cols-[minmax(0,680px)_1fr] lg:gap-x-6";

function PublicationRow({ item }: { item: Publication }) {
  const tag = item.tag?.trim();
  /** Link shown as its own line (Studio "Link text"); otherwise the row links. */
  const linked = Boolean(item.href && item.linkLabel);

  const title = titleWithoutOrphan(item.title);
  // Phones: the cover thumb stays with the title's last word instead of
  // wrapping onto a line of its own (Souvenirs…, mobile QA M17).
  const cut = item.cover ? title.lastIndexOf(" ") : -1;

  const inner = (
    <>
      <div className={ROW_GRID}>
        <span className="min-w-0 text-[18px] font-normal leading-[1.28] tracking-[0.38px] text-black md:text-[28px]">
          <span className="inline">{cut > 0 ? title.slice(0, cut + 1) : item.cover ? "" : title}</span>
          {item.cover ? (
            <span className="max-md:whitespace-nowrap">
              {cut > 0 ? title.slice(cut + 1) : title}
              <BookCoverThumb src={item.cover} alt={item.title} />
            </span>
          ) : null}
        </span>
        <span className="justify-self-end shrink-0 text-right text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black max-md:justify-self-start max-md:text-left md:text-[20px]">
          {item.year}
        </span>
      </div>
      {tag ? (
        <div className={`mt-px ${ROW_GRID}`}>
          <p className="text-[18px] font-normal italic leading-[1.2] tracking-[1px] text-[#1a1a1a] md:text-[20px]">
            {tag}
          </p>
          <span aria-hidden className="hidden lg:block" />
        </div>
      ) : null}
      {/* Fas, Nov 18: "we have to put the link somehow… just here, each one" —
          the doc shows a red link under the tag line ("Read publication"). */}
      {linked ? (
        <div className={`mt-[6px] ${ROW_GRID}`}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="w-fit text-[16px] font-normal leading-[1.3] text-accent underline underline-offset-4 transition-opacity hover:opacity-80 md:text-[18px]"
          >
            {item.linkLabel}
          </a>
          <span aria-hidden className="hidden lg:block" />
        </div>
      ) : null}
    </>
  );

  const rowClass =
    "flex w-full flex-col border-b border-black pb-[22px] pt-[15px]";

  if (item.href && !linked) {
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
          <PublicationRow key={`${title}-${i}`} item={item} />
        ))}
      </div>
    </section>
  );
}

/** Figma 3315:4124 — the ".publications" tab. Fas, Nov 18: "only two
 *  categories, Articles and Papers and Books… we're getting rid of this
 *  journal". Studio: "Articles & Papers" = the currentProjects list; the
 *  Journals list is no longer shown. */
export default function WordsPublications({
  publications,
}: {
  publications: PublicationsData;
}) {
  const empty =
    !publications.currentProjects.length && !publications.books.length;

  return (
    <div className="mx-auto flex w-full max-w-[1129px] flex-col gap-14 pt-10 reckless-prose max-md:px-1 lg:gap-[57px] lg:pt-16">
      {empty ? (
        <p className="text-center text-[15px] font-normal leading-relaxed text-black/55">
          Publications will appear here once added in Studio → Blogs &amp; Media
          → Publications.
        </p>
      ) : null}
      <PublicationSection
        title="Articles & Papers"
        items={publications.currentProjects}
      />
      <PublicationSection title="Books" items={publications.books} />
    </div>
  );
}
