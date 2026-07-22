"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import BlogModal from "@/components/BlogModal";
import MediaModal from "@/components/MediaModal";
import { contentDrift, revealBlur, revealOpacity } from "@/lib/reveal";
import { useReveal } from "@/lib/useReveal";
import { blogPosts, mediaItems, type BlogPost, type MediaItem } from "@/lib/blogs";

type Tab = "blog" | "media";

function PlayGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M9 7.5v9l7-4.5-7-4.5z" />
    </svg>
  );
}

export default function BlogsBody({
  posts = blogPosts,
  media = mediaItems,
}: {
  posts?: BlogPost[];
  media?: MediaItem[];
}) {
  const [tab, setTab] = useState<Tab>("blog");
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
      <div className="lg:sticky lg:top-[52px]">
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
            {/* Tabs */}
            <div className="flex items-center justify-center gap-10 font-grotesk text-[20px]">
              {(["blog", "media"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  data-cursor="hover"
                  className={`underline-offset-8 transition-colors ${
                    tab === t
                      ? "font-medium text-black underline decoration-2"
                      : "text-black/45 hover:text-black/70"
                  }`}
                >
                  .{t}
                </button>
              ))}
            </div>

            {tab === "blog" ? (
              <div className="mx-auto mt-14 flex max-w-[720px] flex-col gap-16">
                {groups.map((group) => (
                  <section key={group.category} className="flex flex-col gap-14">
                    <h2 className="text-center font-grotesk text-[16px] font-semibold text-black">
                      {group.category}
                    </h2>
                    {group.items.map(({ post, index }) => (
                      <article key={post.slug} className="text-center">
                        <p className="font-grotesk text-[13px] text-black/55">
                          {post.meta}
                        </p>
                        <button
                          type="button"
                          onClick={() => setOpenBlog(index)}
                          data-cursor="hover"
                          className="mt-4 font-serif text-[28px] leading-[1.15] text-accent underline decoration-1 underline-offset-[6px] transition-opacity hover:opacity-80 md:text-[32px]"
                        >
                          {post.title}
                        </button>
                      </article>
                    ))}
                  </section>
                ))}
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4 lg:gap-x-8">
                {media.map((item, index) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setOpenMedia(index)}
                    data-cursor="hover"
                    className="group flex flex-col text-left"
                  >
                    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white">
                      {item.thumb && (
                        <Image
                          src={item.thumb}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                      )}
                      <span className="relative flex h-13 w-13 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-105">
                        <PlayGlyph className="ml-0.5 h-6 w-6" />
                      </span>
                    </div>
                    <p className="mt-3 font-serif text-[16px] italic text-accent underline decoration-1 underline-offset-4">
                      {item.title}
                    </p>
                    <p className="mt-1.5 font-grotesk text-[14px] text-black/60">
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
