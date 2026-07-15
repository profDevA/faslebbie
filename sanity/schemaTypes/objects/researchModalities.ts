import { defineField, defineType } from "sanity";

// "Modalities" modal slide: kicker + statement + numbered channel list +
// grouped clusters + footnote.
export const researchModalities = defineType({
  name: "researchModalities",
  title: "Modalities",
  type: "object",
  fields: [
    defineField({ name: "kicker", title: "Kicker", type: "string" }),
    defineField({ name: "statement", title: "Statement", type: "text", rows: 2 }),
    defineField({
      name: "items",
      title: "Channels (numbered list)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "groups",
      title: "Groups",
      type: "array",
      of: [{ type: "researchModalityGroup" }],
    }),
    defineField({ name: "footnote", title: "Footnote", type: "string" }),
  ],
  preview: { prepare: () => ({ title: "Modalities" }) },
});
