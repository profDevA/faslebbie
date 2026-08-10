import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BlogsBody from "@/components/BlogsBody";
import BlogsWatermark from "@/components/BlogsWatermark";
import { blogsFromSanity } from "@/lib/blogsFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBlogsPage, getSiteSettings } from "@/sanity/fetch";

// Blogs & Media (Figma 318-5704 / 308-4566 + modals 16-570 / 504-16389). Two
// tabs — ".blog" (writing list) and ".media" (talks/podcasts grid) — over the
// receding "Blogs/Media" watermark. Both open a paged modal. Content is
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

export default async function BlogsPage() {
  const { posts, media } = blogsFromSanity(await getBlogsPage());
  return (
    <>
      <Nav dark />
      <BlogsWatermark />
      <BlogsBody posts={posts} media={media} />
    </>
  );
}
