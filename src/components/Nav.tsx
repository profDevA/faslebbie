"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ContactDrawer from "@/components/ContactDrawer";
import { useSite } from "@/components/SiteProvider";
import { projectNavItems } from "@/lib/content";
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
      className={`whitespace-nowrap font-grotesk capitalize transition-opacity ${
        light
          ? active
            ? "font-medium text-white"
            : "font-normal text-white/80 hover:text-white"
          : active
            ? "font-medium"
            : "font-normal opacity-70 hover:opacity-100"
      }`}
    >
      {label}
    </Link>
  );
}

/** Projects ▾ — Case Studies + Build/Playground (Figma project-dropdown). */
function ProjectsMenu({ light }: { light?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = projectNavItems.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        data-cursor="hover"
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 whitespace-nowrap font-grotesk capitalize transition-opacity ${
          light
            ? active
              ? "font-medium text-white"
              : "font-normal text-white/80 hover:text-white"
            : active
              ? "font-medium"
              : "font-normal opacity-70 hover:opacity-100"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        Projects
        <svg
          aria-hidden
          viewBox="0 0 8 5"
          className={`h-[5px] w-[8px] fill-current transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </button>
      {open && (
        // pt-2 (not mt-2): keeps a visual gap without a dead hover zone that
        // would close the menu before you can click a link.
        <div className="absolute left-0 top-full z-50 pt-2">
          <div className="min-w-[11.5rem] rounded-[4px] bg-[#1a1a1a] px-4 py-3 text-white shadow-lg">
            <ul className="flex flex-col gap-2.5 font-grotesk text-[15px] xl:text-[16px]">
              {projectNavItems.map((item) => {
                const on =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-cursor="hover"
                      aria-current={on ? "page" : undefined}
                      className={`block w-fit capitalize transition-opacity ${
                        on
                          ? "opacity-100"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const MENU_MS = 300;

export default function Nav({ dark = false }: { dark?: boolean }) {
  const { navItems, mobileNavItems, contact } = useSite();
  const [open, setOpen] = useState(false);
  // Keep panel mounted through the close slide (open alone would unmount instantly).
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuEntered, setMenuEntered] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const isActive = useIsActive();
  const light = dark;

  // Desktop / mobile: Home + About + Projects▾ + rest. Case Studies / Build under Projects.
  const home =
    navItems.find((i) => i.href === "/") ?? { label: "Home", href: "/" };
  const desktopRest = navItems.filter(
    (i) => i.href !== "/work" && i.href !== "/build" && i.href !== "/",
  );
  const about = desktopRest.find((i) => i.href === "/about");
  const afterProjects = desktopRest.filter((i) => i.href !== "/about");

  const mobileHome =
    mobileNavItems.find((i) => i.href === "/") ?? home;
  const mobileAbout = mobileNavItems.find((i) => i.href === "/about");
  const mobileAfter = mobileNavItems.filter(
    (i) =>
      i.href !== "/" &&
      i.href !== "/about" &&
      i.href !== "/work" &&
      i.href !== "/build",
  );

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

  // Header stays above the panel (z-50 > z-40). Panel is a sibling, not a
  // child, so it can’t paint over the logo/X. Slides right ↔ left.
  const menuOpen = menuMounted;

  return (
    <>
      {/* Spacer keeps page layout when the header is pinned fixed — without
          this, Work/Build/etc. .txt/.img content jumps/disappears on open. */}
      {menuOpen && <div className={`shrink-0 ${NAV_H}`} aria-hidden />}
      <header
        className={`${
          menuOpen ? "fixed inset-x-0 top-0 z-50" : "relative z-50"
        } ${
          menuOpen || dark
            ? "border-b border-white/25 bg-[#1e1e1e] text-white"
            : "bg-bg text-black shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
        }`}
      >
        <div
          className={`mx-auto grid ${NAV_H} max-w-[1350px] grid-cols-[1fr_auto] items-center gap-4 px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-12`}
        >
          <div className="justify-self-start">
            <Logo onClick={menuOpen ? () => setOpen(false) : undefined} />
          </div>
          <nav className="hidden items-center gap-x-5 text-[15px] capitalize lg:flex xl:gap-x-7 xl:text-[18px]">
            <NavLink
              label={home.label}
              href={home.href}
              active={isActive(home.href)}
              light={light}
            />
            {about && (
              <NavLink
                label={about.label}
                href={about.href}
                active={isActive(about.href)}
                light={light}
              />
            )}
            <ProjectsMenu light={light} />
            {afterProjects.map((item) => (
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
                onClick={() => {
                  setOpen(true);
                  setProjectsOpen(false);
                }}
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
            <Link
              href={mobileHome.href}
              onClick={() => setOpen(false)}
              data-cursor="hover"
              aria-current={isActive(mobileHome.href) ? "page" : undefined}
              className={`w-fit capitalize transition-opacity hover:opacity-70 ${
                isActive(mobileHome.href) ? "font-medium" : ""
              }`}
            >
              {mobileHome.label}
            </Link>
            {mobileAbout && (
              <Link
                href={mobileAbout.href}
                onClick={() => setOpen(false)}
                data-cursor="hover"
                aria-current={isActive(mobileAbout.href) ? "page" : undefined}
                className={`w-fit capitalize transition-opacity hover:opacity-70 ${
                  isActive(mobileAbout.href) ? "font-medium" : ""
                }`}
              >
                {mobileAbout.label}
              </Link>
            )}
            <div>
              <button
                type="button"
                data-cursor="hover"
                aria-expanded={projectsOpen}
                onClick={() => setProjectsOpen((v) => !v)}
                className="flex w-fit items-center gap-3 capitalize transition-opacity hover:opacity-70"
              >
                Projects
                <svg
                  aria-hidden
                  viewBox="0 0 8 5"
                  className={`h-[10px] w-[16px] transition-transform ${
                    projectsOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M0.5 0.5L4 4.5L7.5 0.5"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
              </button>
              {projectsOpen && (
                <ul className="mt-4 flex flex-col gap-4 pl-4 text-[28px] sm:text-[30px]">
                  {projectNavItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        data-cursor="hover"
                        aria-current={
                          isActive(item.href) ? "page" : undefined
                        }
                        className={`w-fit capitalize transition-opacity hover:opacity-70 ${
                          isActive(item.href) ? "font-medium" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {mobileAfter.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                data-cursor="hover"
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`w-fit capitalize transition-opacity hover:opacity-70 ${
                  isActive(item.href) ? "font-medium" : ""
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
