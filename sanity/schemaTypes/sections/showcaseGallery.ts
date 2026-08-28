import { defineField, defineType } from "sanity";

import { SHOWCASE_ARTIFACT_DEFAULTS } from "../../../src/lib/caseStudyDefaults";
import { SHOWCASE_GALLERY_APPEARANCE_DEFAULTS } from "../../../src/lib/sanityAppearanceDefaults";

// Cover-flow showcase slider. One item featured at a time with prev/next.
export const showcaseGallery = defineType({
  name: "showcaseGallery",
  title: "Showcase Gallery (slider)",
  type: "object",
  fields: [
    defineField({ name: "sectionTitle", title: "Section title", type: "string" }),
    defineField({ name: "introBody", title: "Intro body", type: "portableText" }),
    defineField({
      name: "expandable",
      title: "Tap to expand",
      type: "boolean",
      initialValue: false,
      description:
        "When on, clicking the centered slide opens a full-screen lightbox. Otherwise clicking a side slide centers it.",
    }),
    defineField({
      name: "sliderGap",
      title: "Slider gap (px)",
      type: "number",
      initialValue: SHOWCASE_ARTIFACT_DEFAULTS.sliderGap,
      description: "Gap between artifact slider cards (expandable / Research Artifacts layout).",
      validation: (r) => r.min(0).integer(),
      hidden: ({ parent }) => !parent?.expandable,
    }),
    defineField({
      name: "items",
      title: "Showcase items",
      type: "array",
      of: [{ type: "showcaseItem" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "appearance",
      type: "appearance",
      initialValue: SHOWCASE_GALLERY_APPEARANCE_DEFAULTS,
    }),
  ],
  preview: {
    select: { title: "sectionTitle", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Showcase Gallery",
      subtitle: `${items?.length || 0} slide(s)`,
    }),
  },
});
