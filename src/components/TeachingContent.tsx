"use client";

import { Fragment, useEffect, useState } from "react";
import {
  CYCLE_CHIP,
  NavPill,
  NavPillButton,
  PopupLink,
  STATIC_PILL,
  expandPillClass,
  onActivateKey,
} from "@/components/InlineToken";
import type { TeachSection, TeachToken } from "@/lib/teaching";

function StaticPill({ text }: { text: string }) {
  return (
    <span className={STATIC_PILL}>
      {text}
    </span>
  );
}

function RevealPill({
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
      data-teach-key
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

function Term({ text }: { text: string }) {
  return <span className={CYCLE_CHIP}>{text}</span>;
}

function renderTokens(
  tokens: TeachToken[],
  prefix: string,
  onSeeAll: () => void,
  openKey: string | null,
  toggle: (key: string) => void,
) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`;
    if (tok.t === "pill") {
      if (!tok.expansion) return <StaticPill key={key} text={tok.text} />;
      const open = openKey === tok.text;
      // Reveals are an appositive clause spliced into the sentence
      // (", where I teach…,"), so they drop the leading space when they open on
      // punctuation and the trailing comma when the copy after already has one.
      const next = tokens[j + 1];
      const dropTrailing =
        /[,;:]\s*$/.test(tok.expansion) &&
        Boolean(next && next.t === "text" && /^\s*[,;:]/.test(next.text));
      return (
        <Fragment key={key}>
          <RevealPill
            text={tok.text}
            open={open}
            onToggle={() => toggle(tok.text)}
          />
          {open && (
            <>
              {/^\s*[,.;:!?]/.test(tok.expansion) ? null : " "}
              <span
                data-teach-key
                className="animate-[panel-in_0.35s_ease-out] font-normal"
              >
                {dropTrailing
                  ? tok.expansion.replace(/\s*[,;:]\s*$/, "")
                  : tok.expansion}
              </span>
              {dropTrailing ? null : " "}
            </>
          )}
        </Fragment>
      );
    }
    if (tok.t === "term") return <Term key={key} text={tok.text} />;
    if (tok.t === "student")
      return (
        <PopupLink
          key={key}
          href={`/teaching?view=works&student=${tok.id}`}
          className="whitespace-nowrap"
        >
          {tok.text}
        </PopupLink>
      );
    if (tok.t === "action") {
      if (tok.kind === "students") {
        return (
          <NavPillButton key={key} onClick={onSeeAll}>
            {tok.text}
          </NavPillButton>
        );
      }
      return (
        <NavPill key={key} href="/teaching/exhibition">
          {tok.text}
        </NavPill>
      );
    }
    return <Fragment key={key}>{tok.text}</Fragment>;
  });
}

export default function TeachingContent({
  className = "",
  intro,
  sections,
  onSeeAllStudents,
}: {
  className?: string;
  intro: TeachToken[][];
  sections: TeachSection[];
  onSeeAllStudents: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  useEffect(() => {
    if (!openKey) return;
    const close = () => setOpenKey(null);
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.("[data-teach-key]")) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openKey]);

  return (
    <section
      className={`page-body-prose text-black ${className}`}
    >
      {intro.map((para, i) => (
        <p key={`intro-${i}`} className="mb-10">
          {renderTokens(para, `intro-${i}`, onSeeAllStudents, openKey, toggle)}
        </p>
      ))}

      {sections.map((section, s) => (
        <div key={section.kicker} className={s === 0 ? "" : "mt-12"}>
          <p className="page-body-eyebrow mb-4 text-black/50">
            {section.kicker}
          </p>
          {section.paragraphs.map((para, i) => (
            <p key={`s${s}-p${i}`} className="mb-6 last:mb-0">
              {renderTokens(
                para,
                `s${s}-p${i}`,
                onSeeAllStudents,
                openKey,
                toggle,
              )}
            </p>
          ))}
          <p className="mt-2">
            {section.action.kind === "students" ? (
              <NavPillButton onClick={onSeeAllStudents}>
                {section.action.text}
              </NavPillButton>
            ) : (
              <NavPill href="/teaching/exhibition">{section.action.text}</NavPill>
            )}
          </p>
        </div>
      ))}
    </section>
  );
}
