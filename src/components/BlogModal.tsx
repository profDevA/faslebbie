"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { BlogBlock, BlogPost } from "@/lib/blogs";

// Renders the full article body (below the hero) in the scroll region.
function ArticleBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <article className="mx-auto w-full max-w-[660px] px-6 py-12 md:px-8 md:py-16">
      {blocks.map((b, i) => {
        if (b.kind === "h2")
          return (
            <h3
              key={i}
              className="mt-10 mb-1 font-grotesk text-[20px] font-bold leading-snug text-black first:mt-0 md:text-[22px]"
            >
              {b.text}
            </h3>
          );
        if (b.kind === "h3")
          return (
            <p
              key={i}
              className="mt-7 font-grotesk text-[15px] font-medium italic leading-snug text-black/70"
            >
              {b.text}
            </p>
          );
        if (b.kind === "li")
          return (
            <p
              key={i}
              className="relative mt-2 pl-5 font-grotesk text-[15px] leading-[1.7] text-black/80 before:absolute before:left-1 before:content-['•']"
            >
              {b.text}
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
              sizes="(max-width: 768px) 90vw, 640px"
              className="mx-auto my-8 h-auto w-full rounded-md"
            />
          );
        return (
          <p
            key={i}
            className="mt-4 font-grotesk text-[15px] leading-[1.75] text-black/80 md:text-[16px]"
          >
            {b.text}
          </p>
        );
      })}
    </article>
  );
}

// A share icon that sits on the cover image and opens a small popup (Fas 07/21
// — "put a share icon on the image… clicking it opens a small share pop-up").
// Replaces the old inline share buttons.
function ShareMenu({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="absolute right-3 top-3 z-10">
      <button
        type="button"
        aria-label="Share"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        data-cursor="hover"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/75"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg bg-white py-1 font-grotesk text-[13px] text-black shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
          <button
            type="button"
            onClick={copy}
            data-cursor="hover"
            className="block w-full px-4 py-2 text-left transition-colors hover:bg-black/5"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="block px-4 py-2 transition-colors hover:bg-black/5"
            >
              Share on {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Paged blog modal (Figma 16-570 / 16-1497 / 16-997 / 16-2211). One post at a
// time: a cover hero + colored caption panel, followed by the full article body
// — the whole thing scrolls inside the modal, with a sticky breadcrumb header
// and a sticky Previous / dots / Next footer.
export default function BlogModal({
  index,
  posts,
  onNavigate,
  onClose,
}: {
  index: number | null;
  posts: BlogPost[];
  onNavigate: (i: number) => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const scrollRef = useRef<HTMLDivElement>(null);

  const open = index !== null;
  const n = posts.length;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index! - 1 + n) % n);
      if (e.key === "ArrowRight") onNavigate((index! + 1) % n);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, index, n, onNavigate, onClose]);

  // Reset scroll to the top whenever the post changes.
  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [index, open]);

  if (!mounted || !open) return null;
  const post = posts[index!];
  const prev = () => onNavigate((index! - 1 + n) % n);
  const next = () => onNavigate((index! + 1) % n);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
      className="fixed inset-0 z-100 flex animate-[panel-in_0.2s_ease-out] items-center justify-center bg-black/40 p-3 lg:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 -z-10 cursor-default"
        tabIndex={-1}
      />
      <div className="relative flex max-h-[94vh] w-full max-w-[1000px] flex-col bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        {/* Sticky header: breadcrumb + close */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-black/10 px-6 py-4 lg:px-8">
          <div className="min-w-0 truncate font-grotesk text-[14px] text-black/80 lg:text-[16px]">
            <span className="text-black/50">Blogs</span>
            <span className="mx-1.5 text-black/30">/</span>
            <span className="text-black/50">{post.category}</span>
            <span className="mx-1.5 text-black/30">/</span>
            <span className="underline underline-offset-4">{post.title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="hover"
            className="shrink-0 text-[22px] leading-none text-black transition-opacity hover:opacity-60"
          >
            ✕
          </button>
        </div>

        {/* Scroll region: hero + full article */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col md:grid md:grid-cols-2">
            <div
              className="relative order-2 min-h-[240px] md:order-1 md:min-h-[440px]"
              style={{ backgroundColor: post.coverBg }}
            >
              {post.cover && (
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                />
              )}
              <ShareMenu
                url={post.url ?? (typeof window !== "undefined" ? window.location.href : "")}
                title={post.title}
              />
            </div>
            <div
              className="order-1 flex flex-col justify-center px-7 py-12 text-center md:order-2 md:px-12 md:py-16"
              style={{ backgroundColor: post.panelBg, color: post.panelText }}
            >
              <p className="font-grotesk text-[12px] uppercase tracking-[0.14em] opacity-80">
                {post.kicker}
              </p>
              <h2 className="mt-5 font-serif text-[34px] leading-[1.08] md:text-[46px]">
                {post.title}
              </h2>
              <p className="mx-auto mt-6 max-w-[34ch] font-grotesk text-[13px] leading-[1.6] opacity-80 md:text-[14px]">
                {post.description}
              </p>
            </div>
          </div>

          {post.body?.length ? <ArticleBody blocks={post.body} /> : null}

          {post.url && (
            <div className="pb-12 text-center">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="font-grotesk text-[14px] font-medium text-accent underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                Read on faslebbie.com →
              </a>
            </div>
          )}
        </div>

        {/* Sticky footer: pager */}
        <div className="flex shrink-0 items-center justify-between border-t border-black/10 px-6 py-4 lg:px-10">
          <button
            type="button"
            onClick={prev}
            data-cursor="hover"
            className="font-grotesk text-[15px] font-medium text-accent transition-opacity hover:opacity-70 lg:text-[17px]"
          >
            &lt; Previous
          </button>
          <div className="flex items-center gap-2">
            {posts.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                aria-label={`Go to ${p.title}`}
                onClick={() => onNavigate(i)}
                data-cursor="hover"
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-accent" : "bg-black/20 hover:bg-black/40"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            data-cursor="hover"
            className="font-grotesk text-[15px] font-medium text-accent transition-opacity hover:opacity-70 lg:text-[17px]"
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
