"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
/**
 * The one popup shell for the whole site (Fas 07/30: "every popup should use
 * the same shell and spacing — consistent breadcrumbs, close button, padding
 * and overlay treatment"). Adopted from the approved Student Works / Build
 * popup: a centred card over a light scrim, a white breadcrumb header with the
 * ✕, an internally scrolling body, and an optional white footer pager.
 *
 * Mobile (Figma 1:37279): inset centred card (~20px margin, ~80vh tall) — not
 * full-bleed. From `sm` up it stays a wide centred overlay with margin.
 */

export type PopupCrumb = {
  label: string;
  /** Drop the crumb on phones, where the header only fits the last one or two. */
  hideOnMobile?: boolean;
};

function Breadcrumbs({ crumbs }: { crumbs: PopupCrumb[] }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5 font-grotesk text-[12px] font-light text-black sm:text-[16px]">
      {crumbs.map((crumb, i) => {
        const last = i === crumbs.length - 1;
        return (
          // The separator belongs to the crumb it follows, so hiding a crumb on
          // mobile hides its slash too.
          <span
            key={`${crumb.label}-${i}`}
            className={`min-w-0 items-center gap-1.5 ${
              crumb.hideOnMobile ? "hidden sm:flex" : "flex"
            }`}
          >
            <span
              className={
                last ? "truncate underline underline-offset-2" : "truncate"
              }
            >
              {crumb.label}
            </span>
            {!last && <span className="text-black/40">/</span>}
          </span>
        );
      })}
    </span>
  );
}

export default function PopupShell({
  open = true,
  onClose,
  crumbs,
  children,
  footer,
  footerClassName = "",
  label,
  bodyClassName = "min-h-0 flex-1 overflow-y-auto",
  bodyRef,
  overlayProps,
  cardClassName,
}: {
  /** Render nothing while false (the caller can stay mounted). */
  open?: boolean;
  onClose: () => void;
  crumbs: PopupCrumb[];
  children: ReactNode;
  /** Pager row; rendered inside the standard white footer bar. */
  footer?: ReactNode;
  /** Extra classes on the footer bar (e.g. `lg:hidden` for mobile-only pagers). */
  footerClassName?: string;
  /** Accessible name for the dialog; defaults to the last breadcrumb. */
  label?: string;
  /** Override when the body is a full-bleed split rather than a scroll area. */
  bodyClassName?: string;
  /** Access to the scrolling body (e.g. to reset scroll when paging). */
  bodyRef?: React.Ref<HTMLDivElement>;
  /** Hooks some pages use to detect their own popup (e.g. data-research-modal). */
  overlayProps?: Record<string, string>;
  /** Card fill. Defaults to `bg-close`. */
  cardClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Only the topmost dialog closes, so Escape inside a nested popup (e.g.
      // the case-study artifact lightbox) doesn't also dismiss its parent.
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== overlayRef.current) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      {...overlayProps}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={label ?? crumbs[crumbs.length - 1]?.label}
      className="fixed inset-0 z-100 flex animate-[panel-in_0.2s_ease-out] items-center justify-center p-5 sm:p-10 lg:p-16"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-[rgba(226,226,218,0.82)]"
      />
      <div
        className={`relative flex h-[min(684px,80dvh)] max-h-full min-h-0 w-full flex-col overflow-hidden sm:h-[min(880px,92vh)] ${cardClassName ?? "bg-close"}`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-black/15 bg-white px-5 sm:h-16 sm:px-8">
          <Breadcrumbs crumbs={crumbs} />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            data-cursor="hover"
            className="shrink-0 text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ✕
          </button>
        </div>

        <div ref={bodyRef} className={bodyClassName}>
          {children}
        </div>

        {footer && (
          <div
            className={`flex h-16 shrink-0 items-center justify-center border-t border-black/15 bg-white px-6 sm:px-10 ${footerClassName}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Standard red pager link used inside a PopupShell footer. */
export function PopupPagerButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  className = "text-[15px] lg:text-[18px]",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-cursor="hover"
      className={`font-grotesk font-bold text-accent transition-opacity enabled:hover:opacity-70 disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}

/** Standard dot row used between the two pager buttons. */
export function PopupDots({
  count,
  active,
  onSelect,
  labelFor,
  className = "hidden sm:flex",
}: {
  count: number;
  active: number;
  onSelect: (index: number) => void;
  labelFor?: (index: number) => string;
  className?: string;
}) {
  return (
    <div
      className={`max-w-full items-center justify-center gap-2.5 ${className}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={labelFor?.(i) ?? `Go to ${i + 1}`}
          aria-current={i === active}
          onClick={() => onSelect(i)}
          data-cursor="hover"
          className={`size-2 shrink-0 rounded-full transition-colors ${
            i === active ? "bg-accent" : "bg-black/25 hover:bg-black/40"
          }`}
        />
      ))}
    </div>
  );
}
