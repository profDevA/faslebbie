import { defineField, defineType } from "sanity";

// Legacy — use problemContextSection, reflectionSection, or section-specific types.
export const proseSection = defineType({
  name: "proseSection",
  title: "Prose (legacy)",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
    defineField({
      name: "body",
      title: "Body",
      type: "portableText",
      validation: (r) => r.required(),
    }),
    defineField({ name: "appearance", type: "appearance" }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare: ({ title }) => ({ title: title || "Prose", subtitle: "Legacy — prefer §03 or §11 types" }),
  },
});
