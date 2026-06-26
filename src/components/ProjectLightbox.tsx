"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { WorkProject } from "@/lib/content";

/**
 * Project lightbox (Figma 840:74764) — a centred pop-up, the same modal pattern
 * as the testimonials carousel: a black panel with the project wordmark + a
 * one-line descriptor, a large hero image on the right with an organic curved
 * edge, an × close, and red "< Previous" / "Next >" to page through every
 * project. Opened from a red project link in the ".txt" narrative or a card in
 * the ".img" grid. Portaled to <body> so it's centred on the viewport and sits
 * above the page's scroll-fade.
 *
 * TODO(assets): real per-project hero art + logos — until then each project
 * shows a branded colour panel keyed off `project.accent`.
 */
export default function ProjectLightbox({
  projects,
  index,
  onIndex,
  onClose,
}: {
  projects: WorkProject[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const max = projects.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onIndex(Math.min(max, index + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, max, onIndex, onClose]);

  if (typeof document === "undefined") return null;
  const p = projects[index];
  if (!p) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 animate-[panel-in_0.2s_ease-out]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-[1120px] flex-col overflow-hidden bg-white"
      >
        {/* White header strip with the × close (Figma 840:74764). */}
        <div className="flex shrink-0 items-center justify-end px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="font-grotesk text-[30px] leading-none text-black/70 transition-colors hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Black hero panel: wordmark + descriptor on the left, curved image on
            the right. */}
        <div className="relative grid min-h-0 flex-1 grid-cols-1 overflow-hidden bg-[#0c0c0c] lg:grid-cols-[1fr_1.05fr]">
          <div className="relative z-10 flex flex-col justify-between gap-8 px-7 py-8 lg:px-12 lg:py-12">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="size-7 shrink-0 rounded-[6px] lg:size-9"
                style={{ backgroundColor: p.accent }}
              />
              <span className="font-grotesk text-[28px] font-bold leading-none text-white lg:text-[40px]">
                {p.name}
              </span>
            </div>
            <p className="max-w-[34ch] font-grotesk text-[12px] font-medium leading-snug tracking-wide text-white/70 lg:text-[13px]">
              {p.name} · {p.tagline}
            </p>
          </div>

          {/* Hero image area — branded colour placeholder with an organic curved
              left edge that bites into the black panel (Figma 840:74764). */}
          <div className="relative min-h-[220px] lg:min-h-[420px]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: p.image
                  ? `url(${p.image})`
                  : `radial-gradient(120% 120% at 70% 25%, ${p.accent} 0%, ${p.accent}cc 45%, ${p.accent}80 100%)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                clipPath: "ellipse(86% 128% at 78% 26%)",
              }}
            />
          </div>
        </div>

        {/* Previous / Next in red (Figma 840:74764). */}
        <div className="flex shrink-0 items-center justify-center gap-16 px-6 py-4">
          <button
            type="button"
            onClick={() => onIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            data-cursor="hover"
            className="font-grotesk text-[18px] font-medium text-accent underline-offset-2 transition-opacity enabled:hover:underline disabled:opacity-30"
          >
            {"< Previous"}
          </button>
          <button
            type="button"
            onClick={() => onIndex(Math.min(max, index + 1))}
            disabled={index === max}
            data-cursor="hover"
            className="font-grotesk text-[18px] font-medium text-accent underline-offset-2 transition-opacity enabled:hover:underline disabled:opacity-30"
          >
            {"Next >"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
