"use client";

import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlockComponent,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import {
  parseVideoEmbed,
  resolveBlogHighlight,
  resolveBlogTextColor,
} from "@/lib/blogEditorColors";

const BODY =
  "font-grotesk text-[15px] leading-[1.75] text-black/80 md:text-[16px]";

const blockClass: Record<string, string> = {
  normal: `mt-4 ${BODY}`,
  lead: "mt-4 font-grotesk text-[17px] leading-[1.65] text-black/90 md:text-[18px]",
  h2: "mt-10 mb-1 font-grotesk text-[20px] font-bold leading-snug text-black first:mt-0 md:text-[22px]",
  h3: "mt-7 font-grotesk text-[15px] font-medium italic leading-snug text-black/70",
  h4: "mt-6 font-grotesk text-[16px] font-bold leading-snug text-black/85",
  h5: "mt-5 font-grotesk text-[14px] font-bold uppercase tracking-[0.08em] text-black/75",
  blockquote:
    "mt-6 border-l-2 border-black/20 pl-4 font-grotesk text-[15px] italic leading-[1.7] text-black/70",
  center: `mt-4 text-center ${BODY}`,
  right: `mt-4 text-right ${BODY}`,
  small: "mt-3 font-grotesk text-[13px] leading-[1.65] text-black/65",
};

function blockTag(style: string | undefined): "p" | "h3" | "blockquote" {
  if (style === "h2" || style === "h5") return "h3";
  if (style === "blockquote") return "blockquote";
  return "p";
}

function makeBlockComponent(style: string): PortableTextBlockComponent {
  const Tag = blockTag(style);
  const className = blockClass[style] ?? blockClass.normal;
  return ({ children }) => <Tag className={className}>{children}</Tag>;
}

const IMG_WIDTH: Record<string, string> = {
  full: "w-full",
  medium: "w-[85%]",
  small: "w-[60%]",
};

const IMG_ALIGN: Record<string, string> = {
  left: "mr-auto ml-0",
  center: "mx-auto",
  right: "ml-auto mr-0",
};

const CALLOUT_STYLES: Record<
  string,
  { border: string; bg: string; label: string }
> = {
  note: { border: "border-black/15", bg: "bg-black/[0.03]", label: "Note" },
  tip: { border: "border-teal/30", bg: "bg-teal/5", label: "Tip" },
  important: {
    border: "border-accent/40",
    bg: "bg-accent/5",
    label: "Important",
  },
  warning: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    label: "Warning",
  },
};

