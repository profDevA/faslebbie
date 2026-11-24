"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import type { MediaFeatured, MediaItem } from "@/lib/blogs";
import { hiResUrl } from "@/sanity/image";

const DEFAULT_HERO = "/media/design-again-hero.png";
const HERO_DISPLAY_W = 1400;

/**
 * Videos shown before "See More" (Fas, Nov 23 call #6: "two or three videos
 * here, and then three down, and then another three, and then see more").
 * 6 = two rows of 3 on desktop ≥ 1280, three rows of 2 at 1024–1279 and on
 * phones / tablets. Any number of talks can come from Studio; with 6 or fewer
 * there is no button.
 */
const MEDIA_TALKS_SHOWN = 6;

function MediaPlayOverlay({ className = "size-[52px]" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      fill="none"
      aria-hidden
      className={`relative shrink-0 transition-transform group-hover:scale-105 ${className}`}
    >
      <circle cx="26" cy="26" r="26" fill="#010916" fillOpacity="0.4" />
      <path
        d="M38.0999 24.5273C39.4535 25.2608 39.5055 27.1846 38.1935 27.9901L21.957 37.9588C20.6449 38.7644 18.9529 37.8475 18.9113 36.3085L18.3964 17.2629C18.3548 15.7238 19.9948 14.7169 21.3485 15.4504L38.0999 24.5273Z"
        fill="white"
      />
    </svg>
  );
}

// No underline: part of the blurb was underlined like a link but wasn't one
// (mobile QA M18; Fas, Nov 23 call: "it should not be underlined"). Same p
// classes as before, so the lines sit where they did.
function FeaturedBlurb({ text }: { text: string }) {
  return (
    <p className="text-[14px] font-normal capitalize leading-[1.35] text-black lg:text-[18px]">
      {text}
    </p>
  );
}

function splitTalkColumns(talks: MediaItem[], count = 2): MediaItem[][] {
  const cols: MediaItem[][] = Array.from({ length: count }, () => []);
  talks.forEach((item, i) => cols[i % count]!.push(item));
  return cols;
}

/** Talk and podcast titles: italic, underlined, red while the card is hovered
 *  (Fas, Nov 23 call: the podcast title gets the talk-title treatment). */
const MEDIA_TITLE =
  "italic underline decoration-1 underline-offset-2 transition-colors group-hover:text-accent";

