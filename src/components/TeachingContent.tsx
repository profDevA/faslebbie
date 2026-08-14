"use client";

import { Fragment } from "react";
import {
  CYCLE_CHIP,
  NavPill,
  NavPillButton,
  PopupLink,
} from "@/components/InlineToken";
import type { TeachSection, TeachToken } from "@/lib/teaching";

/** Static grey institution pill from the intro (Figma 16-22597). */
function Pill({ text }: { text: string }) {
  return (
    <span className="mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-black text-shadow-token">
      {text}
    </span>
  );
}

/** The black `>/~` term, e.g. "learn it". */
function Term({ text }: { text: string }) {
  return <span className={CYCLE_CHIP}>{text}</span>;
}

function renderTokens(
  tokens: TeachToken[],
  prefix: string,
  onSeeAll: () => void,
) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`;
    if (tok.t === "pill") return <Pill key={key} text={tok.text} />;
    if (tok.t === "term") return <Term key={key} text={tok.text} />;
    if (tok.t === "student")
      return (
        <PopupLink
          key={key}
          href={`/teaching/students/${tok.id}`}
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
  return (
    <section
      className={`font-grotesk text-[28px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
      {intro.map((para, i) => (
        <p key={`intro-${i}`} className="mb-10">
          {renderTokens(para, `intro-${i}`, onSeeAllStudents)}
        </p>
      ))}

      {sections.map((section, s) => (
        <div key={section.kicker} className={s === 0 ? "" : "mt-12"}>
          <p className="mb-4 font-grotesk text-[14px] font-medium tracking-[0.08em] text-black/50">
            {section.kicker}
          </p>
          {section.paragraphs.map((para, i) => (
            <p key={`s${s}-p${i}`} className="mb-6 last:mb-0">
              {renderTokens(para, `s${s}-p${i}`, onSeeAllStudents)}
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
