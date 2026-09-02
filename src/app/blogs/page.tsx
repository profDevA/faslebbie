import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BlogsBody from "@/components/BlogsBody";
import { blogsFromSanity } from "@/lib/blogsFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBlogsPage, getSiteSettings } from "@/sanity/fetch";

// Blogs & Media (Figma 2627-4448 / 2729-2736 / 308-4566). Three tabs —
// ".blogs" (writing list), ".words" (books + journals), ".media" (talks grid).

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
  const [blogsPage, site] = await Promise.all([getBlogsPage(), getSiteSettings()]);
  const { posts, mediaFeatured, media, publications } = blogsFromSanity(blogsPage);
  const defaultAuthorAvatar =
    site?.masterPortrait?.trim() || "/portrait-master.png";
  return (
    <>
      <Nav dark />
      <BlogsBody
        posts={posts}
        mediaFeatured={mediaFeatured}
        media={media}
        publications={publications}
        viewFromUrl={viewFromUrl ?? null}
        defaultAuthorAvatar={defaultAuthorAvatar}
      />
    </>
  );
}
