"use client";

import { useState } from "react";
import BlogModal from "@/components/BlogModal";
import BlogsWatermark from "@/components/BlogsWatermark";
import MediaBody from "@/components/MediaBody";
import MediaPopup from "@/components/MediaPopup";
import ViewToggle from "@/components/ViewToggle";
import WordsPublications from "@/components/WordsPublications";
import { useBlogListScrollFade } from "@/hooks/useBlogListScrollFade";
import { usePersistedView } from "@/hooks/usePersistedView";
import { STICKY_UNDER_NAV } from "@/lib/navLayout";
import { contentDrift, revealBlur, revealOpacity } from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import type { BlogPost, MediaFeatured, MediaItem, PublicationsData } from "@/lib/blogs";

type Tab = "blogs" | "words" | "media";

export default function BlogsBody({
  posts,
  mediaFeatured,
  media,
  publications,
  viewFromUrl = null,
  defaultAuthorAvatar = "/portrait-master.png",
}: {
  posts: BlogPost[];
  mediaFeatured: MediaFeatured | null;
  media: MediaItem[];
  publications: PublicationsData;
  viewFromUrl?: string | null;
  defaultAuthorAvatar?: string;
}) {
  const [tab, setTab] = usePersistedView<Tab>(
    ["blogs", "words", "media"] as const,
    "blogs",
    { blog: "blogs" },
    viewFromUrl,
  );
  const [openBlog, setOpenBlog] = useState<number | null>(null);
  const [openMediaCarousel, setOpenMediaCarousel] = useState<number | null>(
    null,
  );

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
                {posts.map((post, index) => (
                  <article
                    key={post.slug}
                    data-blog-scroll-item
                    className="flex flex-col items-center origin-center text-center will-change-[transform,opacity] transition-[transform,opacity] duration-[250ms] ease-out"
                  >
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
                ))}
              </div>
            ) : tab === "words" ? (
              /* Figma 2729:2736 — centered 1129px block, numbered rows. */
              <WordsPublications publications={publications} />
            ) : (
              /* Figma 3323:9065 / 3330:17914 — Design Again hero + talk grid. */
              <MediaBody
                featured={mediaFeatured}
                talks={media}
                onOpenFeatured={() => setOpenMediaCarousel(0)}
                onOpenTalk={(talkIndex) =>
                  setOpenMediaCarousel(
                    (mediaFeatured ? 1 : 0) + talkIndex,
                  )
                }
              />
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
        defaultAuthorAvatar={defaultAuthorAvatar}
      />
      <MediaPopup
        index={openMediaCarousel}
        featured={mediaFeatured}
        talks={media}
        onNavigate={setOpenMediaCarousel}
        onClose={() => setOpenMediaCarousel(null)}
      />
    </div>
  );
}
