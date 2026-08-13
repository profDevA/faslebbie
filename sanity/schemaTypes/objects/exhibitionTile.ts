import { defineField, defineType } from "sanity";

// One tile in the Teaching exhibition collage.
export const exhibitionTile = defineType({
  name: "exhibitionTile",
  title: "Exhibition tile",
  type: "object",
  fields: [
    defineField({
      name: "tint",
      title: "Placeholder tint",
      type: "string",
      description: "Hex colour used when no image is uploaded.",
      initialValue: "#8f8a82",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "label",
      title: "Caption",
      type: "string",
      description: "Optional caption under the tile in the gallery grid.",
    }),
    defineField({
      name: "span",
      title: "Masonry height",
      type: "string",
      options: {
        list: [
          { title: "Short", value: "sm" },
          { title: "Medium", value: "md" },
          { title: "Tall", value: "lg" },
        ],
      },
      initialValue: "md",
    }),
    defineField({
      name: "posTop",
      title: "Overlay top %",
      type: "number",
      description: "Scattered-collage placement (desktop overlay).",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "posLeft",
      title: "Overlay left %",
      type: "number",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "posW",
      title: "Overlay width %",
      type: "number",
      validation: (r) => r.min(1).max(40),
    }),
  ],
  preview: {
    select: { title: "label", tint: "tint", media: "image" },
    prepare: ({ title, tint, media }) => ({
      title: title || tint || "Tile",
      media,
    }),
  },
});
