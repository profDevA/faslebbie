import { defineField, defineType } from "sanity";

/** One slider in §08 staggered-pair layout (OC Links dual carousels). */
export const desktopMotionCarousel = defineType({
  name: "desktopMotionCarousel",
  title: "Desktop motion carousel",
  type: "object",
  fields: [
    defineField({
      name: "body",
      title: "Caption under this slider",
      type: "portableText",
    }),
    defineField({
      name: "slides",
      title: "Slides",
      type: "array",
      of: [{ type: "desktopMotionSlide" }],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: { slides: "slides" },
    prepare: ({ slides }) => ({
      title: `Slider · ${slides?.length || 0} slide(s)`,
    }),
  },
});
