"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  heroSegments,
  panels,
  toolStackImage,
  type HeroSegment,
  type SectionId,
} from "@/lib/content";

type Token =
  | { kind: "word"; text: string }
  | { kind: "space"; text: string }
  | { kind: "keyword"; id: SectionId; text: string }
  | { kind: "story"; text: string };

// Split text segments into word/space tokens so we can measure line positions
// per word and insert the panel after the END of the keyword's line (the
// paragraph line stays intact, as in the Figma prototype).
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

function Panel({ id, onClose }: { id: SectionId; onClose: () => void }) {
  const panel = panels[id];
  return (
    <div className="block animate-[panel-in_0.25s_ease-out] py-5 text-left">
      <div className="mx-auto flex w-full max-w-[817px] flex-col gap-[13px] border-l-4 border-accent bg-panel px-[17px] py-[14px]">
        <p className="font-serif text-[20px] font-bold lowercase leading-[1.35] tracking-[0.05em]">
          {panel.title}
        </p>
        {panel.body.map((paragraph) => (
          <p
            key={paragraph}
            className="font-serif text-[16px] font-medium leading-[1.35] tracking-[0.06em]"
          >
            {paragraph}
          </p>
        ))}
        {panel.hasToolStack && (
          /* eslint-disable-next-line @next/next/no-img-element -- small static strip, no optimization needed */
          <img
            src={toolStackImage}
            alt="Tool stack: design and development tools"
            className="h-[18px] w-auto max-w-full self-start object-contain pt-0.5"
          />
        )}
        <div className="flex items-center gap-[19px] pt-1">
          <button
            type="button"
            onClick={onClose}
            data-cursor="hover"
            className="rounded-[18px] border border-hairline bg-close px-[17px] py-[3px] font-serif text-[16px] font-medium"
          >
            Close
          </button>
          <Link
            href={panel.cta.href}
            data-cursor="hover"
            className="font-serif text-[16px] font-medium text-accent underline underline-offset-2"
          >
            {panel.cta.label} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const tokens = useMemo(() => tokenize(heroSegments), []);
  const [active, setActive] = useState<SectionId | null>(null);
  // Token index after which the panel is inserted (= last token on the
  // keyword's visual line). null = not measured yet.
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const tokenRefs = useRef<(HTMLElement | null)[]>([]);

  const keywordIndex = active
    ? tokens.findIndex((t) => t.kind === "keyword" && t.id === active)
    : -1;

  useLayoutEffect(() => {
    if (keywordIndex < 0 || insertIndex !== null) return;
    const keywordEl = tokenRefs.current[keywordIndex];
    if (!keywordEl) return;
    // Compare vertical centers: the keyword button (inline-block) and plain
    // text spans report different box tops even on the same visual line.
    const keywordRect = keywordEl.getBoundingClientRect();
    const keywordCenter = keywordRect.top + keywordRect.height / 2;
    const sameLineTolerance = keywordRect.height / 2;
    let lastOnLine = keywordIndex;
    for (let i = keywordIndex + 1; i < tokens.length; i++) {
      const el = tokenRefs.current[i];
      if (!el) continue; // whitespace renders without an element
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      if (Math.abs(center - keywordCenter) < sameLineTolerance) {
        lastOnLine = i;
      } else {
        break;
      }
    }
    setInsertIndex(lastOnLine);
  }, [keywordIndex, insertIndex, tokens]);

  // Line breaks move on resize — re-measure while a panel is open.
  useEffect(() => {
    if (!active) return;
    const onResize = () => setInsertIndex(null);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  const toggle = (id: SectionId) => {
    setActive((current) => (current === id ? null : id));
    setInsertIndex(null);
  };

  return (
    <section className="mx-auto flex w-full max-w-[1088px] flex-col items-center px-6 pb-24">
      <Image
        src="/portrait.png"
        alt="Portrait of Fas Lebbie"
        width={161}
        height={145}
        priority
        className="mt-[60px] h-[145px] w-auto object-cover"
      />
      <div className="mt-12 text-center font-serif text-[clamp(26px,3.5vw,42px)] font-bold leading-[1.55] tracking-[0.04em]">
        {tokens.map((token, i) => {
          const panelHere = active && insertIndex === i && (
            <Panel id={active} onClose={() => setActive(null)} />
          );

          if (token.kind === "space") {
            return <span key={i}> </span>;
          }
          if (token.kind === "word") {
            return (
              <span key={i}>
                <span
                  ref={(el) => {
                    tokenRefs.current[i] = el;
                  }}
                >
                  {token.text}
                </span>
                {panelHere}
              </span>
            );
          }
          if (token.kind === "story") {
            return (
              <Link
                key={i}
                href="/story"
                data-cursor="hover"
                className="-mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.25em] leading-[1.2] text-accent transition-colors duration-200 hover:bg-black/15"
              >
                {token.text}
              </Link>
            );
          }
          const isActive = active === token.id;
          return (
            <span key={i}>
              <button
                type="button"
                ref={(el) => {
                  tokenRefs.current[i] = el;
                }}
                data-cursor="hover"
                aria-expanded={isActive}
                onClick={() => toggle(token.id)}
                className={`-mx-[0.05em] rounded-full px-[0.25em] leading-[1.2] text-accent transition-colors duration-200 ${
                  isActive ? "bg-black/20" : "bg-pill hover:bg-black/15"
                }`}
              >
                {token.text}
              </button>
              {panelHere}
            </span>
          );
        })}
      </div>
    </section>
  );
}
