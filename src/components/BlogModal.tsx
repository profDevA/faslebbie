"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { ExternalTextLink } from "@/components/InlineToken";
import PopupShell from "@/components/PopupShell";
import type { BlogBlock, BlogInline, BlogPost } from "@/lib/blogs";

function RichText({ parts, text }: { parts?: BlogInline[]; text: string }) {
  if (!parts?.length) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => {
        let node: ReactNode = p.text;
        if (p.bold) node = <strong className="font-medium">{node}</strong>;
        if (p.italic) node = <em>{node}</em>;
        if (p.href)
          node = (
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="text-accent underline underline-offset-2"
            >
              {node}
            </a>
          );
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <article className="mx-auto w-full max-w-[420px] px-6 py-12 lg:max-w-[440px] lg:px-0 lg:py-16">
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
        if (b.kind === "li")
          return (
            <p
              key={i}
              className="relative mt-2 pl-5 font-grotesk text-[15px] leading-[1.7] text-black/80 before:absolute before:left-1 before:content-['•']"
            >
              <RichText parts={b.parts} text={b.text} />
            </p>
          );
        if (b.kind === "img")
          return (
            <Image
              key={i}
              src={b.text}
              alt=""
              width={1200}
              height={800}
              sizes="(max-width: 768px) 90vw, 440px"
              className="mx-auto my-8 h-auto w-full"
            />
          );
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

// Figma 318:6158 desktop / 16:997 mobile. Single article — no list pager or share
// (Aug 13: stray Next / Share / old link targets removed).
export default function BlogModal({
  index,
  posts,
  onClose,
}: {
  index: number | null;
  posts: BlogPost[];
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shellScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    if (shellScrollRef.current) shellScrollRef.current.scrollTop = 0;
    if (rightScrollRef.current) rightScrollRef.current.scrollTop = 0;
  }, [index, open]);

  if (!mounted || !open) return null;
  const post = posts[index!];
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
          {hasBody ? <ArticleBody blocks={post.body!} /> : null}

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
