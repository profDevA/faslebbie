import { defineField, defineType } from "sanity";

export const approachSection = defineType({
  name: "approachSection",
  title: "Approach section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Section title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "static",
      title: "Static (no keyword reveals)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "blocks",
      title: "Blocks",
      type: "array",
      of: [
        {
          type: "object",
          name: "approachBlock",
          fields: [
            {
              name: "subheading",
              title: "Subheading (optional)",
              type: "string",
            },
            {
              name: "body",
              title: "Body",
              type: "interactiveProse",
              validation: (r) => r.required(),
            },
          ],
          preview: {
            select: { subheading: "subheading", title: "title" },
            prepare: ({ subheading }: { subheading?: string }) => ({
              title: subheading || "Paragraph",
            }),
          },
        },
      ],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: { title: "title", static: "static" },
    prepare: ({ title, static: isStatic }: { title?: string; static?: boolean }) => ({
      title: title || "Section",
      subtitle: isStatic ? "Static" : "Interactive",
    }),
  },
});
