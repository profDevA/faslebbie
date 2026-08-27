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
      className={`page-body-prose text-black ${className}`}
    >
      {intro.map((para, i) => (
        <p key={i} className="mb-8 last:mb-0">
          {renderTokens(para, `p${i}`, onOpenProject)}
        </p>
      ))}
    </section>
  );
}
