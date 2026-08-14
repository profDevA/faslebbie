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
      name: "posX",
      title: "Overlay X %",
      type: "number",
      description: "Scattered-collage placement (desktop overlay).",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "posXAnchor",
      title: "Overlay X anchor",
      type: "string",
      options: {
        list: [
          { title: "From left", value: "left" },
          { title: "From right", value: "right" },
        ],
      },
      initialValue: "left",
    }),
    defineField({
      name: "posY",
      title: "Overlay Y %",
      type: "number",
      validation: (r) => r.min(0).max(100),
    }),
    defineField({
      name: "posYAnchor",
      title: "Overlay Y anchor",
      type: "string",
      description:
        "Anchoring from the bottom keeps a tile pinned whatever the photo's height.",
      options: {
        list: [
          { title: "From top", value: "top" },
          { title: "Centred on Y", value: "center" },
          { title: "From bottom", value: "bottom" },
        ],
      },
      initialValue: "top",
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
