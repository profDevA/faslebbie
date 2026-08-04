"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
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

  // Arrows page between items. (Escape / scroll lock live in the shell.)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onNavigate((index! - 1 + n) % n);
      if (e.key === "ArrowRight") onNavigate((index! + 1) % n);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, n, onNavigate]);

  if (!mounted || !open) return null;
  const item = items[index!];
  const prev = () => onNavigate((index! - 1 + n) % n);
  const next = () => onNavigate((index! + 1) % n);

  return (
    <PopupShell
      onClose={onClose}
      label={item.title}
      crumbs={[
        { label: "Blogs", hideOnMobile: true },
        { label: "Media", hideOnMobile: true },
        { label: mediaCategory(item.format), hideOnMobile: true },
        { label: item.title },
      ]}
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between">
          <PopupPagerButton onClick={prev}>{"< Previous"}</PopupPagerButton>
          <PopupDots
            count={n}
            active={index!}
            onSelect={onNavigate}
            labelFor={(i) => `Go to ${items[i].title}`}
          />
          <PopupPagerButton onClick={next}>{"Next >"}</PopupPagerButton>
        </div>
      }
    >
      {/* Body: video + details */}
        <div className="grid min-h-full grid-cols-1 content-center gap-8 px-6 py-8 md:grid-cols-2 md:items-center md:gap-10 md:px-10 md:py-12">
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
    </PopupShell>
  );
}
