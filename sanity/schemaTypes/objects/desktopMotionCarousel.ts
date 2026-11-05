import { defineField, defineType } from "sanity";

/** The band this slider sits in (path: sections[_key].carousels[_key].…). */
function parentBandLayout(document: unknown, path: unknown) {
  const key = (Array.isArray(path) ? path[1] : undefined) as { _key?: string } | undefined;
  const sections = (document as { sections?: { _key?: string; layoutVariant?: string }[] } | undefined)
    ?.sections;
  return sections?.find((s) => s._key === key?._key)?.layoutVariant;
}

/**
 * One slider in the staggered-pair layout (OC Links uses two; Circle KPE uses
 * three) — or one row of the Old vs New layout (slide 1 old screen, slide 2 new
 * screen, row title + caption on the right).
 */
export const desktopMotionCarousel = defineType({
  name: "desktopMotionCarousel",
  title: "Desktop motion carousel",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Row title (Old vs New)",
      type: "string",
      hidden: ({ document, path }) => parentBandLayout(document, path) !== "oldVsNew",
    }),
    defineField({
      name: "body",
      title: "Caption under this slider",
      description: "Old vs New: the text under the row title.",
      type: "portableText",
    }),
    defineField({
      name: "slides",
      title: "Slides",
      description: "Old vs New: slide 1 = old screen, slide 2 = new screen.",
      type: "array",
      of: [{ type: "desktopMotionSlide" }],
      validation: (r) => r.min(1),
    }),
  ],
  preview: {
    select: { title: "title", slides: "slides" },
    prepare: ({ title, slides }) => ({
      title: title || `Slider · ${slides?.length || 0} slide(s)`,
      subtitle: title ? `${slides?.length || 0} slide(s)` : undefined,
    }),
  },
});
