import { defineField, defineType } from "sanity";

// A reference link kept on the case study (e.g. the Figma frame it maps to).
export const designRef = defineType({
  name: "designRef",
  title: "Design reference",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string" }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "url" },
  },
});
