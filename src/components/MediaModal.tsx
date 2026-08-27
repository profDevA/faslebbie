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
        { label: "Words + Media", href: "/blogs?view=media", hideOnMobile: true },
        { label: "Media", href: "/blogs?view=media", hideOnMobile: true },
        { label: mediaCategory(item.format) },
        { label: item.title },
      ]}
      bodyRef={shellScrollRef}
      bodyClassName="reckless-prose grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:overflow-hidden"
      footerClassName="reckless-prose"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between">
          <PopupPagerButton onClick={prev}>{"< Previous"}</PopupPagerButton>
          <PopupDots
            className="flex"
            count={n}
            active={index!}
            onSelect={onNavigate}
            labelFor={(i) => `Go to ${items[i].title}`}
          />
          <PopupPagerButton onClick={next}>{"Next >"}</PopupPagerButton>
        </div>
      }
    >
      <div className="order-1 bg-close px-[21px] pt-14 pb-12 lg:flex lg:h-full lg:items-center lg:px-[50px] lg:py-[50px]">
        <div className="relative aspect-[317/369] w-full overflow-hidden bg-[#0f0d08] lg:aspect-video">
          {item.videoFile ? (
            <video
              src={item.videoFile}
              poster={item.thumb}
              controls
              playsInline
              className="size-full object-cover"
            />
          ) : item.video ? (
            <iframe
              src={item.video}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span className="flex size-[75px] items-center justify-center rounded-full bg-white/90 text-black">
                <PlayGlyph className="ml-0.5 h-8 w-8" />
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        ref={rightScrollRef}
        className="order-2 bg-close px-[21px] pb-12 pt-0 text-black lg:flex lg:h-full lg:items-center lg:overflow-y-auto lg:px-[50px] lg:py-[50px]"
      >
        <div className="reckless-prose flex w-full flex-col gap-[15px] lg:mx-auto lg:max-w-[420px]">
          <div className="border-b border-black pb-3">
            <p className="text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black">
              {item.format}
            </p>
            <h2 className="mt-1 text-[24px] font-normal capitalize leading-[1.28] tracking-[0.38px] text-black">
              {item.title}
            </h2>
            <div className="mt-3 text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black italic lg:not-italic">
              <p>{item.source}</p>
              <p>{item.detail}</p>
            </div>
          </div>
          <div className="border-b border-black pb-3">
            <p className="text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black">
              Description
            </p>
            <p className="mt-3 text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black">
              {item.description}
            </p>
          </div>
          <div className="border-b border-black pb-3">
            <p className="text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black">
              Themes
            </p>
            <p className="mt-3 text-[18px] font-normal leading-[1.6] tracking-[0.38px] text-black">
              {item.themes.join(" / ")}
            </p>
          </div>
        </div>
      </div>
    </PopupShell>
  );
}
