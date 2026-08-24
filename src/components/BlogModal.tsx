"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ExternalTextLink } from "@/components/InlineToken";
import BlogArticleBody, { isPortableTextBody } from "@/components/BlogArticleBody";
import BlogArticleFooter from "@/components/BlogArticleFooter";
import PopupShell from "@/components/PopupShell";
import type { BlogBlock, BlogInline, BlogPost } from "@/lib/blogs";

function RichText({ parts, text }: { parts?: BlogInline[]; text: string }) {
  if (!parts?.length) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => {
        if (!p.text) return null;
        let node: ReactNode = p.text;
        if (p.code)
          node = (
            <code className="rounded bg-black/5 px-1 font-mono text-[0.92em]">
              {node}
            </code>
          );
        if (p.sup) node = <sup>{node}</sup>;
        if (p.sub) node = <sub>{node}</sub>;
        if (p.bold) node = <strong className="font-medium">{node}</strong>;
        if (p.italic) node = <em>{node}</em>;
        if (p.underline) node = <span className="underline">{node}</span>;
        if (p.strike) node = <span className="line-through">{node}</span>;
        if (p.highlight)
          node = (
            <mark
              style={{ backgroundColor: p.highlight }}
              className="rounded-sm px-0.5"
            >
              {node}
            </mark>
          );
        if (p.href)
          node = (
            <a
              href={p.href}
              target={p.linkBlank === false ? undefined : "_blank"}
              rel={
                p.linkBlank === false ? undefined : "noopener noreferrer"
              }
              data-cursor="hover"
              className="text-accent underline underline-offset-2"
            >
              {node}
            </a>
          );
        if (p.color) node = <span style={{ color: p.color }}>{node}</span>;
        return <span key={i}>{node}</span>;
      })}
    </>
  );
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

