"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

/**
 * The one dot pager for the site (Nov 20) — popups, the case-study and blog
 * page bars, and later the sliders.
 *
 * Each item is the segment between two dots: item 1 = dots 1–2, item 2 =
 * dots 2–3 … (Xian, Nov 20: "the stick should be between dots, 1 and 2, 2 and
 * 3… the edge points of the stick should be points, and the animation should
 * be smooth"). So N items draw N + 1 dots, and the current item is a stick
 * whose round ends sit exactly on its two dots. The stick glides to the next
 * pair; with more than `maxSegments` items the dots slide inside the tinted
 * pill (HorizonX look, Fas's reference) and the dot at a cut edge shrinks.
 *
 * Colour: dark by default, `tone="light"` on dark image bars.
 */
const GAP = 16; // centre to centre
const DOT = 8;
const EDGE_DOT = 5;
const EASE = "transform 380ms cubic-bezier(0.22, 1, 0.36, 1)";

export default function PagerDots({
  count,
  active,
  onSelect,
  hrefs,
  labels,
  maxSegments = 5,
  tone = "dark",
  className = "",
}: {
  count: number;
  active: number;
  /** Click on an item's segment (buttons). */
  onSelect?: (index: number) => void;
  /** Or: each segment is a link (page bars). */
  hrefs?: readonly string[];
  /** Accessible name per item. */
  labels?: readonly string[];
  maxSegments?: number;
  /** dark dots on light footers; light on dark image bars (sliders). */
  tone?: "dark" | "light";
  className?: string;
}) {
  if (count < 2) return null;
  const shown = Math.min(count, maxSegments);
  const cur = Math.min(Math.max(active, 0), count - 1);
  // First visible segment: keep the current one near the middle, clamp at ends.
  const start =
    count > shown
      ? Math.min(Math.max(cur - Math.floor(shown / 2), 0), count - shown)
      : 0;
  const viewportW = shown * GAP + DOT;
  const trackStyle: CSSProperties = {
    width: count * GAP + DOT,
    transform: `translateX(${-start * GAP}px)`,
    transition: EASE,
  };

  return (
    <div className={`items-center justify-center ${tone === "light" ? "text-white" : "text-[#1e1e1e]"} ${className || "flex"}`}>
      <div className="flex h-9 shrink-0 items-center rounded-full bg-current/10 px-2.5">
        <div
          className="relative h-9 overflow-hidden"
          style={{ width: viewportW }}
          role="tablist"
          aria-label="Pages"
        >
          <div className="absolute inset-y-0 left-0 motion-reduce:!transition-none" style={trackStyle}>
            {/* N + 1 dots */}
            {Array.from({ length: count + 1 }, (_, p) => {
              const cut =
                count > shown &&
                ((p === start && start > 0) ||
                  (p === start + shown && start + shown < count));
              const size = cut ? EDGE_DOT : DOT;
              return (
                <span
                  key={p}
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 block rounded-full bg-current opacity-30 transition-[width,height,margin] duration-300"
                  style={{
                    left: p * GAP + DOT / 2,
                    width: size,
                    height: size,
                    marginLeft: -size / 2,
                    marginTop: -size / 2,
                  }}
                />
              );
            })}
            {/* The stick: ends on dot `cur` and dot `cur + 1`. */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-0 block rounded-full bg-current motion-reduce:!transition-none"
              style={{
                width: GAP + DOT,
                height: DOT,
                marginTop: -DOT / 2,
                transform: `translateX(${cur * GAP}px)`,
                transition: EASE,
              }}
            />
            {/* Hit areas: one per segment. */}
            {Array.from({ length: count }, (_, i) => {
              const props = {
                role: "tab",
                "aria-selected": i === cur,
                "aria-label": labels?.[i] ?? `Go to ${i + 1} of ${count}`,
                "data-cursor": "hover",
                className: "absolute inset-y-0 block bg-transparent p-0",
                style: { left: i * GAP + DOT / 2, width: GAP } as CSSProperties,
              } as const;
              return hrefs?.[i] ? (
                <Link key={i} href={hrefs[i]} {...props} />
              ) : (
                <button key={i} type="button" onClick={() => onSelect?.(i)} {...props} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Slide controls for sliders inside a page or popup: ‹ circle · dots · circle ›
 * (the Life of a Miner / HorizonX control — 36px tinted circles with a 14px
 * chevron, 10px from the dot pill). Moving between slides inside one thing;
 * the text "< Previous · Next >" bar is for moving between pages / items.
 */
export function SliderControls({
  count,
  active,
  onPrev,
  onNext,
  onSelect,
  labels,
  tone = "dark",
  className = "",
}: {
  count: number;
  active: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
  labels?: readonly string[];
  tone?: "dark" | "light";
  className?: string;
}) {
  if (count < 2) return null;
  const arrow = (dir: 1 | -1) => <SlideArrow dir={dir} onClick={dir === 1 ? onNext : onPrev} />;
  return (
    <div
      className={`flex w-fit items-center gap-2.5 ${tone === "light" ? "text-white" : "text-[#1e1e1e]"} ${className}`}
    >
      {arrow(-1)}
      <PagerDots count={count} active={active} onSelect={onSelect} labels={labels} tone={tone} />
      {arrow(1)}
    </div>
  );
}

/** One ‹ / › circle of SliderControls, for sliders whose arrows sit apart
 *  (field-note images: left / right edges). Colour = currentColor. */
export function SlideArrow({
  dir,
  onClick,
  className = "",
}: {
  dir: 1 | -1;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={dir === 1 ? "Next slide" : "Previous slide"}
      data-cursor="hover"
      onClick={onClick}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-current/10 transition-opacity hover:opacity-70 ${className}`}
    >
      <svg viewBox="0 0 10.5 10.5" className={`size-3.5 ${dir === 1 ? "" : "-scale-x-100"}`} aria-hidden>
        <path
          d="M3.2 1.2l4.2 4.05-4.2 4.05"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
