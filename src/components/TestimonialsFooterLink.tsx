"use client";

import { useState } from "react";

import { ArrowTrigger } from "@/components/InlineToken";
import TestimonialsModal from "@/components/TestimonialsModal";
import type { Testimonial } from "@/lib/content";

/**
 * Red "Testimonials" footer link that opens the shared testimonials modal. Fas
 * 07/28: add at the bottom of Work and Leadership so quotes are easier to find.
 * Drawn like the rest of the end-of-page link row (Figma 807:19215–19234).
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
      <div
        className={`mt-2 flex flex-wrap items-center gap-x-10 gap-y-3 reckless-prose font-normal ${className}`}
      >
        <ArrowTrigger onClick={() => setOpen(true)}>{label}</ArrowTrigger>
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
