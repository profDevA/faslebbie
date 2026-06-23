"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navItems, mobileNavItems } from "@/lib/content";

const contactItem = { label: "Contact", href: "/contact" };
const contactEmail = "dr.faslebbie@gmail.com";

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
      Fas lebbie, Ph.D.
    </Link>
  );
}

// Nav links — Neue Haas Grotesk 55 Roman, capitalized (Figma 854:79643). The
// surname/words render Capitalized rather than all-caps.
function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      data-cursor="hover"
      className="whitespace-nowrap font-grotesk font-normal capitalize"
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
      <div className="mx-auto flex h-13 max-w-345 items-center justify-between gap-8 px-6">
        <Logo />
        {/* Desktop: full horizontal menu */}
        <nav className="hidden items-center gap-x-6 text-[15px] capitalize lg:flex xl:gap-x-9 xl:text-[18px]">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
        <Link
          href="/contact"
          data-cursor="hover"
          className="hidden font-grotesk text-[15px] font-normal capitalize lg:block xl:text-[18px]"
        >
          Contact
        </Link>
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

      {/* Mobile/tablet: full-screen menu overlay. Slides down on open and matches
          the light page treatment (Figma 187:3325): #e5e5de bg, black text,
          Neue Haas Grotesk links, CLOSE label, email footer. */}
      {open && (
        <div className="fixed inset-0 z-50 flex animate-[menu-in_0.3s_ease-out] flex-col overflow-y-auto bg-bg text-black lg:hidden">
          <div className="sticky top-0 flex h-13 shrink-0 items-center justify-between bg-bg px-6 shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
            <Logo onClick={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              data-cursor="hover"
              className="font-grotesk text-[16px] uppercase tracking-[0.02em]"
            >
              Close
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-[31px] px-5 pt-16 font-grotesk text-[36px] font-normal uppercase leading-none">
            {[...mobileNavItems, contactItem].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-cursor="hover"
              >
                {/* ZWSP after "/" lets long labels wrap at the slash (Figma 21:30) */}
                {item.label.replace("/", "/​")}
              </Link>
            ))}
          </nav>
          <a
            href={`mailto:${contactEmail}`}
            data-cursor="hover"
            className="px-5 pb-10 pt-6 font-grotesk text-[14px] uppercase tracking-wide text-black/70"
          >
            [ {contactEmail} ]
          </a>
        </div>
      )}
    </header>
  );
}
