"use client";

import { useMemo } from "react";

import { NavPill } from "@/components/InlineToken";
import type { HomeHeroSegment } from "@/lib/homeFromSanity";

type Token =
  | { kind: "word"; text: string }
  | { kind: "space"; text: string }
  | { kind: "keyword"; href: string; text: string }
  | { kind: "story"; text: string; href: string };

function tokenize(segments: HomeHeroSegment[], storyHref: string): Token[] {
  const tokens: Token[] = [];
  for (const segment of segments) {
    if (segment.type === "keyword") {
      tokens.push({
        kind: "keyword",
        href: segment.href,
        text: segment.text,
      });
    } else if (segment.type === "story") {
      tokens.push({
        kind: "story",
        text: segment.text,
        href: segment.href ?? storyHref,
      });
    } else {
      for (const part of segment.text.split(/(\s+)/)) {
        if (!part) continue;
        tokens.push({ kind: /\s/.test(part) ? "space" : "word", text: part });
      }
    }
  }
  return tokens;
}

/**
 * The interactive hero paragraph: the self-description whose red keywords now
 * navigate straight to their internal page (Israel 06/22 — "no dropdown
 * anymore… it takes you directly to the page"). Each keyword links to its
 * section, styled per the "Navigate to internal page" legend (823:70182): red
 * text on a grey pill that turns black w/ white text on hover.
 *
 * Below `md` the size comes from `--hero-para-size`, which V2Hero shrinks to
 * whatever actually fits the phone's viewport — the hero holds the paragraph in
 * a non-scrolling box, so at 28px a short screen simply cut the first and last
 * lines off with no way to reach them.
 */
export default function HeroParagraph({
  className = "",
  storyHref = "/about",
  segments,
}: {
  className?: string;
  /** Where "And there's more to my story+." links when a mark has no href. */
  storyHref?: string;
  /** Sanity-driven segments only (empty Studio = empty paragraph). */
  segments: HomeHeroSegment[];
}) {
  const tokens = useMemo(
    () => tokenize(segments, storyHref),
    [segments, storyHref],
  );

  return (
    <div
      className={`home-hero-prose text-(length:--hero-para-size,28px) md:text-[36px] lg:text-[42px] ${className}`}
    >
      {tokens.map((token, i) => {
        if (token.kind === "space") return <span key={i}> </span>;
        if (token.kind === "word") return <span key={i}>{token.text}</span>;
        // Every hero keyword navigates to another page → the red pill.
        return (
          <NavPill key={i} href={token.href}>
            {token.text}
          </NavPill>
        );
      })}
    </div>
  );
}
