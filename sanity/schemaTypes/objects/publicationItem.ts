import { defineField, defineType } from "sanity";

/** Books / journals row on Words + Media → .words (Figma 2729:2736). */
export const publicationItem = defineType({
  name: "publicationItem",
  title: "Publication",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
      description: 'e.g. "2024", "Forthcoming", or "—" when unknown.',
    }),
    defineField({
      name: "href",
      title: "Link (optional)",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "title", year: "year" },
    prepare: ({ title, year }) => ({
      title: title || "Publication",
      subtitle: year || undefined,
    }),
  },
});
