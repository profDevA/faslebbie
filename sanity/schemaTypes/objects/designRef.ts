import { defineField, defineType } from "sanity";

// A reference link kept on the case study (e.g. design file or frame URL).
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
