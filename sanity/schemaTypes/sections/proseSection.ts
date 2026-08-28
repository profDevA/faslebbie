import { defineField, defineType } from "sanity";

import { PROBLEM_CONTEXT_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

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
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: PROBLEM_CONTEXT_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle" },
    prepare: ({ title }) => ({ title: title || "Prose", subtitle: "Legacy — prefer §03 or §11 types" }),
  },
});
