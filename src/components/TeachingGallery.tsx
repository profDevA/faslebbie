"use client";

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
        className={`px-4 text-center text-[clamp(18px,2vw,28px)] font-semibold tracking-tight ${
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
      className="group reckless-prose block w-full text-left"
    >
      <Cover item={item} />
      <span className="mt-2.5 block text-[14px] font-normal capitalize leading-[1.35] text-black underline underline-offset-2 transition-colors group-hover:text-accent sm:text-[16px] lg:text-[18px]">
        {item.title}
      </span>
    </button>
  );
}

export default function TeachingGallery({
  students,
  onOpenStudent,
  showAll,
  onExpandAll,
  onCollapseAll,
}: {
  students: StudentProject[];
  onOpenStudent: (id: string) => void;
  showAll: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}) {
  const hasMore = students.length > INITIAL_STUDENT_COUNT;
  const columns = studentWorkColumns(students, showAll);

  const expandAll = () => {
    onExpandAll();
    requestAnimationFrame(() => {
      document.getElementById("teaching-gallery-more")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  if (!students.length) return null;

  const mobileColumns = [
    [...(columns[0] ?? []), ...(columns[2] ?? [])],
    [...(columns[1] ?? []), ...(columns[3] ?? [])],
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 lg:px-12">
      <div className="mb-8">
        <h2 className="page-body-kicker text-black">
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
            onClick={showAll ? onCollapseAll : expandAll}
            data-cursor="hover"
            className="reckless-prose text-[22px] font-normal text-black underline decoration-from-font underline-offset-4 lg:text-[27px]"
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
