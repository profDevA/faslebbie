import { defineField, defineType } from "sanity";

// A numbered entry inside the Paradigms / Principles modal sections. The number
// is derived from list order at render time, so authors only supply the copy.
export const researchNumberedItem = defineType({
  name: "researchNumberedItem",
  title: "Item",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "body", title: "Body", type: "text", rows: 5 }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});
