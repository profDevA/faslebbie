import { defineField, defineType } from "sanity";

// One slide in the cover-flow Showcase Gallery (Galderma-style slider).
export const showcaseItem = defineType({
  name: "showcaseItem",
  title: "Showcase item",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({
      name: "expandImage",
      title: "Expanded image",
      type: "image",
      options: { hotspot: true },
      description:
        "Optional higher-resolution version shown in the lightbox. Falls back to the slide image.",
    }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  preview: {
    select: { title: "caption", media: "image" },
    prepare: ({ title, media }) => ({ title: title || "Slide", media }),
  },
});