function ArticleFigure({ block }: { block: BlogBlock }) {
  const w = IMG_WIDTH[block.size ?? "full"];
  const align = IMG_ALIGN[block.align ?? "center"];
  return (
    <figure className={`my-8 ${align} max-w-full`}>
      <Image
        src={block.text}
        alt={block.alt ?? block.caption ?? ""}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 90vw, 440px"
        className={`${w} h-auto`}
      />
      {block.caption ? (
        <figcaption className="mt-2 font-grotesk text-[13px] leading-snug text-black/55">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <article className="mx-auto w-full max-w-[420px] px-6 py-12 [counter-reset:blog-oli] lg:max-w-[440px] lg:px-0 lg:py-16">
      {blocks.map((b, i) => {
        if (b.kind === "h2")
          return (
            <h3
              key={i}
              className="mt-10 mb-1 font-grotesk text-[20px] font-bold leading-snug text-black first:mt-0 md:text-[22px]"
            >
              <RichText parts={b.parts} text={b.text} />
            </h3>
          );
        if (b.kind === "h3")
          return (
            <p
              key={i}
              className="mt-7 font-grotesk text-[15px] font-medium italic leading-snug text-black/70"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "h4")
          return (
            <p
              key={i}
              className="mt-6 font-grotesk text-[16px] font-bold leading-snug text-black/85"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "lead")
          return (
            <p
              key={i}
              className="mt-4 font-grotesk text-[17px] leading-[1.65] text-black/90 md:text-[18px]"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "center")
          return (
            <p
              key={i}
              className="mt-4 text-center font-grotesk text-[15px] leading-[1.75] text-black/80 md:text-[16px]"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "right")
          return (
            <p
              key={i}
              className="mt-4 text-right font-grotesk text-[15px] leading-[1.75] text-black/80 md:text-[16px]"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "small")
          return (
            <p
              key={i}
              className="mt-3 font-grotesk text-[13px] leading-[1.65] text-black/65"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "li")
          return (
            <p
              key={i}
              className="relative mt-2 pl-5 font-grotesk text-[15px] leading-[1.7] text-black/80 before:absolute before:left-1 before:content-['•']"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "oli")
          return (
            <p
              key={i}
              className="relative mt-2 pl-6 font-grotesk text-[15px] leading-[1.7] text-black/80 [counter-increment:blog-oli] before:absolute before:left-0 before:w-5 before:text-right before:content-[counter(blog-oli)'.']"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "quote")
          return (
            <blockquote
              key={i}
              className="mt-6 border-l-2 border-black/20 pl-4 font-grotesk text-[15px] italic leading-[1.7] text-black/70"
            >
              <RichText parts={b.parts} text={b.text} />
            </blockquote>
          );
        if (b.kind === "hr")
          return b.divider === "space" ? (
            <div key={i} className="my-10" aria-hidden />
          ) : (
            <hr key={i} className="my-10 border-black/15" />
          );
        if (b.kind === "img") return <ArticleFigure key={i} block={b} />;
        return (
          <p
            key={i}
            className="mt-4 font-grotesk text-[15px] leading-[1.75] text-black/80 md:text-[16px]"
          >
            <RichText parts={b.parts} text={b.text} />
          </p>
        );
      })}
    </article>
  );
}

// Figma 318:6158 desktop / 16:997 mobile. Article footer: 16:1581.
export default function BlogModal({
  index,
  posts,
  onClose,
  defaultAuthorAvatar = "/portrait-master.png",
}: {
  index: number | null;
  posts: BlogPost[];
  onClose: () => void;
  defaultAuthorAvatar?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => setMounted(true), []);
  const shellScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const open = index !== null;
  const post = open ? posts[index!] : null;

  useEffect(() => {
    if (!open) return;
    if (shellScrollRef.current) shellScrollRef.current.scrollTop = 0;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
  }, [index, open]);

  useEffect(() => {
    if (!open || index === null) return;
    const current = posts[index];
    setShareUrl(current.url ?? window.location.href);
  }, [open, index, posts]);

  if (!mounted || !open || !post) return null;
  const hasBody = Boolean(post.body?.length);

  return (
    <PopupShell
      onClose={onClose}
      label={post.title}
      crumbs={[{ label: "Blogs", hideOnMobile: true }, { label: post.title }]}
      bodyRef={shellScrollRef}
      bodyClassName="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
    >
      <div
        className="relative order-2 min-h-[240px] sm:min-h-[280px] lg:order-1 lg:h-full lg:min-h-0 lg:overflow-hidden"
        style={{ backgroundColor: post.coverBg }}
      >
        {post.cover && (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      <div
        ref={rightScrollRef}
        className="contents lg:order-2 lg:flex lg:min-h-0 lg:flex-col lg:overflow-y-auto lg:bg-close"
      >
        <div
          className="order-1 flex flex-col items-center justify-center gap-5 px-7 py-12 text-center lg:order-none lg:min-h-full lg:px-14 lg:py-14"
          style={{ backgroundColor: post.panelBg, color: post.panelText }}
        >
          <p className="font-grotesk text-[12px] uppercase tracking-[0.14em] opacity-80 lg:text-[14px]">
            {post.kicker}
          </p>
          <h2 className="font-grotesk text-[34px] font-medium leading-[1.08] lg:text-[46px]">
            {post.title}
          </h2>
          <p className="mx-auto max-w-[34ch] font-grotesk text-[13px] leading-[1.6] opacity-80 lg:text-[14px]">
            {post.description}
          </p>
        </div>

        <div className="order-3 bg-close lg:order-none">
          {hasBody && isPortableTextBody(post.body) ? (
            <BlogArticleBody value={post.body} />
          ) : hasBody ? (
            <ArticleBody blocks={post.body as BlogBlock[]} />
          ) : null}

          {hasBody && shareUrl ? (
            <BlogArticleFooter
              publishedAt={post.publishedAt}
              authorName={post.authorName ?? "Fas Lebbie"}
              authorAvatar={post.authorAvatar ?? defaultAuthorAvatar}
              shareUrl={shareUrl}
            />
          ) : null}

          {!hasBody && post.url ? (
            <div className="pb-12 text-center">
              <ExternalTextLink
                href={post.url}
                className="font-grotesk text-[14px] font-medium"
              >
                Read on faslebbie.com
              </ExternalTextLink>
            </div>
          ) : null}
        </div>
      </div>
    </PopupShell>
  );
}
