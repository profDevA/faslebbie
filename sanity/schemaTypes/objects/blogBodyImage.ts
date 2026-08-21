import { defineField, defineType } from "sanity";

/** In-article figure with Studio controls (replaces bare `image` blocks). */
export const blogBodyImage = defineType({
  name: "blogBodyImage",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Accessibility label. Required for diagrams and photos.",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional line below the image.",
    }),
    defineField({
      name: "size",
      title: "Width",
      type: "string",
      initialValue: "full",
      options: {
        list: [
          { title: "Full width", value: "full" },
          { title: "Medium (85%)", value: "medium" },
          { title: "Small (60%)", value: "small" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "align",
      title: "Alignment",
      type: "string",
      initialValue: "center",
      options: {
        list: [
          { title: "Center", value: "center" },
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
  ],
  preview: {
    select: { media: "image", title: "caption", subtitle: "alt" },
    prepare({ media, title, subtitle }) {
      return {
        title: title || subtitle || "Image",
        subtitle: title && subtitle ? subtitle : undefined,
        media,
      };
    },
  },
});
