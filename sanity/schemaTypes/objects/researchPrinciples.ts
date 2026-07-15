import { defineField, defineType } from "sanity";

// "Principles" modal slide: intro + numbered principles + a closing note.
export const researchPrinciples = defineType({
  name: "researchPrinciples",
  title: "Principles",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", initialValue: "Principles" }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "researchNumberedItem" }],
    }),
    defineField({ name: "conclusionKicker", title: "Conclusion kicker", type: "string" }),
    defineField({ name: "conclusionBody", title: "Conclusion body", type: "text", rows: 3 }),
  ],
  preview: { prepare: () => ({ title: "Principles" }) },
});
