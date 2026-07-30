"use client";

import { useId, useState } from "react";

import TestimonialsModal from "@/components/TestimonialsModal";
import type { Testimonial } from "@/lib/content";

// Same NE arrow as About's CV / Resume links (Figma 823:70191).
function ArrowUpRight({ className = "" }: { className?: string }) {
  const uid = useId();
  const filterId = `arrow-shadow-${uid}`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter={`url(#${filterId})`}>
        <path
          d="M10.415 20L29.415 1.5M14.915 1.5H29.415V16.5"
          stroke="#EA2C2C"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
      <defs>
        <filter
          id={filterId}
          x="0.000441074"
          y="0"
          width="32.0774"
          height="31.7066"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="-3.87591" dy="5.16788" />
          <feGaussianBlur stdDeviation="2.51934" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.694118 0 0 0 0 0.686275 0 0 0 0 0.67451 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Red "Testimonials ↗" footer link (same treatment as About CV / Resume) that
 * opens the shared testimonials modal. Fas 07/28: add at the bottom of Work and
 * Leadership so quotes are easier to find.
 */
export default function TestimonialsFooterLink({
  testimonials,
  section,
  label = "Testimonials",
  className = "",
}: {
  testimonials: Testimonial[];
  section: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (!testimonials.length) return null;

  return (
    <>
      {/* Match About CV / Resume / LinkedIn / Email exactly (Figma 807:19215). */}
      <div
        className={`mt-2 flex flex-wrap items-center gap-x-10 gap-y-3 font-grotesk font-medium ${className}`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-cursor="hover"
          className="group inline-flex items-center gap-0 text-accent text-shadow-token"
        >
          <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
            {label}
          </span>
          <ArrowUpRight className="h-[1em] w-[1em] shrink-0 translate-y-[0.04em] transition-transform duration-200 group-hover:translate-x-[0.06em] group-hover:translate-y-[-0.06em]" />
        </button>
      </div>
      {open && (
        <TestimonialsModal
          testimonials={testimonials}
          section={section}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
