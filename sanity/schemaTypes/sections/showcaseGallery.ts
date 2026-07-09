import { defineField, defineType } from "sanity";

// Cover-flow showcase slider (Galderma-style). One item featured at a time with
// prev/next; supports unlimited items. Renderer shows nav only when >1.
export const showcaseGallery = defineType({
  name: "showcaseGallery",
  title: "Showcase Gallery (slider)",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
    defineField({ name: "introBody", title: "Intro body", type: "portableText" }),
    defineField({
      name: "items",
      title: "Showcase items",
      type: "array",
      of: [{ type: "showcaseItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Showcase Gallery",
      subtitle: `${items?.length || 0} slide(s)`,
    }),
  },
});
