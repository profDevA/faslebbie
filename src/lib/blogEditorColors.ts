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
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id)
        return {
          src: `https://www.youtube.com/embed/${id}`,
          title: "YouTube video",
        };
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id)
        return {
          src: `https://www.youtube.com/embed/${id}`,
          title: "YouTube video",
        };
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id)
        return {
          src: `https://player.vimeo.com/video/${id}`,
          title: "Vimeo video",
        };
    }
  } catch {
    /* invalid URL */
  }
  return null;
}
