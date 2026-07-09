import { defineField, defineType } from "sanity";

// White count-up metric band (Impact stats).
export const statsSection = defineType({
  name: "statsSection",
  title: "Stats / Metrics",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
    defineField({
      name: "items",
      title: "Stats",
      type: "array",
      of: [{ type: "statItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Stats",
      subtitle: `${items?.length || 0} metric(s)`,
    }),
  },
});
