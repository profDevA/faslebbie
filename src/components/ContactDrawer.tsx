"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSite } from "@/components/SiteProvider";
import { NAV_H } from "@/lib/navLayout";
import ContactForm from "./ContactForm";

// Contact drawer (Figma 2218:75548) — right-side slide-in on a warm light
// panel, white "Contact" + ✕ bar (same 82px height as page nav).
export default function ContactDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { contact } = useSite();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={contact.drawerTitle}
      className="fixed inset-0 z-100 flex animate-[panel-in_0.3s_ease-out] justify-end"
    >
      {/* Soft wash over the page (Figma: rgba(225,225,216,0.5)). */}
      <div className="absolute inset-0 bg-[#e1e1d8]/50" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-[480px] animate-[drawer-in_0.35s_ease-out] flex-col bg-[#d2d2c8] text-black shadow-[-8px_0_28px_rgba(0,0,0,0.18)]">
        <div
          className={`flex ${NAV_H} shrink-0 items-center justify-between border-b border-black bg-white px-7`}
        >
          <span className="font-grotesk text-[18px] font-light tracking-[0.38px] text-black underline decoration-from-font underline-offset-2">
            {contact.drawerTitle}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="flex size-5 items-center justify-center text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-[30px] pb-16 pt-16">
          <ContactForm />
        </div>
      </div>
    </div>,
    document.body,
  );
}
