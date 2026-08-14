"use client";

import { useEffect, useRef } from "react";
import type { ExhibitionTile, TilePos } from "@/lib/teaching";

// Live faslebbie.com exhibition scroller: the band creeps upward on its own,
// the wheel adds to that speed and it decays back, hovering a photo pauses it,
// and reaching the bottom hands scrolling back to the page.
const BASE_SPEED = 0.5;
const MAX_SPEED = 15;
const WHEEL_STEP = 2;
const DECAY_MS = 200;
const NAV_H = 82;

/** Live `.image-box img` sizing: 175px, dropping to 130px under 1400px. */
const TILE_W = "w-[130px] min-[1400px]:w-[175px]";

function tileStyle(pos: TilePos) {
  const style: React.CSSProperties = {};
  if (pos.x.anchor === "left") style.left = `${pos.x.pct}%`;
  else style.right = `${pos.x.pct}%`;

  if (pos.y.anchor === "bottom") {
    style.bottom = `${pos.y.pct}%`;
  } else {
    style.top = `${pos.y.pct}%`;
    if (pos.y.anchor === "center") style.transform = "translateY(-50%)";
  }
  return style;
}

function PhotoBand({ tiles, suffix }: { tiles: ExhibitionTile[]; suffix: string }) {
  return (
    <div className="relative h-[calc(100dvh-82px)] min-h-[560px] w-full">
      {tiles.map((tile, i) => (
        <div
          key={`${suffix}-${i}`}
          data-collage-tile
          className={`absolute ${TILE_W}`}
          style={tileStyle(tile.pos)}
        >
          {tile.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
            <img
              src={tile.image}
              alt={tile.label ?? ""}
              className="h-auto w-full shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            />
          ) : (
            <div
              style={{ backgroundColor: tile.tint }}
              className="aspect-4/3 w-full shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ExhibitionScrollCollage({
  tiles,
}: {
  tiles: ExhibitionTile[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const inner = innerRef.current;
    if (!viewport || !inner) return;

    let pos = 0;
    let speed = BASE_SPEED;
    let maxScroll = 0;
    let frame = 0;
    let decay: number | undefined;
    let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      maxScroll = Math.max(0, inner.scrollHeight - viewport.clientHeight);
      pos = Math.min(pos, maxScroll);
      inner.style.transform = `translate3d(0, ${-pos}px, 0)`;
    };
    measure();
    window.addEventListener("resize", measure);

    const tick = () => {
      // Settling at the bottom releases the page; scrolling up re-engages.
      if (!paused && !(pos >= maxScroll && speed > 0)) {
        pos = Math.min(maxScroll, Math.max(0, pos + speed));
        inner.style.transform = `translate3d(0, ${-pos}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      const rect = viewport.getBoundingClientRect();
      if (rect.bottom <= NAV_H || rect.top >= window.innerHeight) return;
      if (pos <= 0 && e.deltaY < 0) return;
      if (pos >= maxScroll && e.deltaY > 0) return;

      e.preventDefault();
      const nudge = e.deltaY > 0 ? WHEEL_STEP : -WHEEL_STEP;
      speed = Math.min(MAX_SPEED, Math.max(-MAX_SPEED, speed + nudge));
      window.clearTimeout(decay);
      decay = window.setTimeout(() => {
        speed = BASE_SPEED;
      }, DECAY_MS);
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    const onOver = (e: Event) => {
      if ((e.target as HTMLElement).closest("[data-collage-tile]")) paused = true;
    };
    const onOut = (e: Event) => {
      if ((e.target as HTMLElement).closest("[data-collage-tile]")) paused = false;
    };
    viewport.addEventListener("mouseover", onOver);
    viewport.addEventListener("mouseout", onOut);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(decay);
      window.removeEventListener("resize", measure);
      window.removeEventListener("wheel", onWheel);
      viewport.removeEventListener("mouseover", onOver);
      viewport.removeEventListener("mouseout", onOut);
    };
  }, [tiles.length]);

  if (!tiles.length) return null;

  return (
    <div
      ref={viewportRef}
      className="relative hidden h-[calc(100dvh-82px)] overflow-hidden lg:block"
    >
      <div ref={innerRef} className="will-change-transform">
        <PhotoBand tiles={tiles} suffix="top" />
        <PhotoBand tiles={tiles} suffix="bottom" />
      </div>
    </div>
  );
}
