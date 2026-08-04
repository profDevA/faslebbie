"use client";

import { useCallback, useEffect, useState } from "react";
import PopupShell, {
  PopupDots,
  PopupPagerButton,
} from "@/components/PopupShell";
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

  // Arrows page between moments. (Escape / scroll lock live in the shell.)
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, go]);

  if (!mounted || index < 0) return null;
  const item = items[index];
  const { popup } = item;

  return (
    <PopupShell
      onClose={onClose}
      label={popup.name}
      overlayProps={{ "data-lead-popup": "" }}
      crumbs={[
        { label: "Leadership", hideOnMobile: true },
        { label: "Moments", hideOnMobile: true },
        { label: popup.name },
      ]}
      bodyClassName="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-10"
      footer={
        <div className="flex w-full max-w-[620px] items-center justify-between">
          <PopupPagerButton onClick={() => go(-1)}>
            {"< Previous"}
          </PopupPagerButton>
          <PopupDots
            count={items.length}
            active={index}
            onSelect={(i) => onNavigate(items[i].id)}
            labelFor={(i) => items[i].label}
          />
          <PopupPagerButton onClick={() => go(1)}>{"Next >"}</PopupPagerButton>
        </div>
      }
    >
      {/* Roughly 50/50 image | name / role / testimonial (Fas 07/30). */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
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
          <p className="mt-6 border-t border-black pt-6 font-grotesk text-[18px] font-light leading-[1.6] text-black lg:text-[22px]">
            {popup.testimonial}
          </p>
        </div>
      </div>
    </PopupShell>
  );
}
