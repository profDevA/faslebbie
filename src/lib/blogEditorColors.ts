/** Brand color presets — keep in sync with sanity/schemaTypes/objects/blogEditorShared.ts */
export const BLOG_TEXT_COLOR_HEX: Record<string, string> = {
  accent: "#e06164",
  maroon: "#3a1618",
  salmon: "#e8917b",
  teal: "#52747e",
  black: "#111111",
  muted: "#666666",
};

export const BLOG_HIGHLIGHT_HEX: Record<string, string> = {
  yellow: "#fff3bf",
  pink: "#ffe0e0",
  mint: "#d8f3dc",
  blue: "#dbeafe",
  grey: "#ececec",
};

export function resolveBlogTextColor(value?: {
  preset?: string | null;
  custom?: { hex?: string } | null;
  /** Legacy shape before preset picker. */
  value?: { hex?: string } | null;
}): string | undefined {
  if (!value) return undefined;
  if (value.custom?.hex) return value.custom.hex;
  if (value.value?.hex) return value.value.hex;
  if (value.preset) return BLOG_TEXT_COLOR_HEX[value.preset] ?? value.preset;
  return undefined;
}

export function resolveBlogHighlight(value?: {
  preset?: string | null;
  custom?: { hex?: string } | null;
  value?: { hex?: string } | null;
}): string | undefined {
  if (!value) return undefined;
  if (value.custom?.hex) return value.custom.hex;
  if (value.value?.hex) return value.value.hex;
  if (value.preset) return BLOG_HIGHLIGHT_HEX[value.preset] ?? value.preset;
  return undefined;
}

export function parseVideoEmbed(
  url: string,
): { src: string; title: string } | null {
  try {
    const trimmed = url.trim();
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const embedId = u.pathname.match(/^\/embed\/([^/?]+)/)?.[1];
      if (embedId) {
        return { src: trimmed, title: "YouTube video" };
      }
      const id = u.searchParams.get("v");
      if (id) {
        return {
          src: `https://www.youtube.com/embed/${id}`,
          title: "YouTube video",
        };
      }
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) {
        return {
          src: `https://www.youtube.com/embed/${id}`,
          title: "YouTube video",
        };
      }
    }
    if (host === "player.vimeo.com") {
      return { src: trimmed, title: "Vimeo video" };
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) {
        return {
          src: `https://player.vimeo.com/video/${id}`,
          title: "Vimeo video",
        };
      }
    }
    if (host === "open.spotify.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed") {
        return { src: trimmed, title: "Spotify embed" };
      }
      if (parts.length >= 2 && ["episode", "show", "track"].includes(parts[0]!)) {
        return {
          src: `https://open.spotify.com/embed/${parts[0]}/${parts[1]}${u.search}`,
          title: "Spotify embed",
        };
      }
    }
  } catch {
    /* invalid URL */
  }
  return null;
}

/** Watch/share URLs → iframe-safe embed src; passthrough when already embeddable. */
export function mediaEmbedSrc(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  return parseVideoEmbed(url)?.src ?? url.trim();
}
