"use client";

import type { Publication, PublicationsData } from "@/lib/blogs";

function padIndex(n: number) {
  return String(n).padStart(2, "0");
}

function PublicationRow({
  index,
  item,
}: {
  index: number;
  item: Publication;
}) {
  const content = (
    <>
      <span className="font-grotesk text-[18px] leading-[1.6] tracking-[0.38px] text-black md:text-[20px]">
        {padIndex(index)}
      </span>
      <span className="font-grotesk text-[22px] leading-[1.28] tracking-[0.38px] text-black md:text-[28px]">
        {item.title}
      </span>
      <span className="text-right font-grotesk text-[18px] leading-[1.6] tracking-[0.38px] text-black md:text-[20px]">
        {item.year}
      </span>
    </>
  );

  // Figma 2729:2759 — 40px index · 624px title · 417px year (right-aligned).
  const rowClass =
    "grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-x-4 border-b border-black pb-[22px] pt-[15px] sm:gap-x-6 lg:grid-cols-[40px_minmax(0,624px)_minmax(5rem,417px)] lg:gap-x-6";

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="hover"
        className={`group transition-opacity hover:opacity-80 ${rowClass}`}
      >
        {content}
      </a>
    );
  }

  return <div className={rowClass}>{content}</div>;
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
      <h2 className="font-grotesk text-[20px] font-medium leading-[1.6] tracking-[0.5px] text-black md:text-[24px]">
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

/** Figma 2729:2736 — centered 1129px block, numbered Books + Journals rows. */
export default function WordsPublications({
  publications,
}: {
  publications: PublicationsData;
}) {
  return (
    <div className="flex w-full max-w-[1129px] flex-col gap-14 lg:gap-[57px]">
      <PublicationSection title="Books" items={publications.books} />
      <PublicationSection
        title="Journals + Articles"
        items={publications.journals}
      />
    </div>
  );
}
