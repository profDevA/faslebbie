"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { Testimonial } from "@/lib/content";

/**
 * Centred testimonials slider (Figma 41:1599) — shared by About ("what people
 * are saying") and the Work / Leadership footer links. `section` drives the
 * breadcrumb (e.g. "Work / Testimonials").
 */
export default function TestimonialsModal({
  testimonials,
  onClose,
  section = "About",
}: {
  testimonials: Testimonial[];
  onClose: () => void;
  section?: string;
}) {
  const [i, setI] = useState(0);
  const max = testimonials.length - 1;
  const go = (d: number) => setI((c) => Math.min(max, Math.max(0, c + d)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setI((c) => Math.max(0, c - 1));
      if (e.key === "ArrowRight") setI((c) => Math.min(max, c + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [max, onClose]);

  if (typeof document === "undefined" || !testimonials.length) return null;
  const t = testimonials[i];
  const role = t.role.replace(/^[-–\s]+/, "");

  return createPortal(
    <div
      data-about-panel
      role="dialog"
      aria-modal="true"
      aria-label="Testimonials"
      onClick={onClose}
      className="fixed inset-0 z-100 flex animate-[panel-in_0.2s_ease-out] items-center justify-center bg-[rgba(226,226,218,0.85)] p-5 sm:p-10 lg:p-16"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[min(880px,92vh)] w-full flex-col overflow-hidden bg-close shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-4 lg:px-9 lg:py-5">
          <p className="font-grotesk text-[15px] tracking-wider">
            <span className="text-black/45">{section}</span>
            <span className="mx-1.5 text-black/35">/</span>
            <span className="text-black underline underline-offset-4">
              Testimonials
            </span>
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="text-[26px] leading-none text-black/70 transition-colors hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center gap-5 bg-[#c9c9c4] px-6 py-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt={t.name}
              className="h-[120px] w-[108px] shrink-0 bg-black/5 object-cover"
            />
            <div>
              <p className="font-grotesk text-[36px] font-normal leading-tight tracking-[0.5px] text-[#1a1a1a] lg:text-[44px]">
                {t.name}
              </p>
              <p className="mt-1 font-grotesk text-[14px] tracking-wider text-black/60">
                {role}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center overflow-y-auto bg-[#1c1c1c] px-6 py-8 lg:px-12">
            <p className="max-w-[420px] text-center font-grotesk text-[14px] font-normal capitalize leading-[1.55] tracking-wider text-white/85 lg:text-[15px]">
              “{t.quote}”
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-black/10 px-6 py-4 lg:px-16 lg:py-5">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={i === 0}
            data-cursor="hover"
            className="font-grotesk text-[16px] font-bold text-accent underline-offset-2 transition-opacity enabled:hover:underline disabled:opacity-30"
          >
            {"< Previous"}
          </button>
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
            {testimonials.map((tItem, idx) => (
              <button
                key={tItem.name}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show testimonial ${idx + 1}: ${tItem.name}`}
                aria-current={idx === i}
                data-cursor="hover"
                className={`size-2 shrink-0 rounded-full transition-colors ${
                  idx === i ? "bg-accent" : "bg-black/20 hover:bg-black/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={i === max}
            data-cursor="hover"
            className="font-grotesk text-[16px] font-bold text-accent underline-offset-2 transition-opacity enabled:hover:underline disabled:opacity-30"
          >
            {"Next >"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
