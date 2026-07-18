"use client";

import { Fragment } from "react";
import type { TeachSection, TeachToken } from "@/lib/teaching";
import { teachingIntro, teachingSections } from "@/lib/teaching";

// Static gray institution pill (Figma 16-22597 intro) — same look as the
// About/Leadership keyword pills but non-interactive here.
function Pill({ text }: { text: string }) {
  return (
    <span className="mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-black text-shadow-token">
      {text}
    </span>
  );
}

// Black `>/~` terminal-style highlight (Figma — the "learn it" cycle term).
function Term({ text }: { text: string }) {
  return (
    <span className="mx-[0.1em] box-decoration-clone bg-[#141414] px-[0.4em] py-[0.08em] text-[1em] leading-[1.7] text-bg">
      <span className="mr-[0.3em]">{">/~"}</span>
      {text}
    </span>
  );
}

// Red, underlined link (student project or action).
function RedLink({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      data-cursor="hover"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer whitespace-nowrap text-accent underline decoration-from-font underline-offset-2 text-shadow-token transition-opacity hover:opacity-70"
    >
      {text}
    </span>
  );
}

function renderTokens(
  tokens: TeachToken[],
  prefix: string,
  onOpenStudent: (id: string) => void,
  onSeeAll: () => void,
  onExhibition: () => void,
) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`;
    if (tok.t === "pill") return <Pill key={key} text={tok.text} />;
    if (tok.t === "term") return <Term key={key} text={tok.text} />;
    if (tok.t === "student")
      return (
        <RedLink key={key} text={tok.text} onClick={() => onOpenStudent(tok.id)} />
      );
    if (tok.t === "action")
      return (
        <RedLink
          key={key}
          text={tok.text}
          onClick={tok.kind === "students" ? onSeeAll : onExhibition}
        />
      );
    return <Fragment key={key}>{tok.text}</Fragment>;
  });
}

export default function TeachingContent({
  className = "",
  intro = teachingIntro,
  sections = teachingSections,
  onOpenStudent,
  onSeeAllStudents,
  onOpenExhibition,
}: {
  className?: string;
  intro?: TeachToken[][];
  sections?: TeachSection[];
  onOpenStudent: (id: string) => void;
  onSeeAllStudents: () => void;
  onOpenExhibition: () => void;
}) {
  return (
    <section
      className={`font-grotesk text-[28px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
      {intro.map((para, i) => (
        <p key={`intro-${i}`} className="mb-10">
          {renderTokens(
            para,
            `intro-${i}`,
            onOpenStudent,
            onSeeAllStudents,
            onOpenExhibition,
          )}
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
                onOpenStudent,
                onSeeAllStudents,
                onOpenExhibition,
              )}
            </p>
          ))}
          <p className="mt-2">
            <RedLink
              text={section.action.text}
              onClick={
                section.action.kind === "students"
                  ? onSeeAllStudents
                  : onOpenExhibition
              }
            />
          </p>
        </div>
      ))}
    </section>
  );
}
