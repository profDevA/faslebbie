"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import {
  mediaCategory,
  type MediaFeatured,
  type MediaItem,
} from "@/lib/blogs";

const DEFAULT_HERO = "/media/design-again-hero.png";

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M9 7.5v9l7-4.5-7-4.5z" />
    </svg>
  );
}

function DesignAgainPanel({ featured }: { featured: MediaFeatured }) {
  const heroSrc = featured.heroImage?.trim() || DEFAULT_HERO;

  return (
    <>
      <div className="relative min-h-[50vh] w-full lg:min-h-0 lg:h-full">
        <Image
          src={heroSrc}
          alt={featured.title}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>
      <div className="flex min-h-[320px] items-center justify-center bg-[#401717] px-6 py-12 text-[#f6b097] sm:px-10 lg:min-h-0 lg:h-full lg:px-12 lg:py-16">
        <div className="mx-auto flex max-w-[389px] flex-col items-center gap-3.5 text-center">
          <h2 className="font-grotesk text-[36px] leading-[1.09] tracking-[-0.55px] capitalize sm:text-[50px] sm:leading-[54px]">
            {featured.comingSoonTitle}
          </h2>
          <p className="font-grotesk text-[13px] font-light leading-[1.2] tracking-[-0.13px]">
            {featured.comingSoonBody}
          </p>
          {featured.earlyAccessUrl ? (
            <Link
              href={featured.earlyAccessUrl}
              className="font-grotesk text-[11px] font-light leading-[1.2] tracking-[-0.11px] underline underline-offset-2"
            >
              {featured.earlyAccessLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}

function TalkPanel({ item }: { item: MediaItem }) {
  return (
    <>
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
      <div className="order-2 bg-close px-[21px] pb-12 pt-0 text-black lg:flex lg:h-full lg:items-center lg:overflow-y-auto lg:px-[50px] lg:py-[50px]">
        <div className="flex w-full flex-col gap-[15px] lg:mx-auto lg:max-w-[420px]">
          <div className="border-b border-black pb-3">
            <p className="font-grotesk text-[18px] leading-[1.6] tracking-[0.38px] text-black">
              {item.format}
            </p>
            <h2 className="mt-1 font-grotesk text-[24px] font-medium capitalize leading-[1.28] tracking-[0.38px] text-black">
              {item.title}
            </h2>
            <div className="mt-3 font-grotesk text-[18px] font-light leading-[1.6] tracking-[0.38px] text-black italic lg:not-italic">
              <p>{item.source}</p>
              <p>{item.detail}</p>
            </div>
          </div>
          {item.description ? (
            <div className="border-b border-black pb-3">
              <p className="font-grotesk text-[18px] font-medium leading-[1.6] tracking-[0.38px] text-black">
                Description
              </p>
              <p className="mt-3 font-grotesk text-[18px] font-light leading-[1.6] tracking-[0.38px] text-black">
                {item.description}
              </p>
            </div>
          ) : null}
          {item.themes.length ? (
            <div className="border-b border-black pb-3">
              <p className="font-grotesk text-[18px] font-medium leading-[1.6] tracking-[0.38px] text-black">
                Themes
              </p>
              <p className="mt-3 font-grotesk text-[18px] font-light leading-[1.6] tracking-[0.38px] text-black">
                {item.themes.join(" / ")}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** Figma 3323:10268 podcast popup + 318:6395 talk popup — one carousel. */
export default function MediaPopup({
  index,
  featured,
  talks,
  onNavigate,
  onClose,
}: {
  index: number | null;
  featured: MediaFeatured | null;
  talks: MediaItem[];
  onNavigate: (i: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shellScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const open = index !== null;
  const hasFeatured = Boolean(featured);
  const total = (hasFeatured ? 1 : 0) + talks.length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onNavigate((index! - 1 + total) % total);
      if (e.key === "ArrowRight") onNavigate((index! + 1) % total);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, index, total, onNavigate]);

  useEffect(() => {
    if (!open) return;
    if (shellScrollRef.current) shellScrollRef.current.scrollTop = 0;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
  }, [index, open]);

  if (!mounted || !open || index === null || total === 0) return null;

  const isPodcast = hasFeatured && index === 0;
  const talk = isPodcast
    ? null
    : talks[index - (hasFeatured ? 1 : 0)];

  if (!isPodcast && !talk) return null;

  const label = isPodcast ? featured!.title : talk!.title;
  const crumbs = isPodcast
    ? [
        { label: "Words + Media", hideOnMobile: true },
        { label: "Media", hideOnMobile: true },
        { label: featured!.title },
      ]
    : [
        { label: "Words + Media", hideOnMobile: true },
        { label: "Media", hideOnMobile: true },
        { label: mediaCategory(talk!.format) },
        { label: talk!.title },
      ];

  const prev = () => onNavigate((index - 1 + total) % total);
  const next = () => onNavigate((index + 1) % total);

  const bodyClassName = isPodcast
    ? "grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
    : "grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:overflow-hidden";

  return (
    <PopupShell
      onClose={onClose}
      label={label}
      crumbs={crumbs}
      bodyRef={shellScrollRef}
      bodyClassName={bodyClassName}
      footer={
        total > 1 ? (
          <div className="flex w-full max-w-[620px] items-center justify-between">
            <PopupPagerButton onClick={prev}>{"< Previous"}</PopupPagerButton>
            <PopupDots
              className="flex"
              count={total}
              active={index}
              onSelect={onNavigate}
              labelFor={(i) => {
                if (hasFeatured && i === 0) return `Go to ${featured!.title}`;
                const t = talks[i - (hasFeatured ? 1 : 0)];
                return t ? `Go to ${t.title}` : `Go to item ${i + 1}`;
              }}
            />
            <PopupPagerButton onClick={next}>{"Next >"}</PopupPagerButton>
          </div>
        ) : undefined
      }
    >
      {isPodcast && featured ? (
        <DesignAgainPanel featured={featured} />
      ) : talk ? (
        <TalkPanel item={talk} />
      ) : null}
    </PopupShell>
  );
}
