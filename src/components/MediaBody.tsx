"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import type { MediaFeatured, MediaItem } from "@/lib/blogs";
import { STICKY_UNDER_NAV } from "@/lib/navLayout";
import { hiResUrl } from "@/sanity/image";

const DEFAULT_HERO = "/media/design-again-hero.png";
const HERO_DISPLAY_W = 1400;

/**
 * Phones / tablets (< 1024) only: videos shown before "See More" (Fas, Nov 23
 * call #6) = three rows of 2. With 6 or fewer talks there is no button.
 * Desktop shows every talk and has no button since the Nov 24 evening call
 * (Fas + Xian: "you just scroll" — the right column scrolls beside the fixed
 * podcast panel, Figma Final Cleanup 1392:16974).
 */
const MEDIA_TALKS_SHOWN = 6;

/**
 * Desktop podcast panel (Xian, Nov 25): at the top of the page it rests under
 * the tabs; scrolling, it rises with the page and locks right under the site
 * nav (STICKY_UNDER_NAV = top NAV_H_PX 82), then fills the window from the nav
 * down (100svh − 82) while the talks scroll past it. Was locked at its resting
 * 270 px, which left an empty band above it once the tabs scrolled away, and
 * made it a wide landscape box that cut the art's bottom on wide windows.
 */
const FEATURED_PANEL_DESKTOP = `${STICKY_UNDER_NAV} lg:h-[calc(100svh-82px)] lg:w-1/2 lg:shrink-0`;

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
// classes as before, so the lines sit where they did. Desktop: white italic on
// the podcast art (Figma 1392:16974; not bold — Fas, Nov 24 evening).
function FeaturedBlurb({ text }: { text: string }) {
  return (
    <p className="text-[14px] font-normal capitalize leading-[1.35] text-black lg:text-[18px] lg:italic lg:text-white">
      {text}
    </p>
  );
}

function splitTalkColumns(talks: MediaItem[], count = 2): MediaItem[][] {
  const cols: MediaItem[][] = Array.from({ length: count }, () => []);
  talks.forEach((item, i) => cols[i % count]!.push(item));
  return cols;
}

/** Podcast title (and the phone talk titles): italic, underlined, red while
 *  the card is hovered (Fas, Nov 23 call: the podcast title gets the
 *  talk-title treatment). */
const MEDIA_TITLE =
  "italic underline decoration-1 underline-offset-2 transition-colors group-hover:text-accent";

/**
 * Phones / tablets (< 1024): title (underlined, red on hover) over a plain
 * "platform · year" line — unchanged.
 * Desktop (Fas, Nov 24 evening, Figma 1392:16997 — "this goes up … this
 * becomes the line"): "platform · year" moves up, 10 px under the thumbnail,
 * italic + underlined + red on hover; the title sits 15 px under it, italic,
 * no underline. Platform · year 18 / 1.35; the title 16 / 1.35 (Fas, Nov 25
 * call: "it's italics and it should be smaller"). Flipped with `order` so the
 * phone DOM and spacing stay as they were.
 */
function TalkCard({
  item,
  order,
  hiddenOnPhones = false,
  onClick,
}: {
  item: MediaItem;
  /** Position in the Studio list — orders the cards in the desktop grid. */
  order: number;
  /** Past MEDIA_TALKS_SHOWN while See More is closed (phones / tablets only). */
  hiddenOnPhones?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      style={{ order }}
      className={`group flex w-full max-w-[190px] flex-col text-left lg:max-w-none ${
        hiddenOnPhones ? "max-lg:hidden" : ""
      }`}
    >
      {/* Desktop: the Figma 333 × 260 box, scaled to the grid column. */}
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
      <p className="mt-2.5 text-[14px] font-normal capitalize italic leading-[1.35] text-black transition-colors max-lg:underline max-lg:decoration-1 max-lg:underline-offset-2 max-lg:group-hover:text-accent lg:order-2 lg:mt-[15px] lg:text-[16px]">
        {item.title}
      </p>
      <p className="mt-[15px] text-[13px] font-normal capitalize leading-[1.35] text-black lg:order-1 lg:mt-2.5 lg:text-[18px] lg:italic lg:underline lg:decoration-1 lg:underline-offset-2 lg:transition-colors lg:group-hover:text-accent">
        {item.platform} · {item.year}
      </p>
    </button>
  );
}

/**
 * Phones / tablets (< 1024): Figma 3330:17914 — two independent columns
 * (round-robin), not a row-aligned grid; unchanged.
 * Desktop (Figma 1392:16974, Nov 24 evening; 2 per row — Xian): the column
 * wrappers turn into `display: contents` and the cards become one row-aligned
 * grid of 2, kept in the Studio order by each card's `order`. Gaps are the
 * 1440 frame's 27 / 33 px, scaled down with the window below 1440.
 */
