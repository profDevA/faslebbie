import { defineField, defineType } from "sanity";

/** Books / journals / current projects — Figma 3315:4124 (.words tab). */
export const publicationItem = defineType({
  name: "publicationItem",
  title: "Publication row",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "tag",
      title: "Tag line",
      type: "string",
      description:
        'Italic line under the title, e.g. "Initiative", "Journal · Transition Design", "Panel · Carnegie Mellon University". Leave empty for Books rows.',
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
    select: { title: "title", tag: "tag", year: "year" },
    prepare: ({ title, tag, year }) => ({
      title: title || "Publication",
      subtitle: [tag, year].filter(Boolean).join(" · ") || undefined,
    }),
  },
});
