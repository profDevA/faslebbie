"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import BlogModal from "@/components/BlogModal";
import BlogsWatermark from "@/components/BlogsWatermark";
import MediaModal from "@/components/MediaModal";
import ViewToggle from "@/components/ViewToggle";
import { STICKY_UNDER_NAV } from "@/lib/navLayout";
import { contentDrift, revealBlur, revealOpacity } from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import type { BlogPost, MediaItem } from "@/lib/blogs";

type Tab = "words" | "media";

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
}: {
  posts: BlogPost[];
  media: MediaItem[];
}) {
  const [tab, setTab] = useState<Tab>("words");
  const [openBlog, setOpenBlog] = useState<number | null>(null);
  const [openMedia, setOpenMedia] = useState<number | null>(null);

  const { r, pin } = useReveal(true);
  const opacity = revealOpacity(r);
  const blurPx = revealBlur(r);
  const blur = blurPx ? `blur(${blurPx}px)` : undefined;

  // Group blog posts by their column heading, preserving order.
  const groups = useMemo(() => {
    const out: { category: string; items: { post: BlogPost; index: number }[] }[] = [];
    posts.forEach((post, index) => {
      let g = out.find((x) => x.category === post.category);
      if (!g) {
        g = { category: post.category, items: [] };
        out.push(g);
      }
      g.items.push({ post, index });
    });
    return out;
  }, [posts]);

  return (
    <div className="relative">
      {/* Figma 318:6052 / 308:4566 — large centered wordmark behind content. */}
      <BlogsWatermark />

      <div className={STICKY_UNDER_NAV}>
        <main className="relative z-10 mx-auto w-full max-w-[1350px] px-6 py-12 lg:px-12 lg:py-16">
          <div
            style={{
              opacity,
              filter: blur,
              transform: contentDrift(r),
              pointerEvents: r < 1 ? "none" : undefined,
            }}
            className="will-change-[opacity,filter,transform]"
          >
            {/* Tabs — shared switch so Blogs matches Work/Build/Leadership/
                Teaching exactly (Fas 07/28). Sits in an already-padded wrapper,
                so the component's own top padding is dropped. */}
            <ViewToggle
              views={["words", "media"] as const}
              value={tab}
              onChange={setTab}
              className="pt-0 lg:pt-0"
            />

            {tab === "words" ? (
              /* Figma 318:6052 — 18px meta, 42px red titles, ~105px stack gap. */
              <div className="mx-auto mt-12 flex max-w-[700px] flex-col gap-[105px] lg:mt-10">
                {groups.map((group) => (
                  <section
                    key={group.category}
                    className="flex flex-col gap-[105px]"
                  >
                    {/* Category heading ("Design Muscle") removed — Fas 07/28.
                        Grouping kept for order / restore if he wants it back. */}
                    {group.items.map(({ post, index }) => (
                      <article key={post.slug} className="text-center">
                        <p className="font-grotesk text-[16px] leading-[1.15] text-black md:text-[18px]">
                          {post.meta}
                        </p>
                        <button
                          type="button"
                          onClick={() => setOpenBlog(index)}
                          data-cursor="hover"
                          className="mt-6 font-grotesk text-[28px] font-medium capitalize leading-[1.37] tracking-[-1.28px] text-accent underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-80 md:mt-7 md:text-[36px] lg:text-[42px]"
                        >
                          {post.title}
                        </button>
                      </article>
                    ))}
                  </section>
                ))}
              </div>
            ) : (
              /* Figma 308:4566 — 4-col landscape thumbs (~333×260), italic titles. */
              <div className="mt-12 grid grid-cols-2 gap-x-2.5 gap-y-8 sm:gap-x-5 sm:gap-y-9 lg:mt-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-8">
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
                      {item.format} · {item.platform} · {item.year}
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
        onNavigate={setOpenBlog}
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
