"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { exhibitionTiles, exhibitionTitle } from "@/lib/teaching";

// SFK Beijing Exhibition overlay (Figma 280-4632 / live faslebbie.com/
// sfk-beijeing-exhibition) — opened from the ".txt" "Explore my student
// exhibitions" link and the ".img" exhibition grid. A scattered photo collage
// (desktop) around the centred serif title + a "View Student Works" button that
// jumps into the student grid. Mobile: title on top, then a simple grid.
// Imagery is placeholder (tinted tiles) until the real exhibition photos land.
export default function ExhibitionOverlay({
  open,
  onClose,
  onViewStudents,
}: {
  open: boolean;
  onClose: () => void;
  onViewStudents: () => void;
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

  const centre = (
    <div className="flex flex-col items-center gap-6 text-center">
      <h2 className="font-serif text-[clamp(36px,6vw,64px)] font-medium leading-[1.05] text-black">
        SFK Beijing
        <br />
        Exhibition
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
          <span className="underline underline-offset-2">{exhibitionTitle}</span>
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
        {exhibitionTiles.map((tile, i) => (
          <div
            key={i}
            style={{
              top: `${tile.pos.top}%`,
              left: `${tile.pos.left}%`,
              width: `${tile.pos.w}vw`,
              backgroundColor: tile.tint,
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
          {exhibitionTiles.map((tile, i) => (
            <div
              key={i}
              style={{ backgroundColor: tile.tint }}
              className="aspect-4/3 w-full"
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
