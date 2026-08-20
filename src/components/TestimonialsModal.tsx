"use client";

import { useEffect, useState } from "react";

import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
import type { Testimonial } from "@/lib/content";

/**
 * Testimonials — desktop 2729:19758 (side by side). Mobile 2729:19837 is a
 * 684px window over a 1075px column: grey photo, then scroll to the quote.
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
        { label: section },
        { label: "Testimonials" },
      ]}
      bodyClassName="min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-cols-2 lg:overflow-hidden"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between gap-2">
          <PopupPagerButton
            className="shrink-0 whitespace-nowrap text-[16px] lg:text-[21px]"
            onClick={() => go(-1)}
            disabled={i === 0}
          >
            {"< Previous"}
          </PopupPagerButton>
          <PopupDots
            className="flex min-w-0 flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            count={testimonials.length}
            active={i}
            onSelect={setI}
            labelFor={(idx) =>
              `Show testimonial ${idx + 1}: ${testimonials[idx].name}`
            }
          />
          <PopupPagerButton
            className="shrink-0 whitespace-nowrap text-[16px] lg:text-[21px]"
            onClick={() => go(1)}
            disabled={i === max}
          >
            {"Next >"}
          </PopupPagerButton>
        </div>
      }
    >
      <div className="flex h-[538px] shrink-0 items-center justify-center bg-[#c2c2c2] px-4 lg:h-auto lg:min-h-0 lg:flex-1">
        <div className="flex w-full max-w-[330px] flex-col items-center gap-3 lg:gap-[18px]">
          <div className="size-[68px] overflow-hidden bg-white lg:size-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.avatar}
              alt={t.name}
              className="size-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col items-center gap-2 text-center text-[#1e1e1e] lg:gap-3.5">
            <p className="font-grotesk text-[28px] font-medium leading-tight lg:text-[34px] lg:leading-[1.2]">
              {t.name}
            </p>
            <p className="font-grotesk text-[14px] font-light text-black/70 lg:text-[20px]">
              {role}
            </p>
          </div>
        </div>
      </div>
      <div className="flex h-[538px] shrink-0 items-center justify-center bg-[#1a1a1a] px-6 lg:h-auto lg:min-h-0 lg:flex-1 lg:px-14">
        <p className="w-full text-center font-grotesk text-[14px] font-light leading-4 text-[#e0e0d7] lg:max-w-[540px] lg:text-[16px] lg:leading-[1.55]">
          “{t.quote}”
        </p>
      </div>
    </PopupShell>
  );
}
