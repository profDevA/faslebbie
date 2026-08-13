import { defineField, defineType } from "sanity";

export const toolStackItem = defineType({
  name: "toolStackItem",
  title: "Stack tool",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Shown on hover (tooltip).",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { accept: "image/png,image/svg+xml,image/webp" },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "label", media: "logo" },
  },
});
