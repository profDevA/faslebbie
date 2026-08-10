"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import {
  PopupTrigger,
  expandPillClass,
  onActivateKey,
} from "@/components/InlineToken";
import type {
  ResearchArea,
  ResearchSectionId,
  ResearchToken,
} from "@/lib/research";

// Reveal-narrative keyword — the shared grey pill (see InlineToken).
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
      onKeyDown={onActivateKey(onToggle)}
      className={expandPillClass(open)}
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
          const expansion = tok.expansion;
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
        // `ext` hrefs are internal routes (/leadership, /blogs). Drawn as red
        // underlined copy, as the Research page has always rendered them —
        // the nav pill is only used where a page frame actually draws one.
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
          <PopupTrigger key={key} onClick={() => onOpenSection(tok.opens)}>
            {tok.text}
          </PopupTrigger>
        );
      })}
    </>
  );
}

export default function ResearchContent({
  className = "",
  onOpen,
  areas,
  closing,
}: {
  className?: string;
  onOpen: (id: ResearchSectionId) => void;
  /** From Sanity only — empty arrays render an empty page body. */
  areas: ResearchArea[];
  closing: ResearchToken[];
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
      // Keep the reveal open while interacting with (and closing) a section
      // modal it launched — only an outside click on the page itself closes it.
      if (t?.closest?.("[data-research-key], [data-research-modal]")) return;
      setOpenKey(null);
    };
    const onKey = (e: KeyboardEvent) => {
      // Escape closes the modal first; don't also collapse the reveal when a
      // modal is open (let the reveal persist so the user returns to it).
      if (e.key === "Escape" && !document.querySelector("[data-research-modal]"))
        setOpenKey(null);
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
