"use client";

import { Fragment } from "react";
import type { BuildToken } from "@/lib/build";
import { buildIntro } from "@/lib/build";

// Red underlined project link — opens the paged project modal (Figma 16-3007).
function ProjectLink({
  text,
  onOpen,
}: {
  text: string;
  onOpen: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      data-cursor="hover"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer whitespace-nowrap text-accent underline decoration-from-font underline-offset-2 text-shadow-token transition-opacity hover:opacity-70"
    >
      {text}
    </span>
  );
}

function renderTokens(
  tokens: BuildToken[],
  prefix: string,
  onOpenProject: (id: string) => void,
) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`;
    if (tok.t === "proj")
      return (
        <ProjectLink
          key={key}
          text={tok.text}
          onOpen={() => onOpenProject(tok.id)}
        />
      );
    return <Fragment key={key}>{tok.text}</Fragment>;
  });
}

export default function BuildContent({
  className = "",
  onOpenProject,
}: {
  className?: string;
  onOpenProject: (id: string) => void;
}) {
  return (
    <section
      className={`font-serif text-[28px] font-medium leading-[1.6] tracking-[0.5px] text-black md:text-[32px] lg:text-[42px] lg:leading-normal ${className}`}
    >
      {buildIntro.map((para, i) => (
        <p key={i} className="mb-8 last:mb-0">
          {renderTokens(para, `p${i}`, onOpenProject)}
        </p>
      ))}
    </section>
  );
}