function createComponents(compact = false): PortableTextComponents {
  const listClass = compact
    ? "mt-2 space-y-1 pl-5 font-grotesk text-[14px] leading-[1.65] text-black/80"
    : "mt-2 space-y-2 pl-5 font-grotesk text-[15px] leading-[1.7] text-black/80";

  return {
    block: {
      normal: makeBlockComponent("normal"),
      lead: makeBlockComponent("lead"),
      h2: makeBlockComponent("h2"),
      h3: makeBlockComponent("h3"),
      h4: makeBlockComponent("h4"),
      h5: makeBlockComponent("h5"),
      blockquote: makeBlockComponent("blockquote"),
      center: makeBlockComponent("center"),
      right: makeBlockComponent("right"),
      small: makeBlockComponent("small"),
    },
    list: {
      bullet: ({ children }) => (
        <ul className={`${listClass} list-disc`}>{children}</ul>
      ),
      number: ({ children }) => (
        <ol className={`${listClass} list-decimal`}>{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => <li>{children}</li>,
      number: ({ children }) => <li>{children}</li>,
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-medium">{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
      underline: ({ children }) => (
        <span className="underline">{children}</span>
      ),
      "strike-through": ({ children }) => (
        <span className="line-through">{children}</span>
      ),
      code: ({ children }) => (
        <code className="rounded bg-black/5 px-1 font-mono text-[0.92em]">
          {children}
        </code>
      ),
      sup: ({ children }) => <sup>{children}</sup>,
      sub: ({ children }) => <sub>{children}</sub>,
      link: ({ children, value }) => {
        const blank = value?.blank !== false;
        const rel = blank
          ? value?.nofollow
            ? "noopener noreferrer nofollow"
            : "noopener noreferrer"
          : value?.nofollow
            ? "nofollow"
            : undefined;
        return (
          <a
            href={value?.href}
            target={blank ? "_blank" : undefined}
            rel={rel}
            data-cursor="hover"
            className="text-accent underline underline-offset-2"
          >
            {children}
          </a>
        );
      },
      textColor: ({ children, value }) => {
        const color = resolveBlogTextColor(value);
        return color ? (
          <span style={{ color }}>{children}</span>
        ) : (
          <>{children}</>
        );
      },
      highlight: ({ children, value }) => {
        const bg = resolveBlogHighlight(value);
        return bg ? (
          <mark style={{ backgroundColor: bg }} className="rounded-sm px-0.5">
            {children}
          </mark>
        ) : (
          <>{children}</>
        );
      },
    },
    types: {
      blogBodyImage: ({ value }) => {
        if (!value?.url) return null;
        const w = IMG_WIDTH[value.size ?? "full"];
        const align = IMG_ALIGN[value.align ?? "center"];
        return (
          <figure className={`my-8 ${align} max-w-full`}>
            <Image
              src={value.url}
              alt={value.alt ?? value.caption ?? ""}
              width={1200}
              height={800}
              sizes="(max-width: 768px) 90vw, 440px"
              className={`${w} h-auto`}
            />
            {value.caption ? (
              <figcaption className="mt-2 font-grotesk text-[13px] leading-snug text-black/55">
                {value.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      },
      image: ({ value }) => {
        const url = value?.url as string | undefined;
        if (!url) return null;
        return (
          <figure className="my-8 mx-auto max-w-full">
            <Image
              src={url}
              alt={(value?.alt as string | undefined) ?? ""}
              width={1200}
              height={800}
              sizes="(max-width: 768px) 90vw, 440px"
              className="h-auto w-full"
            />
          </figure>
        );
      },
      blogDivider: ({ value }) =>
        value?.style === "space" ? (
          <div className="my-10" aria-hidden />
        ) : (
          <hr className="my-10 border-black/15" />
        ),
      blogCodeBlock: ({ value }) => (
        <div className="my-8 overflow-hidden rounded-md border border-black/10 bg-[#1e1e1e] text-[13px] text-white/90">
          {value?.filename ? (
            <div className="border-b border-white/10 px-4 py-2 font-mono text-[11px] text-white/50">
              {value.filename}
            </div>
          ) : null}
          <pre className="overflow-x-auto p-4">
            <code>{value?.code}</code>
          </pre>
        </div>
      ),
      blogVideoEmbed: ({ value }) => {
        const embed = value?.url ? parseVideoEmbed(value.url) : null;
        if (!embed) return null;
        const aspect =
          value?.aspect === "4:3" ? "aspect-[4/3]" : "aspect-video";
        return (
          <figure className="my-8">
            <div
              className={`relative w-full overflow-hidden rounded-md bg-black/5 ${aspect}`}
            >
              <iframe
                src={embed.src}
                title={embed.title}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {value?.caption ? (
              <figcaption className="mt-2 font-grotesk text-[13px] leading-snug text-black/55">
                {value.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      },
      blogTable: ({ value }) => {
        const rows = (value?.rows ?? []) as { cells?: string[] }[];
        if (!rows.length) return null;
        const headerRow = value?.headerRow !== false;
        const bodyRows = headerRow ? rows.slice(1) : rows;
        return (
          <figure className="my-8 overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse font-grotesk text-[14px]">
              {headerRow && rows[0] ? (
                <thead>
                  <tr className="border-b border-black/20 bg-black/[0.04]">
                    {(rows[0].cells ?? []).map((cell, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-medium text-black/85"
                      >
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className="border-b border-black/10">
                    {(row?.cells ?? []).map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-black/80">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {value?.caption ? (
              <figcaption className="mt-2 font-grotesk text-[13px] text-black/55">
                {value.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      },
      blogCallout: ({ value }) => {
        const tone = (value?.tone as string) ?? "note";
        const skin = CALLOUT_STYLES[tone] ?? CALLOUT_STYLES.note;
        const inner = value?.body as PortableTextBlock[] | undefined;
        return (
          <aside
            className={`my-8 rounded-md border px-4 py-3 ${skin.border} ${skin.bg}`}
          >
            <p className="mb-2 font-grotesk text-[11px] font-bold uppercase tracking-[0.1em] text-black/50">
              {value?.title || skin.label}
            </p>
            {inner?.length ? (
              <div className="[&>*:first-child]:mt-0">
                <PortableText
                  value={inner}
                  components={createComponents(true)}
                />
              </div>
            ) : null}
          </aside>
        );
      },
      blogPullQuote: ({ value }) => (
        <figure className="my-10 text-center">
          <blockquote className="font-grotesk text-[22px] font-medium leading-snug text-black/85 md:text-[26px]">
            {value?.quote}
          </blockquote>
          {value?.attribution ? (
            <figcaption className="mt-3 font-grotesk text-[13px] text-black/55">
              {value?.cite ? (
                <a
                  href={value.cite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {value.attribution}
                </a>
              ) : (
                value.attribution
              )}
            </figcaption>
          ) : null}
        </figure>
      ),
      blogCta: ({ value }) => {
        const style = value?.style ?? "primary";
        const blank = value?.blank !== false;
        const base =
          "inline-flex items-center justify-center rounded-full px-6 py-2.5 font-grotesk text-[14px] font-medium transition-opacity hover:opacity-90";
        const classes =
          style === "outline"
            ? `${base} border border-accent text-accent`
            : style === "link"
              ? "font-grotesk text-[14px] font-medium text-accent underline underline-offset-2"
              : `${base} bg-accent text-white`;
        return (
          <div className="my-8 text-center">
            <a
              href={value?.href}
              target={blank ? "_blank" : undefined}
              rel={blank ? "noopener noreferrer" : undefined}
              data-cursor="hover"
              className={classes}
            >
              {value?.label}
            </a>
          </div>
        );
      },
    },
  };
}

const blogComponents = createComponents();

export default function BlogArticleBody({
  value,
}: {
  value: PortableTextBlock[];
}) {
  if (!value?.length) return null;
  return (
    <article className="mx-auto w-full max-w-[420px] px-6 py-12 lg:max-w-[440px] lg:px-0 lg:py-16">
      <PortableText value={value} components={blogComponents} />
    </article>
  );
}

export function isPortableTextBody(
  body: unknown,
): body is PortableTextBlock[] {
  if (!Array.isArray(body) || !body.length) return false;
  const first = body[0] as { _type?: string; kind?: string };
  return Boolean(first._type && !first.kind);
}
