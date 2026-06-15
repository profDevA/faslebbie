"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  aboutLogos,
  aboutPanels,
  aboutParagraphs,
  roleCredentials,
  roleWords,
} from "@/lib/content";

// Inline brand logo chip — colored rounded box with the logo, like the Figma.
function LogoChip({ name }: { name: keyof typeof aboutLogos }) {
  const logo = aboutLogos[name];
  return (
    <span
      className="mx-1 inline-flex h-[1.1em] w-[1.25em] items-center justify-center overflow-hidden rounded-[5px] align-middle"
      style={{ backgroundColor: logo.bg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static logo */}
      <img src={logo.src} alt={name} className="max-h-[70%] max-w-[78%] object-contain" />
    </span>
  );
}

// System 1: designer/researcher/educator typer. Clicking backspaces and types
// the next role (typewriter) and reveals that role's credential as a >/~ tag.
function RoleTyper() {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(roleWords[0]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const target = roleWords[idx];
    let cancelled = false;
    const timers: number[] = [];
    let t = 0;
    setShown((current) => {
      for (let i = current.length - 1; i >= 0; i--) {
        const n = i;
        timers.push(window.setTimeout(() => !cancelled && setShown(current.slice(0, n)), t));
        t += 45;
      }
      for (let i = 1; i <= target.length; i++) {
        const n = i;
        timers.push(window.setTimeout(() => !cancelled && setShown(target.slice(0, n)), t));
        t += 65;
      }
      return current;
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <>
      <button
        type="button"
        data-cursor="hover"
        onClick={() => {
          setIdx((i) => (i + 1) % roleWords.length);
          setRevealed(true);
        }}
        className="mx-1 inline-flex items-center rounded-[6px] bg-[#141414] px-2.5 py-0.5 align-middle font-grotesk text-[0.8em] lowercase text-bg"
        aria-label={`Role: ${shown}. Click to cycle.`}
      >
        <span className="mr-1.5 text-accent">{">/~"}</span>
        {shown}
        <span className="ml-0.5 inline-block w-px animate-pulse self-stretch bg-bg" />
      </button>
      {revealed && (
        <span className="mx-1 inline-flex items-center rounded-[6px] bg-[#141414] px-2.5 py-0.5 align-middle font-grotesk text-[0.8em] lowercase text-bg">
          <span className="mr-1.5 text-accent">{">/~"}</span>
          {roleCredentials[roleWords[idx]]}
        </span>
      )}
    </>
  );
}

// Dropdown panel for an About keyword (Systems 2 & 3) — mirrors the homepage panel.
function AboutPanel({ keyword, onClose }: { keyword: string; onClose: () => void }) {
  const panel = aboutPanels[keyword];
  if (!panel) return null;
  return (
    <span className="mt-4 block animate-[panel-in_0.25s_ease-out] text-left text-[16px] leading-[1.4] tracking-[0.04em]">
      <span className="relative block w-full max-w-[760px] border-l-4 border-accent bg-panel px-[17px] py-[14px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="absolute right-[12px] top-[10px] font-serif text-[20px] leading-none text-black/60 transition-colors hover:text-black"
        >
          ×
        </button>
        <span className="block pr-6 font-bold lowercase">{keyword}</span>
        {panel.body.map((b, i) => (
          <span key={i} className="mt-2 block font-medium">
            {b}
          </span>
        ))}
        {panel.placeholder && (
          <span className="mt-1 block text-[12px] uppercase tracking-wider text-black/40">
            placeholder — final copy pending
          </span>
        )}
        {panel.cta && (
          <Link
            href={panel.cta.href}
            data-cursor="hover"
            className="mt-2 inline-block font-medium text-accent underline underline-offset-2"
          >
            {panel.cta.label} →
          </Link>
        )}
      </span>
    </span>
  );
}

export default function AboutContent() {
  const [active, setActive] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Click outside closes the open panel (keyword clicks toggle themselves).
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.("[data-about-key], [data-about-panel]")) return;
      setActive(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active]);

  return (
    <section
      ref={rootRef}
      id="about"
      className="mx-auto w-full max-w-[1088px] px-6 pb-32 pt-8 font-serif text-[clamp(22px,2.6vw,34px)] font-medium leading-[1.5] tracking-[0.02em]"
    >
      {aboutParagraphs.map((para, i) => {
        const activeInThisPara =
          active && para.some((t) => t.t === "key" && t.text === active);
        return (
          <p key={i} className="mb-7">
            {para.map((tok, j) => {
              if (tok.t === "text") return <span key={j}>{tok.text}</span>;
              if (tok.t === "role") return <RoleTyper key={j} />;
              if (tok.t === "logo") return <LogoChip key={j} name={tok.name} />;
              if (tok.t === "term") {
                return (
                  <span
                    key={j}
                    className="mx-1 inline-flex items-center rounded-[6px] bg-[#141414] px-2.5 py-0.5 align-middle font-grotesk text-[0.8em] lowercase text-bg"
                  >
                    <span className="mr-1.5 text-accent">{">/~"}</span>
                    {tok.text}
                  </span>
                );
              }
              // key — red keyword on a gray pill; expands a dropdown (Systems 2/3)
              const isActive = active === tok.text;
              const hasPanel = Boolean(aboutPanels[tok.text]);
              return (
                <button
                  key={j}
                  type="button"
                  data-about-key
                  data-cursor="hover"
                  aria-expanded={isActive}
                  onClick={() =>
                    hasPanel && setActive((cur) => (cur === tok.text ? null : tok.text))
                  }
                  className={`mx-[0.05em] rounded-full px-[0.25em] text-accent transition-colors ${
                    isActive ? "bg-black/20" : "bg-pill hover:bg-black/15"
                  }`}
                >
                  {tok.text}
                </button>
              );
            })}
            {activeInThisPara && active && (
              <span data-about-panel>
                <AboutPanel keyword={active} onClose={() => setActive(null)} />
              </span>
            )}
          </p>
        );
      })}
    </section>
  );
}
