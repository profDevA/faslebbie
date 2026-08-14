"use client";

import { Fragment } from "react";
import { PopupTrigger } from "@/components/InlineToken";
import type { BuildToken } from "@/lib/build";

function renderTokens(
  tokens: BuildToken[],
  prefix: string,
  onOpenProject: (id: string) => void,
) {
  return tokens.map((tok, j) => {
    const key = `${prefix}-${j}`;
    if (tok.t === "proj")
      return (
        <PopupTrigger
          key={key}
          onClick={() => onOpenProject(tok.id)}
          className="whitespace-nowrap"
        >
          {tok.text}
        </PopupTrigger>
      );
    return <Fragment key={key}>{tok.text}</Fragment>;
  });
}

export default function BuildContent({
  className = "",
  intro,
  onOpenProject,
}: {
  className?: string;
  intro: BuildToken[][];
  onOpenProject: (id: string) => void;
}) {
  return (
    <section
      className={`font-grotesk text-[24px] font-medium leading-[1.6] tracking-[1.65px] text-black md:text-[32px] lg:text-[42px] lg:leading-[1.6] lg:tracking-[0.5px] ${className}`}
    >
      {intro.map((para, i) => (
        <p key={i} className="mb-8 last:mb-0">
          {renderTokens(para, `p${i}`, onOpenProject)}
        </p>
      ))}
    </section>
  );
}
