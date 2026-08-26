import { defineField, defineType } from "sanity";

// "Paradigms" modal slide: intro + numbered worldviews.
export const researchParadigms = defineType({
  name: "researchParadigms",
  title: "Paradigms",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", initialValue: "Paradigms" }),
    defineField({
      name: "image",
      title: "Side image",
      type: "image",
      description: "Book cover / still in the left column of the popup.",
      options: { hotspot: true },
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 3 }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "researchNumberedItem" }],
    }),
  ],
  preview: { prepare: () => ({ title: "Paradigms" }) },
});
