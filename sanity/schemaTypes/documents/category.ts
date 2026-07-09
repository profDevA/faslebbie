import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

// Work filter taxonomy (Product Design, Design Research, Design Technology,
// Service Design, Branding, …). Unlimited + reorderable.
export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    orderRankField({ type: "category" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "title" } },
});
