"use client";

import { useMemo } from "react";
import Link from "next/link";
import { heroSegments, panels, type HeroSegment, type SectionId } from "@/lib/content";

type Token =
  | { kind: "word"; text: string }
  | { kind: "space"; text: string }
  | { kind: "keyword"; id: SectionId; text: string }
  | { kind: "story"; text: string };

function tokenize(segments: HeroSegment[]): Token[] {
  const tokens: Token[] = [];
  for (const segment of segments) {
    if (segment.type === "keyword") {
      tokens.push({ kind: "keyword", id: segment.id, text: segment.text });
    } else if (segment.type === "story") {
      tokens.push({ kind: "story", text: segment.text });
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
}: {
  className?: string;
  /** Where "And there's more to my story+." links. v2 passes "#about". */
  storyHref?: string;
}) {
  const tokens = useMemo(() => tokenize(heroSegments), []);

  const pillClass =
    "mx-[-0.05em] box-decoration-clone rounded-full bg-pill px-[0.25em] leading-[1.2] text-accent text-shadow-token transition-colors duration-200 hover:bg-black hover:text-white hover:[text-shadow:none]";

  return (
    <div
      className={`font-grotesk text-[28px] font-medium leading-[1.55] tracking-[0.04em] md:text-[36px] lg:text-[42px] ${className}`}
    >
      {tokens.map((token, i) => {
        if (token.kind === "space") return <span key={i}> </span>;
        if (token.kind === "word") return <span key={i}>{token.text}</span>;
        if (token.kind === "story") {
          return (
            <Link key={i} href={storyHref} data-cursor="hover" className={pillClass}>
              {token.text}
            </Link>
          );
        }
        return (
          <Link
            key={i}
            href={panels[token.id].cta.href}
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
