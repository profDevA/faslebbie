"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ContactDrawer from "@/components/ContactDrawer";
import { useSite } from "@/components/SiteProvider";
import { OPEN_CONTACT_EVENT } from "@/lib/contactDrawer";
import { NAV_H, NAV_TOP } from "@/lib/navLayout";

// Whether a nav href is the current section (WIP3 1111:4384 — the active page
// is highlighted stronger than the rest).
function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

// Nav logo — Site Settings → Brand (normal ", " after the name per Figma).
function Logo({ onClick }: { onClick?: () => void }) {
  const { brand } = useSite();
  return (
    <Link
      href="/"
      onClick={onClick}
      data-cursor="hover"
      className="whitespace-nowrap font-logo text-[18px] font-bold tracking-[-0.02em] lg:text-[20px]"
    >
      {brand.logoName}, {brand.logoSuffix}
    </Link>
  );
}

function NavLink({
  label,
  href,
  active,
  light,
}: {
  label: string;
  href: string;
  active?: boolean;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      data-cursor="hover"
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap font-grotesk capitalize underline-offset-[6px] transition-opacity ${
        light
          ? active
            ? "font-medium text-white underline decoration-1"
            : "font-normal text-white/80 hover:text-white"
          : active
            ? "font-medium underline decoration-2"
            : "font-normal opacity-70 hover:opacity-100"
      }`}
    >
      {label}
    </Link>
  );
}

const MENU_MS = 300;

export default function Nav({ dark = false }: { dark?: boolean }) {
  const { navItems, mobileNavItems, contact } = useSite();
  const [open, setOpen] = useState(false);
  // Keep panel mounted through the close slide (open alone would unmount instantly).
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuEntered, setMenuEntered] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const isActive = useIsActive();
  const light = dark;

  // One flat menu in Site Settings order — no Projects▾ dropdown (Fas, Nov 16
  // evening: "add another menu here and not do a drop down… Work… Build").
  // Home · About · Work · Build · Approach · Research · Teaching · Words + Media.

  useEffect(() => {
    if (open) {
      setMenuMounted(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setMenuEntered(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setMenuEntered(false);
    const t = window.setTimeout(() => setMenuMounted(false), MENU_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  // Freeze scroll without jumping to top (overflow:hidden alone can reset
  // scrollY on mobile and makes .txt/.img listing content flash away).
  useEffect(() => {
    if (!menuMounted) return;
    const y = window.scrollY;
    const { body } = document;
    const prev = body.style.cssText;
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";
    return () => {
      body.style.cssText = prev;
      window.scrollTo(0, y);
    };
  }, [menuMounted]);

  useEffect(() => {
    const openDrawer = () => setContactOpen(true);
    window.addEventListener(OPEN_CONTACT_EVENT, openDrawer);
    return () => window.removeEventListener(OPEN_CONTACT_EVENT, openDrawer);
  }, []);

  // Sticky header above the menu panel (z-50 > z-40). Panel is a sibling so
  // it can’t paint over the logo/X. Slides right ↔ left.
  const menuOpen = menuMounted;

  return (
    <>
      <header
        className={`sticky top-0 z-50 ${
          menuOpen || dark
            ? "border-b border-white/25 bg-[#1e1e1e] text-white"
            : "bg-bg text-black shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
        }`}
      >
        <div
          className={`mx-auto grid ${NAV_H} max-w-[1440px] grid-cols-[1fr_auto] items-center gap-4 px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-12`}
        >
          <div className="justify-self-start">
            <Logo onClick={menuOpen ? () => setOpen(false) : undefined} />
          </div>
          <nav className="hidden items-center gap-x-5 text-[15px] capitalize lg:flex xl:gap-x-7 xl:text-[18px]">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                {...item}
                active={isActive(item.href)}
                light={light}
              />
            ))}
          </nav>
          <div className="justify-self-end">
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              data-cursor="hover"
              className={`hidden font-grotesk text-[15px] font-normal capitalize underline-offset-[6px] transition-opacity hover:opacity-100 lg:block xl:text-[18px] ${
                light ? "text-white/80 hover:text-white" : "opacity-70"
              }`}
            >
              {contact.drawerTitle}
            </button>
            {menuOpen ? (
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                data-cursor="hover"
                className="flex size-10 items-center justify-center text-white transition-opacity hover:opacity-70 lg:hidden"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="size-[19px]"
                  fill="none"
                >
                  <path
                    d="M1 1L19 19M19 1L1 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                data-cursor="hover"
                className="flex h-10 w-10 items-center justify-center lg:hidden"
              >
                {/* Figma mobile: two-line mark (not a 3-line hamburger). */}
                <span aria-hidden className="flex w-[22px] flex-col gap-[7px]">
                  <span className="h-[2px] w-full rounded-full bg-current" />
                  <span className="h-[2px] w-full rounded-full bg-current" />
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className={`fixed inset-x-0 bottom-0 ${NAV_TOP} z-40 flex flex-col overflow-y-auto bg-[#1e1e1e] text-white transition-transform duration-300 ease-out lg:hidden ${
            menuEntered ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex min-h-full flex-col justify-center gap-6 px-6 pb-16 font-grotesk text-[34px] font-normal leading-none sm:text-[37px]">
            {mobileNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-cursor="hover"
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`w-fit capitalize underline-offset-8 transition-opacity hover:opacity-70 ${
                  isActive(item.href) ? "font-medium underline decoration-2" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setContactOpen(true);
              }}
              data-cursor="hover"
              className="w-fit capitalize text-left underline-offset-8 transition-opacity hover:opacity-70"
            >
              {contact.drawerTitle}
            </button>
          </nav>
        </div>
      )}

      <ContactDrawer open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
