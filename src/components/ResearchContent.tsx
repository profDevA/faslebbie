"use client";

import { Fragment } from "react";
import Link from "next/link";
import {
  researchAreas,
  researchClosing,
  type ResearchSectionId,
  type ResearchToken,
} from "@/lib/research";

// Grey highlight pill — same emphasis chrome as About/Leadership keywords.
function Pill({ text }: { text: string }) {
  return (
    <span className="mx-[0.05em] box-decoration-clone rounded-full bg-pill px-[0.3em] py-[0.095em] leading-none text-black">
      {text}
    </span>
  );
}

function Tokens({
  tokens,
  prefix,
  onOpen,
}: {
  tokens: ResearchToken[];
  prefix: string;
  onOpen: (id: ResearchSectionId) => void;
}) {
  return (
    <>
      {tokens.map((tok, j) => {
        const key = `${prefix}-${j}`;
        if (tok.t === "text") return <Fragment key={key}>{tok.text}</Fragment>;
        if (tok.t === "hl") return <Pill key={key} text={tok.text} />;
        if (tok.t === "ext")
          return (
            <Link
              key={key}
              href={tok.href}
              data-cursor="hover"
              className="text-accent underline-offset-2 hover:underline"
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
            onClick={() => onOpen(tok.opens)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen(tok.opens);
              }
            }}
            className="cursor-pointer text-accent underline-offset-2 hover:underline"
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
}: {
  className?: string;
  onOpen: (id: ResearchSectionId) => void;
}) {
  return (
    <section
      className={`font-grotesk text-[24px] font-medium leading-normal tracking-[0.3px] text-black md:text-[28px] lg:text-[34px] lg:leading-[1.45] ${className}`}
    >
      {researchAreas.map((area, i) => (
        <div key={area.kicker} className="mb-12 lg:mb-16">
          <p className="mb-4 font-grotesk text-[13px] font-medium uppercase tracking-[0.14em] text-black/45 lg:text-[14px]">
            {area.kicker}
          </p>
          <p>
            <Tokens tokens={area.body} prefix={`a${i}`} onOpen={onOpen} />
          </p>
        </div>
      ))}
      <p>
        <Tokens tokens={researchClosing} prefix="closing" onOpen={onOpen} />
      </p>
    </section>
  );
}
