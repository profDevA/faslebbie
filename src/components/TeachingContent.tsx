"use client";

import { Fragment, useEffect, useState } from "react";
import {
  CYCLE_CHIP,
  NavPill,
  NavPillButton,
  PopupLink,
  expandPillClass,
  onActivateKey,
} from "@/components/InlineToken";
import type { TeachSection, TeachToken } from "@/lib/teaching";

function StaticPill({ text }: { text: string }) {
  return (
    <span className="mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-black text-shadow-token">
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
      return (
        <Fragment key={key}>
          <RevealPill
            text={tok.text}
            open={open}
            onToggle={() => toggle(tok.text)}
          />
          {open && (
            <>
              {" "}
              <span
                data-teach-key
                className="animate-[panel-in_0.35s_ease-out] font-normal"
              >
                {tok.expansion}
              </span>{" "}
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
      className={`font-grotesk text-[28px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[32px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
      {intro.map((para, i) => (
        <p key={`intro-${i}`} className="mb-10">
          {renderTokens(para, `intro-${i}`, onSeeAllStudents, openKey, toggle)}
        </p>
      ))}

      {sections.map((section, s) => (
        <div key={section.kicker} className={s === 0 ? "" : "mt-12"}>
          <p className="mb-4 font-grotesk text-[14px] font-medium tracking-[0.08em] text-black/50">
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
