"use client";

import type { ExhibitionTile, StudentProject } from "@/lib/teaching";

// ".img" view (Figma 280:4434 / 840:5714): Student Works masonry only.
// Exhibitions open from the .txt CTA overlay (Figma 280:4634), not stacked here.
/** Placeholder tiles only — real photos use natural aspect (match Work .img). */
const PLACEHOLDER_H: Record<StudentProject["span"], string> = {
  sm: "h-[160px]",
  md: "h-[220px]",
  lg: "h-[280px]",
};

export default function TeachingGallery({
  students,
  onOpenStudent,
}: {
  students: StudentProject[];
  /** Kept for call-site compatibility; exhibition lives in the .txt overlay. */
  exhibitionTitle?: string;
  exhibitionTiles?: ExhibitionTile[];
  onOpenStudent: (id: string) => void;
  onOpenExhibition?: () => void;
}) {
  if (!students.length) return null;

  return (
    <div className="mx-auto w-full max-w-[1350px] px-6 lg:px-12">
      <h2 className="mb-7 font-grotesk text-[18px] font-bold tracking-[0.02em] text-black">
        Student Works
      </h2>
      <div className="columns-2 gap-4 [column-fill:balance] lg:columns-4 lg:gap-6 *:mb-6 *:break-inside-avoid lg:*:mb-9">
        {students.map((item) => {
          const cover = item.images?.[0];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenStudent(item.id)}
              data-cursor="hover"
              className="group block w-full text-left"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- student art
                <img
                  src={cover}
                  alt={item.title}
                  className="h-auto w-full bg-[#f0f0f0] transition-opacity group-hover:opacity-90"
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
              <p className="mt-3 w-fit border-b border-black pb-1 font-grotesk text-[15px] font-bold leading-tight text-black transition-colors group-hover:text-accent">
                {item.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
