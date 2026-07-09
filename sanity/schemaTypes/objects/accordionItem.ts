import { defineField, defineType } from "sanity";

// One collapsible row in an accordion section (What I Brought / Design Process).
export const accordionItem = defineType({
  name: "accordionItem",
  title: "Accordion item",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "body", title: "Body", type: "portableText" }),
    defineField({
      name: "defaultOpen",
      title: "Open by default",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", open: "defaultOpen" },
    prepare: ({ title, open }) => ({
      title: title || "(untitled)",
      subtitle: open ? "Open by default" : undefined,
    }),
  },
});
