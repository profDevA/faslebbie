"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import ContactForm from "./ContactForm";

// Contact drawer (Figma 1:227 / 16:45157) — a right-side slide-in panel with a
// "Contact" + ✕ top bar over the "Drop Me a Line" form. Opened from the nav
// (desktop Contact link + mobile menu). Mirrors the deepsocal contact drawer.
export default function ContactDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Lock body scroll + close on Escape while open.
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
      aria-label="Contact"
      className="fixed inset-0 z-100 flex animate-[panel-in_0.3s_ease-out] justify-end"
    >
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-[480px] animate-[drawer-in_0.35s_ease-out] flex-col bg-[#e0e0d8] shadow-[-8px_0_28px_rgba(0,0,0,0.18)]">
        {/* Top bar: "Contact" (underlined) + × close. */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-black bg-white px-6">
          <span className="font-grotesk text-[18px] text-black underline underline-offset-4">
            Contact
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ✕
          </button>
        </div>
        {/* Body: the "Drop Me a Line" form (scrolls if tall). */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-16 pt-8">
          <ContactForm />
        </div>
      </div>
    </div>,
    document.body,
  );
}
