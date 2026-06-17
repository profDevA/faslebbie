"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

function Panel({
  id,
  onClose,
  panelRef,
}: {
  id: SectionId;
  onClose: () => void;
  panelRef: React.Ref<HTMLDivElement>;
}) {
  const panel = panels[id];
  return (
    <div className="block animate-[panel-in_0.25s_ease-out] py-5 text-left">
      <div
        ref={panelRef}
        className="relative mx-auto flex w-full max-w-204.25 flex-col gap-3.25 border-l-4 border-accent bg-panel px-4.25 py-3.5"
      >
        {/* X close at top-right (per Fas 06/12); also closes on click-outside / re-click */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-3 top-2 font-serif text-[30px] leading-none text-black/70 transition-colors hover:text-black"
        >
          ×
        </button>
        <p className="pr-6 font-serif text-[20px] font-bold lowercase leading-[1.35] tracking-wider">
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
          <span className="flex items-center gap-2">
            <span className="font-serif text-[16px] font-bold tracking-[0.06em]">
              Stack:
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element -- small static strip, no optimization needed */}
            <img
              src={toolStackImage}
              alt="Tool stack: design and development tools"
              className="h-4.5 w-auto max-w-full object-contain"
            />
          </span>
        )}
        <Link
          href={panel.cta.href}
          data-cursor="hover"
          className="font-serif text-[16px] font-medium text-accent underline underline-offset-2"
        >
          {panel.cta.label} →
        </Link>
      </div>
    </div>
  );
}

/**
 * The interactive hero paragraph: the self-description whose red keywords expand
 * into dropdown panels inline. Shared by the homepage (with a portrait above)
 * and the v2 shell (layered over the faded name wordmark).
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
  const [active, setActive] = useState<SectionId | null>(null);
  // Token index after which the panel is inserted (= last token on the
  // keyword's visual line). null = not measured yet.
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const tokenRefs = useRef<(HTMLElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Click outside the open panel closes it (keyword clicks are handled by their
  // own toggle, so ignore those here).
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (panelRef.current?.contains(target)) return;
      if (target?.closest?.("[data-keyword]")) return;
      setActive(null);
      setInsertIndex(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active]);

  const toggle = (id: SectionId) => {
    setActive((current) => (current === id ? null : id));
    setInsertIndex(null);
  };

  return (
    <div
      className={`font-serif text-[28px] font-bold leading-[1.55] tracking-[0.04em] md:text-[36px] lg:text-[42px] ${className}`}
    >
      {tokens.map((token, i) => {
        const panelHere = active && insertIndex === i && (
          <Panel id={active} onClose={() => setActive(null)} panelRef={panelRef} />
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
              href={storyHref}
              data-cursor="hover"
              className="mx-[-0.05em] box-decoration-clone rounded-full bg-pill px-[0.25em] leading-[1.2] text-accent transition-colors duration-200 hover:bg-black hover:text-white"
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
              data-keyword
              aria-expanded={isActive}
              onClick={() => toggle(token.id)}
              className={`mx-[-0.05em] rounded-full px-[0.25em] leading-[1.2] transition-colors duration-200 ${
                isActive
                  ? "bg-black text-white"
                  : "bg-pill text-accent hover:bg-black hover:text-white"
              }`}
            >
              {token.text}
            </button>
            {panelHere}
          </span>
        );
      })}
    </div>
  );
}
