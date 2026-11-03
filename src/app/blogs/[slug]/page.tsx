import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogArticleLayout from "@/components/BlogArticleLayout";
import Nav from "@/components/Nav";
import { blogsFromSanity } from "@/lib/blogsFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBlogsPage, getSiteSettings } from "@/sanity/fetch";

export const revalidate = 60;

/** The URL segment can arrive percent-encoded (e.g. a slug with ’), so compare
 *  the decoded value too — otherwise those posts 404. */
function findPost<T extends { slug: string }>(posts: T[], raw: string) {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {}
  return posts.find((p) => p.slug === decoded || p.slug === raw);
}

export async function generateStaticParams() {
  const { posts } = blogsFromSanity(await getBlogsPage());
  // Prerender URL-safe slugs only: a Studio slug typed as a title ("Extractive
  // 2.0: The…") breaks the build on Windows (":" in the output path). Those
  // posts still render on request (dynamicParams defaults to true).
  return posts
    .filter((post) => /^[\w-]+$/.test(post.slug))
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { posts } = blogsFromSanity(await getBlogsPage());
  const post = findPost(posts, slug);
  if (!post) return { title: "Blog — Fas Lebbie, Ph.D." };

  return pageMetadataFromSanity(undefined, {
    title: `${post.title} — Fas Lebbie, Ph.D.`,
    description: post.description?.trim() || post.meta,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [blogsPage, site] = await Promise.all([
    getBlogsPage(),
    getSiteSettings(),
  ]);
  const { posts } = blogsFromSanity(blogsPage);
  const post = findPost(posts, slug);
  if (!post) notFound();

  const defaultAuthorAvatar =
    site?.masterPortrait?.trim() || "/portrait-master.png";
  const sharePath = `/blogs/${encodeURIComponent(post.slug)}`;

  return (
    <>
      <Nav dark />
      <main className="flex min-h-0 flex-1 flex-col bg-close max-lg:overflow-visible max-lg:[--blog-cover-peek:24svh] max-lg:[--blog-mobile-chrome:7rem] lg:max-h-[calc(100dvh-82px)] lg:overflow-hidden">
        <div className="flex h-14 shrink-0 items-center border-b border-black/15 bg-white px-6 sm:h-16 sm:px-8">
          <Link
            href="/blogs?view=blogs"
            className="font-grotesk text-[12px] font-light text-black underline underline-offset-2 sm:text-[16px]"
          >
            Blogs / {post.title}
          </Link>
        </div>
        <BlogArticleLayout
          post={post}
          shareUrl={sharePath}
          defaultAuthorAvatar={defaultAuthorAvatar}
          className="grid w-full flex-1 grid-cols-1 max-lg:overflow-visible lg:min-h-0 lg:grid-cols-2 lg:overflow-hidden"
        />
      </main>
    </>
  );
}
