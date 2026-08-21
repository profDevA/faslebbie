import type { SanityBlogPostItem, SanityBlogsPage, SanityPublicationItem } from "@/sanity/types";
import type {
  BlogPost,
  MediaItem,
  Publication,
  PublicationsData,
} from "@/lib/blogs";

export type BlogsContentData = {
  posts: BlogPost[];
  media: MediaItem[];
  publications: PublicationsData;
};

const emptyPublications: PublicationsData = { books: [], journals: [] };

function mapPublications(
  items: SanityPublicationItem[] | undefined,
): Publication[] {
  if (!items?.length) return [];
  return items
    .map((p) => ({
      title: p.title?.trim() ?? "",
      year: p.year?.trim() ?? "",
      href: p.href?.trim() || undefined,
    }))
    .filter((p) => p.title);
}

/** Sanity Blogs & Media page. Empty Studio = empty UI. */
export function blogsFromSanity(
  data: SanityBlogsPage | null | undefined,
): BlogsContentData {
  if (!data) {
    return { posts: [], media: [], publications: emptyPublications };
  }

  const posts: BlogPost[] = (data.posts ?? []).map((p, i) => ({
    slug: p.slug ?? `post-${i}`,
    category: p.category ?? "Design Muscle",
    meta: p.meta ?? "",
    title: p.title ?? "Untitled",
    kicker: p.kicker ?? p.meta ?? "",
    description: p.description ?? "",
    body: p.body?.length ? p.body : undefined,
    url: p.url ?? undefined,
    cover: p.cover ?? undefined,
    coverBg: p.coverBg ?? "#eaa31e",
    panelBg: p.panelBg ?? "#3a1618",
    panelText: p.panelText ?? "#e8917b",
  }));

  const media: MediaItem[] = (data.media ?? []).map((m, i) => ({
    slug: m.slug ?? `media-${i}`,
    format: m.format ?? "Podcast",
    title: m.title ?? "Untitled",
    platform: m.platform ?? "",
    year: m.year ?? "",
    thumb: m.thumb ?? undefined,
    video: m.video ?? undefined,
    videoFile: m.videoFile ?? undefined,
    source: m.source ?? "",
    detail: m.detail ?? "",
    description: m.description ?? "",
    themes: m.themes ?? [],
  }));

  const publications: PublicationsData = {
    books: mapPublications(data.books),
    journals: mapPublications(data.journals),
  };

  return { posts, media, publications };
}
