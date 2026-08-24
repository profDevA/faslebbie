"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { StudentProject } from "@/lib/teaching";
import {
  INITIAL_STUDENT_COUNT,
  STUDENT_COVER_BOX,
  studentWorkColumns,
} from "@/lib/studentWorksLayout";

function Cover({ item }: { item: StudentProject }) {
  const cover = item.cover ?? item.images?.[0];
  const box = STUDENT_COVER_BOX[item.id];
  const frameClass = box
    ? "w-full overflow-hidden bg-[#f0f0f0]"
    : "w-full overflow-hidden bg-[#f0f0f0]";
  const frameStyle = box
    ? { aspectRatio: `${box.w} / ${box.h}` }
    : undefined;

  if (cover) {
    return (
      <div className={frameClass} style={frameStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={item.title}
          className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
        />
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: item.tint, ...frameStyle }}
      className={`flex items-center justify-center ${frameClass} ${
        box ? "" : "h-[220px]"
      } transition-opacity group-hover:opacity-90`}
    >
      <span
        className={`px-4 text-center font-logo text-[clamp(18px,2vw,28px)] font-semibold tracking-tight ${
          item.lightArt ? "text-black/25" : "text-white/90"
        }`}
      >
        {item.title}
      </span>
    </div>
  );
}

function StudentCard({
  item,
  onOpen,
}: {
  item: StudentProject;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      data-cursor="hover"
      className="group block w-full text-left"
    >
      <Cover item={item} />
      <span className="mt-2.5 block font-grotesk text-[14px] font-medium capitalize leading-[1.35] tracking-[0.9px] text-black underline underline-offset-2 transition-colors group-hover:text-accent sm:text-[16px] sm:tracking-[1.65px] lg:text-[18px]">
        {item.title}
      </span>
    </button>
  );
}

export default function TeachingGallery({
  students,
  onOpenStudent,
}: {
  students: StudentProject[];
  onOpenStudent: (id: string) => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const startExpanded = searchParams.get("all") === "1";
  const [showAll, setShowAll] = useState(startExpanded);
  const hasMore = students.length > INITIAL_STUDENT_COUNT;
  const columns = studentWorkColumns(students, showAll);

  useEffect(() => {
    if (searchParams.get("all") === "1") setShowAll(true);
  }, [searchParams]);

  const expandAll = () => {
    setShowAll(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "works");
    params.set("all", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    requestAnimationFrame(() => {
      document.getElementById("teaching-gallery-more")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const collapseAll = () => {
    setShowAll(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "works");
    params.delete("all");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!students.length) return null;

  const mobileColumns = [
    [...(columns[0] ?? []), ...(columns[2] ?? [])],
    [...(columns[1] ?? []), ...(columns[3] ?? [])],
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
      <div className="mb-8">
        <h2 className="font-grotesk text-[24px] font-medium tracking-[0.5px] text-black">
          Student Works
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:hidden">
        {mobileColumns.map((col, i) => (
          <div key={i} className="flex flex-col gap-8">
            {col.map((item) => (
              <StudentCard
                key={item.id}
                item={item}
                onOpen={onOpenStudent}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-x-8 lg:gap-y-[33px]">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-col gap-[33px]">
            {col.map((item) => (
              <StudentCard
                key={item.id}
                item={item}
                onOpen={onOpenStudent}
              />
            ))}
          </div>
        ))}
      </div>
      {hasMore ? (
        <div
          id="teaching-gallery-more"
          className="mt-14 flex justify-center pb-8"
        >
          <button
            type="button"
            onClick={showAll ? collapseAll : expandAll}
            data-cursor="hover"
            className="font-grotesk text-[22px] font-medium text-black underline decoration-from-font underline-offset-4 lg:text-[27px]"
          >
            {showAll ? "See Less" : "See All Student Works"}
          </button>
        </div>
      ) : (
        <div id="teaching-gallery-more" className="h-8" aria-hidden />
      )}
    </div>
  );
}
