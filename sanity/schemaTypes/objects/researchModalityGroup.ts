import { defineField, defineType } from "sanity";

// A labelled cluster of modality channels (e.g. "human & oral").
export const researchModalityGroup = defineType({
  name: "researchModalityGroup",
  title: "Modality group",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "items",
      title: "Channels",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: { select: { title: "title" } },
});
