"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { mediaCategory, type MediaItem } from "@/lib/blogs";

// Play glyph reused on the card + modal placeholder.
function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M9 7.5v9l7-4.5-7-4.5z" />
    </svg>
  );
}

// Paged media modal (Figma 504-16389 / 16-1163). One item at a time: a video
// player (placeholder) + a details panel. Previous / Next + dots cycle items.
export default function MediaModal({
  index,
  items,
  onNavigate,
  onClose,
}: {
  index: number | null;
  items: MediaItem[];
  onNavigate: (i: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = index !== null;
  const n = items.length;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index! - 1 + n) % n);
      if (e.key === "ArrowRight") onNavigate((index! + 1) % n);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, index, n, onNavigate, onClose]);

  if (!mounted || !open) return null;
  const item = items[index!];
  const prev = () => onNavigate((index! - 1 + n) % n);
  const next = () => onNavigate((index! + 1) % n);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-100 flex animate-[panel-in_0.2s_ease-out] items-start justify-center overflow-y-auto bg-black/40 px-4 py-4 lg:py-[64px]"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 -z-10 cursor-default"
        tabIndex={-1}
      />
      <div className="flex w-full max-w-[1000px] flex-col bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        {/* Header: breadcrumb + close */}
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-4 lg:px-8">
          <div className="min-w-0 truncate font-grotesk text-[14px] text-black/80 lg:text-[16px]">
            <span className="text-black/50">Blogs</span>
            <span className="mx-1.5 text-black/30">/</span>
            <span className="text-black/50">Media</span>
            <span className="mx-1.5 text-black/30">/</span>
            <span className="text-black/50">{mediaCategory(item.format)}</span>
            <span className="mx-1.5 text-black/30">/</span>
            <span className="underline underline-offset-4">{item.title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="shrink-0 text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ✕
          </button>
        </div>

        {/* Body: video + details */}
        <div className="grid grid-cols-1 gap-8 bg-[#e0e0d8] px-6 py-8 md:grid-cols-2 md:items-center md:gap-10 md:px-10 md:py-12">
          <div className="relative aspect-video w-full bg-black">
            {item.video ? (
              <iframe
                src={item.video}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black">
                  <PlayGlyph className="ml-0.5 h-8 w-8" />
                </span>
              </div>
            )}
          </div>

          <div className="text-black">
            <p className="font-grotesk text-[15px] text-black/70">{item.format}</p>
            <h2 className="mt-1 font-grotesk text-[24px] font-bold leading-tight md:text-[26px]">
              {item.title}
            </h2>
            <p className="mt-3 font-grotesk text-[15px] text-black/70">{item.source}</p>
            <p className="font-grotesk text-[15px] text-black/70">{item.detail}</p>

            <hr className="my-5 border-black/15" />
            <p className="font-grotesk text-[16px] font-bold">Description</p>
            <p className="mt-2 font-grotesk text-[15px] leading-[1.6] text-black/80">
              {item.description}
            </p>

            <hr className="my-5 border-black/15" />
            <p className="font-grotesk text-[16px] font-bold">Themes</p>
            <p className="mt-2 font-grotesk text-[15px] text-black/80">
              {item.themes.join(" / ")}
            </p>
          </div>
        </div>

        {/* Footer: pager */}
        <div className="flex items-center justify-between px-6 py-5 lg:px-10">
          <button
            type="button"
            onClick={prev}
            data-cursor="hover"
            className="font-grotesk text-[15px] font-medium text-accent transition-opacity hover:opacity-70 lg:text-[17px]"
          >
            &lt; Previous
          </button>
          <div className="flex items-center gap-2">
            {items.map((m, i) => (
              <button
                key={m.slug}
                type="button"
                aria-label={`Go to ${m.title}`}
                onClick={() => onNavigate(i)}
                data-cursor="hover"
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-accent" : "bg-black/20 hover:bg-black/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            data-cursor="hover"
            className="font-grotesk text-[15px] font-medium text-accent transition-opacity hover:opacity-70 lg:text-[17px]"
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
