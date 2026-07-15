"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  researchAreas,
  researchClosing,
  researchExpansions,
  type ResearchArea,
  type ResearchSectionId,
  type ResearchToken,
} from "@/lib/research";

// Clickable grey keyword pill (same chrome + behaviour as the About page): grey
// pill with a soft drop-shadow that inverts to a black pill on hover / while
// open, and reveals inline continuation copy when clicked.
function KeyPill({
  text,
  open,
  onToggle,
}: {
  text: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      data-research-key
      data-cursor="hover"
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`mx-[0.05em] box-decoration-clone cursor-pointer rounded-full px-[0.3em] py-[0.095em] leading-none transition-colors duration-200 ${
        open
          ? "bg-black text-white"
          : "bg-pill text-black text-shadow-token hover:bg-black hover:text-white hover:text-shadow-none"
      }`}
    >
      {text}
    </span>
  );
}

function Tokens({
  tokens,
  prefix,
  openKey,
  onToggleKey,
  onOpenSection,
}: {
  tokens: ResearchToken[];
  prefix: string;
  openKey: string | null;
  onToggleKey: (key: string) => void;
  onOpenSection: (id: ResearchSectionId) => void;
}) {
  return (
    <>
      {tokens.map((tok, j) => {
        const key = `${prefix}-${j}`;
        if (tok.t === "text") return <Fragment key={key}>{tok.text}</Fragment>;
        if (tok.t === "hl") {
          const open = openKey === tok.text;
          const expansion = tok.expansion ?? researchExpansions[tok.text];
          const hasExpand = Boolean(tok.expand?.length) || Boolean(expansion);
          return (
            <Fragment key={key}>
              <KeyPill
                text={tok.text}
                open={open}
                onToggle={() => onToggleKey(tok.text)}
              />
              {open && hasExpand && (
                <>
                  {" "}
                  {/* Marked as part of the key so the outside-click handler
                      doesn't close (and unmount) the expansion on pointerdown
                      before a link inside it can register its click. */}
                  <span
                    data-research-key
                    className="animate-[panel-in_0.35s_ease-out] font-normal"
                  >
                    {tok.expand?.length ? (
                      <Tokens
                        tokens={tok.expand}
                        prefix={`${key}x`}
                        openKey={openKey}
                        onToggleKey={onToggleKey}
                        onOpenSection={onOpenSection}
                      />
                    ) : (
                      expansion
                    )}
                  </span>
                  {/* Rich runs own their trailing punctuation; string
                      expansions keep the About-style trailing space. */}
                  {tok.expand?.length ? null : " "}
                </>
              )}
            </Fragment>
          );
        }
        if (tok.t === "ext")
          return (
            <Link
              key={key}
              href={tok.href}
              data-cursor="hover"
              className="text-accent text-shadow-token underline decoration-from-font underline-offset-2 hover:decoration-2"
            >
              {tok.text}
            </Link>
          );
        // link → opens the research modal at its section
        return (
          <span
            key={key}
            role="button"
            tabIndex={0}
            data-cursor="hover"
            onClick={() => onOpenSection(tok.opens)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenSection(tok.opens);
              }
            }}
            className="cursor-pointer text-accent text-shadow-token underline decoration-from-font underline-offset-2 hover:decoration-2"
          >
            {tok.text}
          </span>
        );
      })}
    </>
  );
}

export default function ResearchContent({
  className = "",
  onOpen,
  areas = researchAreas,
  closing = researchClosing,
}: {
  className?: string;
  onOpen: (id: ResearchSectionId) => void;
  areas?: ResearchArea[];
  closing?: ResearchToken[];
}) {
  // One grey expansion open at a time (About-style). Click-outside / Escape
  // closes it.
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggleKey = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  useEffect(() => {
    if (!openKey) return;
    const close = (e: Event) => {
      const t = e.target as Element | null;
      if (t?.closest?.("[data-research-key]")) return;
      setOpenKey(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  return (
    <section
      className={`font-grotesk text-[26px] font-medium leading-[1.6] tracking-[0.5px] text-black md:text-[30px] lg:text-[36px] lg:leading-[1.6] ${className}`}
    >
      {areas.map((area, i) => (
        <div key={area.kicker} className="mb-12 lg:mb-16">
          <p className="mb-5 font-grotesk text-[16px] font-medium capitalize text-black lg:text-[18px]">
            {area.kicker}
          </p>
          <p>
            <Tokens
              tokens={area.body}
              prefix={`a${i}`}
              openKey={openKey}
              onToggleKey={toggleKey}
              onOpenSection={onOpen}
            />
          </p>
        </div>
      ))}
      <p>
        <Tokens
          tokens={closing}
          prefix="closing"
          openKey={openKey}
          onToggleKey={toggleKey}
          onOpenSection={onOpen}
        />
      </p>
    </section>
  );
}