function TalkGrid({
  talks,
  phonesShown,
  onOpenTalk,
}: {
  talks: MediaItem[];
  /** Phones / tablets show only this many (See More closed). */
  phonesShown: number;
  onOpenTalk: (talkIndex: number) => void;
}) {
  const columns = splitTalkColumns(talks, 2);

  return (
    <div className="flex w-full items-start justify-center gap-2.5 lg:grid lg:grid-cols-2 lg:gap-x-[min(1.875vw,27px)] lg:gap-y-[min(2.29vw,33px)]">
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
                hiddenOnPhones={talkIndex >= phonesShown}
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
 * The talk grid plus, on phones / tablets, "See More" / "See Less" (same text
 * button as Teaching's "See All Student Projects"). See More opens the rest in
 * place; See Less keeps the button where it was on screen (like case-study
 * Load Less, mobile QA R3), so you aren't left far below the shorter list.
 * Desktop always shows every talk and never the button (Nov 24 evening).
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
  // Every talk is rendered; while See More is closed, phones / tablets hide
  // the ones past the first N with CSS (desktop shows them all). The first N
  // are a prefix of the Studio list, so a card's index (and its
  // /blogs/media/<talk> popup) is the same collapsed or expanded.
  const phonesShown = hasMore && !expanded ? MEDIA_TALKS_SHOWN : talks.length;

  return (
    <div className={`flex w-full flex-col ${className}`}>
      <TalkGrid talks={talks} phonesShown={phonesShown} onOpenTalk={onOpenTalk} />
      {hasMore ? (
        <div className="mt-14 flex justify-center pb-8 lg:hidden">
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

  // Phones / tablets: art, then the text under it — unchanged.
  // Desktop (Figma Final Cleanup 1392:16974, Fas, Nov 24 evening): the left
  // half of the window, flush with its left edge, fixed while the talks
  // scroll ("like Build, where the left is fixed"); the art covers the panel,
  // a white "Featured" chip top-left (Figma 1392:17072: 101 × 30 at 17 / 35),
  // title + blurb in white on the art, bottom-left (27 in, 54 up).
  // Text pinned (Xian, Nov 25 — "go with pinning the text"): at the top of
  // the page the panel runs below the window, so the art is a layer behind
  // and the text block is the panel's last row, sticky 54 px above the window
  // bottom; once the panel locks under the nav it rests 54 px above the
  // panel's own bottom, as before. CSS only.
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      className={`group flex w-full flex-col gap-2.5 text-left lg:justify-end lg:gap-0 ${FEATURED_PANEL_DESKTOP}`}
    >
      <div className="relative aspect-[390/374] w-full overflow-hidden bg-[#d9d9d9] lg:absolute lg:inset-0 lg:aspect-auto">
        <Image
          src={heroSrc}
          alt={featured.title}
          fill
          priority
          quality={90}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-opacity group-hover:opacity-95"
        />
        <span className="absolute left-[17px] top-[35px] hidden bg-white px-5 py-1.5 text-[15px] leading-[18px] text-black lg:block">
          Featured
        </span>
      </div>
      <div className="flex w-full flex-col gap-2 capitalize not-italic lg:sticky lg:bottom-[54px] lg:mx-[27px] lg:mb-[54px] lg:w-auto lg:max-w-[min(32vw,460px)] lg:gap-[15px]">
        <p className={`text-[14px] font-normal leading-[0.91] text-black ${MEDIA_TITLE} lg:text-[18px] lg:leading-[1.35] lg:text-white`}>
          {featured.title}
        </p>
        {featured.listingBlurb ? (
          <FeaturedBlurb text={featured.listingBlurb} />
        ) : null}
        {/* Studio "Tag line" — empty = no line (Fas, Nov 23: drop "Podcast · Ongoing"). */}
        {featured.tag ? (
          <p className="text-[13px] font-normal leading-[1.35] text-black lg:text-[18px] lg:text-white">
            {featured.tag}
          </p>
        ) : null}
      </div>
    </button>
  );
}

/**
 * Desktop: Figma Final Cleanup 1392:16974 (Nov 24 evening) — podcast panel on
 * the left half, talks 2 per row on the right half (at 1440: 14 in from the
 * middle, 13 from the right edge, cards 333). Needs the page's media <main>
 * to run edge to edge (BlogsBody). Phones / tablets: Figma 3330:17914.
 */
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
    <div className="reckless-prose flex w-full max-w-[1397px] flex-col gap-3 pt-10 max-md:gap-2 lg:max-w-none lg:flex-row lg:items-start lg:gap-0 lg:pt-16">
      <FeaturedCard featured={featured} onClick={onOpenFeatured} />
      {talks.length ? (
        <TalkList
          talks={talks}
          onOpenTalk={onOpenTalk}
          expanded={expanded}
          onExpandedChange={onExpandedChange}
          className="lg:min-w-0 lg:flex-1 lg:pb-16 lg:pl-[min(0.97vw,14px)] lg:pr-[min(0.9vw,13px)]"
        />
      ) : null}
    </div>
  );
}
