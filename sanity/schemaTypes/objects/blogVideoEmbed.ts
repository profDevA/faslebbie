import { defineField, defineType } from "sanity";

export const blogVideoEmbed = defineType({
  name: "blogVideoEmbed",
  title: "Video embed",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "YouTube or Vimeo URL",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "aspect",
      title: "Aspect ratio",
      type: "string",
      initialValue: "16:9",
      options: {
        list: [
          { title: "16:9 (default)", value: "16:9" },
          { title: "4:3", value: "4:3" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
  ],
  preview: {
    select: { title: "url", subtitle: "caption" },
    prepare({ title, subtitle }) {
      return { title: subtitle || "Video embed", subtitle: title };
    },
  },
});
