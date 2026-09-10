import { defineField, defineType } from "sanity";

import { INTERVENTION_CAROUSEL_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

/**
 * Design Assist — poster carousel (Figma 3719:64984).
 * Large centred card, prev/next below, caption block bottom-right.
 */
export const interventionCarousel = defineType({
  name: "interventionCarousel",
  title: "Intervention Carousel (poster)",
  type: "object",
  fields: [
    defineField({
      name: "sectionTitle",
      title: "Caption kicker",
      type: "string",
      initialValue: "Design Interventions",
    }),
    defineField({
      name: "introBody",
      title: "Caption body",
      type: "portableText",
      description: "Default copy under the kicker. Per-slide body overrides when set.",
    }),
    defineField({
      name: "slides",
      title: "Slides",
      type: "array",
      of: [{ type: "interventionSlide" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: INTERVENTION_CAROUSEL_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", slides: "slides" },
    prepare: ({ title, slides }) => ({
      title: title || "Intervention Carousel",
      subtitle: `${slides?.length || 0} slide(s)`,
    }),
  },
});
