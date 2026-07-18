"use client";

import type { StudentProject } from "@/lib/teaching";
import { exhibitionTiles, students as fallbackStudents } from "@/lib/teaching";

// ".img" view (Figma 16-19360 / 280-4434): a "Student Works" masonry (each card
// opens the paged student modal) followed by an "SFK Exhibition" masonry (opens
// the SFK Beijing exhibition overlay). Placeholder tinted art until Fas supplies
// the real photos.
const SPAN_H: Record<StudentProject["span"], string> = {
  sm: "h-[220px]",
  md: "h-[300px]",
  lg: "h-[380px]",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-7 font-grotesk text-[18px] font-bold tracking-[0.02em] text-black">
      {children}
    </h2>
  );
}

function SeeAll({
  text,
  onClick,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <div className="mt-4 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        data-cursor="hover"
        className="font-grotesk text-[18px] font-bold text-black underline decoration-from-font underline-offset-4 transition-opacity hover:opacity-70"
      >
        {text}
      </button>
    </div>
  );
}

export default function TeachingGallery({
  students = fallbackStudents,
  onOpenStudent,
  onOpenExhibition,
}: {
  students?: StudentProject[];
  onOpenStudent: (id: string) => void;
  onOpenExhibition: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[1350px] px-6 lg:px-12">
      {/* Student Works */}
      <SectionHeading>Student Works</SectionHeading>
      <div className="columns-2 gap-6 [column-fill:balance] lg:columns-4 *:mb-9 *:break-inside-avoid">
        {students.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onOpenStudent(item.id)}
            data-cursor="hover"
            className="group block w-full text-left"
          >
            <div
              style={{ backgroundColor: item.tint }}
              className={`flex w-full items-center justify-center overflow-hidden ${SPAN_H[item.span]} transition-opacity group-hover:opacity-90`}
            >
              <span
                className={`px-4 text-center font-logo text-[clamp(18px,2vw,28px)] font-semibold tracking-tight ${
                  item.lightArt ? "text-black/25" : "text-white/90"
                }`}
              >
                {item.title}
              </span>
            </div>
            <p className="mt-3 w-fit border-b border-black pb-1 font-grotesk text-[15px] font-bold leading-tight text-black transition-colors group-hover:text-accent">
              {item.title}
            </p>
          </button>
        ))}
      </div>
      <SeeAll
        text="See All Student Works"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />

      <hr className="my-14 border-black/10" />

      {/* SFK Exhibition */}
      <SectionHeading>SFK Exhibition</SectionHeading>
      <div className="columns-2 gap-6 [column-fill:balance] lg:columns-4 *:mb-9 *:break-inside-avoid">
        {exhibitionTiles.map((tile, i) => (
          <button
            key={i}
            type="button"
            onClick={onOpenExhibition}
            data-cursor="hover"
            className="group block w-full text-left"
          >
            <div
              style={{ backgroundColor: tile.tint }}
              className={`w-full overflow-hidden ${SPAN_H[tile.span]} transition-opacity group-hover:opacity-90`}
            />
            <p className="mt-3 font-grotesk text-[14px] font-medium text-black/70">
              Lorem Ipsum
            </p>
          </button>
        ))}
      </div>
      <SeeAll text="See All" onClick={onOpenExhibition} />
    </div>
  );
}
