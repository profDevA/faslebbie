import { defineField, defineType } from "sanity";
import { orderRankField } from "@sanity/orderable-document-list";

// A single "what people are saying" testimonial. Orderable so Fas can drag to
// reorder the carousel; rendered on the About page (TestimonialsModal).
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
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
