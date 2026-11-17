import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogsBody from "@/components/BlogsBody";
import Nav from "@/components/Nav";
import { mediaFeaturedSlug } from "@/lib/blogs";
import { blogsFromSanity } from "@/lib/blogsFromSanity";
import { pageMetadataFromSanity } from "@/lib/pageMetadata";
import { getBlogsPage, getSiteSettings } from "@/sanity/fetch";

// /blogs/media/<slug> — the .media tab with that talk / podcast popup open, so
// each one has an address (Fas, Nov 16 evening). Opening a popup on /blogs
// puts this address in the bar (usePopupRoute in BlogsBody).

export const revalidate = 60;

async function load(raw: string) {
  let id = raw;
  try {
    id = decodeURIComponent(raw);
  } catch {}
  const data = blogsFromSanity(await getBlogsPage());
  const featured =
    data.mediaFeatured && mediaFeaturedSlug(data.mediaFeatured) === id
      ? data.mediaFeatured
      : null;
  const talk = featured ? null : data.media.find((m) => m.slug === id) ?? null;
  return { id, data, featured, talk };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ talk: string }>;
}): Promise<Metadata> {
  const { talk: raw } = await params;
  const [{ featured, talk }, site] = await Promise.all([load(raw), getSiteSettings()]);
  const title = featured?.title ?? talk?.title;
  const description = featured?.listingBlurb ?? talk?.description;
  return pageMetadataFromSanity(undefined, {
    title: `${title ?? "Media"} — Words + Media — Fas Lebbie, Ph.D.`,
    description: description?.trim() || site?.siteDescription?.trim(),
    ogImage: site?.ogImage,
    ogImageAlt: site?.ogImageAlt,
  });
}

export default async function MediaItemPage({
  params,
}: {
  params: Promise<{ talk: string }>;
}) {
  const { talk: raw } = await params;
  const { id, data, featured, talk } = await load(raw);
  if (!featured && !talk) notFound();
  return (
    <>
      <Nav dark />
      <BlogsBody
        posts={data.posts}
        mediaFeatured={data.mediaFeatured}
        media={data.media}
        publications={data.publications}
        viewFromUrl="media"
        initialMediaId={id}
      />
    </>
  );
}
