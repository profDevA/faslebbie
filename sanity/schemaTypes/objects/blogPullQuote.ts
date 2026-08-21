import { defineField, defineType } from "sanity";

export const blogPullQuote = defineType({
  name: "blogPullQuote",
  title: "Pull quote",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      type: "string",
      description: "Name or source line below the quote.",
    }),
    defineField({
      name: "cite",
      title: "Link (optional)",
      type: "url",
    }),
  ],
  preview: {
    select: { title: "quote", subtitle: "attribution" },
    prepare({ title, subtitle }) {
      const line = (title as string | undefined)?.split("\n")[0]?.slice(0, 60);
      return { title: line || "Pull quote", subtitle };
    },
  },
});
