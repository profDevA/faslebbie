import { defineField, defineType } from "sanity";

// §09 Impact — count-up metric band (Figma 2110:40267).
export const statsSection = defineType({
  name: "statsSection",
  title: "09 — Impact",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section Heading", type: "string" }),
    defineField({
      name: "body",
      title: "Impact / Outcome Description",
      type: "portableText",
    }),
    defineField({
      name: "items",
      title: "Metric Items",
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
