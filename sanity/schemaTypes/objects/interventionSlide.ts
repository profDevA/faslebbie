import { defineField, defineType } from "sanity";

/** One poster slide in the Intervention Carousel band. */
export const interventionSlide = defineType({
  name: "interventionSlide",
  title: "Intervention slide",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Poster image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "title",
      title: "Slide title (optional)",
      type: "string",
      description: "Reserved for per-slide headings. Caption kicker stays on the section.",
    }),
    defineField({
      name: "body",
      title: "Slide body (optional)",
      type: "portableText",
      description: "Overrides the section intro for this slide when set.",
    }),
    defineField({ name: "order", title: "Display order", type: "number" }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Intervention slide",
      media,
    }),
  },
});
