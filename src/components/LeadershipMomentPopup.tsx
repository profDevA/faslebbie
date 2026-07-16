"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { LeadershipGalleryItem } from "@/lib/content";

/**
 * Unified moment / testimonial popup (Israel 07/15 — "one pop-up system across
 * everything… the image, the name, the role, and the testimonial on the right").
 * A contained card that sits below the sticky nav on mobile and centres on
 * desktop, with Previous / dots / Next paging. Copy + art are placeholders
 * until Fas finalizes the leadership moments.
 */
export default function LeadershipMomentPopup({
  items,
  openId,
  onNavigate,
  onClose,
}: {
  items: LeadershipGalleryItem[];
  openId: string | null;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const index = openId ? items.findIndex((it) => it.id === openId) : -1;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (index < 0) return;
      const n = items.length;
      onNavigate(items[(index + dir + n) % n].id);
    },
    [index, items, onNavigate],
  );

  useEffect(() => {
    if (!openId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId, go, onClose]);

  if (!mounted || index < 0) return null;
  const item = items[index];
  const { popup } = item;

  return createPortal(
    <div
      data-lead-popup
      className="fixed inset-0 z-100 flex flex-col px-3 pb-3 pt-16 sm:flex-row sm:items-center sm:justify-center sm:px-8 sm:pb-8 sm:pt-8"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-x-0 bottom-0 top-13 cursor-pointer bg-black/30 sm:inset-0"
      />
      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#d7d7d0] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:h-[min(760px,90vh)] sm:min-h-0 sm:w-[min(1000px,96vw)] sm:flex-none">
        {/* Header */}
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-black bg-white px-6 sm:px-8">
          <span className="truncate font-grotesk text-[15px] font-light text-black sm:text-[18px]">
            Leadership Moments{" "}
            <span className="underline underline-offset-2">{popup.name}</span>
          </span>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            data-cursor="hover"
            className="text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ✕
          </button>
        </div>

        {/* Body: image | name/role/testimonial */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
            <div className="aspect-4/3 w-full bg-white">
              {popup.image && (
                // eslint-disable-next-line @next/next/no-img-element -- static design asset
                <img
                  src={popup.image}
                  alt={popup.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex flex-col">
              <p className="font-grotesk text-[28px] font-medium leading-[1.2] text-black lg:text-[34px]">
                {popup.name}
              </p>
              <p className="mt-2 font-grotesk text-[18px] font-light text-black/70 lg:text-[20px]">
                {popup.role}
              </p>
              <p className="mt-6 border-t border-black pt-6 font-serif text-[18px] font-light leading-[1.6] text-black lg:text-[22px]">
                {popup.testimonial}
              </p>
            </div>
          </div>
        </div>

        {/* Footer / pager */}
        <div className="flex h-[64px] shrink-0 items-center justify-center border-t border-black border-b-[6px] bg-white px-6">
          <div className="flex w-full max-w-[560px] items-center justify-between">
            <button
              type="button"
              onClick={() => go(-1)}
              data-cursor="hover"
              className="font-grotesk text-[18px] font-medium text-accent transition-opacity hover:opacity-70 lg:text-[20px]"
            >
              {"< Previous"}
            </button>
            <div className="hidden items-center gap-2.5 sm:flex">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  type="button"
                  aria-label={it.label}
                  onClick={() => onNavigate(it.id)}
                  data-cursor="hover"
                  className={`size-2 rounded-full transition-colors ${
                    i === index ? "bg-accent" : "bg-black/25 hover:bg-black/40"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => go(1)}
              data-cursor="hover"
              className="font-grotesk text-[18px] font-medium text-accent transition-opacity hover:opacity-70 lg:text-[20px]"
            >
              {"Next >"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
