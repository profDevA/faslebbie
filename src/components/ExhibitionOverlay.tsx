"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  exhibitionTiles as fallbackTiles,
  exhibitionTitle as fallbackTitle,
  type ExhibitionTile,
} from "@/lib/teaching";

// SFK Beijing Exhibition overlay (Figma 280-4632 / live faslebbie.com/
// sfk-beijeing-exhibition) — opened from the ".txt" "Explore my student
// exhibitions" link and the ".img" exhibition grid. A scattered photo collage
// (desktop) around the centred serif title + a "View Student Works" button that
// jumps into the student grid. Mobile: title on top, then a simple grid.
export default function ExhibitionOverlay({
  open,
  onClose,
  onViewStudents,
  title = fallbackTitle,
  tiles = fallbackTiles,
}: {
  open: boolean;
  onClose: () => void;
  onViewStudents: () => void;
  title?: string;
  tiles?: ExhibitionTile[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  // Title often comes as one line ("SFK Beijing Exhibition"); split for the
  // two-line serif treatment when it has a natural break after "Beijing".
  const titleLines = title.replace(/\s+Exhibition$/i, "\nExhibition").split("\n");

  const centre = (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="font-serif text-[clamp(36px,6vw,64px)] font-medium leading-[1.05] text-black">
        {titleLines.map((line, i) => (
          <span key={i}>
            {i > 0 ? <br /> : null}
            {line}
          </span>
        ))}
      </h2>
      <button
        type="button"
        onClick={onViewStudents}
        data-cursor="hover"
        className="bg-black px-6 py-3 font-grotesk text-[13px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80"
      >
        View Student Works
      </button>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-100 overflow-y-auto bg-close">
      {/* Header / close */}
      <div className="sticky top-0 z-20 flex h-13 items-center justify-between border-b border-black/10 bg-close/90 px-5 backdrop-blur-sm sm:px-8">
        <span className="font-grotesk text-[14px] font-light text-black sm:text-[16px]">
          Teaching <span className="text-black/40">/</span>{" "}
          <span className="underline underline-offset-2">{title}</span>
        </span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          data-cursor="hover"
          className="text-[22px] leading-none text-black transition-opacity hover:opacity-60"
        >
          ✕
        </button>
      </div>

      {/* Desktop: scattered collage with the title centred over it */}
      <div className="relative hidden h-[calc(100vh-52px)] w-full lg:block">
        {tiles.map((tile, i) => (
          <div
            key={i}
            style={{
              top: `${tile.pos.top}%`,
              left: `${tile.pos.left}%`,
              width: `${tile.pos.w}vw`,
              backgroundColor: tile.tint,
              backgroundImage: tile.image ? `url(${tile.image})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="absolute aspect-4/3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          />
        ))}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {centre}
        </div>
      </div>

      {/* Mobile: title on top, then a simple grid */}
      <div className="lg:hidden">
        <div className="px-6 py-14">{centre}</div>
        <div className="grid grid-cols-2 gap-3 px-4 pb-16">
          {tiles.map((tile, i) => (
            <div
              key={i}
              style={{
                backgroundColor: tile.tint,
                backgroundImage: tile.image ? `url(${tile.image})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              className="aspect-4/3 w-full"
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
