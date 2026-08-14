import type { SanityBlogPostItem, SanityBlogsPage, SanityPublicationItem } from "@/sanity/types";
import type {
  BlogBlock,
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

// Flatten the Sanity `body` (Portable Text + inline images) into the flat block
// list the modal renders. Preserves strong/em/link marks as `parts`.
function toBlogBody(
  blocks: SanityBlogPostItem["body"],
): BlogBlock[] | undefined {
  if (!blocks?.length) return undefined;
  type RawChild = { text?: string; marks?: string[] };
  type MarkDef = { _key?: string; _type?: string; href?: string };
  type RawBlock = {
    _type?: string;
    style?: string;
    listItem?: string;
    children?: RawChild[];
    markDefs?: MarkDef[];
    url?: string | null;
  };

  const toParts = (children: RawChild[] | undefined, markDefs: MarkDef[]) =>
    (children ?? []).map((c) => {
      const marks = c.marks ?? [];
      const linkKey = marks.find((m) =>
        markDefs.some((d) => d._key === m && d._type === "link"),
      );
      const href = markDefs.find((d) => d._key === linkKey)?.href;
      return {
        text: c.text ?? "",
        bold: marks.includes("strong"),
        italic: marks.includes("em"),
        href: href || undefined,
      };
    });

  const out: BlogBlock[] = [];
  for (const raw of blocks) {
    const b = raw as RawBlock;
    if (b._type === "image") {
      if (b.url) out.push({ kind: "img", text: b.url });
      continue;
    }
    if (b._type !== "block") continue;
    const parts = toParts(b.children, b.markDefs ?? []);
    const text = parts.map((p) => p.text).join("").trim();
    if (!text) continue;
    const rich = parts.some((p) => p.bold || p.italic || p.href)
      ? parts
      : undefined;
    if (b.listItem === "bullet") out.push({ kind: "li", text, parts: rich });
    else if (b.style === "h2") out.push({ kind: "h2", text, parts: rich });
    else if (b.style === "h3" || b.style === "h4")
      out.push({ kind: "h3", text, parts: rich });
    else out.push({ kind: "p", text, parts: rich });
  }
  return out.length ? out : undefined;
}

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
    body: toBlogBody(p.body),
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
