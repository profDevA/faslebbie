"use client";

import { useEffect, useMemo, useRef } from "react";
import type { StudentProject } from "@/lib/teaching";

// Live faslebbie.com/students-work banner: two columns creeping upward, wheel
// nudges the column under the pointer, speed decays back after a beat.
const BASE_SPEED = 0.5;
const MAX_SPEED = 15;
const WHEEL_STEP = 2;
const DECAY_MS = 200;
const MAX_IMAGES = 20;

function MarqueeColumn({ images }: { images: string[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let offset = 0;
    let speed = BASE_SPEED;
    let frame = 0;
    let decay: number | undefined;

    const tick = () => {
      // The track renders the list twice, so one list height is a seamless loop.
      const loop = track.scrollHeight / 2;
      if (loop > 0) {
        offset = (((offset + speed) % loop) + loop) % loop;
        track.style.transform = `translate3d(0, ${-offset}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      const nudge = e.deltaY > 0 ? WHEEL_STEP : -WHEEL_STEP;
      speed = Math.min(MAX_SPEED, Math.max(-MAX_SPEED, speed + nudge));
      window.clearTimeout(decay);
      decay = window.setTimeout(() => {
        speed = BASE_SPEED;
      }, DECAY_MS);
    };
    viewport.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(decay);
      viewport.removeEventListener("wheel", onWheel);
    };
  }, [images]);

  return (
    <div ref={viewportRef} className="h-full overflow-hidden">
      <div ref={trackRef} className="will-change-transform">
        {[...images, ...images].map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            loading="lazy"
            className="mb-4 w-full object-cover"
          />
        ))}
      </div>
    </div>
  );
}

/** Student Works banner collage. Desktop only, like the live site. */
export default function StudentWorksMarquee({
  students,
}: {
  students: StudentProject[];
}) {
  const [left, right] = useMemo(() => {
    const all = Array.from(
      new Set(students.flatMap((s) => s.images ?? [])),
    ).slice(0, MAX_IMAGES);
    const a: string[] = [];
    const b: string[] = [];
    all.forEach((src, i) => (i % 2 ? b : a).push(src));
    return [a, b];
  }, [students]);

  if (!left.length) return null;

  return (
    <div
      aria-hidden
      className="hidden h-[calc(100dvh-200px)] gap-4 lg:grid lg:grid-cols-2"
    >
      <MarqueeColumn images={left} />
      {right.length ? <MarqueeColumn images={right} /> : null}
    </div>
  );
}
