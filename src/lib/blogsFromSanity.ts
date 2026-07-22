import type { SanityBlogPostItem, SanityBlogsPage } from "@/sanity/types";
import {
  blogBodies,
} from "@/lib/blogBodies";
import {
  blogPosts,
  mediaItems,
  type BlogBlock,
  type BlogPost,
  type MediaItem,
} from "@/lib/blogs";

export type BlogsContentData = {
  posts: BlogPost[];
  media: MediaItem[];
};

// In-code cover fallback, keyed by slug (used when Sanity has no cover yet).
const coverBySlug = new Map(blogPosts.map((p) => [p.slug, p.cover]));

// Flatten the Sanity `body` (Portable Text + inline images) into the flat block
// list the modal renders. Section = h2, Subheading = h3, bullet = li, image =
// img, everything else = p.
function toBlogBody(
  blocks: SanityBlogPostItem["body"],
): BlogBlock[] | undefined {
  if (!blocks?.length) return undefined;
  type RawBlock = {
    _type?: string;
    style?: string;
    listItem?: string;
    children?: { text?: string }[];
    url?: string | null;
  };
  const out: BlogBlock[] = [];
  for (const raw of blocks) {
    const b = raw as RawBlock;
    // Inline figures/diagrams (resolved to a URL in the GROQ query).
    if (b._type === "image") {
      if (b.url) out.push({ kind: "img", text: b.url });
      continue;
    }
    if (b._type !== "block") continue;
    const text = (b.children ?? [])
      .map((c) => c.text ?? "")
      .join("")
      .trim();
    if (!text) continue;
    if (b.listItem === "bullet") out.push({ kind: "li", text });
    else if (b.style === "h2") out.push({ kind: "h2", text });
    else if (b.style === "h3" || b.style === "h4")
      out.push({ kind: "h3", text });
    else out.push({ kind: "p", text });
  }
  return out.length ? out : undefined;
}

// Map the raw `blogsPage` singleton to the component props, falling back to the
// in-code content (lib/blogs.ts) whenever the document or a field is empty.
export function blogsFromSanity(
  data: SanityBlogsPage | null | undefined,
): BlogsContentData {
  const posts: BlogPost[] =
    data?.posts?.length
      ? data.posts.map((p, i) => ({
          slug: p.slug ?? `post-${i}`,
          category: p.category ?? "Design Muscle",
          meta: p.meta ?? "",
          title: p.title ?? "Untitled",
          kicker: p.kicker ?? p.meta ?? "",
          description: p.description ?? "",
          body:
            toBlogBody(p.body) ??
            (p.slug ? blogBodies[p.slug] : undefined),
          url: p.url ?? undefined,
          cover: p.cover ?? (p.slug ? coverBySlug.get(p.slug) : undefined),
          coverBg: p.coverBg ?? "#eaa31e",
          panelBg: p.panelBg ?? "#3a1618",
          panelText: p.panelText ?? "#e8917b",
        }))
      : blogPosts;

  const media: MediaItem[] =
    data?.media?.length
      ? data.media.map((m, i) => ({
          slug: m.slug ?? `media-${i}`,
          format: m.format ?? "Podcast",
          title: m.title ?? "Untitled",
          platform: m.platform ?? "",
          year: m.year ?? "",
          thumb: m.thumb ?? undefined,
          video: m.video ?? undefined,
          source: m.source ?? "",
          detail: m.detail ?? "",
          description: m.description ?? "",
          themes: m.themes ?? [],
        }))
      : mediaItems;

  return { posts, media };
}
