"use client";

import { useEffect, useState } from "react";

import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import type { Testimonial } from "@/lib/content";

/**
 * Centred testimonials slider (Figma 41:1599) — shared by About ("what people
 * are saying") and the Work / Leadership footer links. `section` drives the
 * breadcrumb (e.g. "Work / Testimonials"). Uses the shared popup shell, so the
 * header, close button, padding and overlay match every other popup.
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
      if (e.key === "ArrowLeft") setI((c) => Math.max(0, c - 1));
      if (e.key === "ArrowRight") setI((c) => Math.min(max, c + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [max]);

  if (!testimonials.length) return null;
  const t = testimonials[i];
  const role = t.role.replace(/^[-–\s]+/, "");

  return (
    <PopupShell
      onClose={onClose}
      label="Testimonials"
      overlayProps={{ "data-about-panel": "" }}
      crumbs={[
        { label: section, hideOnMobile: true },
        { label: "Testimonials" },
      ]}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between">
          <PopupPagerButton onClick={() => go(-1)} disabled={i === 0}>
            {"< Previous"}
          </PopupPagerButton>
          <PopupDots
            count={testimonials.length}
            active={i}
            onSelect={setI}
            labelFor={(idx) =>
              `Show testimonial ${idx + 1}: ${testimonials[idx].name}`
            }
          />
          <PopupPagerButton onClick={() => go(1)} disabled={i === max}>
            {"Next >"}
          </PopupPagerButton>
        </div>
      }
    >
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
      <div className="flex items-center justify-center bg-[#1c1c1c] px-6 py-8 lg:overflow-y-auto lg:px-12">
        <p className="max-w-[420px] text-center font-grotesk text-[14px] font-normal capitalize leading-[1.55] tracking-wider text-white/85 lg:text-[15px]">
          “{t.quote}”
        </p>
      </div>
    </PopupShell>
  );
}
