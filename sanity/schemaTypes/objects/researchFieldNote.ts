import { defineField, defineType } from "sanity";

// One entry in the Field Notes modal section.
export const researchFieldNote = defineType({
  name: "researchFieldNote",
  title: "Field note",
  type: "object",
  fields: [
    defineField({ name: "place", title: "Place", type: "string" }),
    defineField({ name: "quote", title: "Caption / quote", type: "text", rows: 2 }),
    defineField({ name: "methodology", title: "Methodology", type: "string" }),
    defineField({ name: "themes", title: "Research themes", type: "string" }),
    defineField({ name: "insight", title: "Research insight", type: "text", rows: 3 }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: { select: { title: "place", media: "image" } },
});
