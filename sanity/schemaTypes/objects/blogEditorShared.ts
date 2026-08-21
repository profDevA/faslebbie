import { defineArrayMember } from "sanity";

/** Site palette — used in Studio preset pickers and front-end rendering. */
export const BLOG_COLOR_PRESETS = [
  { title: "Accent red", value: "accent", hex: "#e06164" },
  { title: "Maroon", value: "maroon", hex: "#3a1618" },
  { title: "Salmon", value: "salmon", hex: "#e8917b" },
  { title: "Teal", value: "teal", hex: "#52747e" },
  { title: "Black", value: "black", hex: "#111111" },
  { title: "Muted", value: "muted", hex: "#666666" },
] as const;

export const BLOG_HIGHLIGHT_PRESETS = [
  { title: "Soft yellow", value: "yellow", hex: "#fff3bf" },
  { title: "Soft pink", value: "pink", hex: "#ffe0e0" },
  { title: "Soft mint", value: "mint", hex: "#d8f3dc" },
  { title: "Soft blue", value: "blue", hex: "#dbeafe" },
  { title: "Soft grey", value: "grey", hex: "#ececec" },
] as const;

export function blogColorHex(
  preset?: string | null,
  custom?: { hex?: string } | null,
): string | undefined {
  if (custom?.hex) return custom.hex;
  if (!preset) return undefined;
  const hit = BLOG_COLOR_PRESETS.find((p) => p.value === preset);
  return hit?.hex ?? preset;
}

export function blogHighlightHex(
  preset?: string | null,
  custom?: { hex?: string } | null,
): string | undefined {
  if (custom?.hex) return custom.hex;
  if (!preset) return undefined;
  const hit = BLOG_HIGHLIGHT_PRESETS.find((p) => p.value === preset);
  return hit?.hex ?? preset;
}

const colorPresetField = {
  name: "preset",
  type: "string" as const,
  title: "Preset",
  options: {
    list: BLOG_COLOR_PRESETS.map((p) => ({ title: p.title, value: p.value })),
    layout: "dropdown" as const,
  },
};

const highlightPresetField = {
  name: "preset",
  type: "string" as const,
  title: "Preset",
  options: {
    list: BLOG_HIGHLIGHT_PRESETS.map((p) => ({
      title: p.title,
      value: p.value,
    })),
    layout: "dropdown" as const,
  },
};

export const blogTextStyles = [
  { title: "Normal", value: "normal" },
  { title: "Lead", value: "lead" },
  { title: "Section", value: "h2" },
  { title: "Subheading", value: "h3" },
  { title: "Minor heading", value: "h4" },
  { title: "Small heading", value: "h5" },
  { title: "Quote", value: "blockquote" },
  { title: "Center", value: "center" },
  { title: "Right align", value: "right" },
  { title: "Small", value: "small" },
];

export const blogTextLists = [
  { title: "Bullet", value: "bullet" },
  { title: "Numbered", value: "number" },
];

export const blogTextMarks = {
  decorators: [
    { title: "Bold", value: "strong" },
    { title: "Italic", value: "em" },
    { title: "Underline", value: "underline" },
    { title: "Strike", value: "strike-through" },
    { title: "Code", value: "code" },
    { title: "Superscript", value: "sup" },
    { title: "Subscript", value: "sub" },
  ],
  annotations: [
    {
      name: "link",
      type: "object",
      title: "Link",
      fields: [
        {
          name: "href",
          type: "url",
          title: "URL",
          validation: (r: {
            uri: (o: {
              allowRelative: boolean;
              scheme: string[];
            }) => unknown;
          }) =>
            r.uri({
              allowRelative: true,
              scheme: ["http", "https", "mailto", "tel"],
            }),
        },
        {
          name: "blank",
          type: "boolean",
          title: "Open in new tab",
          initialValue: true,
        },
        {
          name: "nofollow",
          type: "boolean",
          title: "nofollow (SEO)",
          initialValue: false,
        },
      ],
    },
    {
      name: "textColor",
      type: "object",
      title: "Text color",
      fields: [
        colorPresetField,
        { name: "custom", type: "color", title: "Custom color" },
      ],
    },
    {
      name: "highlight",
      type: "object",
      title: "Highlight",
      fields: [
        highlightPresetField,
        { name: "custom", type: "color", title: "Custom background" },
      ],
    },
  ],
};

/** Shared text block member — used in article body and callout insets. */
export function blogTextBlockMember() {
  return defineArrayMember({
    type: "block",
    styles: blogTextStyles,
    lists: blogTextLists,
    marks: blogTextMarks,
  });
}
