"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { ExhibitionTile, StudentProject } from "@/lib/teaching";

const PLACEHOLDER_H: Record<StudentProject["span"], string> = {
  sm: "h-[160px]",
  md: "h-[220px]",
  lg: "h-[280px]",
};

/** Figma 2823:2384 — ~2 rows visible, then underlined "See all student works". */
const INITIAL_COUNT = 8;

export default function TeachingGallery({
  students,
  exhibitionTitle,
}: {
  students: StudentProject[];
  exhibitionTitle?: string;
  exhibitionTiles?: ExhibitionTile[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const startExpanded = searchParams.get("all") === "1";
  const [showAll, setShowAll] = useState(startExpanded);
  const visible = showAll ? students : students.slice(0, INITIAL_COUNT);
  const hasMore = students.length > INITIAL_COUNT;

  useEffect(() => {
    if (searchParams.get("all") === "1") setShowAll(true);
  }, [searchParams]);

  const expandAll = () => {
    setShowAll(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "img");
    params.set("all", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    requestAnimationFrame(() => {
      document.getElementById("teaching-gallery-more")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  if (!students.length) return null;

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-grotesk text-[18px] font-bold tracking-[0.02em] text-black">
          Student Works
        </h2>
        {exhibitionTitle ? (
          <Link
            href="/teaching/exhibition"
            data-cursor="hover"
            className="font-grotesk text-[14px] font-medium text-black underline underline-offset-4 transition-colors hover:text-accent"
          >
            {exhibitionTitle}
          </Link>
        ) : null}
      </div>
      <div className="columns-2 gap-4 [column-fill:balance] lg:columns-4 lg:gap-6 *:mb-6 *:break-inside-avoid lg:*:mb-9">
        {visible.map((item) => {
          const cover = item.cover ?? item.images?.[0];
          return (
            <Link
              key={item.id}
              href={`/teaching/students/${item.id}`}
              data-cursor="hover"
              className="group block w-full text-left"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={item.title}
                  className="h-auto w-full bg-[#f0f0f0] object-cover transition-opacity group-hover:opacity-90"
                />
              ) : (
                <div
                  style={{ backgroundColor: item.tint }}
                  className={`flex w-full items-center justify-center overflow-hidden ${PLACEHOLDER_H[item.span]} transition-opacity group-hover:opacity-90`}
                >
                  <span
                    className={`px-4 text-center font-logo text-[clamp(18px,2vw,28px)] font-semibold tracking-tight ${
                      item.lightArt ? "text-black/25" : "text-white/90"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
              )}
              <span className="mt-2.5 block font-grotesk text-[14px] font-medium capitalize leading-[1.35] tracking-[0.9px] text-black underline underline-offset-2 transition-colors group-hover:text-accent sm:text-[16px] sm:tracking-[1.65px] lg:text-[18px]">
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
      {hasMore && !showAll ? (
        <div id="teaching-gallery-more" className="mt-14 flex justify-center pb-8">
          <button
            type="button"
            onClick={expandAll}
            data-cursor="hover"
            className="font-grotesk text-[22px] font-medium italic text-black underline underline-offset-4 lg:text-[27px]"
          >
            See all student works
          </button>
        </div>
      ) : (
        <div id="teaching-gallery-more" className="h-8" aria-hidden />
      )}
    </div>
  );
}
