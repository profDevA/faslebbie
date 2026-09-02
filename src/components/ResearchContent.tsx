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
import { hiResUrl } from "@/sanity/image";

// Figma 3393:3429 — inline book before paradigms; About-style hover preview.
function InlineBookThumb({ src, alt }: { src: string; alt: string }) {
  const imgSrc = hiResUrl(src, 2400) ?? src;
  const [hot, setHot] = useState(false);
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <span
      data-cursor="hover"
      data-hot={hot ? "" : undefined}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
      className="logo-chip relative z-0 mx-1 inline-flex h-6 translate-y-[-0.1em] items-center justify-center overflow-visible align-middle hover:z-40"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN URL */}
      <img
        src={imgSrc}
        alt={alt}
        className="h-full w-auto object-contain"
        onError={() => setFailed(true)}
      />
      <span aria-hidden className="logo-chip-preview">
        {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN URL */}
        <img src={imgSrc} alt="" className="h-auto w-full object-contain" />
      </span>
    </span>
  );
}

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

type Highlight = Extract<ResearchToken, { t: "hl" }>;
type Textish = Extract<ResearchToken, { text: string }>;

const isTextish = (tok: ResearchToken): tok is Textish => "text" in tok;

/** Sanity returns a string expansion as nested blocks, so read either shape. */
function expansionEdges(tok: Highlight) {
  if (tok.expand?.length) {
    const runs = tok.expand.filter(isTextish);
    return { first: runs[0]?.text, last: runs[runs.length - 1]?.text };
  }
  return { first: tok.expansion, last: tok.expansion };
}

/**
 * Fas writes reveals as an appositive clause spliced into the sentence
 * (", which get made on…,"). Rendered raw they collide with the sentence's own
 * punctuation, so the clause drops its trailing comma when the copy that
 * follows already supplies one, and its leading space when it opens on one.
 */
function trimTrailingPunctuation(tokens: ResearchToken[]): ResearchToken[] {
  const last = tokens.map(isTextish).lastIndexOf(true);
  if (last === -1) return tokens;
  const tok = tokens[last] as Textish;
  return tokens.map((t, i) =>
    i === last ? { ...tok, text: tok.text.replace(/\s*[,;:]\s*$/, "") } : t,
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
        if (tok.t === "break") return null;
        if (tok.t === "hl") {
          const open = openKey === tok.text;
          const expansion = tok.expansion;
          const hasExpand = Boolean(tok.expand?.length) || Boolean(expansion);
          const edges = expansionEdges(tok);
          const opensOnPunctuation = /^\s*[,.;:!?]/.test(edges.first ?? "");
          const next = tokens[j + 1];
          const dropTrailing =
            /[,;:]\s*$/.test(edges.last ?? "") &&
            Boolean(next && isTextish(next) && /^\s*[,;:]/.test(next.text));
          const runs =
            tok.expand?.length && dropTrailing
              ? trimTrailingPunctuation(tok.expand)
              : tok.expand;
          return (
            <Fragment key={key}>
              <KeyPill
                text={tok.text}
                open={open}
                onToggle={() => onToggleKey(tok.text)}
              />
              {open && hasExpand && (
                <>
                  {opensOnPunctuation ? null : " "}
                  {/* Marked as part of the key so the outside-click handler
                      doesn't close (and unmount) the expansion on pointerdown
                      before a link inside it can register its click. */}
                  <span
                    data-research-key
                    className="animate-[panel-in_0.35s_ease-out] font-normal"
                  >
                    {runs?.length ? (
                      <Tokens
                        tokens={runs}
                        prefix={`${key}x`}
                        openKey={openKey}
                        onToggleKey={onToggleKey}
                        onOpenSection={onOpenSection}
                      />
                    ) : dropTrailing ? (
                      expansion?.replace(/\s*[,;:]\s*$/, "")
                    ) : (
                      expansion
                    )}
                  </span>
                  {/* Rich runs own their trailing punctuation; string
                      expansions keep the About-style trailing space. */}
                  {runs?.length || dropTrailing ? null : " "}
                </>
              )}
            </Fragment>
          );
        }
        if (tok.t === "photo")
          return tok.src ? (
            <InlineBookThumb key={key} src={tok.src} alt={tok.alt} />
          ) : null;
        // `ext` hrefs are internal routes (/approach, /blogs). Drawn as red
        // underlined copy, as the Research page has always rendered them —
        // the nav pill is only used where a page frame actually draws one.
        if (tok.t === "ext")
          return (
            <Link
              key={key}
              href={tok.href}
              data-cursor="hover"
              className="text-accent underline decoration-from-font underline-offset-2 hover:decoration-2"
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

function splitParas(tokens: ResearchToken[]): ResearchToken[][] {
  const out: ResearchToken[][] = [[]];
  for (const tok of tokens) {
    if (tok.t === "break") {
      if (out[out.length - 1].length) out.push([]);
      continue;
    }
    out[out.length - 1].push(tok);
  }
  return out.filter((p) => p.length > 0);
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
      className={`page-body-prose text-black ${className}`}
    >
      {areas.map((area, i) => (
        <div key={area.kicker} className="mb-12 lg:mb-16">
          <p className="page-body-kicker mb-5 capitalize text-black">
            {area.kicker}
          </p>
          {splitParas(area.body).map((para, pi) => (
            <p key={pi} className={pi > 0 ? "mt-7" : undefined}>
              <Tokens
                tokens={para}
                prefix={`a${i}p${pi}`}
                openKey={openKey}
                onToggleKey={toggleKey}
                onOpenSection={onOpen}
              />
            </p>
          ))}
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
