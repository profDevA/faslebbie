"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navItems } from "@/lib/content";

const contactItem = { label: "Contact", href: "/contact" };

// "Fas Lebbie, Ph.D." — normal caps per the mobile frame (16:636). NOTE: the
// desktop nav frame (40:625) shows a small-caps variant ("Fas lebbie"); unified
// on normal caps for consistency — flag to Fas if the small-caps was intended.
function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      data-cursor="hover"
      className="whitespace-nowrap font-logo text-[18px] font-bold tracking-[-0.02em] lg:text-[20px]"
    >
      Fas Lebbie, Ph.D.
    </Link>
  );
}

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      data-cursor="hover"
      className="whitespace-nowrap font-serif font-medium uppercase tracking-[0.02em]"
    >
      {label}
    </Link>
  );
}

export default function Nav({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 ${
        dark
          ? "bg-[#141414] text-bg"
          : "bg-bg text-black shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
      }`}
    >
      <div className="mx-auto flex h-[52px] max-w-[1380px] items-center justify-between gap-8 px-6">
        <Logo />
        {/* Desktop: full horizontal menu */}
        <nav className="hidden items-center gap-x-6 text-[14px] uppercase lg:flex xl:gap-x-10">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <Link
          href="/contact"
          data-cursor="hover"
          className="hidden font-serif text-[16px] font-medium lg:block"
        >
          Contact
        </Link>
        {/* Mobile/tablet: MENU toggle */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-cursor="hover"
          className="font-serif text-[16px] uppercase tracking-[0.02em] lg:hidden"
        >
          Menu
        </button>
      </div>

      {/* Mobile/tablet: full-screen menu overlay. Dark treatment for clear
          contrast vs. the light page (Fas 06/12: "make it black"). */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#141414] text-bg lg:hidden">
          <div className="flex h-[52px] shrink-0 items-center justify-between px-6">
            <Logo onClick={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              data-cursor="hover"
              className="font-serif text-[16px] uppercase tracking-[0.02em]"
            >
              Close
            </button>
          </div>
          <nav className="flex flex-col gap-[18px] px-6 pt-10 text-[32px] uppercase leading-[1.1]">
            {[...navItems, contactItem].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-cursor="hover"
                className="font-serif font-medium"
              >
                {/* ZWSP after "/" lets long labels wrap at the slash (Figma 21:30) */}
                {item.label.replace("/", "/​")}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
