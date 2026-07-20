"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, mobileNavItems } from "@/lib/content";
import ContactDrawer from "@/components/ContactDrawer";
import { OPEN_CONTACT_EVENT } from "@/lib/contactDrawer";

// Whether a nav href is the current section (WIP3 1111:4384 — the active page,
// e.g. "Work", is highlighted stronger than the rest).
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

// Wordmark "Fas lebbie, Ph.D." — the surname is intentionally lowercase per the
// desktop nav (Figma 402:2899, an uppercase base with the surname lowercased).
// NOTE: the mobile nav frames type it with a capital "Lebbie"; unified on the
// desktop's lowercase wordmark for consistency — flag to Fas if mobile differs.
function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      data-cursor="hover"
      className="whitespace-nowrap font-logo text-[18px] font-bold tracking-[-0.02em] lg:text-[20px]"
    >
      {/* Wider gap before "Ph.D." to match Figma (Israel 06/25 — the negative
          tracking pulled it in too tight). */}
      Fas lebbie,<span className="ml-[0.4em]">Ph.D.</span>
    </Link>
  );
}

// Nav links — Neue Haas Grotesk 55 Roman, capitalized (Figma 854:79643). The
// surname/words render Capitalized rather than all-caps.
function NavLink({ label, href, active }: { label: string; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      data-cursor="hover"
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap font-grotesk capitalize underline-offset-[6px] transition-opacity ${
        active ? "font-medium underline decoration-2" : "font-normal opacity-70 hover:opacity-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Nav({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const isActive = useIsActive();

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Any "contact" trigger elsewhere in the app can open the drawer.
  useEffect(() => {
    const openDrawer = () => setContactOpen(true);
    window.addEventListener(OPEN_CONTACT_EVENT, openDrawer);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, openDrawer);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 ${
        dark
          ? "bg-[#141414] text-bg"
          : "bg-bg text-black shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
      }`}
    >
      <div className="mx-auto flex h-13 max-w-345 items-center justify-between gap-8 px-6">
        <Logo />
        {/* Desktop: full horizontal menu */}
        <nav className="hidden items-center gap-x-6 text-[15px] capitalize lg:flex xl:gap-x-9 xl:text-[18px]">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>
        {/* Contact opens a slide-in drawer (Figma 1:227), not a page. */}
        <button
          type="button"
          onClick={() => setContactOpen(true)}
          data-cursor="hover"
          className="hidden font-grotesk text-[15px] font-normal capitalize underline-offset-[6px] opacity-70 transition-opacity hover:opacity-100 lg:block xl:text-[18px]"
        >
          Contact
        </button>
        {/* Mobile/tablet: MENU toggle */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-cursor="hover"
          className="font-grotesk text-[16px] uppercase tracking-[0.02em] lg:hidden"
        >
          Menu
        </button>
      </div>

      {/* Mobile/tablet: full-screen dropdown overlay (Figma 1-128). Dark panel,
          "Fas lebbie, Ph.D." + ✕ in a divided header, then a large left-aligned
          Title-Case list (About → Contact). Fades/slides in on open. */}
      {open && (
        <div className="fixed inset-0 z-50 flex animate-[menu-in_0.3s_ease-out] flex-col overflow-y-auto bg-[#141414] text-bg lg:hidden">
          <div className="flex h-13 shrink-0 items-center justify-between border-b border-white/20 px-6">
            <Logo onClick={() => setOpen(false)} />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              data-cursor="hover"
              className="text-[22px] leading-none transition-opacity hover:opacity-70"
            >
              ✕
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-7 px-6 pb-16 font-grotesk text-[34px] font-normal leading-none sm:text-[40px]">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-cursor="hover"
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`w-fit underline-offset-8 transition-opacity hover:opacity-70 ${
                  isActive(item.href) ? "underline decoration-2" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Contact opens the drawer (closes the menu first). */}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setContactOpen(true);
              }}
              data-cursor="hover"
              className="w-fit text-left underline-offset-8 transition-opacity hover:opacity-70"
            >
              Contact
            </button>
          </nav>
        </div>
      )}

      <ContactDrawer open={contactOpen} onClose={() => setContactOpen(false)} />
    </header>
  );
}
