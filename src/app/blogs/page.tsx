import type { Metadata } from "next";
import Nav from "@/components/Nav";
import BlogsBody from "@/components/BlogsBody";
import BlogsWatermark from "@/components/BlogsWatermark";
import { getBlogsPage } from "@/sanity/fetch";
import { blogsFromSanity } from "@/lib/blogsFromSanity";

export const metadata: Metadata = {
  title: "Blogs & Media — Fas Lebbie, Ph.D.",
  description:
    "Writing, talks, podcasts, and interviews on design leadership, systems, and post-extractive design.",
};

// Blogs & Media (Figma 318-5704 / 308-4566 + modals 16-570 / 504-16389). Two
// tabs — ".blog" (writing list) and ".media" (talks/podcasts grid) — over the
// receding "Blogs/Media" watermark. Both open a paged modal. Content is
// Sanity-driven (blogsPage singleton); lib/blogs.ts is the fallback.
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
