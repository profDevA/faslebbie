"use client";

import { useMemo } from "react";
import Link from "next/link";

import {
  defaultHomeSegments,
  type HomeHeroSegment,
} from "@/lib/homeFromSanity";

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
 */
export default function HeroParagraph({
  className = "",
  storyHref = "/about",
  segments,
}: {
  className?: string;
  /** Where "And there's more to my story+." links when a mark has no href. */
  storyHref?: string;
  /** Sanity-driven segments; falls back to in-code home copy. */
  segments?: HomeHeroSegment[];
}) {
  const tokens = useMemo(
    () => tokenize(segments ?? defaultHomeSegments(), storyHref),
    [segments, storyHref],
  );

  // Figma "Component Interaction" legend (823:70182) → "Navigate to internal
  // page": red text on a light-grey rounded pill that fills to BLACK with white
  // text on hover/click. Same treatment as the About-page internal-link pills.
  // box-decoration-clone keeps the rounded pill intact if it wraps across lines.
  const pillClass =
    "mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-accent text-shadow-token transition-colors duration-200 hover:bg-black hover:text-white hover:text-shadow-none";

  return (
    <div
      className={`font-grotesk text-[28px] font-medium leading-[1.55] tracking-[0.04em] md:text-[36px] lg:text-[42px] ${className}`}
    >
      {tokens.map((token, i) => {
        if (token.kind === "space") return <span key={i}> </span>;
        if (token.kind === "word") return <span key={i}>{token.text}</span>;
        if (token.kind === "story") {
          return (
            <Link key={i} href={token.href} data-cursor="hover" className={pillClass}>
              {token.text}
            </Link>
          );
        }
        return (
          <Link
            key={i}
            href={token.href}
            data-cursor="hover"
            className={pillClass}
          >
            {token.text}
          </Link>
        );
      })}
    </div>
  );
}
