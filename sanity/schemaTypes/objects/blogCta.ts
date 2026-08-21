import { defineField, defineType } from "sanity";

export const blogCta = defineType({
  name: "blogCta",
  title: "Button / CTA",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "url",
      validation: (r) =>
        r.required().uri({
          allowRelative: true,
          scheme: ["http", "https", "mailto", "tel"],
        }),
    }),
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      initialValue: "primary",
      options: {
        list: [
          { title: "Primary (red)", value: "primary" },
          { title: "Outline", value: "outline" },
          { title: "Text link", value: "link" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "blank",
      title: "Open in new tab",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
