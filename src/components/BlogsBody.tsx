"use client";

import { useState } from "react";
import Image from "next/image";
import BlogModal from "@/components/BlogModal";
import BlogsWatermark from "@/components/BlogsWatermark";
import MediaModal from "@/components/MediaModal";
import ViewToggle from "@/components/ViewToggle";
import WordsPublications from "@/components/WordsPublications";
import { useBlogListScrollFade } from "@/hooks/useBlogListScrollFade";
import { usePersistedView } from "@/hooks/usePersistedView";
import { STICKY_UNDER_NAV } from "@/lib/navLayout";
import { contentDrift, revealBlur, revealOpacity } from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import type { BlogPost, MediaItem, PublicationsData } from "@/lib/blogs";

type Tab = "blogs" | "words" | "media";

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M9 7.5v9l7-4.5-7-4.5z" />
    </svg>
  );
}

export default function BlogsBody({
  posts,
  media,
  publications,
}: {
  posts: BlogPost[];
  media: MediaItem[];
  publications: PublicationsData;
}) {
  const [tab, setTab] = usePersistedView<Tab>(
    ["blogs", "words", "media"] as const,
    "blogs",
  );
  const [openBlog, setOpenBlog] = useState<number | null>(null);
  const [openMedia, setOpenMedia] = useState<number | null>(null);

  const { r, pin } = useReveal(true);
  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  useBlogListScrollFade(tab === "blogs");

  return (
    <div className="relative">
      {/* Figma 318:6052 / 308:4566 — large centered wordmark behind content. */}
      <BlogsWatermark />

      <div className={STICKY_UNDER_NAV}>
        {/* Toggle sits directly under the nav — same as Work/Build/Teaching (.txt/.img). */}
        <div
          style={{
            opacity,
            filter: blur,
            pointerEvents: r < 0.7 ? "none" : undefined,
          }}
          className="will-change-[opacity,filter]"
        >
          <ViewToggle
            views={["blogs", "words", "media"] as const}
            value={tab}
            onChange={setTab}
            className="gap-8 sm:gap-12 lg:gap-[84px]"
          />
        </div>
        <main className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-12 pt-8 lg:px-12 lg:pb-16 lg:pt-12">
          <div
            style={{
              opacity,
              filter: blur,
              transform: contentDrift(r),
              pointerEvents: r < 0.7 ? "none" : undefined,
            }}
            className="flex w-full flex-col items-center will-change-[opacity,filter,transform]"
          >
            {tab === "blogs" ? (
              /* Mobile 16:2335 — 85px stack. Desktop keeps vh rhythm. */
              <div className="flex w-full max-w-[700px] flex-col gap-[85px] pt-[52px] pb-[28vh] lg:gap-[12vh] lg:pt-[10vh] lg:pb-[32vh]">
                {posts.map((post, index) => {
                  const category =
                    post.category &&
                    post.category !== posts[index - 1]?.category
                      ? post.category
                      : null;
                  return (
                  <article
                    key={post.slug}
                    data-blog-scroll-item
                    className="flex flex-col items-center origin-center text-center will-change-[transform,opacity] transition-[transform,opacity] duration-[250ms] ease-out"
                  >
                    {category ? (
                      <p className="mb-[79px] font-grotesk text-[16px] font-medium capitalize leading-[1.04] text-black lg:mb-[98px] lg:text-[20px] lg:leading-[1.03]">
                        {category}
                      </p>
                    ) : null}
                    <p className="font-grotesk text-[14px] leading-[1.19] text-black lg:text-[18px] lg:leading-[1.15]">
                      {post.meta}
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenBlog(index)}
                      data-cursor="hover"
                      className="mt-[21px] font-grotesk text-[28px] font-medium capitalize leading-[1.67] tracking-[-1.04px] text-accent underline decoration-1 underline-offset-[6px] lg:mt-7 lg:text-[42px] lg:leading-[1.37] lg:tracking-[-1.28px]"
                    >
                      {post.title}
                    </button>
                  </article>
                  );
                })}
              </div>
            ) : tab === "words" ? (
              /* Figma 2729:2736 — centered 1129px block, numbered rows. */
              <WordsPublications publications={publications} />
            ) : (
              /* Figma 2623:3908 — 4-col landscape thumbs (~333×260), centered grid. */
              <div className="grid w-full max-w-[1408px] grid-cols-2 gap-x-2.5 gap-y-8 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-8">
                {media.map((item, index) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setOpenMedia(index)}
                    data-cursor="hover"
                    className="group flex flex-col text-left"
                  >
                    <div className="relative flex aspect-[333/260] w-full items-center justify-center overflow-hidden bg-white lg:h-[260px] lg:aspect-auto">
                      {item.thumb && (
                        <Image
                          src={item.thumb}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                      )}
                      <span className="relative flex size-13 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-105">
                        <PlayGlyph className="ml-0.5 h-6 w-6" />
                      </span>
                    </div>
                    <p className="mt-2.5 font-grotesk text-[14px] font-medium italic capitalize leading-[1.35] tracking-[0.9px] text-black underline decoration-1 underline-offset-2 transition-colors group-hover:text-accent sm:mt-3 sm:text-[16px] lg:text-[18px] lg:tracking-[1.65px]">
                      {item.title}
                    </p>
                    <p className="mt-3.5 font-grotesk text-[14px] capitalize leading-[1.35] tracking-[0.9px] text-black lg:text-[18px] lg:tracking-[1.65px]">
                      {item.platform} · {item.year}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Pin scroll distance (desktop only) for the watermark recede. */}
      <div aria-hidden className="hidden lg:block" style={{ height: pin }} />

      <BlogModal
        index={openBlog}
        posts={posts}
        onClose={() => setOpenBlog(null)}
      />
      <MediaModal
        index={openMedia}
        items={media}
        onNavigate={setOpenMedia}
        onClose={() => setOpenMedia(null)}
      />
    </div>
  );
}
