"use client";

import Link from "next/link";
import { useId, type KeyboardEvent, type ReactNode } from "react";

/**
 * The one vocabulary of inline interactions, straight off the Figma
 * "Component Interaction" legend (823:70182). Every clickable word inside page
 * copy must come from here, so a reader can tell what a word will do before
 * they tap it:
 *
 *   red pill              → navigates somewhere new (another page, or a view
 *                           switch such as Leadership's ".img" gallery)
 *   red underline         → opens something in place (popup, overlay, drawer)
 *   red + ↗, rule on hover → leaves the site (external URL, PDF, mailto)
 *   grey pill, black text → reveals narrative inline, in place
 *   black >/~ chip        → cycles through a word list on click
 *
 * These are shared classes, not a licence to restyle a page: where a page frame
 * in Figma draws a word differently from the legend, the page frame wins.
 *
 * `box-decoration-clone` on the pills/chips keeps them intact when a phrase
 * wraps across lines, and spans (rather than <button>) carry the click for the
 * same reason: a button is an atomic inline box and can't break across lines.
 */

/** Navigate to an internal page — red on a grey pill, inverts to black. */
export const NAV_PILL =
  "mx-[0.05em] box-decoration-clone cursor-pointer rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-accent transition-colors duration-200 hover:bg-black hover:text-white";

/** Opens a popup / overlay / drawer without leaving the page. */
export const POPUP_LINK =
  "cursor-pointer text-accent underline decoration-from-font underline-offset-2 transition-opacity duration-200 hover:opacity-70";

/** Same as POPUP_LINK but underline appears on hover only (Fas 08/31 About QA). */
export const POPUP_LINK_HOVER =
  "cursor-pointer text-accent underline-offset-2 decoration-from-font hover:underline transition-opacity duration-200 hover:opacity-70";

/**
 * Leaves the site. Red text and the ↗ only — the rule appears on hover, per the
 * legend's two states and the "Linkedin ↗" footer row (807:19218).
 */
export const EXTERNAL_LINK =
  "group inline-flex items-center gap-0 text-accent";

/** Non-interactive grey pill (static keyword highlight). */
export const STATIC_PILL =
  "mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-black";

/** Reveals narrative inline — grey pill, black text, inverts while open. */
export function expandPillClass(open: boolean) {
  return `mx-[0.05em] box-decoration-clone cursor-pointer rounded-full px-[0.3em] py-[0.095em] leading-none transition-colors duration-200 ${
    open
      ? "bg-black text-white"
      : "bg-pill text-black hover:bg-black hover:text-white"
  }`;
}

/** Cycles its word list on click — the black `>/~` chip. */
export const CYCLE_CHIP =
  "mx-[0.06em] box-decoration-clone cursor-pointer bg-[#141414] px-[0.24em] py-[0.02em] text-[0.82em] leading-[1.1] text-bg";

/** Press-to-activate for spans standing in for buttons. */
export function onActivateKey(run: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    run();
  };
}

/**
 * The ↗ that marks a link as leaving the site (Figma 823:70191). Raised like a
 * superscript; the 33×32 viewBox already pads the lower-left for the drop
 * shadow, so it needs little manual lift.
 */
export function ExternalArrow({
  className = "",
  shadow = true,
}: {
  className?: string
  /** Figma 2110:41729 uses a flat arrow — no drop shadow on the reflection PDF link. */
  shadow?: boolean
}) {
  const uid = useId();
  const filterId = `arrow-shadow-${uid}`;
  const path = (
    <path
      d="M10.415 20L29.415 1.5M14.915 1.5H29.415V16.5"
      stroke="#EA2C2C"
      strokeWidth={3}
      strokeLinecap="round"
    />
  );
  return (
    <svg
      aria-hidden
      viewBox="0 0 33 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`ml-[0.1em] inline-block h-[0.85em] w-[0.85em] shrink-0 translate-y-[0.04em] transition-transform duration-200 group-hover:translate-x-[0.06em] group-hover:translate-y-[-0.06em] ${className}`}
    >
      {shadow ? <g filter={`url(#${filterId})`}>{path}</g> : path}
      {shadow ? (
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
      ) : null}
    </svg>
  );
}

export function NavPill({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} data-cursor="hover" className={`${NAV_PILL} ${className}`}>
      {children}
    </Link>
  );
}

/** Navigation that stays on the same URL (e.g. switching to the .img view). */
export function NavPillButton({
  onClick,
  children,
  className = "",
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      data-cursor="hover"
      onClick={onClick}
      onKeyDown={onActivateKey(onClick)}
      className={`${NAV_PILL} ${className}`}
    >
      {children}
    </span>
  );
}

export function PopupLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} data-cursor="hover" className={`${POPUP_LINK} ${className}`}>
      {children}
    </Link>
  );
}

export function PopupTrigger({
  onClick,
  children,
  className = "",
  ...rest
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
} & Record<`data-${string}`, unknown>) {
  return (
    <span
      role="button"
      tabIndex={0}
      data-cursor="hover"
      onClick={onClick}
      onKeyDown={onActivateKey(onClick)}
      className={`${POPUP_LINK} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}

export function normalizeHref(href: string) {
  const t = href.trim();
  // Bare email addresses from Studio should still open the mail client.
  if (t && !/^[a-z][a-z0-9+.-]*:/i.test(t) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))
    return `mailto:${t}`;
  return t;
}

export function ExternalTextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const resolved = normalizeHref(href);
  const sameTab =
    resolved.startsWith("mailto:") || resolved.startsWith("tel:");
  return (
    <a
      href={resolved}
      target={sameTab ? undefined : "_blank"}
      rel={sameTab ? undefined : "noopener noreferrer"}
      data-cursor="hover"
      className={`${EXTERNAL_LINK} ${className}`}
    >
      <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
        {children}
      </span>
      <ExternalArrow />
    </a>
  );
}

/**
 * Same red + ↗ treatment for something that opens in place rather than leaving
 * the site — the About / Work footer row draws Testimonials alongside CV,
 * Resume, Linkedin and Email (807:19215–19234), so it wears the row's style.
 */
export function ArrowTrigger({
  onClick,
  children,
  className = "",
  ...rest
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
} & Record<`data-${string}`, unknown>) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="hover"
      className={`${EXTERNAL_LINK} ${className}`}
      {...rest}
    >
      <span className="border-b-2 border-transparent transition-colors group-hover:border-current">
        {children}
      </span>
      <ExternalArrow />
    </button>
  );
}