function TalkCard({
  item,
  order,
  onClick,
}: {
  item: MediaItem;
  /** Position in the Studio list — orders the cards in the desktop grid. */
  order: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      style={{ order }}
      className="group flex w-full max-w-[190px] flex-col text-left lg:max-w-[333px]"
    >
      {/* Desktop: the Figma 333 × 260 box, now scaled to the grid column. */}
      <div className="relative flex aspect-[190/191] w-full items-center justify-center overflow-hidden bg-white lg:aspect-[333/260]">
        {item.thumb ? (
          <Image
            src={item.thumb}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : null}
        <MediaPlayOverlay />
      </div>
      <p className={`mt-2.5 text-[14px] font-normal capitalize leading-[1.35] text-black ${MEDIA_TITLE} lg:mt-2.5 lg:text-[18px]`}>
        {item.title}
      </p>
      <p className="mt-[15px] text-[13px] font-normal capitalize leading-[1.35] text-black lg:text-[18px]">
        {item.platform} · {item.year}
      </p>
    </button>
  );
}

/**
 * Phones / tablets (< 1024): Figma 3330:17914 — two independent columns
 * (round-robin), not a row-aligned grid; unchanged.
 * Desktop (Nov 24, call #6): the column wrappers turn into `display: contents`
 * and the cards become one row-aligned grid — 2 per row at 1024–1279, 3 per
 * row from 1280 — kept in the Studio order by each card's `order`.
 */
function TalkGrid({
  talks,
  onOpenTalk,
}: {
  talks: MediaItem[];
  onOpenTalk: (talkIndex: number) => void;
}) {
  const columns = splitTalkColumns(talks, 2);

  return (
    <div className="flex w-full items-start justify-center gap-2.5 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-[33px] xl:grid-cols-3">
      {columns.map((col, colIndex) => (
        <div
          key={colIndex}
          className={`flex min-w-0 flex-1 flex-col gap-[18px] lg:contents ${
            colIndex === 0 ? "items-end" : "items-start"
          }`}
        >
          {col.map((item, rowIndex) => {
            const talkIndex = colIndex + rowIndex * 2;
            return (
              <TalkCard
                key={item.slug}
                item={item}
                order={talkIndex}
                onClick={() => onOpenTalk(talkIndex)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * The talk grid plus "See More" / "See Less" (same text button as Teaching's
 * "See All Student Projects"). See More opens the rest in place; See Less
 * keeps the button where it was on screen (like case-study Load Less, mobile
 * QA R3), so you aren't left far below the shorter list.
 */
function TalkList({
  talks,
  onOpenTalk,
  expanded,
  onExpandedChange,
  className = "",
}: {
  talks: MediaItem[];
  onOpenTalk: (talkIndex: number) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  className?: string;
}) {
  const toggleRef = useRef<HTMLButtonElement>(null);
  const lessTop = useRef<number | null>(null);

  useLayoutEffect(() => {
    const top = lessTop.current;
    const btn = toggleRef.current;
    if (top == null || expanded || !btn) return;
    lessTop.current = null;
    const d = btn.getBoundingClientRect().top - top;
    if (Math.abs(d) >= 1) window.scrollBy({ top: d, behavior: "instant" });
  }, [expanded]);

  const hasMore = talks.length > MEDIA_TALKS_SHOWN;
  // The first N are a prefix of the Studio list, so a card's index (and its
  // /blogs/media/<talk> popup) is the same collapsed or expanded.
  const shown = hasMore && !expanded ? talks.slice(0, MEDIA_TALKS_SHOWN) : talks;

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <TalkGrid talks={shown} onOpenTalk={onOpenTalk} />
      {hasMore ? (
        <div className="mt-14 flex justify-center pb-8">
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={expanded}
            onClick={(e) => {
              if (expanded) {
                lessTop.current = e.currentTarget.getBoundingClientRect().top;
              }
              onExpandedChange(!expanded);
            }}
            data-cursor="hover"
            className="reckless-prose text-[22px] font-normal text-black underline decoration-from-font underline-offset-4 lg:text-[27px]"
          >
            {expanded ? "See Less" : "See More"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function FeaturedCard({
  featured,
  onClick,
}: {
  featured: MediaFeatured;
  onClick: () => void;
}) {
  const heroSrc =
    hiResUrl(featured.heroImage?.trim(), HERO_DISPLAY_W) || DEFAULT_HERO;

  // Desktop: 40 % of the row (was a fixed 687 px, which with the 684 px talks
  // overflowed a 1440 window with a classic scrollbar by 22 px), and it stays
  // in view while the videos beside it scroll (Fas, Nov 23 call: "I want the
  // podcast to stay always here").
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      className="group flex w-full flex-col gap-2.5 text-left lg:sticky lg:top-[114px] lg:w-[40%] lg:max-w-[687px] lg:shrink-0 lg:gap-[13px]"
    >
      <div className="relative aspect-[390/374] w-full overflow-hidden bg-[#d9d9d9] lg:aspect-[703/674]">
        <Image
          src={heroSrc}
          alt={featured.title}
          fill
          priority
          quality={90}
          sizes="(max-width: 1024px) 100vw, 687px"
          className="object-cover transition-opacity group-hover:opacity-95"
        />
      </div>
      <div className="flex w-full flex-col gap-2 capitalize not-italic lg:gap-[15px]">
        <p className={`text-[14px] font-normal leading-[0.91] text-black ${MEDIA_TITLE} lg:text-[18px]`}>
          {featured.title}
        </p>
        {featured.listingBlurb ? (
          <FeaturedBlurb text={featured.listingBlurb} />
        ) : null}
        {/* Studio "Tag line" — empty = no line (Fas, Nov 23: drop "Podcast · Ongoing"). */}
        {featured.tag ? (
          <p className="text-[13px] font-normal leading-[1.35] text-black lg:text-[18px]">
            {featured.tag}
          </p>
        ) : null}
      </div>
    </button>
  );
}

/** Figma 3323:9065 desktop / 3330:17914 mobile — podcast hero + talk grid. */
export default function MediaBody({
  featured,
  talks,
  onOpenFeatured,
  onOpenTalk,
  expanded,
  onExpandedChange,
}: {
  featured: MediaFeatured | null;
  talks: MediaItem[];
  onOpenFeatured: () => void;
  onOpenTalk: (talkIndex: number) => void;
  /** See More open — held by the page, because closing a talk popup
   *  remounts this list and would fold it back to the first rows. */
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  if (!featured && !talks.length) {
    return (
      <p className="reckless-prose text-center text-[15px] font-normal leading-relaxed text-black/55">
        Media will appear here once added in Studio → Blogs &amp; Media → Media.
      </p>
    );
  }

  if (!featured) {
    return (
      <TalkList
        talks={talks}
        onOpenTalk={onOpenTalk}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
        className="reckless-prose max-w-[1408px] lg:max-w-none"
      />
    );
  }

  return (
    <div className="reckless-prose flex w-full max-w-[1397px] flex-col gap-3 pt-10 max-md:gap-2 lg:flex-row lg:items-start lg:gap-[28px] lg:pt-16">
      <FeaturedCard featured={featured} onClick={onOpenFeatured} />
      {talks.length ? (
        <TalkList
          talks={talks}
          onOpenTalk={onOpenTalk}
          expanded={expanded}
          onExpandedChange={onExpandedChange}
          className="lg:min-w-0 lg:flex-1"
        />
      ) : null}
    </div>
  );
}
