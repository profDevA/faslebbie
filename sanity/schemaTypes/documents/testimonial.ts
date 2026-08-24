import { defineField, defineType } from "sanity";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

// Orderable testimonial shown on the About page.
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "testimonial" }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role / company",
      type: "string",
      description: 'e.g. "Service Delivery Manager, Meta" — no leading dash.',
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 8,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
