"use client";

import { useCallback, useState } from "react";
import Image from "next/image";

function formatPublishedDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function shareHref(platform: "linkedin" | "x" | "threads", url: string): string {
  const encoded = encodeURIComponent(url);
  if (platform === "linkedin") {
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
  }
  if (platform === "x") {
    return `https://twitter.com/intent/tweet?url=${encoded}`;
  }
  return `https://www.threads.net/intent/post?text=${encoded}`;
}

function ShareIcon({ platform }: { platform: "linkedin" | "x" | "threads" }) {
  if (platform === "threads") {
    return (
      <Image
        src="/blog/share-threads-at.png"
        alt=""
        width={14}
        height={14}
        className="h-[14px] w-[14px] transition-[filter] group-hover:brightness-0 group-hover:invert"
        aria-hidden
      />
    );
  }
  if (platform === "linkedin") {
    return (
      <svg
        viewBox="0 0 14 14"
        aria-hidden
        className="h-[14px] w-[14px] transition-colors"
      >
        <path
          fill="currentColor"
          d="M3.2 1.7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM1.5 5.2h3.4v7.3H1.5V5.2Zm5.1 0h3.3v1c.5-.8 1.4-1.2 2.4-1.2 2.5 0 3 1.6 3 3.7v3.8h-3.4V9.4c0-.9 0-2-1.2-2s-1.4 1-1.4 2v3.1H6.6V5.2Z"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 14 14"
      aria-hidden
      className="h-[14px] w-[14px] transition-colors"
    >
      <path
        fill="currentColor"
        d="M8.4 6.1 12.8.8h-1.2L7.9 5.3 5.1.8H1.2l4.6 6.7L1.2 13h1.2l3.9-4.5 3.1 4.5h3.9L8.4 6.1Zm-1.6 1.8-.5-.7L2.8 2h1.6l3 4.2.5.7 4.5 6.3H9.8L6.8 7.9Z"
      />
    </svg>
  );
}

// Live faslebbie.com blog footer — beige default, black fill + white icon/text on hover.
const shareBtn =
  "group flex h-[31px] min-w-[33px] shrink-0 items-center justify-center border border-black bg-[#e3e3db] px-[14px] py-[8px] text-black transition-colors duration-150 hover:bg-black hover:text-white";

/** Figma 16:1581 — avatar, date · author, boxed share row. */
export default function BlogArticleFooter({
  publishedAt,
  authorName = "Fas Lebbie",
  authorAvatar,
  shareUrl,
}: {
  publishedAt?: string;
  authorName?: string;
  authorAvatar: string;
  shareUrl: string;
}) {
  const [copied, setCopied] = useState(false);

  const attribution = [
    publishedAt ? formatPublishedDate(publishedAt) : null,
    authorName ? `Written by ${authorName}` : null,
  ]
    .filter(Boolean)
    .join(" . ");

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }, [shareUrl]);

  return (
    <footer className="mx-auto flex w-full max-w-[420px] flex-col items-center gap-[14px] px-6 pb-16 pt-10 lg:max-w-[440px] lg:px-0 lg:pb-20 lg:pt-12">
      <div className="relative size-[49px] shrink-0 overflow-hidden bg-[#ebebeb]">
        <Image
          src={authorAvatar}
          alt={authorName ? `Photo of ${authorName}` : ""}
          fill
          sizes="49px"
          className="object-cover"
        />
      </div>

      {attribution ? (
        <p className="text-center font-grotesk text-[13px] leading-[1.2] text-[#4a4545]">
          {attribution}
        </p>
      ) : null}

      <div className="flex w-full max-w-[289px] items-center gap-3">
        <span className="shrink-0 font-grotesk text-[12px] uppercase leading-none tracking-wide text-black">
          Share
        </span>
        <div className="flex min-w-0 flex-1 items-stretch [&>*+*]:-ml-px">
          {(["linkedin", "x", "threads"] as const).map((platform) => (
            <a
              key={platform}
              href={shareHref(platform, shareUrl)}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className={shareBtn}
              aria-label={`Share on ${platform === "x" ? "X" : platform.charAt(0).toUpperCase() + platform.slice(1)}`}
            >
              <ShareIcon platform={platform} />
            </a>
          ))}
          <button
            type="button"
            onClick={onCopy}
            data-cursor="hover"
            className={`${shareBtn} font-grotesk text-[11px] uppercase leading-none tracking-wide ${copied ? "bg-black text-white" : ""}`}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </footer>
  );
}
