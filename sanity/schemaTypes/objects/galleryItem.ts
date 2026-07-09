import { defineField, defineType } from "sanity";

// One image tile in a gallery / spotlight grid.
export const galleryItem = defineType({
  name: "galleryItem",
  title: "Gallery item",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: "caption", title: "Title / caption", type: "string" }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  preview: {
    select: { title: "caption", media: "image" },
    prepare: ({ title, media }) => ({ title: title || "Image", media }),
  },
});
