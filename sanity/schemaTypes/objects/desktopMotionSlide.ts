import { defineField, defineType } from "sanity";

/** One poster in §08 Desktop Motion Showcase carousel (AR Handbook KPE sliders). */
export const desktopMotionSlide = defineType({
  name: "desktopMotionSlide",
  title: "Desktop motion slide",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Slide image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
    }),
  ],
  preview: {
    select: { alt: "alt", media: "image" },
    prepare: ({ alt, media }) => ({
      title: alt || "Desktop motion slide",
      media,
    }),
  },
});
