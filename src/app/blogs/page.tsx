import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import BlogsBody from "@/components/BlogsBody";
import { blogsFromSanity } from "@/lib/blogsFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBlogsPage, getSiteSettings } from "@/sanity/fetch";

// Blogs & Media (Figma 2627-4448 / 2729-2736 / 308-4566). Three tabs —
// ".blogs" (writing list), ".words" (books + journals), ".media" (talks grid).
// Content from Sanity blogsPage only (empty Studio = empty UI).

export async function generateMetadata(): Promise<Metadata> {
  const [page, site] = await Promise.all([getBlogsPage(), getSiteSettings()]);
  return pageMetadataFromSanity(page?.seo, {
    title: "Words + Media — Fas Lebbie, Ph.D.",
    description:
      site?.siteDescription?.trim() ||
      "Writing, talks, podcasts, and interviews on design leadership, systems, and post-extractive design.",
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewFromUrl } = await searchParams;
  const { posts, media, publications } = blogsFromSanity(await getBlogsPage());
  return (
    <>
      <Nav dark />
      <Suspense fallback={null}>
        <BlogsBody
          posts={posts}
          media={media}
          publications={publications}
          viewFromUrl={viewFromUrl ?? null}
        />
      </Suspense>
    </>
  );
}
