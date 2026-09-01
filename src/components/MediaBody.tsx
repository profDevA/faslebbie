"use client";

import Image from "next/image";
import type { MediaFeatured, MediaItem } from "@/lib/blogs";
import { hiResUrl } from "@/sanity/image";

const DEFAULT_HERO = "/media/design-again-hero.png";
const HERO_DISPLAY_W = 1400;

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

function FeaturedBlurb({ text }: { text: string }) {
  const split = text.match(/^(.*?)(schools,.*)$/i);
  if (!split) {
    return (
      <p className="text-[14px] font-normal capitalize leading-[1.35] text-black lg:text-[18px] lg:leading-[1.09]">
        {text}
      </p>
    );
  }

  return (
    <p className="text-[14px] font-normal capitalize leading-[1.35] text-black lg:text-[18px]">
      <span className="leading-[0.91] lg:leading-[1.09]">{split[1]}</span>
      <span className="underline decoration-1 underline-offset-2">
        {split[2]}
      </span>
    </p>
  );
}

function splitTalkColumns(talks: MediaItem[], count = 2): MediaItem[][] {
  const cols: MediaItem[][] = Array.from({ length: count }, () => []);
  talks.forEach((item, i) => cols[i % count]!.push(item));
  return cols;
}

function TalkCard({
  item,
  onClick,
}: {
  item: MediaItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      className="group flex w-full max-w-[190px] flex-col text-left lg:max-w-[333px]"
    >
      <div className="relative flex aspect-[190/191] w-full items-center justify-center overflow-hidden bg-white lg:aspect-[333/260] lg:h-[260px] lg:aspect-auto">
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
      <p className="mt-2.5 text-[14px] font-normal italic capitalize leading-[1.35] text-black underline decoration-1 underline-offset-2 transition-colors group-hover:text-accent lg:mt-2.5 lg:text-[18px]">
        {item.title}
      </p>
      <p className="mt-[15px] text-[13px] font-normal capitalize leading-[1.35] text-black lg:text-[18px]">
        {item.platform} · {item.year}
      </p>
    </button>
  );
}

/** Figma 3330:17914 — two independent columns (round-robin), not row-aligned grid. */
function TalkMasonry({
  talks,
  onOpenTalk,
  className = "",
}: {
  talks: MediaItem[];
  onOpenTalk: (talkIndex: number) => void;
  className?: string;
}) {
  const columns = splitTalkColumns(talks, 2);

  return (
    <div
      className={`flex w-full items-start justify-center gap-2.5 lg:gap-8 ${className}`}
    >
      {columns.map((col, colIndex) => (
        <div
          key={colIndex}
          className={`flex min-w-0 flex-1 flex-col gap-[18px] lg:max-w-[333px] lg:gap-[33px] ${
            colIndex === 0 ? "items-end lg:items-start" : "items-start"
          }`}
        >
          {col.map((item, rowIndex) => {
            const talkIndex = colIndex + rowIndex * 2;
            return (
              <TalkCard
                key={item.slug}
                item={item}
                onClick={() => onOpenTalk(talkIndex)}
              />
            );
          })}
        </div>
      ))}
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

  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      className="group flex w-full flex-col gap-2.5 text-left lg:max-w-[687px] lg:shrink-0 lg:gap-[13px]"
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
        <p className="text-[14px] font-normal leading-[0.91] text-black lg:text-[18px]">
          {featured.title}
        </p>
        {featured.listingBlurb ? (
          <FeaturedBlurb text={featured.listingBlurb} />
        ) : null}
        <p className="text-[13px] font-normal leading-[1.35] text-black lg:text-[18px]">
          {featured.tag}
        </p>
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
}: {
  featured: MediaFeatured | null;
  talks: MediaItem[];
  onOpenFeatured: () => void;
  onOpenTalk: (talkIndex: number) => void;
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
      <TalkMasonry
        talks={talks}
        onOpenTalk={onOpenTalk}
        className="reckless-prose max-w-[1408px] lg:max-w-none"
      />
    );
  }

  return (
    <div className="reckless-prose flex w-full max-w-[1397px] flex-col gap-[17px] pt-10 lg:flex-row lg:items-start lg:gap-[28px] lg:pt-16">
      <FeaturedCard featured={featured} onClick={onOpenFeatured} />
      {talks.length ? (
        <TalkMasonry
          talks={talks}
          onOpenTalk={onOpenTalk}
          className="lg:max-w-[684px] lg:shrink-0"
        />
      ) : null}
    </div>
  );
}
