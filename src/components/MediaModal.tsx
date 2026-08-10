"use client";

import { useEffect, useRef, useState } from "react";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import { mediaCategory, type MediaItem } from "@/lib/blogs";

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M9 7.5v9l7-4.5-7-4.5z" />
    </svg>
  );
}

// Figma 318:6395 desktop / 16:1163 mobile. Shared PopupShell.
// Desktop: left player sticky, right details scroll.
// Mobile: player → details (single body scroll).
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
  const shellScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const open = index !== null;
  const n = items.length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onNavigate((index! - 1 + n) % n);
      if (e.key === "ArrowRight") onNavigate((index! + 1) % n);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, n, onNavigate]);

  useEffect(() => {
    if (!open) return;
    if (shellScrollRef.current) shellScrollRef.current.scrollTop = 0;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
  }, [index, open]);

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
      bodyRef={shellScrollRef}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
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
      {/* Player — first on mobile, left sticky on desktop. */}
      <div className="relative order-1 flex min-h-[220px] items-center justify-center bg-[#0f0d08] px-6 py-8 sm:min-h-[280px] lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-10">
        <div className="relative aspect-video w-full max-w-[560px] bg-black">
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
      </div>

      {/* Details — second on mobile, right scroll on desktop. */}
      <div
        ref={rightScrollRef}
        className="order-2 min-h-0 bg-close px-6 py-10 text-black lg:overflow-y-auto lg:px-12 lg:py-14"
      >
        <div className="mx-auto w-full max-w-[420px]">
          <p className="font-grotesk text-[15px] text-black/70 lg:text-[18px]">
            {item.format}
          </p>
          <h2 className="mt-1 font-grotesk text-[24px] font-medium leading-tight capitalize lg:text-[26px]">
            {item.title}
          </h2>
          <p className="mt-3 font-grotesk text-[15px] italic text-black/70 lg:text-[18px]">
            {item.source}
          </p>
          <p className="font-grotesk text-[15px] italic text-black/70 lg:text-[18px]">
            {item.detail}
          </p>

          <hr className="my-5 border-black/15" />
          <p className="font-grotesk text-[16px] font-medium lg:text-[18px]">
            Description
          </p>
          <p className="mt-2 font-grotesk text-[15px] font-light leading-[1.6] text-black/80 lg:text-[18px]">
            {item.description}
          </p>

          <hr className="my-5 border-black/15" />
          <p className="font-grotesk text-[16px] font-medium lg:text-[18px]">
            Themes
          </p>
          <p className="mt-2 font-grotesk text-[15px] font-light text-black/80 lg:text-[18px]">
            {item.themes.join(" · ")}
          </p>
        </div>
      </div>
    </PopupShell>
  );
}
