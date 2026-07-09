import { defineField, defineType } from "sanity";

// A titled prose band with a background colour. Covers Problem Context,
// Impact, and Reflections & Impact.
export const proseSection = defineType({
  name: "proseSection",
  title: "Prose",
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
    prepare: ({ title }) => ({ title: title || "Prose", subtitle: "Prose section" }),
  },
});
