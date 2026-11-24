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

  // Below lg: a little space above "More to my story." when it wraps onto its
  // own line (Fas, Nov 23 call: "give it space a little bit"; Xian, Nov 24:
  // only when wrapped — inline after the last word, as on Fas's iPhone, stays
  // exactly as it is). CSS only, so nothing moves after load: a zero-width
  // strut glued to the word before the pill makes THAT word's line 10px
  // deeper. Wrapped, that line is the one above the pill → 10px gap. Inline,
  // it's the last line → 10px below it, which the paragraph's -10px bottom
  // margin takes back, so the page lays out exactly as before.
  const n = tokens.length;
  const strutAt =
    tokens[n - 1]?.kind === "story" &&
    tokens[n - 2]?.kind === "space" &&
    tokens[n - 3]?.kind === "word"
      ? n - 3
      : -1;

  return (
    <div
      className={`home-hero-prose text-(length:--hero-para-size,28px) md:text-[36px] lg:text-[42px] ${
        strutAt >= 0 ? "max-lg:-mb-[10px]" : ""
      } ${className}`}
    >
      {tokens.map((token, i) => {
        if (token.kind === "space") return <span key={i}> </span>;
        if (token.kind === "word")
          return (
            <span key={i}>
              {token.text}
              {i === strutAt ? (
                <span
                  aria-hidden
                  className="hidden w-0 select-none pb-[10px] align-top max-lg:inline-block"
                >
                  {"​"}
                </span>
              ) : null}
            </span>
          );
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
